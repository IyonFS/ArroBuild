"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Clarifications,
  Presets,
  GeneratedFiles,
  FileKey,
  UserTier,
} from "./types";
import { FILE_META, TIER_FILE_KEYS } from "./types";
import { trackEvent } from "@/lib/analytics";

type FileStatus = "pending" | "generating" | "done" | "error";

interface FileState {
  key: FileKey;
  status: FileStatus;
  content?: string;
  errorMessage?: string;
  chunks: string;
  retryCount: number;
}

interface GenerationProgressProps {
  idea: string;
  clarifications: Clarifications;
  presets: Presets;
  tier: UserTier;
  modelId?: string;
  selectedDocs?: FileKey[];
  onProjectCreated: (id: string) => void;
  onComplete: (files: GeneratedFiles) => void;
  onError: () => void;
}

// Educational tips per file key
const FILE_TIPS: Partial<Record<FileKey, string>> = {
  prd: "PRD (Product Requirements Document) adalah kontrak antara tim product, design, dan engineering. Ini yang bikin semua orang build hal yang sama.",
  context: "context.md adalah 'memory' untuk AI agent kamu. Paste di Claude Code atau Cursor sebelum mulai coding.",
  plan: "Development plan berisi urutan fitur yang logis — build yang foundational dulu, jangan langsung ke fitur fancy.",
  "design-system": "Design system memastikan konsistensi visual dari hari pertama. AI agent bisa pakai ini sebagai referensi tiap generate komponen UI.",
  agents: "File ini berisi instruksi khusus untuk AI agent kamu. Paste langsung ke .cursorrules atau CLAUDE.md setelah selesai.",
  "production-hardening": "Production hardening checklist memastikan kamu tidak miss hal kritikal sebelum launch — security, monitoring, dan rollback plan.",
  "scale-performance": "Scale planning sebelum traffic datang jauh lebih murah daripada refactor saat sudah overload.",
  "growth-quality": "Growth strategy yang terdokumentasi memastikan tim punya arah yang sama — bukan jalan sendiri-sendiri.",
};

function Spinner() {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 animate-spin"
      style={{
        borderColor: "rgba(204,255,0,0.2)",
        borderTopColor: "var(--color-lime)",
      }}
    />
  );
}

