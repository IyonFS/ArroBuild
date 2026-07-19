"use client";

import type { LucideIcon } from "lucide-react";
import { FolderKanban, Link2, PenLine, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { InputMode } from "./types";

interface Props {
  value: InputMode | null;
  hasProjects: boolean;
  onChange: (mode: InputMode) => void;
  onNext: () => void;
}

const MODES: {
  id: InputMode;
  title: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  {
    id: "project",
    title: "Mode Proyek",
    desc: "Reuse architecture.md + prd.md dari project ArroBuild.",
    icon: FolderKanban,
  },
  {
    id: "repo",
    title: "Mode Repo",
    desc: "Tempel URL GitHub repo publik — kami baca strukturnya.",
    icon: Link2,
  },
  {
    id: "manual",
    title: "Mode Manual",
    desc: "Isi form singkat tanpa project atau repo.",
    icon: PenLine,
  },
];

export default function ModeStep({ value, hasProjects, onChange, onNext }: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold sm:text-[22px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        Pilih mode input
      </h2>
      <p
        className="mb-8 max-w-lg font-mono text-[13.5px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Semua keputusan di tanganmu — tidak ada yang dipilih diam-diam.
      </p>

      <div className="flex flex-col gap-3">
        {MODES.map((mode) => {
          const disabled = mode.id === "project" && !hasProjects;
          const selected = value === mode.id;
          const Icon = mode.icon;

          const cardStyle = {
            background: selected
              ? "rgba(255,176,32,0.08)"
              : "var(--color-bg-elevated)",
            border: selected
              ? "1.5px solid rgba(255,176,32,0.55)"
              : "0.5px solid var(--color-border-default)",
            opacity: disabled ? 0.7 : 1,
          } as const;

          const iconBox = (
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
              style={{
                background: selected
                  ? "rgba(255,176,32,0.14)"
                  : "rgba(56,189,248,0.1)",
                color: selected ? "var(--app-amber)" : "var(--app-sky)",
                border: `0.5px solid ${
                  selected ? "rgba(255,176,32,0.35)" : "rgba(56,189,248,0.25)"
                }`,
              }}
            >
              <Icon size={18} strokeWidth={1.75} />
            </span>
          );

          if (disabled) {
            return (
              <div
                key={mode.id}
                className="flex w-full items-start gap-4 rounded-xl p-5 text-left"
                style={cardStyle}
              >
                {iconBox}
                <div className="min-w-0 flex-1">
                  <div
                    className="font-unbounded text-sm font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {mode.title}
                  </div>
                  <p
                    className="mt-1 font-mono text-xs leading-relaxed sm:text-[13px]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Kamu belum punya project.
                  </p>
                  <Link
                    href="/generate"
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ color: "var(--app-sky)" }}
                  >
                    Generate project dulu
                    <ArrowRight size={12} strokeWidth={2.25} />
                  </Link>
                </div>
              </div>
            );
          }

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className="flex w-full items-start gap-4 rounded-xl p-5 text-left transition-all"
              style={{ ...cardStyle, cursor: "pointer" }}
              onMouseEnter={(e) => {
                if (selected) return;
                e.currentTarget.style.background = "var(--color-bg-hover)";
                e.currentTarget.style.borderColor = "var(--color-border-strong)";
              }}
              onMouseLeave={(e) => {
                if (selected) return;
                e.currentTarget.style.background = "var(--color-bg-elevated)";
                e.currentTarget.style.borderColor = "rgba(240,243,250,0.08)";
              }}
            >
              {iconBox}
              <div className="min-w-0 flex-1">
                <div
                  className="font-unbounded text-sm font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {mode.title}
                </div>
                <p
                  className="mt-1 font-mono text-xs leading-relaxed sm:text-[13px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {mode.desc}
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
