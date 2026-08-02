"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/marketing/Footer";

export default function CTAFinalSection() {
  return (
    <>
      <section
        style={{
          background: "var(--lp-bg-surface)",
          backgroundImage: "var(--lp-blueprint-texture)",
          backgroundSize: "var(--lp-blueprint-size)",
          padding: "160px 24px",
          borderTop: "0.5px solid var(--lp-border-default)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Glow effect in background */}
        <div 
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(255,176,32,0.08) 0%, transparent 60%)",
            pointerEvents: "none"
          }}
        />

        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            style={{
              fontFamily: "var(--font-unbounded)",
              fontWeight: 900,
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "var(--lp-text-primary)",
              margin: "0 0 48px",
            }}
          >
            Siap untuk
            <br />
            compile?
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link
              href="/signup"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 16,
                fontWeight: 700,
                background: "var(--lp-amber)",
                color: "#0D1321",
                padding: "20px 40px",
                borderRadius: 999,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 8px 32px rgba(255,176,32,0.25)"
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 40px rgba(255,176,32,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(255,176,32,0.25)";
              }}
            >
              Mulai gratis sekarang
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
