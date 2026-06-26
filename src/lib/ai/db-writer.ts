/**
 * db-writer.ts
 * Non-blocking database write queue untuk menghindari SSE stream blocking.
 * Semua DB writes diqueue dan diproses secara background (fire-and-forget).
 */

import { prisma } from "@/lib/db/prisma";

// ─── Queue ──────────────────────────────────────────────────────────────────

type WriteTask = () => Promise<void>;

const writeQueue: WriteTask[] = [];
let isProcessing = false;

async function processQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  while (writeQueue.length > 0) {
    const task = writeQueue.shift();
    if (task) {
      await task().catch((err) => {
        console.error("[db-writer] Failed to execute write task:", err);
      });
    }
  }

  isProcessing = false;
}

function enqueue(task: WriteTask): void {
  writeQueue.push(task);
  // Fire-and-forget — tidak perlu await, tidak memblokir SSE stream
  processQueue().catch((err) => {
    console.error("[db-writer] Queue processing error:", err);
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Queue penyimpanan file yang selesai di-generate.
 * Non-blocking — tidak mengganggu SSE stream.
 */
export function queueFileWrite(params: {
  projectId: string;
  fileKey: string;
  fileName: string;
  label: string;
  content: string;
  modelUsed?: string;
  tokenCount?: number;
}): void {
  enqueue(async () => {
    await prisma.generatedFile.create({
      data: {
        projectId: params.projectId,
        fileKey: params.fileKey,
        fileName: params.fileName,
        label: params.label,
        content: params.content,
      },
    });
  });
}

/**
 * Queue update status project.
 * Non-blocking.
 */
export function queueProjectStatusUpdate(
  projectId: string,
  status: "GENERATING" | "DONE" | "FAILED"
): void {
  enqueue(async () => {
    await prisma.project.update({
      where: { id: projectId },
      data: { status, updatedAt: new Date() },
    });
  });
}

/**
 * Flush semua pending writes dan tunggu selesai.
 * Gunakan ini jika perlu memastikan semua writes selesai sebelum close stream.
 */
export async function flushQueue(): Promise<void> {
  // Tambah task sentinel yang resolves setelah semua task sebelumnya selesai
  return new Promise((resolve) => {
    enqueue(async () => {
      resolve();
    });
  });
}
