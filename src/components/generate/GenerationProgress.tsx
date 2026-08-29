"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

function TechSpinner({ size = 48, color = "var(--lp-amber)" }: { size?: number, color?: string }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }} className="mx-auto mb-6">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-t-2 border-r-2"
        style={{ borderColor: color, opacity: 0.3 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner fast ring */}
      <motion.div
        className="absolute inset-[4px] rounded-full border-l-2 border-b-2"
        style={{ borderColor: color, opacity: 0.8 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      {/* Center dot pulsing */}
      <motion.div
        className="absolute inset-0 m-auto rounded-full"
        style={{ width: 8, height: 8, background: color }}
        animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div 
        className="absolute inset-[-50%] m-auto rounded-full blur-xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}20 0%, transparent 60%)` }}
      />
    </div>
  );
}

function SmallSpinner() {
  return (
    <motion.div
      className="w-4 h-4 rounded-full border-2"
      style={{ borderColor: "rgba(255,176,32,0.2)", borderTopColor: "var(--lp-amber)" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
    <div className="generate-app max-w-3xl mx-auto px-4 py-12 relative">
      {/* Ambient glowing background behind the whole component */}
      <div className="absolute inset-0 top-[10%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(255,176,32,0.03)] via-transparent to-transparent pointer-events-none" />

      {/* Heading */}
      <div className="mb-10 text-center relative z-10">
        {globalStatus === "running" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TechSpinner />
            <h1
              className="font-unbounded font-bold text-2xl sm:text-3xl mb-3"
              style={{
                background: "linear-gradient(to right, var(--lp-text-primary), var(--lp-amber))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.03em"
              }}
            >
              Generating your docs...
            </h1>
            <p
              className="font-mono text-sm tracking-wide uppercase font-semibold"
              style={{ color: "var(--lp-text-tertiary)" }}
            >
              {doneCount} / {files.length} FILES COMPLETE
            </p>
          </motion.div>
        )}
        {globalStatus === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-[rgba(34,197,94,0.15)] shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="#4ADE80"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </svg>
            </div>
            <h1
              className="font-unbounded font-bold text-2xl sm:text-3xl mb-2"
              style={{ color: "#4ADE80", letterSpacing: "-0.02em" }}
            >
              System Ready.
            </h1>
            <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Initializing preview environment...
            </p>
          </motion.div>
        )}
        {globalStatus === "error" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-[rgba(239,68,68,0.15)] shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <span style={{ color: "#F87171", fontSize: 24, fontWeight: "bold" }}>!</span>
            </div>
            <h1
              className="font-unbounded font-bold text-2xl mb-2"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
            >
              Generation Failed
            </h1>
            <p
              className="font-mono text-sm max-w-md mx-auto"
              style={{ color: "#F87171" }}
            >
              {error}
            </p>
          </motion.div>
        )}
      </div>

      {/* Overall progress bar */}
      <div className="relative mb-8 z-10">
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 relative"
            style={{
              width: `${progressPct}%`,
              background:
                globalStatus === "done"
                  ? "#4ADE80"
                  : globalStatus === "error"
                  ? "#F87171"
                  : "var(--lp-amber)",
              boxShadow: globalStatus === "running" ? "0 0 10px var(--lp-amber)" : "none",
            }}
          />
        </div>
      </div>

      {/* Live Build Log — Dev Console Style */}
      <div
        className="rounded-xl overflow-hidden mb-8 relative z-10"
        style={{
          border: "1px solid rgba(255,176,32,0.2)",
          background: "var(--app-bg-elevated)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}
        >
          <div className="flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,176,32,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            <span
              className="text-[11px] uppercase tracking-[0.2em] font-bold"
              style={{ color: "var(--lp-text-secondary)", fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              Dev Console
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold tracking-widest"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              {Math.round(progressPct)}%
            </span>
            {globalStatus === "running" && (
              <span className="flex items-center gap-1.5 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse shadow-[0_0_8px_#4ADE80]" />
                <span className="text-[9px] font-bold text-[#4ADE80] tracking-widest">LIVE</span>
              </span>
            )}
          </div>
        </div>
        <div
          ref={logRef}
          className="px-5 py-4 overflow-y-auto"
          style={{
            maxHeight: 180,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {buildLog.map((line, i) => (
            <div key={`${i}-${line.slice(0, 12)}`} className="flex gap-3 hover:bg-[rgba(255,255,255,0.02)] px-2 py-0.5 rounded -mx-2 transition-colors">
              <span style={{ color: "rgba(255,255,255,0.2)", minWidth: "1.5rem" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ color: line.includes("✗") ? "#F87171" : line.includes("✓") ? "#4ADE80" : line.includes("→") ? "var(--lp-amber)" : "inherit" }}>
                {line}
              </span>
            </div>
          ))}
          {globalStatus === "running" && (
            <div className="flex gap-3 px-2 py-0.5">
              <span style={{ color: "rgba(255,255,255,0.2)", minWidth: "1.5rem" }}>--</span>
              <span className="w-2 h-4 bg-[var(--lp-amber)] animate-pulse mt-1" />
            </div>
          )}
        </div>
      </div>

      {/* File list */}
      <div className="flex flex-col gap-3 mb-8 relative z-10">
        {files.map((file) => {
          const meta = FILE_META[file.key];
          const isGenerating = file.status === "generating";
          
          return (
            <motion.div
              key={file.key}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: file.status === "pending" ? 0.5 : 1, y: 0 }}
              className="rounded-xl overflow-hidden transition-all duration-300"
              style={{
                background: isGenerating ? "rgba(255,176,32,0.03)" : "var(--app-bg-elevated)",
                border: isGenerating ? "1px solid rgba(255,176,32,0.3)" : "1px solid var(--app-border-default)",
                boxShadow: isGenerating ? "0 4px 20px rgba(255,176,32,0.05)" : "none",
              }}
            >
              <div className="px-5 py-4 flex items-start gap-4">
                {/* Status icon */}
                <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center mt-0.5">
                  {file.status === "pending" && (
                    <div className="w-5 h-5 rounded-full border-2 border-[rgba(255,255,255,0.1)]" />
                  )}
                  {isGenerating && <SmallSpinner />}
                  {file.status === "done" && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-[rgba(34,197,94,0.15)]"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  )}
                  {file.status === "error" && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[rgba(239,68,68,0.15)]">
                      <span style={{ color: "#F87171", fontSize: 12, fontWeight: "bold" }}>✕</span>
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <DocIcon
                      doc={file.key}
                      size={18}
                      className="shrink-0"
                      style={{ color: isGenerating || file.status === "done" ? "var(--lp-amber)" : "var(--lp-text-tertiary)" }}
                    />
                    <span className="font-mono font-bold text-[14px]" style={{ color: "var(--lp-text-primary)" }}>
                      {meta.label}
                    </span>
                    {file.status === "done" && (
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[rgba(34,197,94,0.1)] text-[#4ADE80] ml-auto">
                        Complete
                      </span>
                    )}
                    {isGenerating && (
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[rgba(255,176,32,0.1)] text-[var(--lp-amber)] ml-auto animate-pulse">
                        {file.retryCount > 0 ? `Retrying ${file.retryCount}...` : "Generating..."}
                      </span>
                    )}
                    {file.status === "error" && (
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[rgba(239,68,68,0.1)] text-[#F87171] ml-auto">
                        Failed
                      </span>
                    )}
                  </div>

                  <p className="font-mono text-[12px] leading-relaxed" style={{ color: "var(--lp-text-secondary)" }}>
                    {meta.description}
                  </p>

                  {/* Streaming Code Preview Box */}
                  <AnimatePresence>
                    {isGenerating && file.chunks && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 font-mono text-[11px] rounded-lg p-3 overflow-hidden"
                        style={{
                          background: "#080808",
                          border: "1px solid rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.5)",
                          lineHeight: 1.6,
                          maxHeight: 100,
                          boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)"
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.8)" }}>{file.chunks.slice(-250)}</span>
                        <span className="animate-pulse ml-1" style={{ color: "var(--lp-amber)", background: "var(--lp-amber)", width: "6px", height: "12px", display: "inline-block", verticalAlign: "middle" }} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Skeleton for pending */}
                  {file.status === "pending" && (
                    <div className="mt-3 flex flex-col gap-2 opacity-30">
                      <div className="h-1.5 w-full max-w-[200px] rounded" style={{ background: "var(--color-border-default)" }} />
                      <div className="h-1.5 w-full max-w-[140px] rounded" style={{ background: "var(--color-border-default)" }} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Educational tip */}
      <AnimatePresence>
        {currentTip && globalStatus === "running" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-4 px-5 py-4 rounded-2xl mb-8 relative overflow-hidden"
            style={{
              background: "var(--app-bg-elevated)",
              border: "1px solid rgba(255,176,32,0.2)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,176,32,0.05)] to-transparent pointer-events-none" />
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[rgba(255,176,32,0.15)] border border-[rgba(255,176,32,0.3)]">
              <span style={{ fontSize: 16 }}>💡</span>
            </div>
            <div className="relative z-10">
              <p
                className="font-unbounded text-[11px] font-bold tracking-widest uppercase mb-1"
                style={{ color: "var(--lp-amber)" }}
              >
                Pro Tip
              </p>
              <p className="font-mono text-[13px]" style={{ color: "var(--lp-text-secondary)", lineHeight: 1.6 }}>
                {currentTip}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {globalStatus === "error" && (
        <motion.button
          id="generation-retry-btn"
          onClick={onError}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl font-mono font-bold text-sm transition-all"
          style={{
            background: "rgba(239,68,68,0.1)",
            color: "#F87171",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          ← COBA LAGI
        </motion.button>
      )}
    </div>
  );
}
