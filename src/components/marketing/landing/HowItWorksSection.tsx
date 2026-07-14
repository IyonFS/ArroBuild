"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ── Step Data ─────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    color: "#2E8EFF",
    title: "Describe",
    desc: "Ceritakan ide produk kamu. Bisa 1 paragraf, bisa detail lengkap.",
    detail: "Tidak perlu format khusus — tulis seperti biasanya kamu jelasin ke tim.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    num: "02",
    color: "#9D4EDD",
    title: "Configure",
    desc: "Pilih framework, gaya desain, dan AI coding tool yang kamu pakai.",
    detail: "Next.js? Vite? Cursor? Claude Code? Semuanya ada opsinya.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    num: "03",
    color: "#38BDF8",
    title: "Generate",
    desc: "Pilih dokumen yang mau dibuat. Progress kelihatan real-time per file.",
    detail: "Semua dokumen terhubung — FEAT-ID sinkron lintas file otomatis.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    num: "04",
    color: "#FFB020",
    title: "Export",
    desc: "Download .zip. Langsung paste ke root proyek, siap dipakai.",
    detail: "Cursor, Claude Code, dan Windsurf langsung membaca semua file.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

// ── Animated connector line ───────────────────────────────────

function ConnectorArrow({ color, inView }: { color: string; inView: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, flexShrink: 0, marginTop: -32 }}>
      <svg width="48" height="16" viewBox="0 0 48 16" fill="none" overflow="visible">
        <motion.line
          x1="4" y1="8" x2="40" y2="8"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeOpacity="0.4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeInOut" }}
        />
        <motion.path
          d="M 38 4 L 44 8 L 38 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeOpacity="0.5"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.9 }}
        />
      </svg>
    </div>
  );
}

// ── Tool logos strip ──────────────────────────────────────────

function ToolsStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: 0.5 }}
      style={{
        marginTop: 48,
        paddingTop: 28,
        borderTop: "0.5px solid var(--lp-border-default)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      <span style={{
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 12,
        color: "var(--lp-text-tertiary)",
        letterSpacing: "0.02em",
      }}>
        Output siap paste ke →
      </span>
      {[
        { name: "Cursor", color: "#38BDF8" },
        { name: "Claude Code", color: "#9D4EDD" },
        { name: "Windsurf", color: "#34D399" },
        { name: "GitHub Copilot", color: "rgba(240,243,250,0.4)" },
      ].map((tool) => (
        <div key={tool.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: tool.color }} />
          <span style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--lp-text-secondary)",
            letterSpacing: "0.02em",
          }}>
            {tool.name}
          </span>
        </div>
      ))}
      <span style={{
        marginLeft: "auto",
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 11,
        color: "var(--lp-text-tertiary)",
        fontStyle: "italic",
      }}>
        tanpa modifikasi manual.
      </span>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      style={{
        background: "var(--lp-bg-base)",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 56 }}
        >
          <h2
            style={{
              fontFamily: "var(--font-unbounded)",
              fontWeight: 800,
              fontSize: "clamp(22px, 3vw, 32px)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--lp-text-primary)",
              margin: "0 0 10px",
            }}
          >
            Dari ide ke dokumen, empat langkah.
          </h2>
          <p style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 13,
            color: "var(--lp-text-tertiary)",
            margin: 0,
            letterSpacing: "0.02em",
          }}>
            Rata-rata 60–90 detik dari prompt sampai ZIP siap download.
          </p>
        </motion.div>

        {/* Steps — horizontal timeline */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0,
          }}
          className="steps-row"
        >
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display: "contents" }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  position: "relative",
                }}
              >
                {/* Step card */}
                <motion.div
                  whileHover={{
                    borderColor: step.color,
                    boxShadow: `0 0 20px ${step.color}18`,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: "var(--lp-bg-elevated)",
                    border: "0.5px solid var(--lp-border-default)",
                    borderRadius: 12,
                    padding: "28px 24px 32px",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    cursor: "default",
                  }}
                >
                  {/* Large ghost number — bottom right */}
                  <div style={{
                    position: "absolute",
                    bottom: -16,
                    right: -4,
                    fontFamily: "var(--font-unbounded)",
                    fontWeight: 900,
                    fontSize: 96,
                    lineHeight: 1,
                    color: step.color,
                    opacity: 0.04,
                    pointerEvents: "none",
                    userSelect: "none",
                    letterSpacing: "-0.05em",
                  }}>
                    {step.num}
                  </div>

                  {/* Icon with colored bg circle */}
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: `${step.color}12`,
                    border: `1px solid ${step.color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step.color,
                    marginBottom: 20,
                  }}>
                    {step.icon}
                  </div>

                  {/* Step number chip */}
                  <div style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: step.color,
                    marginBottom: 8,
                  }}>
                    STEP {step.num}
                  </div>

                  <h3 style={{
                    fontFamily: "var(--font-unbounded)",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--lp-text-primary)",
                    margin: "0 0 10px",
                    letterSpacing: "-0.02em",
                  }}>
                    {step.title}
                  </h3>

                  <p style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 13,
                    color: "var(--lp-text-secondary)",
                    margin: "0 0 10px",
                    lineHeight: 1.7,
                    letterSpacing: "-0.005em",
                  }}>
                    {step.desc}
                  </p>

                  <p style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    color: "var(--lp-text-tertiary)",
                    margin: 0,
                    lineHeight: 1.6,
                    fontStyle: "italic",
                  }}>
                    {step.detail}
                  </p>
                </motion.div>
              </motion.div>

              {/* Arrow connector between steps */}
              {i < STEPS.length - 1 && (
                <ConnectorArrow color={STEPS[i + 1].color} inView={inView} />
              )}
            </div>
          ))}
        </div>

        {/* Tools strip */}
        <ToolsStrip />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .steps-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .steps-row > div { width: 100% !important; flex: none !important; }
        }
      `}</style>
    </section>
  );
}
