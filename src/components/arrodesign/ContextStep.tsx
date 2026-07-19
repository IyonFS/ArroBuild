"use client";

import { ArrowLeft, ArrowRight, Folder, Lightbulb } from "lucide-react";
import type { ArroDesignFormState, ArroDesignMode } from "./types";

interface ContextStepProps {
  state: ArroDesignFormState;
  onChange: (patch: Partial<ArroDesignFormState>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function ContextStep({ state, onChange, onBack, onNext }: ContextStepProps) {
  const modeOption = (
    mode: ArroDesignMode,
    label: string,
    desc: string,
    icon: React.ReactNode
  ) => {
    const active = state.mode === mode;
    return (
      <button
        type="button"
        id={`arrodesign-ctx-mode-${mode}`}
        onClick={() => onChange({ mode })}
        style={{
          width: "100%",
          padding: "16px 18px",
          borderRadius: 10,
          border: active
            ? "1px solid rgba(157,78,221,0.5)"
            : "0.5px solid rgba(240,243,250,0.1)",
          background: active ? "rgba(157,78,221,0.08)" : "rgba(240,243,250,0.02)",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          textAlign: "left",
          transition: "all 150ms ease",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            marginTop: 2,
            color: active ? "#9D4EDD" : "rgba(240,243,250,0.35)",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 13,
              fontWeight: 700,
              color: active ? "#F0F3FA" : "rgba(240,243,250,0.55)",
            }}
          >
            {label}
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              lineHeight: 1.6,
              color: active ? "rgba(240,243,250,0.55)" : "rgba(240,243,250,0.3)",
            }}
          >
            {desc}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Ringkasan input */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(157,78,221,0.06)",
          border: "0.5px solid rgba(157,78,221,0.2)",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            color: "rgba(240,243,250,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          Input:
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            color: "rgba(240,243,250,0.7)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {state.inputType === "url" ? state.referenceUrl : `📷 ${state.imageFileName}`}
        </span>
      </div>

      {/* Mode pilihan */}
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            color: "rgba(240,243,250,0.45)",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Konteks
        </p>
        {modeOption(
          "fresh",
          "Ide Baru",
          "Mulai dari nol — tidak ada konteks proyek ArroBuild yang sudah ada.",
          <Lightbulb size={18} />
        )}
        {modeOption(
          "project",
          "Mode Proyek",
          "Analisis ini untuk proyek yang sudah di-generate di ArroBuild. Tambahkan konteks dari PRD/arsitektur.",
          <Folder size={18} />
        )}
      </div>

      {/* Textarea konteks (selalu tampil, tapi optional) */}
      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="arrodesign-project-ctx"
          style={{
            display: "block",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(240,243,250,0.55)",
            marginBottom: 8,
          }}
        >
          {state.mode === "project"
            ? "Konteks Proyek (dari PRD / Architecture)"
            : "Catatan Tambahan (opsional)"}
        </label>
        <textarea
          id="arrodesign-project-ctx"
          value={state.projectContext}
          onChange={(e) => onChange({ projectContext: e.target.value })}
          placeholder={
            state.mode === "project"
              ? "Nama produk, target user, warna brand utama dari PRD yang sudah ada..."
              : "Catatan apa yang ingin kamu highlight dari desain ini? (biarkan kosong OK)"
          }
          rows={5}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            lineHeight: 1.7,
            background: "rgba(240,243,250,0.04)",
            border: "0.5px solid rgba(240,243,250,0.12)",
            color: "#F0F3FA",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
          maxLength={3000}
        />
        <p
          style={{
            marginTop: 4,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 10,
            color: "rgba(240,243,250,0.22)",
            textAlign: "right",
          }}
        >
          {state.projectContext.length}/3000
        </p>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          id="arrodesign-ctx-back"
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
          id="arrodesign-ctx-next"
          onClick={onNext}
          style={{
            flex: 1,
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            background: "#9D4EDD",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Review & Analisis
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
