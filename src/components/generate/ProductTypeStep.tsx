"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import type { ProductType, ProjectStage } from "./types";
import { ProductTypeIcon, StageIcon } from "@/lib/ui/app-icons";

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
  fit: string;
  popular?: boolean;
  color: string;
}[] = [
  { id: "saas", label: "SaaS", desc: "Web app berbasis subscription", fit: "Ada fitur yang dibayar per bulan", popular: true, color: "#FFB020" },
  { id: "marketplace", label: "Marketplace", desc: "Platform dua sisi (buyer & seller)", fit: "Ada dua tipe user yang saling transaksi", color: "#FF9500" },
  { id: "mobile", label: "Mobile App", desc: "iOS, Android, atau keduanya", fit: "Output utama adalah app di smartphone", color: "#38BDF8" },
  { id: "api", label: "API / Dev Tool", desc: "Headless service, SDK, atau CLI", fit: "User utama adalah developer lain", color: "#9D4EDD" },
  { id: "ai-app", label: "AI-Powered App", desc: "App dengan AI sebagai core feature", fit: "AI bukan fitur tambahan, tapi inti produk", color: "#34D399" },
  { id: "ecommerce", label: "E-Commerce", desc: "Toko online, produk fisik atau digital", fit: "Jual produk langsung ke konsumen", color: "#FB923C" },
  { id: "internal", label: "Internal Tool", desc: "Dashboard, admin, atau ops tool", fit: "Dipakai internal tim atau perusahaan", color: "#2E8EFF" },
  { id: "portfolio", label: "Portfolio / Site", desc: "Showcase project & skills", fit: "Ingin tampil profesional online", color: "#F472B6" },
  { id: "other", label: "Lainnya", desc: "Tipe di luar kategori di atas", fit: "Ceritakan idenya, AI yang bantu klasifikasikan", color: "#94A3B8" },
];

