"use client";

import type { ScratchSubMode } from "@/lib/config/copy-studio-prompt";
import { LayoutTemplate, MessagesSquare } from "lucide-react";

interface Props {
  value: ScratchSubMode | null;
  onChange: (mode: ScratchSubMode) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function ScratchChooser({ value, onChange, onBack, onNext }: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold sm:text-[22px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        Mulai dari nol — cara mana?
      </h2>
      <p
        className="mb-8 font-mono text-[13.5px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Template lebih cepat; diskusi lebih fleksibel kalau ide masih kabur.
      </p>

      <div className="flex flex-col gap-3">
        {(
          [
            {
              id: "template" as const,
              title: "Template struktur",
              desc: "Pilih arketipe (SaaS, UMKM, portfolio, …) lalu isi brief singkat.",
              icon: LayoutTemplate,
            },
            {
              id: "discussion" as const,
              title: "Mode Diskusi",
              desc: "Chat santai dengan hard cap giliran — sama pola Mode Dipandu AI.",
              icon: MessagesSquare,
            },
          ] as const
        ).map((opt) => {
          const selected = value === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
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
                  {opt.title}
                </div>
                <p
                  className="mt-1 font-mono text-xs leading-relaxed sm:text-[13px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Kembali
        </button>
        <button type="button" className="btn btn-primary" disabled={!value} onClick={onNext}>
          Lanjut →
        </button>
      </div>
    </div>
  );
}
