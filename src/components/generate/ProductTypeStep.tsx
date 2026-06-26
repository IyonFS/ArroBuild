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
}[] = [
  {
    id: "saas",
    label: "SaaS",
    desc: "Web app berbasis subscription",
    icon: "▲",
    fit: "Ada fitur yang dibayar per bulan",
    popular: true,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    desc: "Platform dua sisi (buyer & seller)",
    icon: "🛒",
    fit: "Ada dua tipe user yang saling transaksi",
  },
  {
    id: "mobile",
    label: "Mobile App",
    desc: "iOS, Android, atau keduanya",
    icon: "📱",
    fit: "Output utama adalah app di smartphone",
  },
  {
    id: "api",
    label: "API / Dev Tool",
    desc: "Headless service, SDK, atau CLI",
    icon: "⚡",
    fit: "User utama adalah developer lain",
  },
  {
    id: "ai-app",
    label: "AI-Powered App",
    desc: "App dengan AI sebagai core feature",
    icon: "🤖",
    fit: "AI bukan fitur tambahan, tapi inti produk",
  },
  {
    id: "ecommerce",
    label: "E-Commerce",
    desc: "Toko online, produk fisik atau digital",
    icon: "🛍️",
    fit: "Jual produk langsung ke konsumen",
  },
  {
    id: "internal",
    label: "Internal Tool",
    desc: "Dashboard, admin, atau ops tool",
    icon: "🔧",
    fit: "Dipakai internal tim atau perusahaan",
  },
  {
    id: "portfolio",
    label: "Portfolio / Personal Site",
    desc: "Showcase project & skills",
    icon: "🎨",
    fit: "Ingin tampil profesional online",
  },
  {
    id: "other",
    label: "Lainnya",
    desc: "Tipe di luar kategori di atas",
    icon: "✦",
    fit: "—",
  },
];

const STAGES: { id: ProjectStage; label: string; desc: string }[] = [
  {
    id: "idea",
    label: "Ide baru",
    desc: "Belum mulai coding",
  },
  {
    id: "prototype",
    label: "Ada prototype / MVP",
    desc: "Sudah mulai, belum production",
  },
  {
    id: "production",
    label: "Sudah production",
    desc: "Butuh docs lebih lengkap",
  },
];

