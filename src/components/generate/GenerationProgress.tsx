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
  onProjectCreated: (id: string) => void;
  onComplete: (files: GeneratedFiles) => void;
  onError: () => void;
}

function Spinner() {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 animate-spin"
      style={{
        borderColor: "var(--green-muted)",
        borderTopColor: "var(--green-500)",
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
  onProjectCreated,
  onComplete,
  onError,
}: GenerationProgressProps) {
  const fileKeys = TIER_FILE_KEYS[tier];

  const [files, setFiles] = useState<FileState[]>(
    fileKeys.map((key) => ({ key, status: "pending", chunks: "", retryCount: 0 }))
  );
  const [error, setError] = useState<string | null>(null);
  const [globalStatus, setGlobalStatus] = useState<
    "running" | "done" | "error"
  >("running");
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
            } else if (type === "retry") {
              const key = event.fileKey as FileKey;
              const attempt = event.attempt as number;
              // Reset chunks and show retry state
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

  return (
    <div className="animate-fade-in-up">
      {/* Heading */}
      <div className="mb-10 text-center">
        {globalStatus === "running" && (
          <>
            <div
              className="w-12 h-12 rounded-full border-2 animate-spin mx-auto mb-5"
              style={{
                borderColor: "var(--green-muted)",
                borderTopColor: "var(--green-500)",
              }}
            />
            <h1 className="text-h1 mb-2">Generating your docs</h1>
            <p className="text-body-lg">
              {doneCount} of {files.length} files complete
            </p>
          </>
        )}
        {globalStatus === "done" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-h1 mb-2">All done!</h1>
            <p className="text-body-lg">Loading preview...</p>
          </>
        )}
        {globalStatus === "error" && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-h1 mb-2">Generation gagal</h1>
            <p className="text-body-lg max-w-lg mx-auto" style={{ color: "var(--danger-text)" }}>
              {error}
            </p>
          </>
        )}
      </div>

      {/* File list */}
      <div className="card mb-6 p-0 overflow-hidden">
        {files.map((file, i) => {
          const meta = FILE_META[file.key];
          return (
            <div
              key={file.key}
              className="flex items-center gap-4 px-6 py-4"
              style={{
                borderBottom:
                  i < files.length - 1
                    ? "1px solid var(--bg-border)"
                    : "none",
                opacity: file.status === "pending" ? 0.45 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                {file.status === "pending" && (
                  <div
                    className="w-5 h-5 rounded-full border"
                    style={{ borderColor: "var(--bg-border)" }}
                  />
                )}
                {file.status === "generating" && <Spinner />}
                {file.status === "done" && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "var(--green-500)" }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="#052e16"
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
                    style={{ background: "var(--danger-bg)" }}
                  >
                    <span
                      style={{ color: "var(--danger-text)", fontSize: 10 }}
                    >
                      ✕
                    </span>
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span>{meta.icon}</span>
                  <span
                    className="text-h3"
                    style={{
                      color:
                        file.status === "pending"
                          ? "var(--text-tertiary)"
                          : "var(--text-primary)",
                    }}
                  >
                    {meta.label}
                  </span>
                  {file.status === "done" && (
                    <span className="badge badge-success ml-auto text-xs">
                      Done
                    </span>
                  )}
                  {file.status === "generating" && (
                    <span className="badge badge-info ml-auto text-xs">
                      {file.retryCount > 0
                        ? `Retry ${file.retryCount}...`
                        : "Writing..."}
                    </span>
                  )}
                  {file.status === "error" && (
                    <span
                      className="badge ml-auto text-xs"
                      style={{
                        background: "var(--danger-bg)",
                        color: "var(--danger-text)",
                      }}
                    >
                      Failed
                    </span>
                  )}
                </div>
                <p className="text-caption">{meta.description}</p>
                {file.status === "error" && file.errorMessage && (
                  <p
                    className="text-caption mt-1"
                    style={{ color: "var(--danger-text)" }}
                  >
                    {file.errorMessage}
                  </p>
                )}

                {/* Streaming preview */}
                {file.status === "generating" && file.chunks && (
                  <div
                    className="mt-2 text-caption font-mono truncate"
                    style={{
                      color: "var(--text-tertiary)",
                      maxWidth: "100%",
                    }}
                  >
                    {file.chunks.slice(-80)}
                    <span className="animate-pulse">▊</span>
                  </div>
                )}
                {file.status === "pending" && (
                  <div className="mt-3 flex flex-col gap-1.5 opacity-50">
                    <div className="h-2 w-3/4 skeleton rounded" />
                    <div className="h-2 w-1/2 skeleton rounded" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div
        className="h-1 rounded-full overflow-hidden mb-6"
        style={{ background: "var(--bg-border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${(doneCount / files.length) * 100}%`,
            background:
              globalStatus === "done"
                ? "var(--green-500)"
                : "linear-gradient(90deg, var(--green-600), var(--green-500))",
          }}
        />
      </div>

      {globalStatus === "error" && (
        <button
          id="generation-retry-btn"
          onClick={onError}
          className="btn btn-secondary w-full"
        >
          ← Try Again
        </button>
      )}
    </div>
  );
}
