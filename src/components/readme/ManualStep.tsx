"use client";

import type { ManualFields } from "./types";

interface Props {
  value: ManualFields;
  onChange: (value: ManualFields) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function ManualStep({ value, onChange, onBack, onNext }: Props) {
  const canProceed = value.projectName.trim() && value.description.trim();

  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Info proyek
      </h2>
      <p className="mb-8 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Isi data dasar — semua field bisa diedit kapan saja.
      </p>

      <div className="flex flex-col gap-4">
        {(
          [
            { key: "projectName" as const, label: "Nama proyek *", placeholder: "My App" },
            {
              key: "description" as const,
              label: "Deskripsi *",
              placeholder: "Apa yang dilakukan proyek ini?",
              textarea: true,
            },
            {
              key: "techStack" as const,
              label: "Tech stack",
              placeholder: "Next.js, TypeScript, PostgreSQL",
            },
            {
              key: "features" as const,
              label: "Fitur utama",
              placeholder: "Satu fitur per baris…",
              textarea: true,
            },
          ] as const
        ).map((field) => (
          <label key={field.key} className="block">
            <span className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {field.label}
            </span>
            {"textarea" in field && field.textarea ? (
              <textarea
                value={value[field.key]}
                onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                rows={field.key === "description" ? 4 : 3}
                className="mt-1 w-full resize-y rounded-lg px-3 py-2 font-mono text-sm"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "0.5px solid var(--color-border-default)",
                  color: "var(--color-text-primary)",
                }}
              />
            ) : (
              <input
                value={value[field.key]}
                onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-lg px-3 py-2 font-mono text-sm"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "0.5px solid var(--color-border-default)",
                  color: "var(--color-text-primary)",
                }}
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Kembali
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canProceed}
          onClick={onNext}
        >
          Lanjut →
        </button>
      </div>
    </div>
  );
}
