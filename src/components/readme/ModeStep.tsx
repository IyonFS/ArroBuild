"use client";

import type { InputMode } from "./types";

interface Props {
  value: InputMode | null;
  hasProjects: boolean;
  onChange: (mode: InputMode) => void;
  onNext: () => void;
}

const MODES: { id: InputMode; title: string; desc: string; icon: string }[] = [
  {
    id: "project",
    title: "Mode Proyek",
    desc: "Reuse architecture.md + prd.md dari project ArroBuild.",
    icon: "📁",
  },
  {
    id: "repo",
    title: "Mode Repo",
    desc: "Tempel URL GitHub repo publik — kami baca strukturnya.",
    icon: "🔗",
  },
  {
    id: "manual",
    title: "Mode Manual",
    desc: "Isi form singkat tanpa project atau repo.",
    icon: "✏️",
  },
];

export default function ModeStep({ value, hasProjects, onChange, onNext }: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Pilih mode input
      </h2>
      <p className="mb-8 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Semua keputusan di tanganmu — tidak ada yang dipilih diam-diam.
      </p>

      <div className="flex flex-col gap-3">
        {MODES.map((mode) => {
          const disabled = mode.id === "project" && !hasProjects;
          const selected = value === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(mode.id)}
              className="flex items-start gap-4 rounded-xl p-5 text-left transition-all"
              style={{
                background: selected ? "rgba(56,189,248,0.08)" : "var(--color-bg-elevated)",
                border: selected
                  ? "1.5px solid rgba(56,189,248,0.5)"
                  : "0.5px solid var(--color-border-default)",
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <span className="text-2xl">{mode.icon}</span>
              <div>
                <div
                  className="font-unbounded text-sm font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {mode.title}
                </div>
                <p
                  className="mt-1 font-mono text-xs leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {disabled
                    ? "Kamu belum punya project. Generate project dulu →"
                    : mode.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {value && (
        <div className="mt-8 flex justify-end">
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Lanjut →
          </button>
        </div>
      )}
    </div>
  );
}