export default function ProductTypeStep({
  value,
  stage,
  onChange,
  onStageChange,
  onNext,
}: Props) {
  const [showStagePicker, setShowStagePicker] = useState(!!value);

  const handleTypeSelect = (id: ProductType) => {
    onChange(id);
    setShowStagePicker(true);
    // scroll stage into view after a tick
    setTimeout(() => {
      document.getElementById("stage-picker")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  const canNext = !!value && !!stage;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <span
          className="font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-4 inline-block"
          style={{
            background: "rgba(204,255,0,0.08)",
            color: "var(--color-lime)",
            border: "0.5px solid rgba(204,255,0,0.25)",
          }}
        >
          Step 1 of 4 — Tipe Produk
        </span>

        <h2
          className="font-unbounded font-bold text-xl sm:text-2xl mb-2"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
        >
          Kamu lagi build apa?
        </h2>
        <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Pilih yang paling dekat. Ini menentukan pertanyaan di step berikutnya.
        </p>
      </div>

      {/* First-time tip banner */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
        style={{
          background: "rgba(204,255,0,0.04)",
          border: "0.5px solid rgba(204,255,0,0.15)",
        }}
      >
        <span style={{ color: "var(--color-lime)", fontSize: 14 }}>💡</span>
        <p className="font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Baru pertama kali?{" "}
          <button
            onClick={() => handleTypeSelect("saas")}
            className="font-bold underline underline-offset-2 transition-colors"
            style={{ color: "var(--color-lime)" }}
          >
            Mulai dengan SaaS →
          </button>{" "}
          paling banyak dipakai di ArroBuild.
        </p>
      </div>

      {/* Product Type Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
        {PRODUCT_TYPES.map((pt) => {
          const active = value === pt.id;
          return (
            <button
              key={pt.id}
              onClick={() => handleTypeSelect(pt.id)}
              className="text-left rounded-xl p-4 transition-all duration-150 focus:outline-none group relative"
              style={{
                background: active
                  ? "rgba(204,255,0,0.07)"
                  : "var(--color-bg-elevated)",
                border: active
                  ? "1px solid rgba(204,255,0,0.45)"
                  : "0.5px solid var(--color-border-default)",
              }}
            >
              {/* Popular badge */}
              {pt.popular && (
                <span
                  className="absolute top-3 right-3 font-mono text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(204,255,0,0.12)",
                    color: "var(--color-lime)",
                    border: "0.5px solid rgba(204,255,0,0.3)",
                  }}
                >
                  Populer
                </span>
              )}

              {/* Icon + label */}
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="text-base w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 font-mono"
                  style={{
                    background: active
                      ? "rgba(204,255,0,0.12)"
                      : "var(--color-bg-surface)",
                    color: active
                      ? "var(--color-lime)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  {pt.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className="font-mono font-bold text-sm block"
                    style={{
                      color: active
                        ? "var(--color-lime)"
                        : "var(--color-text-primary)",
                    }}
                  >
                    {pt.label}
                  </span>
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {pt.desc}
                  </span>
                </div>
                {active && (
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--color-lime)" }}
                  >
                    <svg width="7" height="7" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="#0A0A0A"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* "Cocok jika..." */}
              <div
                className="flex items-start gap-1.5 mt-2 pt-2"
                style={{ borderTop: "0.5px solid var(--color-border-default)" }}
              >
                <span
                  className="font-mono text-[10px] font-bold tracking-wide uppercase mt-0.5 flex-shrink-0"
                  style={{ color: active ? "rgba(204,255,0,0.6)" : "var(--color-text-tertiary)" }}
                >
                  Cocok:
                </span>
                <span
                  className="font-mono text-[11px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {pt.fit}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage picker — appears after type is selected */}
      {showStagePicker && (
        <div
          id="stage-picker"
          className="mb-8 rounded-xl overflow-hidden"
          style={{
            border: "0.5px solid var(--color-border-default)",
            background: "var(--color-bg-elevated)",
          }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "0.5px solid var(--color-border-default)" }}
          >
            <p
              className="font-mono font-bold text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
              Di fase mana proyekmu sekarang?
            </p>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {STAGES.map((s) => {
              const active = stage === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onStageChange(s.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all"
                  style={{
                    background: active
                      ? "rgba(204,255,0,0.07)"
                      : "transparent",
                    border: active
                      ? "0.5px solid rgba(204,255,0,0.3)"
                      : "0.5px solid transparent",
                  }}
                >
                  {/* Radio */}
                  <div
                    className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: active
                        ? "var(--color-lime)"
                        : "var(--color-border-strong)",
                      background: active
                        ? "var(--color-lime)"
                        : "transparent",
                    }}
                  >
                    {active && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#0A0A0A" }}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className="font-mono font-semibold text-sm"
                      style={{
                        color: active
                          ? "var(--color-lime)"
                          : "var(--color-text-primary)",
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      className="font-mono text-[11px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!canNext}
        className="w-full rounded-xl py-3 font-mono font-bold text-sm transition-all"
        style={{
          background: canNext ? "var(--color-lime)" : "var(--color-bg-elevated)",
          color: canNext ? "#0A0A0A" : "var(--color-text-disabled)",
          border: canNext ? "none" : "0.5px solid var(--color-border-default)",
          cursor: canNext ? "pointer" : "not-allowed",
        }}
      >
        {!value
          ? "Pilih tipe produk dulu"
          : !stage
          ? "Pilih fase proyekmu"
          : "Lanjut →"}
      </button>
    </div>
  );
}
