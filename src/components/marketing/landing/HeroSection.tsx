"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import HeroBlueprintBackground from "./HeroBlueprintBackground";

// ── Live Stats Badge ─────────────────────────────────────────

interface StatsData {
  documentsGenerated: number;
  activeUsers: number;
}

function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  const start = () => {
    if (started.current || target === 0) return;
    started.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  };

  return { count, start };
}

function LiveStatsBadge() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState(false);
  const docsCounter = useCountUp(stats?.documentsGenerated ?? 0);
  const usersCounter = useCountUp(stats?.activeUsers ?? 0);
  const triggered = useRef(false);

  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then((data: StatsData) => setStats(data))
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (stats && !triggered.current) {
      triggered.current = true;
      docsCounter.start();
      usersCounter.start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  if (error || !stats) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 11,
        fontWeight: 400,
        color: "var(--lp-sky)",
        letterSpacing: "0.02em",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--lp-sky)",
          animation: "lpPulse 2s ease-in-out infinite",
        }}
      />
      {docsCounter.count.toLocaleString("id-ID")} dokumen di-generate ·{" "}
      {usersCounter.count.toLocaleString("id-ID")} developer aktif
    </div>
  );
}

// ── Terminal Panel ────────────────────────────────────────────

const TERMINAL_SEQUENCES = [
  {
    prompt: "$ arrobuild generate --idea \"marketplace secondhand lokal\"",
    files: [
      "→ Generating prd.md ...",
      "→ Generating architecture.md ...",
      "→ Generating plan-task.md ...",
    ],
    summary: "✓ 3 dokumen selesai dalam 12 detik. Siap di-paste ke proyek.",
  },
  {
    prompt: "$ arrobuild generate --idea \"SaaS management freelancer\"",
    files: [
      "→ Generating prd.md ...",
      "→ Generating architecture.md ...",
      "→ Generating design-system.md ...",
      "→ Generating agent-rules.md ...",
    ],
    summary: "✓ 4 dokumen selesai. Export siap untuk Cursor + Claude Code.",
  },
  {
    prompt: "$ arrobuild generate --idea \"mobile app budgeting\"",
    files: [
      "→ Generating prd.md ...",
      "→ Generating architecture.md ...",
      "→ Generating plan-task.md ...",
      "→ Generating design-system.md ...",
      "→ Generating adaptive-document.md ...",
    ],
    summary: "✓ 5 dokumen selesai. Semua FEAT-ID sinkron antar file.",
  },
];

