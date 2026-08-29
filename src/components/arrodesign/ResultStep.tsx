"use client";

import { useState } from "react";
import { Copy, Check, RotateCcw, Eye, EyeOff, Download, ExternalLink } from "lucide-react";
import type { ArroDesignFormState } from "./types";
import SafeMarkdown from "@/components/ui/SafeMarkdown";

interface ResultStepProps {
  state: ArroDesignFormState;
  onChange: (patch: Partial<ArroDesignFormState>) => void;
  onReset: () => void;
}

function CopyButton({ text, label, id }: { text: string; label: string; id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      type="button"
      id={id}
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 6,
        border: "0.5px solid rgba(157,78,221,0.35)",
        background: copied ? "rgba(157,78,221,0.15)" : "rgba(157,78,221,0.08)",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 12,
        fontWeight: 600,
        color: copied ? "#C77DFF" : "#9D4EDD",
        cursor: "pointer",
        transition: "all 150ms ease",
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Disalin!" : label}
    </button>
  );
}

function DownloadButton({ content, filename }: { content: string; filename: string }) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      id="arrodesign-download-md"
      onClick={handleDownload}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 6,
        border: "0.5px solid rgba(240,243,250,0.14)",
        background: "rgba(240,243,250,0.04)",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 12,
        fontWeight: 600,
        color: "rgba(240,243,250,0.55)",
        cursor: "pointer",
      }}
    >
      <Download size={13} />
      Download .md
    </button>
  );
}

/** Render design.md dengan highlight [INFERRED] tags */
function DesignMdPreview({ content, showInferred }: { content: string; showInferred: boolean }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 8,
          background: "rgba(13,19,33,0.6)",
          border: "0.5px solid rgba(240,243,250,0.08)",
          minHeight: 200,
        }}
      >
        <SafeMarkdown content={content} showInferred={showInferred} />
      </div>
    </div>
  );
}

export default function ResultStep({ state, onChange, onReset }: ResultStepProps) {
  const { result, showInferred, activeTab } = state;

  if (!result) return null;

  const { designMd, stitchPrompt, creditsUsed, balanceAfter, tavilyConfigured, inputType } = result;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      {/* Header result */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 6px",
              fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#F0F3FA",
              letterSpacing: "-0.02em",
            }}
          >
            design.md siap!
          </h2>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              color: "rgba(240,243,250,0.4)",
            }}
          >
            {creditsUsed} kredit dipakai · sisa{" "}
            <span style={{ color: "#38BDF8" }}>{balanceAfter}</span> kredit
            {!tavilyConfigured && inputType === "url" && (
              <span style={{ color: "rgba(255,176,32,0.7)", marginLeft: 8 }}>
                · Tanpa Tavily (tambah TAVILY_API_KEY untuk konteks lebih kaya)
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            id="arrodesign-reset"
            onClick={onReset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 6,
              border: "0.5px solid rgba(240,243,250,0.14)",
              background: "transparent",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              color: "rgba(240,243,250,0.4)",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={12} />
            Analisis Baru
          </button>
        </div>
      </div>

      {/* Disclaimer — selalu terlihat */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(240,243,250,0.04)",
          border: "0.5px solid rgba(240,243,250,0.08)",
          marginBottom: 20,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            color: "rgba(240,243,250,0.4)",
            lineHeight: 1.6,
          }}
        >
          ⚠️ Hasil ini{" "}
          <strong style={{ color: "rgba(240,243,250,0.65)" }}>&quot;terinspirasi dari&quot;</strong>{" "}
          referensi, bukan identik. <span style={{ color: "#34D399" }}>■</span>{" "}
          <code style={{ color: "#34D399" }}>[EXTRACTED]</code> = data nyata dari referensi.{" "}
          <span style={{ color: "#9D4EDD" }}>■</span>{" "}
          <code style={{ color: "#9D4EDD" }}>[INFERRED]</code> = dugaan terarah — verifikasi sebelum
          dipakai final.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 0,
          borderBottom: "0.5px solid rgba(240,243,250,0.08)",
        }}
      >
        {(["design", "stitch"] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              id={`arrodesign-tab-${tab}`}
              onClick={() => onChange({ activeTab: tab })}
              style={{
                padding: "10px 16px",
                border: "none",
                borderBottom: active ? "2px solid #9D4EDD" : "2px solid transparent",
                background: "transparent",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                color: active ? "#9D4EDD" : "rgba(240,243,250,0.4)",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {tab === "design" ? "design.md" : "Stitch Prompt"}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ marginTop: 16 }}>
        {activeTab === "design" && (
          <>
            {/* Controls */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <button
                type="button"
                id="arrodesign-toggle-inferred"
                onClick={() => onChange({ showInferred: !showInferred })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "0.5px solid rgba(157,78,221,0.25)",
                  background: showInferred ? "rgba(157,78,221,0.08)" : "rgba(240,243,250,0.04)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: showInferred ? "#9D4EDD" : "rgba(240,243,250,0.4)",
                  cursor: "pointer",
                }}
              >
                {showInferred ? <Eye size={12} /> : <EyeOff size={12} />}
                {showInferred ? "Sembunyikan [INFERRED]" : "Tampilkan [INFERRED]"}
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                <CopyButton text={designMd} label="Copy design.md" id="arrodesign-copy-design" />
                <DownloadButton content={designMd} filename="design.md" />
              </div>
            </div>

            <DesignMdPreview content={designMd} showInferred={showInferred} />
          </>
        )}

        {activeTab === "stitch" && (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: "rgba(240,243,250,0.35)",
                  }}
                >
                  Tempel langsung ke Google Stitch
                </span>
                <a
                  href="https://stitch.withgoogle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="arrodesign-open-stitch"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: "#38BDF8",
                    textDecoration: "none",
                  }}
                >
                  Buka Stitch <ExternalLink size={10} />
                </a>
              </div>
              <CopyButton text={stitchPrompt} label="Copy Prompt" id="arrodesign-copy-stitch" />
            </div>

            {stitchPrompt ? (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 8,
                  background: "rgba(13,19,33,0.6)",
                  border: "0.5px solid rgba(240,243,250,0.08)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  lineHeight: 1.75,
                  color: "rgba(240,243,250,0.75)",
                  whiteSpace: "pre-wrap",
                  overflowX: "auto",
                }}
              >
                {stitchPrompt}
              </div>
            ) : (
              <div
                style={{
                  padding: "24px",
                  borderRadius: 8,
                  background: "rgba(13,19,33,0.4)",
                  border: "0.5px dashed rgba(240,243,250,0.1)",
                  textAlign: "center",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  color: "rgba(240,243,250,0.3)",
                }}
              >
                Stitch prompt tidak terdeteksi di output. Coba lihat di tab design.md — prompt
                mungkin tergabung di sana.
              </div>
            )}
          </>
        )}
      </div>

      {/* Content checklist reminder */}
      <div
        style={{
          marginTop: 24,
          padding: "12px 14px",
          borderRadius: 8,
          background: "rgba(52,211,153,0.05)",
          border: "0.5px solid rgba(52,211,153,0.2)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            color: "rgba(52,211,153,0.7)",
            lineHeight: 1.6,
          }}
        >
          💡 Cek bagian <strong>Content Checklist</strong> di design.md — ada item verifikasi yang
          perlu kamu lakukan sebelum pakai (warna hex, nama font, spacing).
        </p>
      </div>
    </div>
  );
}
