import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { getSupabaseUser, syncDbUser } from "@/lib/auth";
import { mergeDisplayTitle } from "@/lib/project-meta";
import { sanitizeGeneratedContent } from "@/lib/ai/validation";

const PatchSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    emailOptIn: z.boolean().optional(),
    displayTitle: z.union([z.string().min(1).max(120), z.null()]).optional(),
  })
  .refine(
    (data) =>
      data.email !== undefined ||
      data.emailOptIn !== undefined ||
      data.displayTitle !== undefined,
    { message: "At least one field is required" }
  );

async function requireOwnedProject(projectId: string) {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return {
      error: NextResponse.json(
        { error: "Login wajib", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  const dbUser = await syncDbUser(supabaseUser);
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true },
  });

  if (!project) {
    return {
      error: NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 }),
    };
  }

  if (project.userId !== dbUser.id) {
    return {
      error: NextResponse.json(
        { error: "Akses ditolak", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  return { dbUser, project };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  const owned = await requireOwnedProject(id);
  if ("error" in owned && owned.error) return owned.error;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      idea: true,
      status: true,
      clarifications: true,
      presets: true,
      planData: true,
      createdAt: true,
      updatedAt: true,
      files: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          fileKey: true,
          fileName: true,
          label: true,
          content: true,
          version: true,
          modelClass: true,
          tokensUsed: true,
          updatedAt: true,
          revisions: {
            orderBy: { version: "desc" },
            take: 20,
            select: {
              id: true,
              version: true,
              revisionType: true,
              sectionName: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
  }

  const healedFiles = await Promise.all(
    project.files.map(async (file) => {
      const cleaned = sanitizeGeneratedContent(file.content);
      if (cleaned === file.content) return file;

      await prisma.generatedFile
        .update({
          where: { id: file.id },
          data: { content: cleaned },
        })
        .catch(() => {});

      return { ...file, content: cleaned };
    })
  );

  return NextResponse.json({ project: { ...project, files: healedFiles } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  const owned = await requireOwnedProject(id);
  if ("error" in owned && owned.error) return owned.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, emailOptIn, displayTitle } = parsed.data;

  try {
    if (displayTitle !== undefined) {
      const existing = await prisma.project.findUnique({
        where: { id },
        select: { planData: true },
      });
      const project = await prisma.project.update({
        where: { id },
        data: {
          planData: mergeDisplayTitle(existing?.planData, displayTitle) as Prisma.InputJsonValue,
        },
        select: { id: true, planData: true },
      });
      return NextResponse.json({ ok: true, project });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required for this update" }, { status: 422 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: { email, emailOptIn: emailOptIn ?? false },
      select: { id: true, email: true, emailOptIn: true },
    });

    return NextResponse.json({ ok: true, project });
  } catch (err) {
    console.error("Failed to update project:", err);
    return NextResponse.json(
      { error: "Project not found or database error" },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  const owned = await requireOwnedProject(id);
  if ("error" in owned && owned.error) return owned.error;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
  }

  if (project.status === "GENERATING") {
    return NextResponse.json(
      { error: "Project sedang digenerate. Tunggu selesai atau gagal dulu." },
      { status: 409 }
    );
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
