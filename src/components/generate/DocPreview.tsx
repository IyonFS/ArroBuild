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
              stroke="var(--green-text)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ color: "var(--green-text)" }}>Copied!</span>
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
  .md-content h1 { font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin: 1.5rem 0 0.75rem; letter-spacing: -0.3px; line-height: 1.3; }
  .md-content h2 { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin: 1.5rem 0 0.5rem; letter-spacing: -0.1px; border-bottom: 1px solid #1e2a40; padding-bottom: 6px; }
  .md-content h3 { font-size: 0.95rem; font-weight: 600; color: #cbd5e1; margin: 1.1rem 0 0.4rem; }
  .md-content h4 { font-size: 0.875rem; font-weight: 600; color: #94a3b8; margin: 0.9rem 0 0.35rem; }
  .md-content p { font-size: 14px; line-height: 1.75; color: #94a3b8; margin: 0.5rem 0; }
  .md-content code { font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 1px 6px; border-radius: 4px; background: #1a2035; color: #4ade80; border: 1px solid #1e2a40; white-space: pre-wrap; word-break: break-all; }
  .md-content pre { background: #0d1117; border: 1px solid #1e2a40; border-radius: 8px; padding: 1rem; margin: 0.75rem 0; overflow-x: auto; }
  .md-content pre code { background: none; border: none; padding: 0; font-size: 13px; color: #e2e8f0; white-space: pre; word-break: normal; }
  .md-content ul, .md-content ol { margin: 0.5rem 0 0.5rem 1.5rem; }
  .md-content li { font-size: 14px; line-height: 1.75; color: #94a3b8; margin: 0.2rem 0; }
  .md-content li::marker { color: #4ade80; }
  .md-content blockquote { border-left: 3px solid #4ade80; padding: 0.5rem 1rem; margin: 0.75rem 0; background: rgba(74,222,128,0.05); border-radius: 0 6px 6px 0; }
  .md-content blockquote p { color: #94a3b8; margin: 0; }
  .md-content hr { border: none; border-top: 1px solid #1e2a40; margin: 1.25rem 0; }
  .md-content table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 13px; }
  .md-content thead tr { background: #1a2035; }
  .md-content th { padding: 8px 12px; text-align: left; font-weight: 600; color: #e2e8f0; border: 1px solid #1e2a40; }
  .md-content td { padding: 8px 12px; color: #94a3b8; border: 1px solid #1e2a40; }
  .md-content tr:nth-child(even) { background: rgba(30,42,64,0.4); }
  .md-content a { color: #4ade80; text-decoration: none; }
  .md-content a:hover { text-decoration: underline; }
  .md-content strong { color: #e2e8f0; font-weight: 600; }
  .md-content em { color: #94a3b8; font-style: italic; }
  .md-content input[type="checkbox"] { accent-color: #4ade80; margin-right: 6px; }
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
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="badge badge-success mb-3">✓ Generation Complete</div>
          <h1 className="text-h1 mb-1">Your documentation is ready</h1>
          <p className="text-body">{availableKeys.length} files generated successfully</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            id="preview-download-btn"
            onClick={handleDownloadClick}
            className="btn btn-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Zip
          </button>
          <button
            id="preview-restart-btn"
            onClick={onRestart}
            className="btn btn-secondary"
          >
            New Project
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div
        className="flex gap-1 mb-4 p-1 rounded-lg overflow-x-auto"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}
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
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-card)" : "transparent",
                border: isActive ? "1px solid var(--bg-border)" : "1px solid transparent",
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
          style={{ borderBottom: "1px solid var(--bg-border)" }}
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
                  color: "var(--text-secondary)",
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
        <p className="text-caption mt-3" style={{ color: "var(--text-tertiary)" }}>
          {activeContent.split(/\s+/).filter(Boolean).length} words ·{" "}
          {activeContent.length.toLocaleString()} characters
        </p>
      )}
    </div>
  );
}
