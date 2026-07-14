import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSupabaseUser, syncDbUser } from "@/lib/auth";
import { DOCUMENT_FILE_KEYS } from "@/lib/config/options";
import { normalizeDocumentKey } from "@/lib/config/documents";

const PatchSchema = z.object({
  content: z.string().min(1).max(200_000),
});

async function requireOwnedFile(projectId: string, fileKey: string) {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return {
      error: NextResponse.json({ error: "Login wajib" }, { status: 401 }),
    };
  }

  const dbUser = await syncDbUser(supabaseUser);
  const normalized = normalizeDocumentKey(fileKey);
  if (!normalized || !(DOCUMENT_FILE_KEYS as readonly string[]).includes(normalized)) {
    return {
      error: NextResponse.json({ error: "File key tidak valid" }, { status: 422 }),
    };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true },
  });

  if (!project) {
    return { error: NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 }) };
  }

  if (project.userId !== dbUser.id) {
    return { error: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }) };
  }

  const file = await prisma.generatedFile.findUnique({
    where: { projectId_fileKey: { projectId, fileKey: normalized } },
  });

  if (!file) {
    return { error: NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 }) };
  }

  return { dbUser, file, normalizedKey: normalized };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileKey: string }> }
) {
  const { id: projectId, fileKey } = await params;

  const owned = await requireOwnedFile(projectId, fileKey);
  if ("error" in owned && owned.error) return owned.error;
  const { file } = owned;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Konten tidak valid" }, { status: 422 });
  }

  if (parsed.data.content.trim() === file.content.trim()) {
    return NextResponse.json({ ok: true, version: file.version, unchanged: true });
  }

  const nextVersion = file.version + 1;

  await prisma.$transaction(async (tx) => {
    await tx.documentRevision.create({
      data: {
        documentId: file.id,
        version: nextVersion,
        content: parsed.data.content,
        revisionType: "manual",
        sectionName: null,
      },
    });

    await tx.generatedFile.update({
      where: { id: file.id },
      data: { content: parsed.data.content, version: nextVersion },
    });
  });

  return NextResponse.json({
    ok: true,
    version: nextVersion,
    content: parsed.data.content,
  });
}
