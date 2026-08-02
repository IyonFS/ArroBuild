"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  {
    num: "01",
    title: "Describe",
    desc: "Ceritakan ide produk kamu. Bisa 1 paragraf, bisa detail lengkap. Tidak perlu format khusus — tulis seperti biasanya kamu jelasin ke tim.",
  },
  {
    num: "02",
    title: "Configure",
    desc: "Pilih framework, gaya desain, dan AI coding tool yang kamu pakai. Next.js? Vite? Cursor? Claude Code? Semuanya ada opsinya.",
  },
  {
    num: "03",
    title: "Generate",
    desc: "Pilih dokumen yang mau dibuat. Progress kelihatan real-time per file. Semua dokumen terhubung — FEAT-ID sinkron lintas file otomatis.",
  },
  {
    num: "04",
    title: "Export",
    desc: "Download .zip. Langsung paste ke root proyek, siap dipakai. Cursor, Claude Code, dan Windsurf langsung membaca semua file tanpa perlu modifikasi.",
  },
];

export default function HowItWorksSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      style={{
        background: "var(--lp-bg-base)",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
        }}
        className="how-it-works-grid"
      >
        {/* Left Sticky Column */}
        <div style={{ padding: "160px 0" }}>
          <div
            style={{
              position: "sticky",
              top: "160px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-unbounded)",
                fontWeight: 800,
                fontSize: "clamp(32px, 4vw, 56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--lp-text-primary)",
                margin: "0 0 24px",
              }}
            >
              Dari ide ke<br />
              <span style={{ color: "var(--lp-text-tertiary)" }}>dokumen.</span>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 16,
                color: "var(--lp-text-secondary)",
                margin: 0,
                lineHeight: 1.6,
                maxWidth: 400,
              }}
            >
              Rata-rata 60–90 detik dari prompt sampai file ZIP siap download dan di-paste ke workspace kamu.
            </p>
          </div>
        </div>

        {/* Right Scrolling Column */}
        <div style={{ padding: "160px 0", display: "flex", flexDirection: "column", gap: 160 }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-unbounded)",
                  fontWeight: 900,
                  fontSize: 120,
                  lineHeight: 0.8,
                  letterSpacing: "-0.05em",
                  color: "rgba(255,255,255,0.03)",
                }}
              >
                {step.num}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-unbounded)",
                  fontWeight: 800,
                  fontSize: 32,
                  color: "var(--lp-text-primary)",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 18,
                  color: "var(--lp-text-secondary)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .how-it-works-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .how-it-works-grid > div:first-child {
            padding: 80px 0 40px !important;
          }
          .how-it-works-grid > div:first-child > div {
            position: relative !important;
            top: 0 !important;
          }
          .how-it-works-grid > div:last-child {
            padding: 0 0 80px !important;
            gap: 80px !important;
          }
        }
      `}</style>
    </section>
  );
}
