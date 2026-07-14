"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MINI_TOOL_LIST } from "@/lib/config/mini-tools";
import {
  PORTFOLIO_SHOWCASE,
  TOOL_SHOWCASE_META,
  getAccent,
  tierLabel,
} from "@/components/tools/tool-meta";

const LANDING_TOOLS = [
  {
    name: PORTFOLIO_SHOWCASE.name,
    desc: PORTFOLIO_SHOWCASE.tagline,
    badge: "Gratis",
    badgeType: "live" as const,
    href: PORTFOLIO_SHOWCASE.href,
    accent: PORTFOLIO_SHOWCASE.accent,
  },
  ...MINI_TOOL_LIST.map((t) => {
    const meta = TOOL_SHOWCASE_META[t.id];
    return {
      name: t.name,
      desc: meta.tagline,
      badge: tierLabel(t.minTier),
      badgeType: "tier" as const,
      href: meta.href,
      accent: meta.accent,
    };
  }),
];

export default function MiniToolsSection() {
  return (
    <section
      style={{
        background: "var(--lp-bg-base)",
        padding: "96px 0",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
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
            margin: "0 0 8px",
          }}
        >
          Tools kecil buat kerjaan harian.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 13,
            color: "var(--lp-text-tertiary)",
            margin: "0 0 16px",
            letterSpacing: "0.01em",
          }}
        >
          Utilitas cepat di luar generate dokumen utama — portfolio prompt, doctor, scope, schema.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ marginBottom: 40 }}
        >
          <Link
            href="/tools"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--lp-amber)",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            Lihat etalase lengkap →
          </Link>
        </motion.div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 16,
            display: "flex",
            gap: 12,
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            maxWidth: "100vw",
          }}
          className="tools-strip"
        >
          {LANDING_TOOLS.map((tool, i) => {
            const accent = getAccent(tool.accent);
            return (
              <motion.a
                key={tool.name}
                href={tool.href}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ scale: 1.02, borderColor: accent.color }}
                style={{
                  flexShrink: 0,
                  width: 200,
                  scrollSnapAlign: "start",
                  background: "var(--lp-bg-elevated)",
                  border: "0.5px solid var(--lp-border-default)",
                  borderRadius: 12,
                  padding: "20px",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
              >
                <div>
                  {tool.badgeType === "live" ? (
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase" as const,
                        color: "#0D1321",
                        background: "var(--lp-amber)",
                        borderRadius: 999,
                        padding: "3px 10px",
                      }}
                    >
                      {tool.badge}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase" as const,
                        color: accent.color,
                        background: accent.soft,
                        border: `0.5px solid ${accent.color}55`,
                        borderRadius: 999,
                        padding: "3px 10px",
                      }}
                    >
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--lp-text-primary)",
                    margin: 0,
                    lineHeight: 1.3,
                    letterSpacing: "0.02em",
                  }}
                >
                  {tool.name}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 12,
                    color: "var(--lp-text-secondary)",
                    margin: 0,
                    lineHeight: 1.6,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {tool.desc}
                </p>
              </motion.a>
            );
          })}
        </div>
      </div>

      <style>{`
        .tools-strip::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
