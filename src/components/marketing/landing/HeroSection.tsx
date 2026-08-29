"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import HeroBlueprintBackground from "./HeroBlueprintBackground";

// ── Live Stats Badge ─────────────────────────────────────────

function MinimalCommandInput() {
  const [typedChars, setTypedChars] = useState(0);
  const fullText = "arrobuild generate --idea \"SaaS management freelancer\"";
  
  useEffect(() => {
    const t = setTimeout(() => {
      if (typedChars < fullText.length) {
        setTypedChars(c => c + 1);
      } else {
        setTimeout(() => setTypedChars(0), 4000); // loop after 4s
      }
    }, 40);
    return () => clearTimeout(t);
  }, [typedChars, fullText.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        marginTop: 64,
        background: "rgba(15, 23, 42, 0.6)", // deep dark slate
        border: "1px solid rgba(240, 243, 250, 0.1)",
        borderRadius: 16,
        padding: "16px 24px",
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px rgba(56, 189, 248, 0.15)",
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 14,
        color: "var(--lp-text-primary)",
        position: "relative",
        maxWidth: "calc(100vw - 48px)"
      }}
    >
      {/* Subtle animated border glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          padding: 1,
          background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none"
        }}
      />
      
      {/* Scrollable container for text to prevent mobile overflow */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 2, paddingRight: 8, scrollbarWidth: "none", msOverflowStyle: "none" }} className="minimal-scrollbar">
        <span style={{ color: "var(--lp-sky)", fontWeight: 600 }}>~</span>
        <span>
          {fullText.slice(0, typedChars)}
          <span style={{ 
            display: "inline-block", 
            width: 8, 
            height: 15, 
            background: "var(--lp-amber)", 
            marginLeft: 6,
            transform: "translateY(2px)",
            animation: "lpBlink 1s step-end infinite" 
          }} />
        </span>
      </div>

      <div style={{
        padding: "4px 10px",
        background: "rgba(56, 189, 248, 0.1)",
        borderRadius: 6,
        fontSize: 11,
        color: "var(--lp-sky)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        flexShrink: 0
      }}>
        ENTER
      </div>
    </motion.div>
  );
}

// ── Hero Section ──────────────────────────────────────────────

export default function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section
      style={{
        background: "var(--lp-bg-base)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "160px 24px 100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <HeroBlueprintBackground />

      {/* Subtle radial vignette - refined for minimal look */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(46,142,255,0.08) 0%, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      <motion.div 
        style={{ 
          maxWidth: 900, 
          width: "100%", 
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          y: y1,
          opacity
        }}
      >
        {/* Badge status */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--lp-amber)",
              background: "rgba(255,176,32,0.05)",
              border: "1px solid rgba(255,176,32,0.25)",
              borderRadius: 999,
              padding: "6px 16px",
              backdropFilter: "blur(4px)"
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--lp-amber)",
                animation: "lpPulse 2s ease-in-out infinite",
              }}
            />
            Sistem aktif · Beta
          </div>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-unbounded)",
            fontWeight: 900,
            fontSize: "clamp(40px, 5.5vw, 72px)",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            color: "var(--lp-text-primary)",
            margin: "0 0 24px",
            textShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}
        >
          Bangun Software Cepat<br />
          Dengan Fondasi <span style={{ color: "var(--lp-amber)" }}>yang Jelas.</span>
        </motion.h1>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "clamp(16px, 1.5vw, 18px)",
            lineHeight: 1.6,
            color: "var(--lp-text-secondary)",
            maxWidth: 680,
            margin: "0 0 48px",
            letterSpacing: "-0.01em",
          }}
        >
          ArroBuild mengubah ide Anda menjadi dokumen spesifikasi teknis (PRD) dan arsitektur yang rapi. Memastikan AI Agent Anda menulis kode dengan akurat tanpa perlu menebak-nebak.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link
            href="/signup"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 14,
              fontWeight: 700,
              background: "var(--lp-amber)",
              color: "#0A0A0A",
              padding: "16px 32px",
              borderRadius: 12,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(255, 176, 32, 0.3)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => { 
              (e.currentTarget as HTMLAnchorElement).style.background = "#FFC44D"; 
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px) scale(1.02)"; 
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(255, 176, 32, 0.4)";
            }}
            onMouseLeave={(e) => { 
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--lp-amber)"; 
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0) scale(1)"; 
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 14px rgba(255, 176, 32, 0.3)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "translateX(1px) translateY(-1px)" }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span style={{ lineHeight: 1 }}>Mulai sekarang</span>
          </Link>
          <a
            href="#how-it-works"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 14,
              fontWeight: 600,
              background: "rgba(255, 255, 255, 0.05)",
              color: "#F0F3FA",
              padding: "16px 32px",
              borderRadius: 12,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => { 
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255, 255, 255, 0.09)"; 
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255, 255, 255, 0.25)"; 
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; 
            }}
            onMouseLeave={(e) => { 
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255, 255, 255, 0.05)"; 
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255, 255, 255, 0.12)"; 
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; 
            }}
          >
            <span style={{ lineHeight: 1 }}>Lihat cara kerja</span>
          </a>
        </motion.div>

        {/* Minimal visual replacement for fake terminal */}
        <MinimalCommandInput />

      </motion.div>

      <style>{`
        @keyframes lpPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes lpBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
