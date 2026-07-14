import { prisma } from "@/lib/db/prisma";
import type { ProjectStatus, Prisma } from "@prisma/client";

export const MAX_DRAFTS_PER_USER = 5;
export const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class DraftServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = "DraftServiceError";
  }
}

function draftCutoff() {
  return new Date(Date.now() - DRAFT_TTL_MS);
}

export async function cleanupExpiredDrafts(userId: string): Promise<number> {
  const cutoff = draftCutoff();
  const expired = await prisma.project.findMany({
    where: {
      userId,
      status: "PENDING",
      files: { none: {} },
      updatedAt: { lt: cutoff },
    },
    select: { id: true },
  });

  if (expired.length === 0) return 0;

  await prisma.project.deleteMany({
    where: { id: { in: expired.map((p) => p.id) } },
  });

  return expired.length;
}

export async function listDrafts(userId: string) {
  await cleanupExpiredDrafts(userId);
  const cutoff = draftCutoff();

  return prisma.project.findMany({
    where: {
      userId,
      status: "PENDING",
      files: { none: {} },
      updatedAt: { gte: cutoff },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      idea: true,
      planData: true,
      updatedAt: true,
      createdAt: true,
    },
    take: MAX_DRAFTS_PER_USER,
  });
}

export async function saveDraft(
  userId: string,
  payload: {
    draftId?: string;
    idea: string;
    planData: Prisma.InputJsonValue;
    clarifications?: Prisma.InputJsonValue;
    presets?: Prisma.InputJsonValue;
  }
) {
  await cleanupExpiredDrafts(userId);

  if (payload.draftId) {
    const existing = await prisma.project.findFirst({
      where: {
        id: payload.draftId,
        userId,
        status: "PENDING",
        files: { none: {} },
      },
    });
    if (!existing) {
      throw new DraftServiceError("DRAFT_NOT_FOUND", "Draft tidak ditemukan", 404);
    }

    return prisma.project.update({
      where: { id: existing.id },
      data: {
        idea: payload.idea,
        planData: payload.planData,
        clarifications: (payload.clarifications ??
          existing.clarifications) as Prisma.InputJsonValue,
        presets: (payload.presets ?? existing.presets) as Prisma.InputJsonValue,
      },
      select: { id: true, updatedAt: true },
    });
  }

  const count = await prisma.project.count({
    where: {
      userId,
      status: "PENDING" as ProjectStatus,
      files: { none: {} },
      updatedAt: { gte: draftCutoff() },
    },
  });

  if (count >= MAX_DRAFTS_PER_USER) {
    throw new DraftServiceError(
      "DRAFT_LIMIT",
      `Maksimal ${MAX_DRAFTS_PER_USER} draft aktif. Hapus satu draft atau lanjutkan generate.`,
      409
    );
  }

  return prisma.project.create({
    data: {
      userId,
      idea: payload.idea,
      planData: payload.planData,
      clarifications: payload.clarifications ?? {},
      presets: payload.presets ?? {},
      status: "PENDING",
    },
    select: { id: true, updatedAt: true },
  });
}

export async function deleteDraft(userId: string, draftId: string) {
  const existing = await prisma.project.findFirst({
    where: {
      id: draftId,
      userId,
      status: "PENDING",
      files: { none: {} },
    },
  });
  if (!existing) {
    throw new DraftServiceError("DRAFT_NOT_FOUND", "Draft tidak ditemukan", 404);
  }
  await prisma.project.delete({ where: { id: draftId } });
}
