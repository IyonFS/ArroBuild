"use client";

import { getTemplateById } from "@/lib/config/readme-templates";
import type { ReadmeFormState } from "./types";

interface Props {
  state: ReadmeFormState;
  credits: number;
  loading: boolean;
  error: string | null;
  onEdit: (step: 1 | 2 | 3) => void;
  onBack: () => void;
  onGenerate: () => void;
}

const MODE_LABELS = {
  project: "Mode Proyek",
  repo: "Mode Repo",
  manual: "Mode Manual",
};

export default function ConfirmStep({
  state,
  credits,
  loading,
  error,
  onEdit,
  onBack,
  onGenerate,
}: Props) {
  const template = state.templateId ? getTemplateById(state.templateId) : null;
  const projectName =
    state.mode === "manual"
      ? state.manual.projectName
      : state.mode === "repo"
        ? state.manual.projectName
        : state.projectName;

  const rows = [
    { label: "Mode", value: state.mode ? MODE_LABELS[state.mode] : "—", step: 1 as const },
    {
      label: "Proyek",
      value: projectName || "—",
      step: 2 as const,
    },
    {
      label: "Kategori",
      value: state.category === "profile" ? "Profile GitHub" : "Repository",
      step: 3 as const,
    },
    {
      label: "Template",
      value: template?.name ?? "—",
      step: 3 as const,
    },
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
        Klik bagian manapun untuk mengubah pilihan.
      </p>

      <div
        className="rounded-xl overflow-hidden mb-6"
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
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
            style={{
              borderTop: i > 0 ? "0.5px solid var(--color-border-default)" : undefined,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(56,189,248,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {row.label}
            </span>
            <span className="flex items-center gap-2 font-mono text-sm" style={{ color: "var(--color-text-primary)" }}>
              {row.value}
              <span className="text-[10px]" style={{ color: "var(--app-sky)" }}>
                ✏️ Ubah
              </span>
            </span>
          </button>
        ))}
      </div>

      <div
        className="rounded-xl px-5 py-4 mb-6 flex items-center justify-between"
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
          {loading ? "Generating…" : "Generate README"}
        </button>
      </div>
    </div>
  );
}
