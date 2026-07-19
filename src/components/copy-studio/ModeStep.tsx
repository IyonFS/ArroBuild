"use client";

import type { LucideIcon } from "lucide-react";
import { Camera, Palette, Sparkles } from "lucide-react";
import type { CopyStudioMode } from "@/lib/config/copy-studio-prompt";

interface Props {
  value: CopyStudioMode | null;
  onChange: (mode: CopyStudioMode) => void;
  onNext: () => void;
}

const MODES: {
  id: CopyStudioMode;
  title: string;
  desc: string;
  icon: LucideIcon;
  soon?: boolean;
}[] = [
  {
    id: "arrodesign",
    title: "Mode ArroDesign",
    desc: "Reuse breakdown section dari hasil ArroDesign yang pernah dibuat.",
    icon: Palette,
    soon: true,
  },
  {
    id: "screenshot",
    title: "Mode Screenshot",
    desc: "Upload screenshot per section — kami baca teksnya dan tandai yang ambigu.",
    icon: Camera,
  },
  {
    id: "scratch",
    title: "Mode Mulai dari Nol",
    desc: "Pilih template struktur konten, atau diskusi santai sampai brief cukup.",
    icon: Sparkles,
  },
];

export default function ModeStep({ value, onChange, onNext }: Props) {
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
        Tidak ada keputusan diam-diam — kalau sistem tidak yakin, kamu yang konfirmasi.
      </p>

      <div className="flex flex-col gap-3">
        {MODES.map((mode) => {
          const selected = value === mode.id;
          const Icon = mode.icon;
          const disabled = Boolean(mode.soon);

          const cardStyle = {
            background: selected
              ? "rgba(255,176,32,0.08)"
              : "var(--color-bg-elevated)",
            border: selected
              ? "1.5px solid rgba(255,176,32,0.55)"
              : "0.5px solid var(--color-border-default)",
            opacity: disabled ? 0.75 : 1,
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
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="font-unbounded text-sm font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {mode.title}
                    </div>
                    <span
                      className="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: "rgba(240,243,250,0.08)",
                        color: "rgba(240,243,250,0.55)",
                        border: "0.5px solid rgba(240,243,250,0.12)",
                      }}
                    >
                      Segera
                    </span>
                  </div>
                  <p
                    className="mt-1 font-mono text-xs leading-relaxed sm:text-[13px]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Aktif setelah ArroDesign jalan. Sementara pakai Screenshot atau Mulai dari
                    Nol.
                  </p>
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

      {value && value !== "arrodesign" && (
        <div className="mt-8 flex justify-end">
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Lanjut →
          </button>
        </div>
      )}
    </div>
  );
}
