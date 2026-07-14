"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/marketing/Footer";

function NodeWatermark() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      style={{
        position: "absolute",
        bottom: 32,
        right: 32,
        opacity: 0.04,
        pointerEvents: "none",
      }}
    >
      <line x1="80" y1="24" x2="136" y2="120" stroke="rgba(240,243,250,0.8)" strokeWidth="3" />
      <line x1="80" y1="24" x2="24" y2="120" stroke="rgba(240,243,250,0.8)" strokeWidth="3" />
      <line x1="136" y1="120" x2="24" y2="120" stroke="rgba(240,243,250,0.8)" strokeWidth="3" />
      <circle cx="80" cy="24" r="18" fill="#FFB020" />
      <circle cx="136" cy="120" r="14" fill="#38BDF8" />
      <circle cx="24" cy="120" r="11" fill="#9D4EDD" />
    </svg>
  );
}

export default function CTAFinalSection() {
  return (
    <>
      <section
        style={{
          background: "var(--lp-bg-base)",
          padding: "96px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            background: "radial-gradient(ellipse, rgba(255,176,32,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "var(--lp-bg-blueprint)",
              backgroundImage: "var(--lp-blueprint-texture)",
              backgroundSize: "var(--lp-blueprint-size)",
              border: "1.5px solid var(--lp-amber)",
              borderRadius: "0 16px 16px 16px",
              clipPath: "polygon(12px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12px)",
              padding: "48px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <NodeWatermark />

            <h2
              style={{
                fontFamily: "var(--font-unbounded)",
                fontWeight: 800,
                fontSize: "clamp(24px, 3.5vw, 36px)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "var(--lp-text-primary)",
                margin: "0 0 32px",
              }}
            >
              Project kamu nunggu buat di-compile.
            </h2>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/dashboard"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  background: "var(--lp-amber)",
                  color: "#0D1321",
                  padding: "13px 26px",
                  borderRadius: 8,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "background 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--lp-amber-dim)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--lp-amber)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                Ke dashboard →
              </Link>
              <Link
                href="/generate"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 13,
                  fontWeight: 500,
                  background: "transparent",
                  color: "var(--lp-text-secondary)",
                  padding: "13px 26px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: "0.5px solid var(--lp-border-strong)",
                  transition: "border-color 0.2s, color 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--lp-amber)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--lp-amber)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--lp-border-strong)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--lp-text-secondary)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                Generate dokumen →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
