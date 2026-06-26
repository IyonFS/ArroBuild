"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GeneratedFiles, FileKey } from "./types";
import { FILE_META } from "./types";
import EmailCaptureModal from "./EmailCaptureModal";
import { useToast } from "@/components/ui/Toast";
import { trackEvent } from "@/lib/analytics";

interface DocPreviewProps {
  projectId: string | null;
  files: GeneratedFiles;
  onRestart: () => void;
}

// Dynamic: show whatever files were generated (tier-dependent)
const ALL_POSSIBLE_KEYS: FileKey[] = [
  "prd",
  "context",
  "plan",
  "design-system",
  "agents",
  "production-hardening",
  "scale-performance",
  "growth-quality",
];

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    trackEvent("copy_to_clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      id="copy-file-btn"
      onClick={handleCopy}
      className="btn btn-secondary btn-sm flex items-center gap-1.5"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="var(--color-lime)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ color: "var(--color-lime)" }}>Copied!</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ─── Markdown renderer styles ─────────────────────────────────────────────────

const markdownStyles = `
  .md-content h1 { font-family: var(--font-unbounded, 'Unbounded'), sans-serif; font-size: 1.3rem; font-weight: 700; color: var(--color-text-primary); margin: 1.5rem 0 0.75rem; letter-spacing: -0.03em; line-height: 1.2; }
  .md-content h2 { font-family: var(--font-jetbrains-mono, monospace); font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 1.5rem 0 0.5rem; border-bottom: 0.5px solid var(--color-border-default); padding-bottom: 6px; }
  .md-content h3 { font-family: var(--font-jetbrains-mono, monospace); font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); margin: 1.1rem 0 0.4rem; }
  .md-content h4 { font-family: var(--font-jetbrains-mono, monospace); font-size: 0.85rem; font-weight: 600; color: var(--color-text-tertiary); margin: 0.9rem 0 0.35rem; }
  .md-content p { font-family: var(--font-jetbrains-mono, monospace); font-size: 13px; line-height: 1.75; color: var(--color-text-secondary); margin: 0.5rem 0; }
  .md-content code { font-family: var(--font-jetbrains-mono, monospace); font-size: 12px; padding: 1px 6px; border-radius: 4px; background: rgba(204,255,0,0.06); color: var(--color-lime); border: 0.5px solid rgba(204,255,0,0.2); white-space: pre-wrap; word-break: break-all; }
  .md-content pre { background: #0D0D0D; border: 0.5px solid var(--color-border-default); border-radius: 8px; padding: 1rem; margin: 0.75rem 0; overflow-x: auto; }
  .md-content pre code { background: none; border: none; padding: 0; font-size: 12px; color: var(--color-text-primary); white-space: pre; word-break: normal; }
  .md-content ul, .md-content ol { margin: 0.5rem 0 0.5rem 1.5rem; }
  .md-content li { font-family: var(--font-jetbrains-mono, monospace); font-size: 13px; line-height: 1.75; color: var(--color-text-secondary); margin: 0.2rem 0; }
  .md-content li::marker { color: var(--color-lime); }
  .md-content blockquote { border-left: 2.5px solid var(--color-lime); padding: 0.5rem 1rem; margin: 0.75rem 0; background: rgba(204,255,0,0.04); border-radius: 0 6px 6px 0; }
  .md-content blockquote p { color: var(--color-text-secondary); margin: 0; }
  .md-content hr { border: none; border-top: 0.5px solid var(--color-border-default); margin: 1.25rem 0; }
  .md-content table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 12px; font-family: var(--font-jetbrains-mono, monospace); }
  .md-content thead tr { background: var(--color-bg-elevated); }
  .md-content th { padding: 8px 12px; text-align: left; font-weight: 600; color: var(--color-text-primary); border: 0.5px solid var(--color-border-default); }
  .md-content td { padding: 8px 12px; color: var(--color-text-secondary); border: 0.5px solid var(--color-border-default); }
  .md-content tr:nth-child(even) { background: rgba(255,255,255,0.02); }
  .md-content a { color: var(--color-lime); text-decoration: none; }
  .md-content a:hover { text-decoration: underline; }
  .md-content strong { color: var(--color-text-primary); font-weight: 600; }
  .md-content em { color: var(--color-text-secondary); font-style: italic; }
  .md-content input[type="checkbox"] { accent-color: var(--color-lime); margin-right: 6px; }
`;

// ─── DocPreview ───────────────────────────────────────────────────────────────

export default function DocPreview({ projectId, files, onRestart }: DocPreviewProps) {
  const { toast } = useToast();
  const availableKeys = ALL_POSSIBLE_KEYS.filter((k) => files[k]);
  const [activeKey, setActiveKey] = useState<FileKey>(availableKeys[0] ?? "context");
  const [showRaw, setShowRaw] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);

  const activeContent = files[activeKey] ?? "";
  const meta = FILE_META[activeKey];

  // ─── Download logic ─────────────────────────────────────────────────────────

  const triggerDownload = useCallback(async () => {
    if (!projectId) {
      toast("Project ID tidak ditemukan, coba ulangi generation.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/export?projectId=${projectId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Export gagal");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `arrobuild-docs-${projectId.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      trackEvent("zip_downloaded");
      toast("✓ File berhasil didownload!", "success");
    } catch (err) {
      console.error("Export error:", err);
      // Fallback: download file aktif saja
      const blob = new Blob([activeContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeKey}.md`;
      a.click();
      URL.revokeObjectURL(url);
      trackEvent("download_fallback", { fileKey: activeKey });
      toast("Export gagal, mendownload file aktif saja.", "error");
    }
  }, [projectId, activeContent, activeKey, toast]);

  function handleDownloadClick() {
    if (emailCaptured || !projectId) {
      // Email sudah dicapture sebelumnya, langsung download
      triggerDownload();
    } else {
      setShowEmailModal(true);
    }
  }

  function handleEmailConfirm() {
    setShowEmailModal(false);
    setEmailCaptured(true);
    toast("Email tersimpan! Mendownload...", "success");
    triggerDownload();
  }

  return (
    <div className="animate-fade-in-up">
      {/* Email capture modal */}
      {showEmailModal && projectId && (
        <EmailCaptureModal
          projectId={projectId}
          onConfirm={handleEmailConfirm}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        {/* Success banner */}
        <div
          className="flex items-start justify-between gap-4 px-5 py-4 rounded-xl mb-5"
          style={{
            background: "rgba(204,255,0,0.05)",
            border: "0.5px solid rgba(204,255,0,0.2)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "var(--color-lime)", fontSize: 16 }}>✦</span>
              <span
                className="font-mono text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "var(--color-lime)" }}
              >
                Docs siap!
              </span>
            </div>
            <h1
              className="font-unbounded font-bold text-xl mb-1"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
            >
              {availableKeys.length} dokumen berhasil digenerate
            </h1>
            <p className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Siap dipakai di AI agent kamu.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              id="preview-download-btn"
              onClick={handleDownloadClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono font-bold text-sm transition-all"
              style={{ background: "var(--color-lime)", color: "#0A0A0A" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download ZIP
            </button>
            <button
              id="preview-restart-btn"
              onClick={onRestart}
              className="px-4 py-2.5 rounded-lg font-mono text-sm transition-all"
              style={{
                background: "var(--color-bg-elevated)",
                color: "var(--color-text-secondary)",
                border: "0.5px solid var(--color-border-default)",
              }}
            >
              Generate lagi
            </button>
          </div>
        </div>

        {/* Quick Start guide */}
        <div
          className="px-4 py-3 rounded-xl mb-4"
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          <p
            className="font-mono text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            — Quick Start
          </p>
          <ol className="flex flex-col gap-1.5">
            {[
              "Extract ZIP ke root folder proyekmu",
              "Buka AI agent-mu, paste file rules (.cursorrules / CLAUDE.md)",
              "Mulai coding — AI sudah punya konteks proyekmu!",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="font-mono text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(204,255,0,0.1)",
                    color: "var(--color-lime)",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <div
            className="flex flex-wrap gap-3 mt-3 pt-3"
            style={{ borderTop: "0.5px solid var(--color-border-default)" }}
          >
            <a
              href="/learn"
              className="font-mono text-xs flex items-center gap-1.5 transition-colors"
              style={{ color: "var(--color-lime)" }}
            >
              → Cara pakai context.md di Claude Code
            </a>
            <a
              href="/learn"
              className="font-mono text-xs flex items-center gap-1.5 transition-colors"
              style={{ color: "var(--color-lime)" }}
            >
              → Setup .cursorrules yang benar
            </a>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div
        className="flex gap-1 mb-4 p-1 rounded-lg overflow-x-auto"
        style={{ background: "var(--color-bg-elevated)", border: "0.5px solid var(--color-border-default)" }}
      >
        {availableKeys.map((key) => {
          const m = FILE_META[key];
          const isActive = activeKey === key;
          return (
            <button
              key={key}
              id={`preview-tab-${key}`}
              onClick={() => {
                trackEvent("tab_switched", { toTab: key });
                setActiveKey(key);
                setShowRaw(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150"
              style={{
                color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                background: isActive ? "var(--color-bg-surface)" : "transparent",
                border: isActive ? "0.5px solid var(--color-border-default)" : "0.5px solid transparent",
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content card */}
      <div className="card" style={{ padding: 0 }}>
        {/* File header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "0.5px solid var(--color-border-default)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{meta.icon}</span>
            <div>
              <p className="text-h3">{meta.label}</p>
              <p className="text-caption">{activeKey}.md</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Raw toggle */}
            <button
              id={`toggle-raw-${activeKey}`}
              onClick={() => {
                trackEvent("raw_toggle", { enabled: !showRaw });
                setShowRaw((v) => !v);
              }}
              className="btn btn-secondary btn-sm"
            >
              {showRaw ? "Rendered" : "Raw"}
            </button>
            <CopyButton text={activeContent} />
          </div>
        </div>

        {/* Markdown / Raw content */}
        <div className="px-6 py-6 overflow-auto" style={{ maxHeight: "60vh" }}>
          {activeContent ? (
            showRaw ? (
              <pre
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {activeContent}
              </pre>
            ) : (
              <>
                <style>{markdownStyles}</style>
                <div className="md-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeContent}
                  </ReactMarkdown>
                </div>
              </>
            )
          ) : (
            <p className="text-secondary">No content available for this file.</p>
          )}
        </div>
      </div>

      {/* Word / char count */}
      {activeContent && (
        <p
          className="font-mono text-[11px] mt-3"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {activeContent.split(/\s+/).filter(Boolean).length} words ·{" "}
          {activeContent.length.toLocaleString()} characters
        </p>
      )}
    </div>
  );
}
