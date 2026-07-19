"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Clarifications,
  Presets,
  GeneratedFiles,
  FileKey,
  UserPlanStatus,
  PerDocumentModelClass,
  Feature,
  ProductType,
  ProjectStage,
} from "./types";
import { FILE_META, TIER_FILE_KEYS, resolvePreviewTier, isSubscribed } from "./types";
import { DocIcon } from "@/lib/ui/app-icons";
import { trackEvent } from "@/lib/analytics";
import { parseApiErrorMessage } from "@/lib/parse-api-error";

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
  plan: UserPlanStatus;
  modelId?: string;
  selectedDocs?: FileKey[];
  perDocModelClass?: PerDocumentModelClass;
  estimatedCredits?: number;
  productType?: ProductType;
  projectStage?: ProjectStage;
  features?: Feature[];
  onProjectCreated: (id: string) => void;
  onComplete: (files: GeneratedFiles) => void;
  onError: () => void;
}

// Educational tips per file key
const FILE_TIPS: Partial<Record<FileKey, string>> = {
  prd: "PRD (Product Requirements Document) adalah kontrak antara tim product, design, dan engineering. Ini yang bikin semua orang build hal yang sama.",
  architecture: "architecture.md adalah blueprint teknis — skema DB, struktur folder, dan kontrak API untuk AI agent kamu.",
  "plan-task": "Plan / task berisi urutan fitur yang logis — build yang foundational dulu, jangan langsung ke fitur fancy.",
  "design-system": "Design system memastikan konsistensi visual dari hari pertama. AI agent bisa pakai ini sebagai referensi tiap generate komponen UI.",
  "agent-rules": "File ini berisi instruksi khusus untuk AI agent kamu. Paste langsung ke .cursorrules atau CLAUDE.md setelah selesai.",
  "adaptive-document": "Dokumen adaptif menyesuaikan strategi dengan tipe produk kamu — SaaS, marketplace, mobile, dan lainnya.",
  "cost-infrastructure": "Estimasi biaya hosting & infrastruktur membantu kamu tidak kaget saat traffic naik.",
  "analytics-metrics": "Event tracking dan funnel yang terdokumentasi memastikan tim punya data yang sama untuk dioptimasi.",
  "testing-qa": "Testing plan prioritas memastikan fitur kritikal tervalidasi sebelum launch.",
  "onboarding-email": "Alur onboarding & email transaksional yang jelas meningkatkan aktivasi pengguna pertama.",
  "competitive-analysis": "Analisis kompetitor membantu positioning produk yang jelas dan diferensiasi yang kuat.",
  "security-launch": "Security & launch checklist memastikan kamu tidak miss hal kritikal sebelum go-live.",
  "database-deep-dive": "Database deep-dive sebelum traffic datang jauh lebih murah daripada refactor saat sudah overload.",
  "compliance-legal": "Outline privasi & legal membantu produk siap regulasi sejak awal.",
};

function Spinner() {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 animate-spin"
      style={{
        borderColor: "rgba(255,176,32,0.2)",
        borderTopColor: "var(--app-amber)",
      }}
    />
  );
}