export default function GenerationProgress({
  idea,
  clarifications,
  presets,
  tier,
  modelId,
  selectedDocs,
  onProjectCreated,
  onComplete,
  onError,
}: GenerationProgressProps) {
  const fileKeys = selectedDocs ?? TIER_FILE_KEYS[tier];

  const [files, setFiles] = useState<FileState[]>(
    fileKeys.map((key) => ({ key, status: "pending", chunks: "", retryCount: 0 }))
  );
  const [error, setError] = useState<string | null>(null);
  const [globalStatus, setGlobalStatus] = useState<"running" | "done" | "error">("running");
  const [currentTip, setCurrentTip] = useState<string>("");
  const started = useRef(false);

  function updateFile(key: FileKey, patch: Partial<FileState>) {
    setFiles((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...patch } : f))
    );
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function run() {
      trackEvent("generation_started");
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, clarifications, presets, tier, modelId }),
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "Unknown error");
          throw new Error(`API error ${res.status}: ${text}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const collectedFiles: GeneratedFiles = {};
        let buffer = "";
        let lastError: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let event: Record<string, unknown>;
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }

            const type = event.type as string;

            if (type === "project_created") {
              onProjectCreated(event.projectId as string);
            } else if (type === "progress") {
              const key = event.fileKey as FileKey;
              updateFile(key, { status: "generating", chunks: "" });
              // Set educational tip for this file
              const tip = FILE_TIPS[key];
              if (tip) setCurrentTip(tip);
            } else if (type === "retry") {
              const key = event.fileKey as FileKey;
              const attempt = event.attempt as number;
              updateFile(key, {
                chunks: "",
                retryCount: attempt - 1,
                status: "generating",
              });
            } else if (type === "chunk") {
              const key = event.fileKey as FileKey;
              setFiles((prev) =>
                prev.map((f) =>
                  f.key === key
                    ? { ...f, chunks: f.chunks + (event.chunk as string) }
                    : f
                )
              );
            } else if (type === "file_done") {
              const key = event.fileKey as FileKey;
              const content = event.content as string;
              collectedFiles[key] = content;
              updateFile(key, { status: "done", content });
            } else if (type === "error") {
              const key = event.fileKey as FileKey | undefined;
              const errMsg = (event.error as string) ?? "Generation failed";
              lastError = errMsg;
              if (key) {
                updateFile(key, { status: "error", errorMessage: errMsg });
              }
            } else if (type === "all_done") {
              const success = event.success !== false;
              const files = event.files as GeneratedFiles | undefined;

              if (!success || !files || Object.keys(files).length === 0) {
                const errMsg =
                  (event.error as string) ??
                  lastError ??
                  "Generation failed. Please try again.";
                trackEvent("generation_failed", { error: errMsg });
                setError(errMsg);
                setGlobalStatus("error");
                return;
              }

              setGlobalStatus("done");
              trackEvent("generation_completed");
              setTimeout(() => onComplete(files), 800);
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Generation failed";
        trackEvent("generation_failed", { error: msg });
        setError(msg);
        setGlobalStatus("error");
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doneCount = files.filter((f) => f.status === "done").length;
  const generatingFile = files.find((f) => f.status === "generating");
  const progressPct = (doneCount / files.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in-up">
      {/* Heading */}
      <div className="mb-8 text-center">
        {globalStatus === "running" && (
          <>
            <div
              className="w-12 h-12 rounded-full border-2 animate-spin mx-auto mb-5"
              style={{
                borderColor: "rgba(204,255,0,0.2)",
                borderTopColor: "var(--color-lime)",
              }}
            />
            <h1
              className="font-unbounded font-bold text-xl mb-2"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
            >
              Generating your docs...
            </h1>
            <p
              className="font-mono text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {doneCount} of {files.length} files complete
            </p>
          </>
        )}
        {globalStatus === "done" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1
              className="font-unbounded font-bold text-xl mb-2"
              style={{ color: "var(--color-lime)", letterSpacing: "-0.02em" }}
            >
              Docs siap!
            </h1>
            <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Loading preview...
            </p>
          </>
        )}
        {globalStatus === "error" && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1
              className="font-unbounded font-bold text-xl mb-2"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
            >
              Generation gagal
            </h1>
            <p
              className="font-mono text-sm max-w-md mx-auto"
              style={{ color: "#EF4444" }}
            >
              {error}
            </p>
          </>
        )}
      </div>

      {/* Overall progress bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden mb-6"
        style={{ background: "var(--color-border-default)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progressPct}%`,
            background:
              globalStatus === "done"
                ? "var(--color-lime)"
                : "linear-gradient(90deg, rgba(204,255,0,0.6), var(--color-lime))",
          }}
        />
      </div>

      {/* File list */}
      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{
          border: "0.5px solid var(--color-border-default)",
          background: "var(--color-bg-elevated)",
        }}
      >
        {files.map((file, i) => {
          const meta = FILE_META[file.key];
          return (
            <div
              key={file.key}
              className="flex items-start gap-4 px-5 py-4 transition-all"
              style={{
                borderBottom:
                  i < files.length - 1
                    ? "0.5px solid var(--color-border-default)"
                    : "none",
                opacity: file.status === "pending" ? 0.4 : 1,
              }}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
                {file.status === "pending" && (
                  <div
                    className="w-5 h-5 rounded-full border"
                    style={{ borderColor: "var(--color-border-default)" }}
                  />
                )}
                {file.status === "generating" && <Spinner />}
                {file.status === "done" && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-lime)" }}
                  >
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="#0A0A0A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                {file.status === "error" && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "#EF4444" }}
                  >
                    <span style={{ color: "#fff", fontSize: 10 }}>✕</span>
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-base">{meta.icon}</span>
                  <span
                    className="font-mono font-semibold text-sm"
                    style={{
                      color:
                        file.status === "pending"
                          ? "var(--color-text-tertiary)"
                          : "var(--color-text-primary)",
                    }}
                  >
                    {meta.label}
                  </span>
                  {file.status === "done" && (
                    <span
                      className="font-mono text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded ml-auto"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        color: "#22C55E",
                      }}
                    >
                      Done
                    </span>
                  )}
                  {file.status === "generating" && (
                    <span
                      className="font-mono text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded ml-auto"
                      style={{
                        background: "rgba(59,130,246,0.1)",
                        color: "#3B82F6",
                      }}
                    >
                      {file.retryCount > 0
                        ? `Retry ${file.retryCount}...`
                        : "Generating..."}
                    </span>
                  )}
                  {file.status === "error" && (
                    <span
                      className="font-mono text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded ml-auto"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        color: "#EF4444",
                      }}
                    >
                      Failed
                    </span>
                  )}
                </div>

                <p
                  className="font-mono text-[11px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {meta.description}
                </p>

                {/* Streaming preview */}
                {file.status === "generating" && file.chunks && (
                  <div
                    className="mt-2 font-mono text-[11px] rounded-lg p-2.5 overflow-hidden"
                    style={{
                      background: "#0D0D0D",
                      border: "0.5px solid var(--color-border-default)",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.6,
                      maxHeight: 80,
                    }}
                  >
                    <span>{file.chunks.slice(-200)}</span>
                    <span className="animate-pulse" style={{ color: "var(--color-lime)" }}>▊</span>
                  </div>
                )}

                {/* Skeleton for pending */}
                {file.status === "pending" && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <div
                      className="h-1.5 w-3/4 rounded"
                      style={{ background: "var(--color-border-default)" }}
                    />
                    <div
                      className="h-1.5 w-1/2 rounded"
                      style={{ background: "var(--color-border-default)" }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational tip */}
      {currentTip && globalStatus === "running" && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl mb-6"
          style={{
            background: "rgba(204,255,0,0.04)",
            border: "0.5px solid rgba(204,255,0,0.12)",
          }}
        >
          <span style={{ color: "var(--color-lime)", fontSize: 14, flexShrink: 0 }}>💡</span>
          <div>
            <p
              className="font-mono text-[10px] font-bold tracking-wide uppercase mb-1"
              style={{ color: "var(--color-lime)" }}
            >
              Tau nggak?
            </p>
            <p
              className="font-mono text-xs"
              style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}
            >
              {currentTip}
            </p>
          </div>
        </div>
      )}

      {globalStatus === "error" && (
        <button
          id="generation-retry-btn"
          onClick={onError}
          className="w-full py-3 rounded-xl font-mono font-bold text-sm transition-all"
          style={{
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-secondary)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          ← Coba lagi
        </button>
      )}
    </div>
  );
}