const STAGES: { id: ProjectStage; label: string; desc: string; note: string }[] = [
  { id: "idea", label: "Ide baru", desc: "Belum mulai coding", note: "Saya akan generate docs dari nol" },
  { id: "prototype", label: "Ada prototype", desc: "Sudah mulai, belum production", note: "Saya sesuaikan docs dengan progress yang ada" },
  { id: "production", label: "Sudah production", desc: "Punya user nyata", note: "Fokus ke docs untuk scale & hardening" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function ProductTypeStep({ value, stage, onChange, onStageChange, onNext }: Props) {
  const [hoveredId, setHoveredId] = useState<ProductType | null>(null);
  const canProceed = value !== null && stage !== null;

  return (
    <div className="generate-app max-w-[720px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8 sm:mb-10">
        <h1
          className="font-unbounded font-extrabold mb-3"
          style={{
            fontSize: "clamp(24px, 3vw, 28px)",
            letterSpacing: "-0.02em",
            color: "var(--app-text-primary)",
            lineHeight: 1.15,
          }}
        >
          Kamu lagi build apa?
        </h1>
        <p className="font-mono text-[14px]" style={{ color: "var(--app-text-secondary)", lineHeight: 1.7 }}>
          Pilihan ini nentuin pertanyaan di step berikutnya.
        </p>
      </div>

      <div
        className="flex items-center gap-2 mb-8 font-mono text-[13px]"
        style={{ color: "var(--app-text-secondary)" }}
      >
        <Lightbulb size={14} strokeWidth={1.75} style={{ color: "var(--app-amber)", flexShrink: 0 }} />
        <span>
          Baru pertama kali?{" "}
          <button
            type="button"
            className="font-semibold hover:underline"
            style={{ color: "var(--app-sky)" }}
            onClick={() => onChange("saas")}
          >
            Mulai dengan SaaS
          </button>{" "}
          — paling banyak dipakai.
        </span>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8"
        initial="hidden"
        animate="visible"
      >
        {PRODUCT_TYPES.map((pt, i) => {
          const isSelected = value === pt.id;
          const isHovered = hoveredId === pt.id;

          return (
            <motion.button
              key={pt.id}
              type="button"
              custom={i}
              variants={cardVariants}
              onClick={() => onChange(pt.id)}
              onMouseEnter={() => setHoveredId(pt.id)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative text-left rounded-xl transition-colors duration-100 sm:flex-col flex flex-row sm:items-stretch items-center gap-3 sm:gap-0"
              style={{
                padding: "16px 18px",
                background: isSelected ? "rgba(255,176,32,0.04)" : "var(--app-bg-elevated)",
                border: isSelected
                  ? "1.5px solid var(--app-amber)"
                  : isHovered
                  ? "1px solid var(--app-sky)"
                  : "0.5px solid var(--app-border-default)",
              }}
            >
              {pt.popular && !isSelected && (
                <span
                  className="absolute top-2 right-2 font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full hidden sm:inline"
                  style={{
                    background: "rgba(56,189,248,0.12)",
                    color: "var(--app-sky)",
                    border: "1px solid rgba(56,189,248,0.3)",
                  }}
                >
                  Populer
                </span>
              )}

              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 sm:mb-3 transition-transform duration-100"
                style={{
                  background: isSelected ? "rgba(255,176,32,0.12)" : "var(--app-bg-hover)",
                  color: isSelected ? pt.color : "var(--app-text-tertiary)",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                }}
              >
                <ProductTypeIcon type={pt.id} size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-mono font-semibold text-[14px] mb-0.5 sm:mb-1" style={{ color: "var(--app-text-primary)" }}>
                  {pt.label}
                </div>
                <div className="font-mono text-[12px] mb-0 sm:mb-2 hidden sm:block" style={{ color: "var(--app-text-tertiary)" }}>
                  {pt.desc}
                </div>
                <div className="font-mono text-[11px] hidden sm:block pt-2 border-t" style={{ borderColor: "var(--app-border-default)", color: "var(--app-text-tertiary)" }}>
                  {pt.fit}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {value && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="mb-4">
            <h2 className="font-unbounded text-[17px] font-bold mb-1" style={{ color: "var(--app-text-primary)" }}>
              Di fase mana proyekmu?
            </h2>
            <p className="font-mono text-[13px]" style={{ color: "var(--app-text-secondary)" }}>
              Ini menentukan rekomendasi dokumen yang paling relevan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STAGES.map((s) => {
              const isActive = stage === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onStageChange(s.id)}
                  className="text-left rounded-xl p-4 transition-all duration-100"
                  style={{
                    background: isActive ? "rgba(255,176,32,0.04)" : "var(--app-bg-elevated)",
                    border: isActive ? "1.5px solid var(--app-amber)" : "0.5px solid var(--app-border-default)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <StageIcon stage={s.id} size={18} className={isActive ? "text-[var(--app-amber)]" : "text-[var(--app-text-tertiary)]"} />
                    <span className="font-mono text-[13px] font-semibold" style={{ color: isActive ? "var(--app-amber)" : "var(--app-text-primary)" }}>
                      {s.label}
                    </span>
                  </div>
                  <p className="font-mono text-[12px] mb-1" style={{ color: "var(--app-text-tertiary)" }}>
                    {s.desc}
                  </p>
                  <p className="font-mono text-[11px]" style={{ color: isActive ? "rgba(255,176,32,0.7)" : "var(--app-text-tertiary)" }}>
                    {s.note}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3.5 rounded-lg font-mono font-bold text-[14px] transition-all duration-120"
        style={{
          background: canProceed ? "var(--app-amber)" : "var(--app-bg-elevated)",
          color: canProceed ? "#0D1321" : "var(--app-text-tertiary)",
          cursor: canProceed ? "pointer" : "not-allowed",
          border: canProceed ? "none" : "0.5px solid var(--app-border-default)",
        }}
      >
        {!value ? "Pilih tipe produk dulu" : !stage ? "Pilih fase proyek dulu" : "Lanjut ke step berikutnya →"}
      </button>
    </div>
  );
}
