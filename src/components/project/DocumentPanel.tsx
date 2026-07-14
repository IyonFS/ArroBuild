"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FILE_META, type FileKey } from "@/components/generate/types";
import { normalizeDocumentKey } from "@/lib/config/documents";
import { DocIcon } from "@/lib/ui/app-icons";
import type { WorkspaceFile } from "./FileSidebar";

interface Props {
  projectId: string;
  file: WorkspaceFile | null;
  scrollToLine?: number | null;
  onFeatClick?: (featId: string) => void;
  onSaved?: (content: string, version: number) => void;
}

const markdownStyles = `
  .ws-md h1 { font-family: var(--font-unbounded, 'Unbounded'), sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 1.25rem 0 0.6rem; }
  .ws-md h2 { font-family: var(--font-jetbrains-mono, monospace); font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 1.25rem 0 0.45rem; border-bottom: 0.5px solid var(--color-border-default); padding-bottom: 6px; }
  .ws-md h3 { font-family: var(--font-jetbrains-mono, monospace); font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); margin: 1rem 0 0.35rem; }
  .ws-md p, .ws-md li { font-family: var(--font-jetbrains-mono, monospace); font-size: 13px; line-height: 1.7; color: var(--color-text-secondary); }
  .ws-md code { font-family: var(--font-jetbrains-mono, monospace); font-size: 12px; padding: 1px 6px; border-radius: 4px; background: rgba(255,176,32,0.08); color: var(--app-amber); }
  .ws-md pre { background: #0D1321; border: 0.5px solid var(--app-border-default); border-radius: 8px; padding: 1rem; overflow-x: auto; }
  .ws-md ul, .ws-md ol { margin: 0.5rem 0 0.5rem 1.4rem; }
  .ws-md a { color: var(--app-sky); }
  .ws-md strong { color: var(--app-text-primary); }
  .feat-chip { display: inline-block; padding: 0 6px; margin: 0 2px; border-radius: 4px; background: rgba(255,176,32,0.12); color: var(--app-amber); border: 0.5px solid rgba(255,176,32,0.3); cursor: pointer; font-family: var(--font-jetbrains-mono), monospace; font-size: 11px; }
`;

function FeatText({
  children,
  onFeatClick,
}: {
  children: ReactNode;
  onFeatClick?: (featId: string) => void;
}) {
  if (typeof children !== "string") return <>{children}</>;
  if (!/FEAT-\d{3}/.test(children)) return <>{children}</>;
  const parts = children.split(/(FEAT-\d{3})/g);
  return (
    <>
      {parts.map((part, i) =>
        /^FEAT-\d{3}$/.test(part) ? (
          <button
            key={`${part}-${i}`}
            type="button"
            className="feat-chip"
            onClick={() => onFeatClick?.(part)}
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function withFeatChildren(
  children: ReactNode,
  onFeatClick?: (featId: string) => void
): ReactNode {
  if (typeof children === "string") {
    return <FeatText onFeatClick={onFeatClick}>{children}</FeatText>;
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => (
      <span key={i}>{withFeatChildren(child, onFeatClick)}</span>
    ));
  }
  return children;
}

export default function DocumentPanel({
  projectId,
  file,
  scrollToLine,
  onFeatClick,
  onSaved,
}: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const [draft, setDraft] = useState(file?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDirty = file ? draft.trim() !== file.content.trim() : false;

  // Re-sync the editable draft when the underlying file changes (adjust state
  // during render instead of in an effect to avoid cascading renders).
  const fileKey = `${file?.id ?? ""}:${file?.version ?? ""}:${file?.content ?? ""}`;
  const [prevFileKey, setPrevFileKey] = useState(fileKey);
  if (fileKey !== prevFileKey) {
    setPrevFileKey(fileKey);
    setDraft(file?.content ?? "");
  }

  useEffect(() => {
    if (!scrollToLine || !scrollRef.current || showRaw) return;
    const lines = (file?.content ?? "").split("\n");
    const ratio = Math.min(scrollToLine / Math.max(lines.length, 1), 1);
    scrollRef.current.scrollTo({
      top: ratio * scrollRef.current.scrollHeight * 0.9,
      behavior: "smooth",
    });
  }, [scrollToLine, file?.content, showRaw]);

  const saveDraft = async () => {
    if (!file || !isDirty) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(
        `/api/project/${projectId}/files/${encodeURIComponent(file.fileKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: draft }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      onSaved?.(data.content ?? draft, data.version ?? file.version + 1);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const meta = file
    ? FILE_META[
        (normalizeDocumentKey(file.fileKey) ?? file.fileKey) as FileKey
      ]
    : null;

  if (!file) {
    return (
      <div
        className="h-full flex items-center justify-center text-sm"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        Pilih dokumen di sidebar
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <style>{markdownStyles}</style>
      <div
        className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="min-w-0">
          <h2
            className="text-[15px] font-semibold truncate flex items-center gap-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            <DocIcon doc={(normalizeDocumentKey(file.fileKey) ?? file.fileKey) as FileKey} size={16} style={{ color: "var(--app-amber)" }} />
            {meta?.label ?? file.label}
          </h2>
          <p
            className="text-[11px] mt-1"
            style={{
              color: "rgba(255,255,255,0.38)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}
          >
            {file.fileName} · v{file.version}
            {file.modelClass ? ` · ${file.modelClass}` : ""}
          </p>
        </div>
        <div
          className="flex items-center p-1 flex-shrink-0 gap-1"
          style={{
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {showRaw && isDirty && (
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={saving}
              className="text-[12px] font-bold px-3 py-1.5"
              style={{
                borderRadius: 8,
                background: "var(--app-amber)",
                color: "#0D1321",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "..." : "Simpan"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowRaw(false)}
            className="text-[12px] font-semibold px-3 py-1.5"
            style={{
              borderRadius: 8,
              background: !showRaw ? "var(--app-amber)" : "transparent",
              color: !showRaw ? "#0D1321" : "var(--app-text-tertiary)",
            }}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setShowRaw(true)}
            className="text-[12px] font-semibold px-3 py-1.5"
            style={{
              borderRadius: 8,
              background: showRaw ? "var(--app-amber)" : "transparent",
              color: showRaw ? "#0D1321" : "var(--app-text-tertiary)",
            }}
          >
            Raw
          </button>
        </div>
      </div>

      {saveError && (
        <p className="px-4 py-1 text-xs" style={{ color: "#EF4444" }}>
          {saveError}
        </p>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 sm:px-8 py-5">
        {showRaw ? (
          <div className="workspace-editor-inner">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full h-full min-h-[60vh] outline-none text-xs leading-relaxed resize-none"
              style={{
                background: "transparent",
                color: "var(--app-text-secondary)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            />
          </div>
        ) : (
          <div className="workspace-editor-inner ws-md">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p>{withFeatChildren(children, onFeatClick)}</p>
                ),
                li: ({ children }) => (
                  <li>{withFeatChildren(children, onFeatClick)}</li>
                ),
                td: ({ children }) => (
                  <td>{withFeatChildren(children, onFeatClick)}</td>
                ),
                strong: ({ children }) => (
                  <strong>{withFeatChildren(children, onFeatClick)}</strong>
                ),
                h2: ({ children }) => (
                  <h2>{withFeatChildren(children, onFeatClick)}</h2>
                ),
                h3: ({ children }) => (
                  <h3>{withFeatChildren(children, onFeatClick)}</h3>
                ),
              }}
            >
              {file.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
