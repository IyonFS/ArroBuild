import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSupabaseUser, syncDbUser } from "@/lib/auth";

async function requireOwnedRevision(revisionId: string) {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return { error: NextResponse.json({ error: "Login wajib" }, { status: 401 }) };
  }

  const dbUser = await syncDbUser(supabaseUser);
  const revision = await prisma.documentRevision.findUnique({
    where: { id: revisionId },
    include: {
      document: {
        include: { project: { select: { id: true, userId: true } } },
      },
    },
  });

  if (!revision) {
    return { error: NextResponse.json({ error: "Revisi tidak ditemukan" }, { status: 404 }) };
  }

  if (revision.document.project.userId !== dbUser.id) {
    return { error: NextResponse.json({ error: "Akses ditolak" }, { status: 403 }) };
  }

  return { dbUser, revision };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ revisionId: string }> }
) {
  const { revisionId } = await params;
  const owned = await requireOwnedRevision(revisionId);
  if ("error" in owned && owned.error) return owned.error;

  const { revision } = owned;
  return NextResponse.json({
    id: revision.id,
    version: revision.version,
    content: revision.content,
    revisionType: revision.revisionType,
    sectionName: revision.sectionName,
    createdAt: revision.createdAt,
    fileKey: revision.document.fileKey,
    projectId: revision.document.project.id,
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ revisionId: string }> }
) {
  const { revisionId } = await params;
  const owned = await requireOwnedRevision(revisionId);
  if ("error" in owned && owned.error) return owned.error;

  const { revision } = owned;
  const file = revision.document;
  const nextVersion = file.version + 1;

  await prisma.$transaction(async (tx) => {
    await tx.documentRevision.create({
      data: {
        documentId: file.id,
        version: nextVersion,
        content: revision.content,
        revisionType: "restore",
        sectionName: `restore:v${revision.version}`,
      },
    });

    await tx.generatedFile.update({
      where: { id: file.id },
      data: { content: revision.content, version: nextVersion },
    });
  });

  return NextResponse.json({
    ok: true,
    version: nextVersion,
    content: revision.content,
    restoredFrom: revision.version,
  });
}
