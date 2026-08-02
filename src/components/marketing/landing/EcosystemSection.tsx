"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const SECTIONS = [
  {
    id: "learn",
    label: "Belajar",
    title: "Mulai dari nol. Gratis selamanya.",
    desc: "Ratusan konten yang dirancang khusus untuk developer yang belajar bangun produk dengan AI agent. Dari konsep dasar sampai workflow advanced — semua bisa diakses tanpa akun berbayar.",
    cta: "Lihat learning path →",
    ctaHref: "/learn",
    items: [
      "01 — Pengenalan AI Agent",
      "02 — Prompt Engineering Dasar",
      "03 — Membuat PRD yang Efektif",
    ],
  },
  {
    id: "build",
    label: "Build",
    title: "Dokumen fondasi, sebelum baris kode pertama.",
    desc: "Generate PRD, arsitektur, design system, dan agent rules dari deskripsi ide kamu. Semua file langsung terhubung lewat FEAT-ID — tidak ada lagi inkonsistensi antar dokumen.",
    cta: "Mulai generate →",
    ctaHref: "/generate",
    items: [
      "→ prd.md",
      "→ architecture.md",
      "→ design-system.md",
    ],
  },
  {
    id: "integrate",
    label: "Integrate",
    title: "Export ke tools yang kamu pakai.",
    desc: "Output ArroBuild dirancang langsung untuk Cursor, Claude Code, dan Windsurf. Paste ke root proyek, AI agent kamu langsung punya konteks lengkap — tanpa setup manual.",
    cta: "Lihat integrasi →",
    ctaHref: "/integrations",
    items: [
      "Cursor",
      "Claude Code",
      "Windsurf",
    ],
  },
];

export default function EcosystemSection() {
  const [hoveredId, setHoveredId] = useState<string>(SECTIONS[0].id);

  return (
    <section
      style={{
        background: "var(--lp-bg-base)",
        padding: "160px 24px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{
            fontFamily: "var(--font-unbounded)",
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 40px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--lp-text-primary)",
            margin: "0 0 64px",
          }}
        >
          Satu akun.<br />
          <span style={{ color: "var(--lp-text-tertiary)" }}>Tiga cara pakai.</span>
        </motion.h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
          className="ecosystem-grid"
        >
          {/* Interactive List (Left) */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {SECTIONS.map((section) => (
              <div
                key={section.id}
                onMouseEnter={() => setHoveredId(section.id)}
                style={{
                  padding: "32px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  opacity: hoveredId === section.id ? 1 : 0.4,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-unbounded)",
                    fontWeight: 700,
                    fontSize: 32,
                    color: "var(--lp-text-primary)",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {section.label}
                </h3>
              </div>
            ))}
          </div>

          {/* Dynamic Content (Right) */}
          <div style={{ position: "relative", minHeight: 300 }}>
            <AnimatePresence mode="wait">
              {SECTIONS.map(
                (section) =>
                  hoveredId === section.id && (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      style={{ position: "absolute", top: 0, left: 0, right: 0 }}
                    >
                      <h4
                        style={{
                          fontFamily: "var(--font-unbounded)",
                          fontWeight: 700,
                          fontSize: 24,
                          color: "var(--lp-text-primary)",
                          margin: "0 0 16px",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {section.title}
                      </h4>
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: 16,
                          lineHeight: 1.6,
                          color: "var(--lp-text-secondary)",
                          margin: "0 0 32px",
                        }}
                      >
                        {section.desc}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          marginBottom: 32,
                        }}
                      >
                        {section.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              fontSize: 14,
                              color: "var(--lp-text-tertiary)",
                              padding: "12px 16px",
                              background: "rgba(255,255,255,0.03)",
                              borderRadius: 8,
                            }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                      <Link
                        href={section.ctaHref}
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--lp-text-primary)",
                          textDecoration: "none",
                          borderBottom: "1px solid var(--lp-text-primary)",
                          paddingBottom: 4,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                      >
                        {section.cta}
                      </Link>
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .ecosystem-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .ecosystem-grid > div:last-child {
            position: relative !important;
            min-height: auto !important;
          }
          .ecosystem-grid > div:last-child > div {
            position: relative !important;
          }
        }
      `}</style>
    </section>
  );
}
