"use client";

import { useState } from "react";
import type { ProductType, ProjectStage } from "./types";

interface Props {
  value: ProductType | null;
  stage: ProjectStage | null;
  onChange: (v: ProductType) => void;
  onStageChange: (s: ProjectStage) => void;
  onNext: () => void;
}

const PRODUCT_TYPES: {
  id: ProductType;
  label: string;
  desc: string;
  icon: string;
  fit: string;
  popular?: boolean;
  color: string;
}[] = [
  {
    id: "saas",
    label: "SaaS",
    desc: "Web app berbasis subscription",
    icon: "▲",
    fit: "Ada fitur yang dibayar per bulan",
    popular: true,
    color: "#CCFF00",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    desc: "Platform dua sisi (buyer & seller)",
    icon: "⊞",
    fit: "Ada dua tipe user yang saling transaksi",
    color: "#FF9500",
  },
  {
    id: "mobile",
    label: "Mobile App",
    desc: "iOS, Android, atau keduanya",
    icon: "◈",
    fit: "Output utama adalah app di smartphone",
    color: "#5E9FFF",
  },
  {
    id: "api",
    label: "API / Dev Tool",
    desc: "Headless service, SDK, atau CLI",
    icon: "⚡",
    fit: "User utama adalah developer lain",
    color: "#A78BFA",
  },
  {
    id: "ai-app",
    label: "AI-Powered App",
    desc: "App dengan AI sebagai core feature",
    icon: "✦",
    fit: "AI bukan fitur tambahan, tapi inti produk",
    color: "#34D399",
  },
  {
    id: "ecommerce",
    label: "E-Commerce",
    desc: "Toko online, produk fisik atau digital",
    icon: "◎",
    fit: "Jual produk langsung ke konsumen",
    color: "#FB923C",
  },
  {
    id: "internal",
    label: "Internal Tool",
    desc: "Dashboard, admin, atau ops tool",
    icon: "⊟",
    fit: "Dipakai internal tim atau perusahaan",
    color: "#60A5FA",
  },
  {
    id: "portfolio",
    label: "Portfolio / Site",
    desc: "Showcase project & skills",
    icon: "◑",
    fit: "Ingin tampil profesional online",
    color: "#F472B6",
  },
  {
    id: "other",
    label: "Lainnya",
    desc: "Tipe di luar kategori di atas",
    icon: "○",
    fit: "Ceritakan idenya, AI yang bantu klasifikasikan",
    color: "#94A3B8",
  },
];

const STAGES: {
  id: ProjectStage;
  label: string;
  desc: string;
  icon: string;
  note: string;
}[] = [
  {
    id: "idea",
    label: "Ide baru",
    desc: "Belum mulai coding",
    icon: "💡",
    note: "Saya akan generate docs dari nol",
  },
  {
    id: "prototype",
    label: "Ada prototype",
    desc: "Sudah mulai, belum production",
    icon: "🔧",
    note: "Saya sesuaikan docs dengan progress yang ada",
  },
  {
    id: "production",
    label: "Sudah production",
    desc: "Punya user nyata",
    icon: "🚀",
    note: "Fokus ke docs untuk scale & hardening",
  },
];

