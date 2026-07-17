"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  output: string;
  productName: string;
  onReset: () => void;
  onOutputChange?: (next: string) => void;
}

const markdownStyles = `
  .copy-result h1 { font-family: var(--font-unbounded); font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 1.25rem 0 0.6rem; }
  .copy-result h2, .copy-result h3 { font-family: var(--font-jetbrains-mono); font-size: 0.95rem; font-weight: 600; color: var(--color-text-primary); margin: 1rem 0 0.4rem; border-bottom: 0.5px solid var(--color-border-default); padding-bottom: 4px; }
  .copy-result p, .copy-result li { font-family: var(--font-jetbrains-mono); font-size: 13px; line-height: 1.75; color: var(--color-text-secondary); }
  .copy-result strong { color: var(--color-text-primary); }
`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Tersalin!" : "Copy"}
    </button>
  );
}

export default function ResultStep({
  output,
  productName,
  onReset,
  onOutputChange,
}: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const [editing, setEditing] = useState(false);
  const needsConfirm = useMemo(
    () => /\[PERLU DIKONFIRMASI\]/i.test(output),
    [output]
  );

  const filename = `${(productName || "landing-copy").replace(/\s+/g, "-").toLowerCase()}-copy.md`;

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <style>{markdownStyles}</style>

      <div
        className="mb-6 flex flex-col gap-4 rounded-xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          background: "rgba(56,189,248,0.06)",
          border: "0.5px solid rgba(56,189,248,0.25)",
        }}
      >
        <div>
          <p
            className="font-mono text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--app-sky)" }}
          >
            Copy siap!
          </p>
          <h2
            className="font-unbounded text-lg font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {productName || "Landing page copy"}
          </h2>
        </div>
        <button type="button" className="btn btn-ghost btn-sm self-start" onClick={onReset}>
          ↻ Buat ulang
        </button>
      </div>

      {needsConfirm && (
        <div
          className="mb-4 rounded-xl px-4 py-3 font-mono text-[12px] leading-relaxed"
          style={{
            background: "rgba(255,176,32,0.08)",
            border: "0.5px solid rgba(255,176,32,0.35)",
            color: "rgba(240,243,250,0.75)",
          }}
        >
          Ada bagian bertanda <strong style={{ color: "#FFB020" }}>[PERLU DIKONFIRMASI]</strong>.
          Edit dulu sebelum pakai — jangan anggap semua teks sudah pasti benar.
        </div>
      )}

      <p
        className="mb-4 font-mono text-[11px] leading-relaxed"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        Hasil ini terinspirasi dari brief / referensi yang kamu berikan — bukan salinan identik
        dari situs lain.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <CopyButton text={output} />
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownload}>
          Download .md
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowRaw((v) => !v)}
        >
          {showRaw ? "Preview" : "Raw markdown"}
        </button>
        {onOutputChange && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "Selesai edit" : "Edit teks"}
          </button>
        )}
      </div>

      <div
        className="overflow-hidden rounded-xl"
        style={{
          border: "0.5px solid var(--color-border-default)",
          background: "var(--color-bg-elevated)",
        }}
      >
        {editing && onOutputChange ? (
          <textarea
            value={output}
            onChange={(e) => onOutputChange(e.target.value)}
            className="min-h-[50vh] w-full p-5 text-[12px] leading-relaxed"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              color: "var(--color-text-secondary)",
              background: "transparent",
              border: "none",
              resize: "vertical",
            }}
          />
        ) : showRaw ? (
          <pre
            className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words p-5 text-[12px]"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}
          >
            {output}
          </pre>
        ) : (
          <div className="copy-result max-h-[60vh] overflow-auto p-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
