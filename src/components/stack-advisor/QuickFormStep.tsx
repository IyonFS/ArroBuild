"use client";

import { PRODUCT_TYPES, PROJECT_STAGES } from "@/lib/config/options";

interface Props {
  productType: string;
  stage: string;
  priority: string;
  budgetNote: string;
  notes: string;
  onChange: (patch: {
    productType?: string;
    stage?: string;
    priority?: string;
    budgetNote?: string;
    notes?: string;
  }) => void;
  onBack: () => void;
  onNext: () => void;
}

const PRODUCT_LABELS: Record<string, string> = {
  saas: "SaaS / web app",
  marketplace: "Marketplace",
  mobile: "Mobile app",
  api: "API / backend",
  portfolio: "Portfolio / profile",
  internal: "Internal tool",
  ecommerce: "E-commerce",
  "ai-app": "AI app / chatbot",
  other: "Lainnya",
};

const PRIORITIES = [
  { id: "speed", label: "Kecepatan", desc: "Ship MVP secepat mungkin" },
  { id: "cost", label: "Biaya", desc: "Hemat hosting & token AI" },
  { id: "scale", label: "Skalabilitas", desc: "Siap tumbuh tanpa rewrite besar" },
] as const;

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: 13,
  background: "var(--color-bg-base, #131A2C)",
  border: "0.5px solid var(--color-border-default)",
  color: "var(--color-text-primary)",
} as const;

export default function QuickFormStep({
  productType,
  stage,
  priority,
  budgetNote,
  notes,
  onChange,
  onBack,
  onNext,
}: Props) {
  const ready = Boolean(productType && priority);

  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold sm:text-[22px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        Brief singkat
      </h2>
      <p
        className="mb-7 font-mono text-[13.5px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Field kosong atau terlalu vague? Nanti sistem tanya balik — bukan rekomendasi asal.
      </p>

      <div className="mb-6">
        <p
          className="mb-3 font-mono text-[11px] font-bold uppercase tracking-wider"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Tipe produk *
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRODUCT_TYPES.map((id) => {
            const selected = productType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ productType: id })}
                className="rounded-xl px-3 py-3 text-left font-mono text-xs transition-all"
                style={{
                  background: selected
                    ? "rgba(255,176,32,0.1)"
                    : "var(--color-bg-elevated)",
                  border: selected
                    ? "1.5px solid rgba(255,176,32,0.55)"
                    : "0.5px solid var(--color-border-default)",
                  color: selected ? "var(--app-amber)" : "var(--color-text-secondary)",
                }}
              >
                {PRODUCT_LABELS[id] ?? id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <p
          className="mb-3 font-mono text-[11px] font-bold uppercase tracking-wider"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Prioritas utama *
        </p>
        <div className="flex flex-col gap-2">
          {PRIORITIES.map((p) => {
            const selected = priority === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ priority: p.id })}
                className="flex flex-col rounded-xl px-4 py-3 text-left transition-all"
                style={{
                  background: selected
                    ? "rgba(56,189,248,0.08)"
                    : "var(--color-bg-elevated)",
                  border: selected
                    ? "1.5px solid rgba(56,189,248,0.45)"
                    : "0.5px solid var(--color-border-default)",
                }}
              >
                <span
                  className="font-unbounded text-sm font-bold"
                  style={{ color: selected ? "var(--app-sky)" : "var(--color-text-primary)" }}
                >
                  {p.label}
                </span>
                <span
                  className="mt-0.5 font-mono text-[12px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {p.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
            Stage
          </span>
          <select
            value={stage}
            onChange={(e) => onChange({ stage: e.target.value })}
            style={{ ...fieldStyle, appearance: "none" as const }}
          >
            {PROJECT_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
            Budget (opsional)
          </span>
          <input
            value={budgetNote}
            onChange={(e) => onChange({ budgetNote: e.target.value })}
            placeholder="Mis. max Rp200rb/bulan"
            style={fieldStyle}
          />
        </label>
      </div>

      <label className="mb-8 flex flex-col gap-1.5">
        <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          Catatan tambahan
        </span>
        <textarea
          value={notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          placeholder="Contoh: butuh auth + pembayaran, tim 1 orang, belum pernah deploy..."
          style={fieldStyle}
        />
      </label>

      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Kembali
        </button>
        <button type="button" className="btn btn-primary" disabled={!ready} onClick={onNext}>
          Lanjut →
        </button>
      </div>
    </div>
  );
}
