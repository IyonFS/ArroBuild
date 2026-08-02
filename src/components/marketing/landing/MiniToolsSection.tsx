"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MINI_TOOL_LIST } from "@/lib/config/mini-tools";
import {
  PORTFOLIO_SHOWCASE,
  TOOL_SHOWCASE_META,
  tierLabel,
} from "@/components/tools/tool-meta";

const LANDING_TOOLS = [
  {
    name: PORTFOLIO_SHOWCASE.name,
    desc: PORTFOLIO_SHOWCASE.tagline,
    badge: "Gratis",
    href: PORTFOLIO_SHOWCASE.href,
  },
  ...MINI_TOOL_LIST.map((t) => {
    const meta = TOOL_SHOWCASE_META[t.id];
    return {
      name: t.name,
      desc: meta.tagline,
      badge: tierLabel(t.minTier),
      href: meta.href,
    };
  }),
];

export default function MiniToolsSection() {
  return (
    <section
      style={{
        background: "var(--lp-bg-base)",
        padding: "160px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Orbs & Grid */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "10%",
        width: 600,
        height: 600,
        background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 60%)",
        pointerEvents: "none",
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        right: "-5%",
        width: 800,
        height: 800,
        background: "radial-gradient(circle, rgba(255, 176, 32, 0.05) 0%, transparent 60%)",
        pointerEvents: "none",
        filter: "blur(60px)",
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundSize: "40px 40px",
        backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{
            fontFamily: "var(--font-unbounded)",
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 48px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--lp-text-primary)",
            margin: "0 0 16px",
            textAlign: "center",
          }}
        >
          Ekosistem Mini Tools.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 18,
            color: "var(--lp-text-secondary)",
            margin: "0 auto 64px",
            textAlign: "center",
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          Kumpulan utilitas cepat dan cerdas yang dirancang khusus untuk melengkapi alur kerja development Anda. Sekali klik, langsung beraksi tanpa beban.
        </motion.p>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", 
          gap: 32 
        }}>
          {LANDING_TOOLS.map((tool, i) => (
            <Link key={tool.name} href={tool.href} style={{ textDecoration: "none", outline: "none" }}>
              <motion.div
                className="group"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8 }}
                style={{
                  background: "rgba(10, 15, 25, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 24,
                  padding: "40px 32px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  backdropFilter: "blur(12px)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  const isAmber = tool.badge !== "Gratis";
                  const color = isAmber ? "255, 176, 32" : "56, 189, 248";
                  el.style.background = `rgba(${color}, 0.05)`;
                  el.style.borderColor = `rgba(${color}, 0.4)`;
                  el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(${color}, 0.1), 0 0 30px rgba(${color}, 0.2)`;
                  const arrow = el.querySelector('.tool-arrow') as SVGElement;
                  if (arrow) arrow.style.transform = "translateX(10px) scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = "rgba(10, 15, 25, 0.6)";
                  el.style.borderColor = "rgba(255, 255, 255, 0.06)";
                  el.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
                  const arrow = el.querySelector('.tool-arrow') as SVGElement;
                  if (arrow) arrow.style.transform = "translateX(0) scale(1)";
                }}
              >
                {/* Glow effect that tracks hover via CSS group-hover (simplified via generic style) */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(135deg, rgba(${tool.badge !== "Gratis" ? "255,176,32" : "56,189,248"}, 0.15) 0%, transparent 50%)`,
                  opacity: 0,
                  transition: "opacity 0.4s ease",
                  pointerEvents: "none",
                }}
                className="card-highlight"
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, position: "relative", zIndex: 2 }}>
                  <h3 style={{ 
                    fontFamily: "var(--font-unbounded)", 
                    fontSize: 24, 
                    fontWeight: 800, 
                    color: "var(--lp-text-primary)",
                    margin: 0,
                    letterSpacing: "-0.03em",
                    textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                  }}>
                    {tool.name}
                  </h3>
                  <div style={{ 
                    fontFamily: "var(--font-jetbrains-mono)", 
                    fontSize: 12, 
                    fontWeight: 700, 
                    color: tool.badge === "Gratis" ? "#0A0A0A" : "#0A0A0A", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.1em", 
                    background: tool.badge === "Gratis" ? "var(--lp-sky)" : "var(--lp-amber)", 
                    padding: "6px 14px", 
                    borderRadius: 999,
                    boxShadow: tool.badge === "Gratis" ? "0 4px 12px rgba(56,189,248,0.3)" : "0 4px 12px rgba(255,176,32,0.3)"
                  }}>
                    {tool.badge}
                  </div>
                </div>
                <p style={{ 
                  fontFamily: "var(--font-jetbrains-mono)", 
                  fontSize: 16, 
                  color: "var(--lp-text-secondary)",
                  lineHeight: 1.7,
                  margin: "0 0 40px",
                  flexGrow: 1,
                  position: "relative",
                  zIndex: 2
                }}>
                  {tool.desc}
                </p>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  color: tool.badge === "Gratis" ? "var(--lp-sky)" : "var(--lp-amber)", 
                  fontFamily: "var(--font-jetbrains-mono)", 
                  fontSize: 15, 
                  fontWeight: 700,
                  position: "relative",
                  zIndex: 2 
                }}>
                  <span>Jalankan Tool</span>
                  <svg className="tool-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 10, transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: 80, display: "flex", justifyContent: "center" }}
        >
          <Link
            href="/tools"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 15,
              fontWeight: 800,
              color: "#0A0A0A",
              background: "var(--lp-sky)",
              boxShadow: "0 4px 14px rgba(56, 189, 248, 0.4)",
              padding: "18px 40px",
              borderRadius: 999,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => { 
              (e.currentTarget as HTMLAnchorElement).style.background = "#5DD0FF"; 
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 30px rgba(56, 189, 248, 0.5)";
            }}
            onMouseLeave={(e) => { 
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--lp-sky)"; 
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 14px rgba(56, 189, 248, 0.4)";
            }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>Jelajahi Etalase Lengkap</span>
            <svg style={{ position: "relative", zIndex: 2 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </Link>
        </motion.div>
      </div>

      <style>{`
        .group:hover .card-highlight {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
}
