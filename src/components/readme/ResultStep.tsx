"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  output: string;
  projectName: string;
  onReset: () => void;
}

const markdownStyles = `
  .readme-result h1 { font-family: var(--font-unbounded); font-size: 1.25rem; font-weight: 700; color: var(--color-text-primary); margin: 1.25rem 0 0.6rem; }
  .readme-result h2 { font-family: var(--font-jetbrains-mono); font-size: 0.95rem; font-weight: 600; color: var(--color-text-primary); margin: 1rem 0 0.4rem; border-bottom: 0.5px solid var(--color-border-default); padding-bottom: 4px; }
  .readme-result p, .readme-result li { font-family: var(--font-jetbrains-mono); font-size: 13px; line-height: 1.75; color: var(--color-text-secondary); }
  .readme-result code { font-size: 12px; padding: 2px 6px; border-radius: 4px; background: rgba(56,189,248,0.1); color: var(--app-sky); }
  .readme-result pre { background: #1a1f2e; border-radius: 10px; padding: 1rem; overflow-x: auto; margin: 0.75rem 0; }
  .readme-result pre code { background: none; padding: 0; color: var(--color-text-primary); }
  .readme-result table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 0.5rem 0; }
  .readme-result th, .readme-result td { padding: 6px 10px; border: 0.5px solid var(--color-border-default); }
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

export default function ResultStep({ output, projectName, onReset }: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const filename = `${(projectName || "README").replace(/\s+/g, "-").toLowerCase()}-README.md`;

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
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--app-sky)" }}>
            README siap!
          </p>
          <h2 className="font-unbounded text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
            {projectName || "README.md"}
          </h2>
        </div>
        <button type="button" className="btn btn-ghost btn-sm self-start" onClick={onReset}>
          ↻ Buat ulang
        </button>
      </div>

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
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "0.5px solid var(--color-border-default)",
          background: "var(--color-bg-elevated)",
        }}
      >
        {showRaw ? (
          <pre
            className="max-h-[60vh] overflow-auto p-5 text-[12px] whitespace-pre-wrap break-words"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}
          >
            {output}
          </pre>
        ) : (
          <div className="readme-result max-h-[60vh] overflow-auto p-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
