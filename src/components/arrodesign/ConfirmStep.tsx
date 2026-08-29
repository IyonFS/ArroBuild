"use client";

import { ArrowLeft, Zap, Image as ImageIcon, Link2, AlertCircle } from "lucide-react";
import { ARRODESIGN_CREDITS } from "@/lib/config/arrodesign-prompt";
import type {
  ArroDesignFormState,
  ArroDesignProgressEvent,
} from "./types";
import { getProgressPercent } from "./types";

interface ConfirmStepProps {
  state: ArroDesignFormState;
  progressEvents: ArroDesignProgressEvent[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onGenerate: () => void;
}

function ProgressBar({ events }: { events: ArroDesignProgressEvent[] }) {
  const latest = events[events.length - 1];
  const pct = latest ? getProgressPercent(latest.step) : 0;

  return (
    <div>
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: "rgba(240,243,250,0.08)",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #9D4EDD, #C77DFF)",
            borderRadius: 2,
            transition: "width 400ms ease",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {events.map((e, i) => {
          const isLatest = i === events.length - 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: isLatest ? 1 : 0.5,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: isLatest ? "#9D4EDD" : "rgba(240,243,250,0.35)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  color: isLatest ? "#F0F3FA" : "rgba(240,243,250,0.45)",
                }}
              >
                {e.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ConfirmStep({
  state,
  progressEvents,
  loading,
  error,
  onBack,
  onGenerate,
}: ConfirmStepProps) {
  const credits = ARRODESIGN_CREDITS[state.inputType];
  const inputIcon = state.inputType === "image" ? <ImageIcon size={14} /> : <Link2 size={14} />;
  const inputLabel = state.inputType === "image" ? state.imageFileName : state.referenceUrl;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {!loading ? (
        <>
          {/* Summary card */}
          <div
            style={{
              padding: "20px 22px",
              borderRadius: 12,
              background: "#1F2A44",
              border: "0.5px solid rgba(157,78,221,0.25)",
              marginBottom: 20,
            }}
          >
            <p
              style={{
                margin: "0 0 16px",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#9D4EDD",
              }}
            >
              Ringkasan
            </p>

            {[
              {
                label: "Input",
                value: (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {inputIcon}
                    <span
                      style={{
                        maxWidth: 280,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {inputLabel}
                    </span>
                  </span>
                ),
              },
              {
                label: "Mode",
                value: state.mode === "project" ? "Mode Proyek" : "Ide Baru",
              },
              {
                label: "Konteks",
                value: state.projectContext.trim()
                  ? `${state.projectContext.slice(0, 60)}${state.projectContext.length > 60 ? "..." : ""}`
                  : "(tidak ada)",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom: "0.5px solid rgba(240,243,250,0.06)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 12,
                    color: "rgba(240,243,250,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 12,
                    color: "#F0F3FA",
                    textAlign: "right",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}

            {/* Kredit */}
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(157,78,221,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  color: "rgba(240,243,250,0.55)",
                }}
              >
                Estimasi kredit
              </span>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#9D4EDD",
                }}
              >
                ~{credits} kredit
              </span>
            </div>

            <p
              style={{
                margin: "10px 0 0",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                color: "rgba(240,243,250,0.25)",
                lineHeight: 1.6,
              }}
            >
              Estimasi awal — angka aktual dikalibrasi dari testing nyata. Kredit dipotong dari
              pool bulanan setelah analisis selesai.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.08)",
                border: "0.5px solid rgba(239,68,68,0.3)",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <AlertCircle size={14} style={{ color: "#EF4444", flexShrink: 0, marginTop: 2 }} />
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  color: "#FCA5A5",
                  lineHeight: 1.6,
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Disclaimer */}
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
                color: "rgba(240,243,250,0.35)",
                lineHeight: 1.6,
              }}
            >
              ⚠️ Hasil ArroDesign selalu <strong style={{ color: "rgba(240,243,250,0.55)" }}>&quot;terinspirasi dari&quot;</strong> referensi,
              bukan identik. Confidence tagging ({" "}
              <code style={{ color: "#9D4EDD" }}>[EXTRACTED]</code> /{" "}
              <code style={{ color: "rgba(240,243,250,0.45)" }}>[INFERRED]</code>) selalu
              ditampilkan di output.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              id="arrodesign-confirm-back"
              onClick={onBack}
              style={{
                padding: "12px 18px",
                borderRadius: 8,
                border: "0.5px solid rgba(240,243,250,0.14)",
                background: "transparent",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 13,
                color: "rgba(240,243,250,0.45)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ArrowLeft size={14} />
              Kembali
            </button>
            <button
              type="button"
              id="arrodesign-run"
              onClick={onGenerate}
              style={{
                flex: 1,
                padding: "14px 20px",
                borderRadius: 8,
                border: "none",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                background: "linear-gradient(135deg, #9D4EDD, #7B2FBE)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 0 20px rgba(157,78,221,0.25)",
              }}
            >
              <Zap size={16} />
              Analisis Sekarang · ~{credits} kredit
            </button>
          </div>
        </>
      ) : (
        // Loading state — progress streaming
        <div
          style={{
            padding: "28px 24px",
            borderRadius: 12,
            background: "#1F2A44",
            border: "0.5px solid rgba(157,78,221,0.25)",
          }}
        >
          <p
            style={{
              margin: "0 0 20px",
              fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#F0F3FA",
            }}
          >
            Analysis Engine sedang bekerja...
          </p>
          <ProgressBar events={progressEvents} />
          <p
            style={{
              marginTop: 20,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              color: "rgba(240,243,250,0.25)",
            }}
          >
            Analisis desain membutuhkan waktu — biasanya 30–90 detik.
          </p>
        </div>
      )}
    </div>
  );
}
