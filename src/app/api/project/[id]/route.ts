import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSupabaseUser, syncDbUser } from "@/lib/auth";

const PatchSchema = z.object({
  email: z.string().email("Invalid email address"),
  emailOptIn: z.boolean().optional().default(false),
});

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

  return NextResponse.json({ project });
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

  const { email, emailOptIn } = parsed.data;

  try {
    const project = await prisma.project.update({
      where: { id },
      data: { email, emailOptIn },
      select: { id: true, email: true, emailOptIn: true },
    });

    return NextResponse.json({ ok: true, project });
  } catch (err) {
    console.error("Failed to update project email:", err);
    return NextResponse.json(
      { error: "Project not found or database error" },
      { status: 404 }
    );
  }
}
