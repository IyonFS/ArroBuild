"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  {
    id: "learn",
    label: "Belajar",
    color: "#9D4EDD",
    title: "Mulai dari nol. Gratis selamanya.",
    desc: "Ratusan konten yang dirancang khusus untuk developer yang belajar bangun produk dengan AI agent. Dari konsep dasar sampai workflow advanced — semua bisa diakses tanpa akun berbayar.",
    cta: "Lihat learning path →",
    ctaHref: "/learn",
    preview: (
      <div style={{ padding: "16px 0" }}>
        {[
          { label: "01 — Pengenalan AI Agent", done: true },
          { label: "02 — Prompt Engineering Dasar", done: true },
          { label: "03 — Membuat PRD yang Efektif", done: false },
          { label: "04 — Arsitektur untuk AI Workflow", done: false },
          { label: "05 — Agent Rules & Context", done: false },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              borderBottom: "0.5px solid var(--lp-border-default)",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: item.done ? "#34D399" : "transparent",
                border: item.done ? "none" : "1px solid var(--lp-border-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {item.done && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#0D1321" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 12,
                color: item.done ? "var(--lp-text-primary)" : "var(--lp-text-tertiary)",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "build",
    label: "Build",
    color: "#FFB020",
    title: "Dokumen fondasi, sebelum baris kode pertama.",
    desc: "Generate PRD, arsitektur, design system, dan agent rules dari deskripsi ide kamu. Semua file langsung terhubung lewat FEAT-ID — tidak ada lagi inkonsistensi antar dokumen.",
    cta: "Mulai generate →",
    ctaHref: "/generate",
    preview: (
      <div
        style={{
          background: "var(--lp-bg-base)",
          borderRadius: 8,
          padding: "14px 16px",
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 12,
          color: "var(--lp-sky)",
          lineHeight: 1.7,
          marginTop: 16,
        }}
      >
        <div style={{ color: "var(--lp-text-tertiary)", marginBottom: 4 }}>$ arrobuild generate</div>
        <div>→ prd.md <span style={{ color: "#34D399" }}>✓</span></div>
        <div>→ architecture.md <span style={{ color: "#34D399" }}>✓</span></div>
        <div>→ design-system.md <span style={{ color: "#34D399" }}>✓</span></div>
        <div style={{ color: "var(--lp-amber)", marginTop: 8 }}>✓ 3 dokumen siap. FEAT-ID sinkron.</div>
      </div>
    ),
  },
  {
    id: "integrate",
    label: "Integrate",
    color: "#38BDF8",
    title: "Export ke tools yang kamu pakai.",
    desc: "Output ArroBuild dirancang langsung untuk Cursor, Claude Code, dan Windsurf. Paste ke root proyek, AI agent kamu langsung punya konteks lengkap — tanpa setup manual.",
    cta: "Lihat integrasi →",
    ctaHref: "/integrations",
    preview: (
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        {["Cursor", "Claude Code", "Windsurf", "GitHub Copilot"].map((tool) => (
          <div
            key={tool}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "0.5px solid var(--lp-border-strong)",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
              color: "var(--lp-text-secondary)",
              fontWeight: 500,
            }}
          >
            {tool}
          </div>
        ))}
      </div>
    ),
  },
];

export default function EcosystemSection() {
  const [activeTab, setActiveTab] = useState("learn");
  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <section
      style={{
        background: "var(--lp-bg-surface)",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-unbounded)",
            fontWeight: 800,
            fontSize: "clamp(22px, 3vw, 32px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--lp-text-primary)",
            margin: "0 0 40px",
          }}
        >
          Satu akun, tiga cara pakai.
        </motion.h2>

        {/* Tab buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 0,
            overflowX: "auto",
            paddingBottom: 0,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 13,
                fontWeight: 700,
                padding: "10px 20px",
                background: activeTab === tab.id ? "var(--lp-bg-elevated)" : "transparent",
                border: `1px solid ${activeTab === tab.id ? tab.color : "var(--lp-border-default)"}`,
                borderRadius: "8px 8px 0 0",
                borderBottom: activeTab === tab.id ? `1px solid var(--lp-bg-elevated)` : `1px solid var(--lp-border-default)`,
                cursor: "pointer",
                color: activeTab === tab.id ? tab.color : "var(--lp-text-tertiary)",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
                position: "relative",
                bottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Panel */}
        <div
          style={{
            background: "var(--lp-bg-elevated)",
            border: `1px solid var(--lp-border-default)`,
            borderTop: `1px solid ${active.color}`,
            borderRadius: "0 8px 8px 8px",
            padding: "32px",
            minHeight: 280,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-unbounded)",
                  fontWeight: 700,
                  fontSize: "clamp(18px, 2.2vw, 22px)",
                  color: "var(--lp-text-primary)",
                  margin: "0 0 14px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                {active.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: "var(--lp-text-secondary)",
                  maxWidth: 480,
                  margin: "0 0 20px",
                  letterSpacing: "-0.005em",
                }}
              >
                {active.desc}
              </p>
              {active.preview}
              <a
                href={active.ctaHref}
                style={{
                  display: "inline-block",
                  marginTop: 24,
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: active.color,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
              >
                {active.cta}
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
