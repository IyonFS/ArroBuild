/**
 * stream-writer.ts
 * Abstraksi SSE (Server-Sent Events) stream writer.
 * Memisahkan logika encoding SSE dari orchestrator.
 */

import type { FileKey } from "./prompts/shared";

// ─── Event Types ─────────────────────────────────────────────────────────────

export type StreamEventType =
  | "project_created"
  | "progress"
  | "chunk"
  | "file_done"
  | "file_error"
  | "all_done"
  | "error"
  | "retry";

export interface StreamEvent {
  type: StreamEventType;
  projectId?: string;
  fileKey?: FileKey;
  fileName?: string;
  label?: string;
  chunk?: string;
  content?: string;
  error?: string;
  attempt?: number;
  usedModel?: string;
  fallbackUsed?: boolean;
  success?: boolean;
  files?: Record<string, string>;
  failedFiles?: Partial<Record<FileKey, string>>;
}

// ─── StreamWriter ─────────────────────────────────────────────────────────

export class StreamWriter {
  private readonly encoder = new TextEncoder();
  private readonly controller: ReadableStreamDefaultController<Uint8Array>;
  private closed = false;

  constructor(controller: ReadableStreamDefaultController<Uint8Array>) {
    this.controller = controller;
  }

  /**
   * Kirim satu SSE event ke client.
   */
  send(event: StreamEvent): void {
    if (this.closed) return;
    try {
      const payload = `data: ${JSON.stringify(event)}\n\n`;
      this.controller.enqueue(this.encoder.encode(payload));
    } catch {
      // Stream mungkin sudah ditutup dari sisi client
      this.closed = true;
    }
  }

  /**
   * Kirim event bahwa project berhasil dibuat.
   */
  sendProjectCreated(projectId: string): void {
    this.send({ type: "project_created", projectId });
  }

  /**
   * Kirim status "mulai generate file X".
   */
  sendFileProgress(fileKey: FileKey, fileName: string, label: string): void {
    this.send({ type: "progress", fileKey, fileName, label });
  }

  /**
   * Kirim chunk teks streaming dari LLM.
   */
  sendChunk(fileKey: FileKey, chunk: string): void {
    this.send({ type: "chunk", fileKey, chunk });
  }

  /**
   * Kirim notifikasi retry.
   */
  sendRetry(fileKey: FileKey, attempt: number): void {
    this.send({ type: "retry", fileKey, attempt });
  }

  /**
   * Kirim event bahwa satu file selesai di-generate.
   */
  sendFileDone(
    fileKey: FileKey,
    fileName: string,
    label: string,
    content: string,
    usedModel?: string,
    fallbackUsed?: boolean
  ): void {
    this.send({
      type: "file_done",
      fileKey,
      fileName,
      label,
      content,
      usedModel,
      fallbackUsed,
    });
  }

  /**
   * Kirim error pada satu file (generate tetap lanjut ke file berikutnya).
   */
  sendFileError(fileKey: FileKey, fileName: string, label: string, error: string): void {
    this.send({ type: "file_error", fileKey, fileName, label, error });
  }

  /**
   * Kirim fatal error (menghentikan seluruh proses).
   */
  sendError(error: string): void {
    this.send({ type: "error", error });
  }

  /**
   * Kirim event akhir — semua dokumen selesai diproses.
   */
  sendAllDone(
    success: boolean,
    files?: Record<string, string>,
    failedFiles?: Partial<Record<FileKey, string>>,
    error?: string
  ): void {
    this.send({
      type: "all_done",
      success,
      files: success ? files : undefined,
      failedFiles: success ? undefined : failedFiles,
      error: success ? undefined : error,
    });
  }

  /**
   * Tutup stream controller.
   */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    try {
      this.controller.close();
    } catch {
      // Sudah tertutup
    }
  }

  get isClosed(): boolean {
    return this.closed;
  }
}

// ─── SSE Response Headers ───────────────────────────────────────────────────

export const SSE_HEADERS: Record<string, string> = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};