function TerminalPanel() {
  const [seqIdx, setSeqIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "files" | "summary" | "pause">("typing");
  const [typedChars, setTypedChars] = useState(0);
  const [visibleFiles, setVisibleFiles] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const seq = TERMINAL_SEQUENCES[seqIdx];

  // Reset the animation state when the sequence changes (adjust state during
  // render instead of in an effect to avoid cascading renders).
  const [prevSeqIdx, setPrevSeqIdx] = useState(seqIdx);
  if (seqIdx !== prevSeqIdx) {
    setPrevSeqIdx(seqIdx);
    setTypedChars(0);
    setVisibleFiles(0);
    setShowSummary(false);
    setPhase("typing");
  }

  // Typing phase
  useEffect(() => {
    if (phase !== "typing") return;
    if (typedChars >= seq.prompt.length) {
      setTimeout(() => setPhase("files"), 400);
      return;
    }
    const t = setTimeout(() => setTypedChars((c) => c + 1), 28);
    return () => clearTimeout(t);
  }, [phase, typedChars, seq.prompt.length]);

  // Files phase
  useEffect(() => {
    if (phase !== "files") return;
    if (visibleFiles >= seq.files.length) {
      setTimeout(() => {
        setShowSummary(true);
        setPhase("summary");
      }, 300);
      return;
    }
    const t = setTimeout(() => setVisibleFiles((v) => v + 1), 320);
    return () => clearTimeout(t);
  }, [phase, visibleFiles, seq.files.length]);

  // Summary phase → loop
  useEffect(() => {
    if (phase !== "summary") return;
    const t = setTimeout(() => {
      setSeqIdx((i) => (i + 1) % TERMINAL_SEQUENCES.length);
    }, 3200);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div
      style={{
        background: "var(--lp-bg-blueprint)",
        border: "1.5px solid var(--lp-amber)",
        borderRadius: "0 12px 12px 12px",
        clipPath: "polygon(12px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12px)",
        padding: "20px 24px",
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 13,
        lineHeight: 1.7,
        backgroundImage: "var(--lp-blueprint-texture)",
        backgroundSize: "var(--lp-blueprint-size)",
        minHeight: 200,
        width: "100%",
        maxWidth: 580,
      }}
    >
      {/* Terminal bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444", opacity: 0.7 }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFB020", opacity: 0.7 }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34D399", opacity: 0.7 }} />
        <span style={{ marginLeft: 8, color: "var(--lp-text-tertiary)", fontSize: 11, letterSpacing: "0.06em" }}>
          arrobuild — terminal
        </span>
      </div>

      {/* Prompt */}
      <div style={{ color: "var(--lp-sky)" }}>
        {seq.prompt.slice(0, typedChars)}
        {phase === "typing" && (
          <span style={{ borderRight: "2px solid var(--lp-amber)", marginLeft: 1, animation: "lpBlink 0.7s step-end infinite" }} />
        )}
      </div>

      {/* Files */}
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        {seq.files.slice(0, visibleFiles).map((f, i) => (
          <div key={i} style={{ color: "var(--lp-text-secondary)" }}>
            {f} <span style={{ color: "#34D399" }}>✓</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {showSummary && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "rgba(52,211,153,0.06)",
            border: "0.5px solid rgba(52,211,153,0.2)",
            borderRadius: 6,
            color: "#34D399",
            fontSize: 12,
          }}
        >
          {seq.summary}
        </div>
      )}
    </div>
  );
}

// ── Reveal animation variants ─────────────────────────────────

const revealVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

// ── Hero Section ──────────────────────────────────────────────

export default function HeroSection() {
  return (
    <section
      style={{
        background: "var(--lp-bg-base)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <HeroBlueprintBackground />

      {/* Subtle radial vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 60% at 50% 10%, rgba(46,142,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div 
        className="hero-grid"
        style={{ 
          maxWidth: 1440, 
          width: "100%", 
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 64,
          alignItems: "center"
        }}
      >
        {/* Left Column */}
        <div className="hero-left-col">
          {/* Badge status */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}
            className="hero-badge-container"
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
                background: "rgba(255,176,32,0.1)",
                border: "1px solid rgba(255,176,32,0.35)",
                borderRadius: 999,
                padding: "6px 14px",
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
            <LiveStatsBadge />
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-unbounded)",
              fontWeight: 900,
              fontSize: "clamp(32px, 3.5vw, 48px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "var(--lp-text-primary)",
              margin: "0 0 24px",
            }}
            className="hero-h1"
          >
            Coding tanpa plan itu<br />
            compile tanpa{" "}
            <span style={{ color: "var(--lp-amber)" }}>syntax check.</span>
          </motion.h1>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--lp-text-secondary)",
              maxWidth: 540,
              margin: "0 0 36px",
              letterSpacing: "-0.005em",
            }}
            className="hero-body"
          >
            ArroBuild ubah ide kamu jadi PRD, arsitektur, dan dokumen fondasi lain. Sebelum AI agent sempat ngasal karena nggak punya konteks.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "flex-start",
              flexWrap: "wrap",
            }}
            className="hero-cta"
          >
            <Link
              href="/signup"
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
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--lp-amber-dim)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--lp-amber)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
            >
              ▸ Mulai compile
            </Link>
            <a
              href="#how-it-works"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 13,
                fontWeight: 500,
                background: "transparent",
                color: "var(--lp-blue)",
                padding: "13px 26px",
                borderRadius: 8,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid rgba(46,142,255,0.4)",
                transition: "border-color 0.2s, color 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--lp-blue)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(46,142,255,0.4)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
            >
              Lihat cara kerja
            </a>
          </motion.div>
        </div>

        {/* Right Column (Terminal) */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
        >
          <TerminalPanel />
        </motion.div>
      </div>

      <style>{`
        @keyframes lpPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes lpBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
            gap: 48px !important;
          }
          .hero-left-col {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-badge-container {
            align-items: center !important;
          }
          .hero-body {
            margin: 0 auto 32px !important;
          }
          .hero-cta {
            justify-content: center !important;
          }
        }
        @media (max-width: 768px) {
          .hero-h1 {
            white-space: normal !important;
            font-size: 34px !important;
          }
        }
      `}</style>
    </section>
  );
}
