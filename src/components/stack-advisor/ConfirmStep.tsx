"use client";

import type { StackAdvisorFormState } from "./types";

interface Props {
  state: StackAdvisorFormState;
  credits: number;
  loading: boolean;
  error: string | null;
  onEdit: (step: 1 | 2) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export default function ConfirmStep({
  state,
  credits,
  loading,
  error,
  onEdit,
  onBack,
  onGenerate,
}: Props) {
  const modeLabel = state.mode === "diskusi" ? "Mode Diskusi" : "Mode Cepat";
  const product =
    state.mode === "diskusi"
      ? state.discussFields.productType || state.productType || "—"
      : state.productType || "—";
  const priority =
    state.mode === "diskusi"
      ? state.discussFields.priority || state.priority || "—"
      : state.priority || "—";

  const rows = [
    { label: "Mode", value: modeLabel, step: 1 as const },
    { label: "Tipe produk", value: product, step: 2 as const },
    { label: "Prioritas", value: priority, step: 2 as const },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Review & Generate
      </h2>
      <p className="mb-8 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Sistem akan menyortir 2–3 paket dari knowledge base curated — bukan mengarang bebas.
      </p>

      <div
        className="mb-6 overflow-hidden rounded-xl"
        style={{
          border: "0.5px solid var(--color-border-default)",
          background: "var(--color-bg-elevated)",
        }}
      >
        {rows.map((row, i) => (
          <button
            key={row.label}
            type="button"
            onClick={() => onEdit(row.step)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
            style={{
              borderTop: i > 0 ? "0.5px solid var(--color-border-default)" : undefined,
            }}
          >
            <span className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {row.label}
            </span>
            <span
              className="flex items-center gap-2 font-mono text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
              {row.value}
              <span className="text-[10px]" style={{ color: "var(--app-sky)" }}>
                Ubah
              </span>
            </span>
          </button>
        ))}
      </div>

      <div
        className="mb-6 flex items-center justify-between rounded-xl px-5 py-4"
        style={{
          background: "rgba(56,189,248,0.06)",
          border: "0.5px solid rgba(56,189,248,0.25)",
        }}
      >
        <span className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Estimasi kredit
        </span>
        <span className="font-unbounded text-lg font-bold" style={{ color: "var(--app-sky)" }}>
          {credits} kredit
        </span>
      </div>

      {error && (
        <p
          className="mb-4 rounded-lg px-4 py-3 font-mono text-sm"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "0.5px solid rgba(239,68,68,0.3)",
            color: "#EF4444",
          }}
        >
          {error}
        </p>
      )}

      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack} disabled={loading}>
          ← Kembali
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? "Menyortir paket…" : "Generate rekomendasi"}
        </button>
      </div>
    </div>
  );
}