export default function ProductTypeStep({
  value,
  stage,
  onChange,
  onStageChange,
  onNext,
}: Props) {
  const [hoveredId, setHoveredId] = useState<ProductType | null>(null);

  const canProceed = value !== null && stage !== null;

  return (
    <div className="font-inter max-w-3xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
          style={{
            background: "rgba(204,255,0,0.08)",
            color: "var(--color-lime)",
            border: "0.5px solid rgba(204,255,0,0.2)",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--color-lime)" }}
          />
          Step 1 of 4
        </div>
        <h1
          className="font-unbounded font-bold mb-3"
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            letterSpacing: "-0.03em",
            color: "var(--color-text-primary)",
            lineHeight: 1.15,
          }}
        >
          Kamu lagi build apa?
        </h1>
        <p
          className="text-base"
          style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}
        >
          Pilih tipe yang paling dekat — ini menentukan pertanyaan di step berikutnya.
        </p>
      </div>

      {/* First-timer hint */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl mb-8 text-sm"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "0.5px solid rgba(255,255,255,0.08)",
        }}
      >
        <span className="text-base mt-0.5">💡</span>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Baru pertama kali?{" "}
          <span
            className="font-semibold cursor-pointer hover:underline underline-offset-2"
            style={{ color: "var(--color-lime)" }}
            onClick={() => onChange("saas")}
          >
            Mulai dengan SaaS →
          </span>{" "}
          paling banyak dipakai di ArroBuild.
        </p>
      </div>

      {/* Product type grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {PRODUCT_TYPES.map((pt) => {
          const isSelected = value === pt.id;
          const isHovered = hoveredId === pt.id;

          return (
            <button
              key={pt.id}
              onClick={() => onChange(pt.id)}
              onMouseEnter={() => setHoveredId(pt.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative text-left rounded-2xl transition-all duration-200 group"
              style={{
                padding: "20px 20px 18px",
                background: isSelected
                  ? "rgba(204,255,0,0.05)"
                  : isHovered
                  ? "rgba(255,255,255,0.04)"
                  : "var(--color-bg-elevated)",
                border: isSelected
                  ? `1.5px solid rgba(204,255,0,0.5)`
                  : `0.5px solid rgba(255,255,255,${isHovered ? "0.14" : "0.08"})`,
                transform: isSelected
                  ? "translateY(-2px)"
                  : isHovered
                  ? "translateY(-1px)"
                  : "none",
                boxShadow: isSelected
                  ? "0 0 0 1px rgba(204,255,0,0.15), 0 8px 24px rgba(0,0,0,0.3)"
                  : isHovered
                  ? "0 4px 16px rgba(0,0,0,0.2)"
                  : "none",
              }}
            >
              {/* Popular badge */}
              {pt.popular && !isSelected && (
                <span
                  className="absolute top-3 right-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(204,255,0,0.12)",
                    color: "var(--color-lime)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    border: "0.5px solid rgba(204,255,0,0.25)",
                  }}
                >
                  Populer
                </span>
              )}

              {/* Selected checkmark */}
              {isSelected && (
                <div
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--color-lime)" }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="#0A0A0A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
                style={{
                  background: isSelected
                    ? `${pt.color}18`
                    : "rgba(255,255,255,0.06)",
                  border: `0.5px solid ${isSelected ? pt.color + "30" : "rgba(255,255,255,0.08)"}`,
                  color: isSelected ? pt.color : "rgba(255,255,255,0.4)",
                  transition: "all 0.2s",
                }}
              >
                {pt.icon}
              </div>

              {/* Label */}
              <div
                className="font-semibold text-base mb-1"
                style={{
                  color: isSelected
                    ? "var(--color-text-primary)"
                    : "rgba(255,255,255,0.85)",
                }}
              >
                {pt.label}
              </div>

              {/* Description */}
              <div
                className="text-sm mb-3"
                style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}
              >
                {pt.desc}
              </div>

              {/* Fit hint */}
              <div
                className="flex items-start gap-1.5 pt-3"
                style={{
                  borderTop: "0.5px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  className="text-[10px] font-bold tracking-wider uppercase flex-shrink-0 mt-0.5"
                  style={{
                    color: isSelected
                      ? "rgba(204,255,0,0.5)"
                      : "rgba(255,255,255,0.2)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                  }}
                >
                  Cocok:
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: isSelected
                      ? "rgba(204,255,0,0.7)"
                      : "rgba(255,255,255,0.3)",
                    lineHeight: 1.5,
                  }}
                >
                  {pt.fit}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage selector — animated in after product selected */}
      {value && (
        <div
          className="animate-fade-slide-up mb-10"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="mb-4">
            <h2
              className="font-semibold text-lg mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              Di fase mana proyekmu?
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Ini menentukan rekomendasi dokumen yang paling relevan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STAGES.map((s) => {
              const isActive = stage === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onStageChange(s.id)}
                  className="text-left rounded-2xl transition-all duration-200 group"
                  style={{
                    padding: "18px 20px",
                    background: isActive
                      ? "rgba(204,255,0,0.05)"
                      : "var(--color-bg-elevated)",
                    border: isActive
                      ? "1.5px solid rgba(204,255,0,0.45)"
                      : "0.5px solid rgba(255,255,255,0.08)",
                    transform: isActive ? "translateY(-1px)" : "none",
                    boxShadow: isActive
                      ? "0 4px 16px rgba(0,0,0,0.25)"
                      : "none",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{s.icon}</span>
                    <span
                      className="font-semibold text-sm"
                      style={{
                        color: isActive
                          ? "var(--color-lime)"
                          : "var(--color-text-primary)",
                      }}
                    >
                      {s.label}
                    </span>
                    {isActive && (
                      <div
                        className="ml-auto w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--color-lime)" }}
                      >
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path
                            d="M1 3L3 5L7 1"
                            stroke="#0A0A0A"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {s.desc}
                  </p>
                  <p
                    className="text-xs italic"
                    style={{
                      color: isActive
                        ? "rgba(204,255,0,0.6)"
                        : "rgba(255,255,255,0.25)",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: "10px",
                    }}
                  >
                    {s.note}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200"
        style={{
          background: canProceed ? "var(--color-lime)" : "rgba(255,255,255,0.05)",
          color: canProceed ? "#0A0A0A" : "rgba(255,255,255,0.2)",
          cursor: canProceed ? "pointer" : "not-allowed",
          border: canProceed ? "none" : "0.5px solid rgba(255,255,255,0.06)",
          transform: canProceed ? "none" : "none",
          boxShadow: canProceed ? "0 4px 24px rgba(204,255,0,0.2)" : "none",
          letterSpacing: "-0.01em",
        }}
      >
        {!value
          ? "Pilih tipe produk dulu"
          : !stage
          ? "Pilih fase proyek dulu"
          : "Lanjut ke step berikutnya →"}
      </button>
    </div>
  );
}
