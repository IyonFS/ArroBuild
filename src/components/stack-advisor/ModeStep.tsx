"use client";

import type { LucideIcon } from "lucide-react";
import { MessagesSquare, Zap } from "lucide-react";
import type { StackAdvisorMode } from "@/lib/config/stack-advisor-prompt";

interface Props {
  value: StackAdvisorMode | null;
  onChange: (mode: StackAdvisorMode) => void;
  onNext: () => void;
}

const MODES: {
  id: StackAdvisorMode;
  title: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  {
    id: "cepat",
    title: "Mode Cepat",
    desc: "Form singkat: tipe produk, prioritas, stage — langsung sort dari knowledge base.",
    icon: Zap,
  },
  {
    id: "diskusi",
    title: "Mode Diskusi",
    desc: "Chat santai dengan hard cap giliran. Kalau terlalu vague, sistem tanya balik.",
    icon: MessagesSquare,
  },
];

export default function ModeStep({ value, onChange, onNext }: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold sm:text-[22px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        Pilih mode
      </h2>
      <p
        className="mb-8 max-w-lg font-mono text-[13.5px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        AI hanya menyortir paket curated — bukan mengarang stack dari ingatannya.
      </p>

      <div className="flex flex-col gap-3">
        {MODES.map((mode) => {
          const selected = value === mode.id;
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className="flex w-full items-start gap-4 rounded-xl p-5 text-left transition-all"
              style={{
                background: selected
                  ? "rgba(255,176,32,0.08)"
                  : "var(--color-bg-elevated)",
                border: selected
                  ? "1.5px solid rgba(255,176,32,0.55)"
                  : "0.5px solid var(--color-border-default)",
                cursor: "pointer",
              }}
            >
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: selected
                    ? "rgba(255,176,32,0.14)"
                    : "rgba(56,189,248,0.1)",
                  color: selected ? "var(--app-amber)" : "var(--app-sky)",
                }}
              >
                <Icon size={18} />
              </span>
              <div>
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