export default function GenerationProgress({
  idea,
  clarifications,
  presets,
  plan,
  selectedDocs,
  perDocModelClass,
  estimatedCredits,
  productType,
  projectStage,
  features,
  onProjectCreated,
  onComplete,
  onError,
}: GenerationProgressProps) {
  const previewTier = resolvePreviewTier(plan);
  const fileKeys = selectedDocs ?? TIER_FILE_KEYS[previewTier];

  const [files, setFiles] = useState<FileState[]>(
    fileKeys.map((key) => ({ key, status: "pending", chunks: "", retryCount: 0 }))
  );
  const [error, setError] = useState<string | null>(null);
  const [globalStatus, setGlobalStatus] = useState<"running" | "done" | "error">("running");
  const [currentTip, setCurrentTip] = useState<string>("");
  const [buildLog, setBuildLog] = useState<string[]>([
    "> arrobuild generate --init",
    "> compiling knowledge model...",
  ]);
  const logRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  function pushLog(line: string) {
    setBuildLog((prev) => [...prev.slice(-80), line]);
  }

  function updateFile(key: FileKey, patch: Partial<FileState>) {
    setFiles((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...patch } : f))
    );
  }

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [buildLog]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function run() {
      trackEvent("generation_started");
      try {
        const previewTier = resolvePreviewTier(plan);
        const docKeys = selectedDocs ?? TIER_FILE_KEYS[previewTier];
        const perDocumentModelClass =
          perDocModelClass && Object.keys(perDocModelClass).length > 0
            ? Object.fromEntries(
                docKeys
                  .filter((k) => perDocModelClass[k])
                  .map((k) => [k, perDocModelClass[k]!])
              )
            : undefined;

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea,
            clarifications,
            presets,
            selectedDocs,
            perDocumentModelClass,
            estimatedCredits,
            productType,
            projectStage,
            features,
            tier: isSubscribed(plan) ? plan : undefined,
          }),
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "Unknown error");
          throw new Error(parseApiErrorMessage(res.status, text));
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
              pushLog(`✓ project created · ${(event.projectId as string).slice(0, 12)}…`);
            } else if (type === "progress") {
              const key = event.fileKey as FileKey;
              updateFile(key, { status: "generating", chunks: "" });
              const tip = FILE_TIPS[key];
              if (tip) setCurrentTip(tip);
              pushLog(`→ generating ${FILE_META[key]?.label ?? key}…`);
            } else if (type === "retry") {
              const key = event.fileKey as FileKey;
              const attempt = event.attempt as number;
              updateFile(key, {
                chunks: "",
                retryCount: attempt - 1,
                status: "generating",
              });
              pushLog(`↻ retry ${FILE_META[key]?.label ?? key} (attempt ${attempt})`);
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
              pushLog(
                `✓ ${FILE_META[key]?.label ?? key} ready · ${content.length.toLocaleString()} chars`
              );
            } else if (type === "error") {
              const key = event.fileKey as FileKey | undefined;
              const errMsg = (event.error as string) ?? "Generation failed";
              lastError = errMsg;
              if (key) {
                updateFile(key, { status: "error", errorMessage: errMsg });
                pushLog(`✗ ${FILE_META[key]?.label ?? key} failed · ${errMsg.slice(0, 80)}`);
              } else {
                pushLog(`✗ error · ${errMsg.slice(0, 100)}`);
              }
            } else if (type === "all_done") {
              const success = event.success !== false;
              const files = event.files as GeneratedFiles | undefined;

              if (!success || !files || Object.keys(files).length === 0) {
                const errMsg =
                  (event.error as string) ??
                  lastError ??
                  "Generation failed. Please try again.";
                pushLog(`✗ build failed · ${errMsg.slice(0, 100)}`);
                trackEvent("generation_failed", { error: errMsg });
                setError(errMsg);
                setGlobalStatus("error");
                return;
              }

              pushLog(`✓ build complete · ${Object.keys(files).length} documents`);
              setGlobalStatus("done");
              trackEvent("generation_completed");
              setTimeout(() => onComplete(files), 800);
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Generation failed";
        pushLog(`✗ fatal · ${msg.slice(0, 120)}`);
        trackEvent("generation_failed", { error: msg });
        setError(msg);
        setGlobalStatus("error");
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doneCount = files.filter((f) => f.status === "done").length;
  const progressPct = (doneCount / files.length) * 100;

  return (
    <div className="generate-app max-w-2xl mx-auto px-4 py-10 animate-fade-in-up">
      {/* Heading */}
      <div className="mb-8 text-center">
        {globalStatus === "running" && (
          <>
            <div
              className="w-12 h-12 rounded-full border-2 animate-spin mx-auto mb-5"
              style={{
                borderColor: "rgba(255,176,32,0.2)",
                borderTopColor: "var(--app-amber)",
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
              style={{ color: "var(--app-amber)", letterSpacing: "-0.02em" }}
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
                ? "var(--app-amber)"
                : "linear-gradient(90deg, rgba(255,176,32,0.6), var(--app-amber))",
          }}
        />
      </div>

      {/* Live Build Log — terminal style */}
      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{
          border: "1px solid rgba(255,176,32,0.18)",
          background: "#050505",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#22C55E" }} />
            <span
              className="ml-2 text-[10px] uppercase tracking-widest font-bold"
              style={{
                color: "rgba(255,176,32,0.7)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              Live Build Log
            </span>
          </div>
          <span
            className="text-[10px]"
            style={{
              color: "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}
          >
            {Math.round(progressPct)}%
          </span>
        </div>
        <div
          ref={logRef}
          className="px-4 py-3 overflow-y-auto"
          style={{
            maxHeight: 160,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            lineHeight: 1.65,
            color: "rgba(255,176,32,0.75)",
          }}
        >
          {buildLog.map((line, i) => (
            <div key={`${i}-${line.slice(0, 12)}`}>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>{" "}
              {line}
            </div>
          ))}
          {globalStatus === "running" && (
            <div>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>··</span>{" "}
              <span className="animate-pulse">_</span>
            </div>
          )}
        </div>
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
                    style={{ background: "var(--app-amber)" }}
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
                  <DocIcon
                    doc={file.key}
                    size={16}
                    className="shrink-0"
                    style={{
                      color:
                        file.status === "generating"
                          ? "var(--app-amber)"
                          : file.status === "done"
                            ? "var(--app-amber)"
                            : "var(--app-text-tertiary)",
                    }}
                  />
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
                    <span className="animate-pulse" style={{ color: "var(--app-amber)" }}>▊</span>
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
            background: "rgba(255,176,32,0.04)",
            border: "0.5px solid rgba(255,176,32,0.12)",
          }}
        >
          <span style={{ color: "var(--app-amber)", fontSize: 14, flexShrink: 0 }}>💡</span>
          <div>
            <p
              className="font-mono text-[10px] font-bold tracking-wide uppercase mb-1"
              style={{ color: "var(--app-amber)" }}
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

