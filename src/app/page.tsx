"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import PricingSection from "@/components/marketing/PricingSection";
import { SparklesIcon } from "@/components/marketing/icons";

/* ============================================================
   ArroBuild Landing Page v2.0
   Design System: Lime + Orange · Unbounded + JetBrains Mono
   Dark mode default · No gradients, no decorative blur
   ============================================================ */

// ─── Inline SVG Icons ───────────────────────────────────────

function ArrowRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function WandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="M17.8 11.8 19 13" /><path d="M15 9h0" /><path d="M17.8 6.2 19 5" /><path d="m3 21 9-9" /><path d="M12.2 6.2 11 5" />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" /><path d="M18 8H6a1 1 0 0 0-1 1v4a5 5 0 0 0 10 0V9a1 1 0 0 0-1-1z" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// ─── Hooks ───────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fallback = setTimeout(() => setIsVisible(true), 500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, isVisible };
}

function useCounter(end: number, isVisible: boolean, duration = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, isVisible, duration]);

  return count;
}

// ─── Shared animation wrapper ────────────────────────────────

function FadeIn({
  index = 0,
  delay = 0,
  className = "",
  children,
}: {
  index?: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const { ref, isVisible } = useInView(0.08);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: "opacity 500ms ease-out, transform 500ms ease-out",
        transitionDelay: `${index * 80 + delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Eyebrow helper ──────────────────────────────────────────

function Eyebrow({
  children,
  orange = false,
}: {
  children: ReactNode;
  orange?: boolean;
}) {
  return (
    <p
      style={{
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: orange ? "var(--color-orange)" : "var(--color-lime)",
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      — {children}
    </p>
  );
}

// ─── Section divider ─────────────────────────────────────────

function Divider() {
  return (
    <div
      style={{
        height: "0.5px",
        background:
          "linear-gradient(90deg, transparent, var(--color-border-default), transparent)",
        width: "60%",
        margin: "0 auto",
      }}
    />
  );
}

/* ============================================================
   SECTIONS
   ============================================================ */

// 1. HERO ─────────────────────────────────────────────────────

function TerminalPreview() {
  const [visibleLines, setVisibleLines] = useState(0);
  const { ref, isVisible } = useInView(0.2);

  const lines = [
    { text: "$ arrobuild generate", dim: true },
    { text: '> "Mau bikin SaaS untuk manajemen freelance..."', lime: true },
    { text: "", dim: false, lime: false },
    { text: "⠋  Generating prd.md ................. done ✓", lime: true },
    { text: "⠋  Generating context.md ............. done ✓", lime: true },
    { text: "⠋  Generating plan.md ................ done ✓", lime: true },
    { text: "⠋  Generating design-system.md ....... done ✓", lime: true },
    { text: "⠋  Generating agents.md .............. done ✓", lime: true },
    { text: "", dim: false, lime: false },
    { text: "✓  5 files · 1m 08s", primary: true },
    { text: "✓  arrobuild-freelance-saas.zip ready", lime: true },
  ];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= lines.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 280);
    return () => clearInterval(interval);
  }, [isVisible, lines.length]);

  return (
    <div
      ref={ref}
      style={{
        background: "#0D0D0D",
        border: "0.5px solid var(--color-border-default)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Terminal chrome */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "12px 16px",
          borderBottom: "0.5px solid var(--color-border-default)",
        }}
      >
        {["#F87171", "#FBBF24", "#22C55E"].map((c) => (
          <div
            key={c}
            style={{ width: 10, height: 10, borderRadius: "50%", background: c }}
          />
        ))}
        <span
          style={{
            marginLeft: 8,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            color: "var(--color-text-tertiary)",
          }}
        >
          terminal — arrobuild
        </span>
      </div>

      {/* Terminal body */}
      <div
        style={{
          padding: "16px 20px",
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 12,
          lineHeight: 1.7,
          minHeight: 260,
          overflowX: "auto",
        }}
      >
        {lines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="animate-fade-in"
            style={{
              color: line.lime
                ? "var(--color-lime)"
                : line.primary
                ? "var(--color-text-primary)"
                : "var(--color-text-tertiary)",
              animationDuration: "0.25s",
            }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
        {visibleLines < lines.length && (
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 14,
              background: "var(--color-lime)",
            }}
            className="animate-cursor-blink"
          />
        )}
      </div>
    </div>
  );
}

function HeroSection() {
  const { ref, isVisible } = useInView(0.05);

  return (
    <section
      id="hero"
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: 60,
      }}
    >
      {/* Grid bg */}
      <div
        className="grid-bg"
        style={{ position: "absolute", inset: 0, opacity: 1 }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
          paddingTop: 60,
          paddingBottom: 80,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
            transition: "opacity 600ms ease",
            opacity: isVisible ? 1 : 0,
          }}
        >
          <span
            className="badge badge-soft-lime"
            style={{ fontSize: 10, gap: 6 }}
          >
            <SparklesIcon />
            Beta · Gratis · Tanpa login
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif",
            fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: "var(--color-text-primary)",
            maxWidth: 820,
            margin: "0 auto 24px",
            transition: "opacity 600ms ease, transform 600ms ease",
            transitionDelay: "100ms",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          Satu tempat untuk{" "}
          <span style={{ color: "var(--color-lime)" }}>belajar</span>,{" "}
          <span style={{ color: "var(--color-lime)" }}>planning</span>, dan{" "}
          <span style={{ color: "var(--color-lime)" }}>build</span> dengan AI
          agent.
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "clamp(13px, 1.5vw, 15px)",
            fontWeight: 300,
            lineHeight: 1.75,
            color: "var(--color-text-secondary)",
            maxWidth: 560,
            margin: "0 auto 40px",
            transition: "opacity 600ms ease, transform 600ms ease",
            transitionDelay: "200ms",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          Learn Hub gratis + doc generator + export ke tools favorit kamu.
          Dibuat untuk developer yang build dengan AI.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            transition: "opacity 600ms ease, transform 600ms ease",
            transitionDelay: "300ms",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <a
            href="/generate"
            className="btn btn-primary btn-lg"
            id="hero-cta-generate"
            style={{ gap: 8 }}
          >
            <WandIcon />
            Mulai generate
            <ArrowRightIcon />
          </a>
          <a
            href="/learn"
            className="btn btn-secondary btn-lg"
            id="hero-cta-learn"
          >
            Mulai belajar →
          </a>
        </div>

        {/* Terminal */}
        <div
          style={{
            marginTop: 64,
            maxWidth: 680,
            margin: "64px auto 0",
            transition: "opacity 700ms ease, transform 700ms ease",
            transitionDelay: "400ms",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <TerminalPreview />
        </div>
      </div>
    </section>
  );
}

// 2. THREE PILLARS ────────────────────────────────────────────

function PillarSection() {
  const { ref, isVisible } = useInView();

  const pillars = [
    {
      num: "①",
      label: "Learn",
      title: "Belajar agent engineering",
      desc: "Learning path gratis dan terstruktur — dari vibe coding 101 sampai multi-agent workflow. Semua gratis, tanpa paywall.",
      cta: "Lihat learning path →",
      href: "/learn",
      accent: "var(--color-lime)",
      icon: <BookIcon />,
    },
    {
      num: "②",
      label: "Build",
      title: "Generate doc fondasi proyek",
      desc: "Ubah ide jadi bundle PRD, context, plan, design system & agents. Framework-aware, siap paste ke AI coding agent.",
      cta: "Mulai generate →",
      href: "/generate",
      accent: "var(--color-lime)",
      icon: <WandIcon />,
    },
    {
      num: "③",
      label: "Integrate",
      title: "Export ke tools favorit kamu",
      desc: "Output siap pakai untuk Cursor (.cursorrules), Claude Code (CLAUDE.md), Windsurf, dan lainnya. Tanpa modifikasi manual.",
      cta: "Lihat integrasi →",
      href: "/integrations",
      accent: "var(--color-orange)",
      icon: <PlugIcon />,
    },
  ];

  return (
    <section
      id="pillars"
      style={{ padding: "96px 0", position: "relative" }}
    >
      <Divider />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          paddingTop: 80,
        }}
      >
        <div ref={ref} style={{ textAlign: "center", marginBottom: 56 }}>
          <Eyebrow>Ekosistem</Eyebrow>
          <h2
            className="text-h2"
            style={{
              maxWidth: 500,
              margin: "0 auto 16px",
              transition: "opacity 500ms ease, transform 500ms ease",
              transitionDelay: "100ms",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Tiga pilar ekosistem ArroBuild
          </h2>
          <p
            className="text-body-lg"
            style={{
              maxWidth: 480,
              margin: "0 auto",
              transition: "opacity 500ms ease, transform 500ms ease",
              transitionDelay: "180ms",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Belajar konsep, lalu langsung praktek generate, lalu export ke
            tools nyata kamu.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {pillars.map((p, i) => (
            <FadeIn key={p.label} index={i} delay={100}>
              <div
                style={{
                  background: "var(--color-bg-surface)",
                  border: "0.5px solid var(--color-border-default)",
                  borderTop: `2.5px solid ${p.accent}`,
                  borderRadius: "0 0 14px 14px",
                  padding: "24px 28px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 150ms ease-out",
                }}
              >
                {/* Icon + label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--color-bg-elevated)",
                      border: "0.5px solid var(--color-border-default)",
                      color: p.accent,
                    }}
                  >
                    {p.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: p.accent,
                    }}
                  >
                    {p.num} {p.label}
                  </span>
                </div>

                <h3 className="text-h3" style={{ marginBottom: 10 }}>
                  {p.title}
                </h3>
                <p className="text-body" style={{ flex: 1, marginBottom: 24 }}>
                  {p.desc}
                </p>

                <a
                  href={p.href}
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: p.accent,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "gap 150ms ease",
                  }}
                >
                  {p.cta}
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// 3. SAMPLE OUTPUT ────────────────────────────────────────────

const sampleOutputs: Record<
  string,
  { label: string; meta: string; code: string }
> = {
  "prd.md": {
    label: "prd.md",
    meta: "Generated with: Claude Sonnet 4 · Framework: Next.js · Type: SaaS",
    code: `# PRD — Freelance Manager SaaS

## Overview
Platform manajemen freelance untuk developer Indonesia.
Target: solo developer & small agency.

## Core Features
- **Dashboard proyek** — status, deadline, billing
- **Klien management** — kontak, riwayat proyek
- **Invoice generator** — export PDF, share link
- **Time tracking** — per-task, billable hours

## User Stories
- Sebagai freelancer, saya ingin melihat semua proyek
  aktif dalam satu dashboard.
- Sebagai freelancer, saya ingin generate invoice
  dari time tracking secara otomatis.

## Success Metrics
- Time-to-first-invoice: < 10 menit
- Invoice paid rate: > 85%`,
  },
  "context.md": {
    label: "context.md",
    meta: "Generated with: Gemini 2.5 Pro · Framework: Next.js · Stack: Supabase",
    code: `# Context — Freelance Manager

## Stack
- Frontend: Next.js 15 App Router + TypeScript
- Database: Supabase (PostgreSQL + Auth + Storage)
- Styling: Tailwind CSS + shadcn/ui
- Deploy: Vercel

## Architecture Decisions
- Gunakan Server Components secara default
- Client Components hanya untuk interaktivitas
- Row Level Security di Supabase untuk semua tabel

## Current State
- [ ] Auth flow (login, signup, OAuth)
- [ ] Dashboard layout
- [ ] Project CRUD
- [ ] Invoice generation

## AI Agent Rules
Selalu referensikan file ini sebelum mulai coding.
Jangan buat komponen baru jika sudah ada di shadcn.`,
  },
  "design-system.md": {
    label: "design-system.md",
    meta: "Generated with: Claude Sonnet 4 · Style: Minimal · Primary: Violet",
    code: `# Design System — Freelance Manager

## Brand Colors
- Primary: #7C3AED (violet)
- Surface: #0F0F0F
- Border: rgba(255,255,255,0.08)

## Typography
- Display: Cal Sans, 900, -0.03em
- Body: Inter, 400, 1.6 line-height
- Code: JetBrains Mono, 400

## Components
### Button
\`\`\`
background: #7C3AED
color: #ffffff
padding: 10px 20px
border-radius: 8px
\`\`\`

### Card
\`\`\`
background: #111111
border: 0.5px solid rgba(255,255,255,0.08)
border-radius: 12px
\`\`\``,
  },
  "agents.md": {
    label: "agents.md",
    meta: "Generated with: Claude Sonnet 4 · AI Tool: Cursor + Claude Code",
    code: `# AI Agent Roles — Freelance Manager

## PM Agent
Role: Product Manager
Scope: Prioritization, user stories, acceptance criteria
Prompt prefix: "Kamu adalah PM untuk proyek ini..."

## Architect Agent
Role: System Architect
Scope: Database schema, API design, folder structure
Constraint: Selalu gunakan stack yang ada di context.md

## UI Agent
Role: Frontend Developer
Scope: Komponen, layout, responsive design
Constraint: Gunakan shadcn/ui, jangan buat dari scratch

## Code Reviewer
Role: Senior Developer
Scope: Code review, security check, performance
Trigger: Sebelum setiap commit ke main`,
  },
};

function SampleOutputSection() {
  const { ref, isVisible } = useInView();
  const [activeTab, setActiveTab] =
    useState<keyof typeof sampleOutputs>("prd.md");

  const tabs = Object.keys(sampleOutputs) as (keyof typeof sampleOutputs)[];
  const current = sampleOutputs[activeTab];

  return (
    <section id="sample-output" style={{ padding: "0 0 96px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div ref={ref} style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>Sample output</Eyebrow>
          <h2
            className="text-h2"
            style={{
              maxWidth: 500,
              margin: "0 auto 14px",
              transition: "opacity 500ms ease, transform 500ms ease",
              transitionDelay: "100ms",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Lihat seperti apa output-nya
          </h2>
          <p
            className="text-body-lg"
            style={{
              maxWidth: 440,
              margin: "0 auto",
              transition: "opacity 500ms ease, transform 500ms ease",
              transitionDelay: "180ms",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Real output dari ArroBuild. Framework-aware, langsung siap paste ke
            project root.
          </p>
        </div>

        <FadeIn delay={200}>
          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              overflowX: "auto",
              paddingBottom: 4,
            }}
            className="scrollbar-none"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? "tab-pill active" : "tab-pill"}
                style={{ flexShrink: 0 }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div
            style={{
              background: "#0D0D0D",
              border: "0.5px solid var(--color-border-default)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* File header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: "0.5px solid var(--color-border-default)",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span style={{ color: "var(--color-lime)" }}>
                  <FileTextIcon />
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {current.label}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 10,
                  color: "var(--color-text-tertiary)",
                }}
              >
                {current.meta}
              </span>
            </div>

            {/* Code content */}
            <pre
              style={{
                margin: 0,
                padding: "20px 24px",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                lineHeight: 1.75,
                color: "var(--color-text-primary)",
                overflowX: "auto",
                maxHeight: 380,
                overflowY: "auto",
              }}
            >
              {current.code}
            </pre>
          </div>

          {/* CTA below */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 24,
            }}
          >
            <a
              href="/generate"
              className="btn btn-primary"
              id="sample-output-cta"
              style={{ gap: 8 }}
            >
              <WandIcon />
              Generate versimu sendiri
              <ArrowRightIcon />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// 4. SOCIAL PROOF ─────────────────────────────────────────────

function SocialProofSection() {
  const { ref, isVisible } = useInView();
  const projectCount = useCounter(347, isVisible, 2000);
  const devCount = useCounter(1200, isVisible, 2200);

  const testimonials = [
    {
      quote:
        "ArroBuild menghemat 3-4 jam setup awal per project. context.md-nya langsung jadi source of truth untuk semua sesi Cursor.",
      name: "Rizky A.",
      role: "Indie Hacker · Surabaya",
    },
    {
      quote:
        "PRD yang dihasilkan lebih terstruktur dari yang biasa saya tulis manual. Langsung pakai ke Claude Code tanpa edit.",
      name: "Sarah M.",
      role: "Solo Dev · Jakarta",
    },
    {
      quote:
        "Generate 5 file dalam 90 detik. Setup project jadi lebih cepat dan AI agent-nya lebih fokus karena punya context yang jelas.",
      name: "Budi P.",
      role: "Fullstack Dev · Bandung",
    },
  ];

  return (
    <section id="social-proof" style={{ padding: "0 0 96px" }}>
      <Divider />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 0",
        }}
      >
        {/* Counters */}
        <div ref={ref}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 32,
              marginBottom: 64,
              textAlign: "center",
            }}
          >
            {[
              { value: projectCount.toLocaleString(), label: "project foundations generated" },
              { value: devCount.toLocaleString() + "+", label: "developers joined" },
              { value: "5", label: "model AI tersedia" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  transition: "opacity 500ms ease, transform 500ms ease",
                  transitionDelay: `${i * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(16px)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    color: "var(--color-lime)",
                    lineHeight: 1.0,
                    marginBottom: 8,
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-body">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {testimonials.map((t, i) => (
            <FadeIn key={i} index={i} delay={100}>
              <div
                style={{
                  background: "var(--color-bg-surface)",
                  border: "0.5px solid var(--color-border-default)",
                  borderRadius: 14,
                  padding: "24px 28px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {/* Stars */}
                <div
                  style={{
                    display: "flex",
                    gap: 3,
                    color: "var(--color-lime)",
                  }}
                >
                  {Array.from({ length: 5 }).map((_, j) => (
                    <StarIcon key={j} />
                  ))}
                </div>
                <p
                  className="text-body"
                  style={{ lineHeight: 1.75, flex: 1 }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 11,
                      fontWeight: 400,
                      color: "var(--color-text-tertiary)",
                      marginTop: 2,
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// 5. HOW IT WORKS ─────────────────────────────────────────────

function HowItWorksSection() {
  const { ref, isVisible } = useInView();

  const steps = [
    {
      step: "01",
      title: "Describe",
      desc: 'Ceritakan ide produk kamu. Tipe produk, target user, fitur inti. Bisa 1 paragraf.',
      icon: <TerminalIcon />,
    },
    {
      step: "02",
      title: "Configure",
      desc: "Pilih framework, design style, dan AI coding tool target kamu.",
      icon: <WandIcon />,
    },
    {
      step: "03",
      title: "Generate",
      desc: "Pilih dokumen yang mau di-generate. Lihat progress real-time per file.",
      icon: <FileTextIcon />,
    },
    {
      step: "04",
      title: "Export",
      desc: "Download .zip dan langsung paste ke root project. Siap untuk Cursor, Claude Code, Windsurf.",
      icon: <DownloadIcon />,
    },
  ];

  return (
    <section
      id="how-it-works"
      style={{ padding: "0 0 96px", scrollMarginTop: 80 }}
    >
      <Divider />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 0",
        }}
      >
        <div ref={ref} style={{ textAlign: "center", marginBottom: 56 }}>
          <Eyebrow>Cara kerja</Eyebrow>
          <h2
            className="text-h2"
            style={{
              margin: "0 auto 14px",
              transition: "opacity 500ms ease, transform 500ms ease",
              transitionDelay: "100ms",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Empat langkah, under 2 menit.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {steps.map((s, i) => (
            <FadeIn key={s.step} index={i} delay={80}>
              <div
                style={{
                  background: "var(--color-bg-surface)",
                  border: "0.5px solid var(--color-border-default)",
                  borderRadius: 14,
                  padding: "24px",
                  height: "100%",
                }}
              >
                {/* Step number */}
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-lime)",
                    marginBottom: 12,
                  }}
                >
                  {s.step}
                </div>
                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-bg-elevated)",
                    border: "0.5px solid var(--color-border-default)",
                    color: "var(--color-lime)",
                    marginBottom: 16,
                  }}
                >
                  {s.icon}
                </div>
                <h3 className="text-h3" style={{ marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p className="text-body">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Highlight note */}
        <div
          style={{
            marginTop: 32,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              fontWeight: 400,
              color: "var(--color-text-tertiary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "var(--color-lime)" }}>
              <CheckIcon />
            </span>
            Output siap paste ke Cursor, Claude Code, Windsurf — tanpa modifikasi
          </p>
        </div>
      </div>
    </section>
  );
}

// 6. LEARN HUB TEASER ─────────────────────────────────────────

function LearnHubTeaserSection() {
  const { ref, isVisible } = useInView();

  const paths = [
    {
      tag: "Pemula",
      title: "Vibe Coding 101",
      desc: "Setup AI agent pertama, cara buat PRD yang baik, deploy project pertama. 5 lesson.",
      lessons: 5,
      time: "~2 jam",
    },
    {
      tag: "Core",
      title: "PRD & Documentation",
      desc: "Kenapa dokumentasi penting, anatomi PRD, context.md sebagai master reference.",
      lessons: 5,
      time: "~3 jam",
    },
    {
      tag: "Lanjut",
      title: "Agent Engineering",
      desc: "Multi-agent workflow, prompt engineering, context window management.",
      lessons: 5,
      time: "~4 jam",
    },
  ];

  return (
    <section
      id="learn"
      style={{ padding: "0 0 96px", scrollMarginTop: 80 }}
    >
      <Divider />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 0",
        }}
      >
        <div
          ref={ref}
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 48,
          }}
        >
          <div>
            <Eyebrow orange>Learn Hub</Eyebrow>
            <h2
              className="text-h2"
              style={{
                maxWidth: 440,
                transition: "opacity 500ms ease, transform 500ms ease",
                transitionDelay: "100ms",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(12px)",
              }}
            >
              Belajar agent engineering, gratis.
            </h2>
          </div>
          <a
            href="/learn"
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-orange)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
              transition: "opacity 500ms ease",
              transitionDelay: "200ms",
              opacity: isVisible ? 1 : 0,
            }}
          >
            Lihat semua learning path
            <ArrowRightIcon />
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {paths.map((p, i) => (
            <FadeIn key={p.title} index={i} delay={100}>
              <a
                href="/learn"
                style={{
                  display: "block",
                  background: "var(--color-bg-surface)",
                  border: "0.5px solid var(--color-border-default)",
                  borderTop: "2.5px solid var(--color-orange)",
                  borderRadius: "0 0 14px 14px",
                  padding: "24px 28px",
                  textDecoration: "none",
                  height: "100%",
                  transition: "border-color 150ms ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--color-border-strong)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--color-border-default)")
                }
              >
                {/* Tag */}
                <span
                  className="badge badge-orange"
                  style={{ marginBottom: 16, display: "inline-flex" }}
                >
                  {p.tag}
                </span>

                <h3 className="text-h3" style={{ marginBottom: 10 }}>
                  {p.title}
                </h3>
                <p className="text-body" style={{ marginBottom: 20 }}>
                  {p.desc}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 11,
                      fontWeight: 400,
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {p.lessons} lesson
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 11,
                      fontWeight: 400,
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {p.time}
                  </span>
                  <span
                    className="badge badge-ghost"
                    style={{ marginLeft: "auto" }}
                  >
                    Gratis
                  </span>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// 7. FREE TOOLS TEASER ────────────────────────────────────────

function ToolsTeaserSection() {
  const { ref, isVisible } = useInView();

  const tools = [
    {
      name: "Portfolio Generator",
      href: "/tools/portfolio",
      desc: "Generate README portfolio + context.md untuk AI dari nama, skills, dan projects kamu.",
      label: "New",
    },
    {
      name: "README Generator",
      href: "/tools/readme",
      desc: "README lengkap untuk open source project — badges, install steps, API docs.",
      label: "Coming soon",
      soon: true,
    },
    {
      name: "API Docs Generator",
      href: "/tools/api-docs",
      desc: "Dokumentasi API dari endpoint list kamu. Format Markdown, siap untuk AI agent.",
      label: "Coming soon",
      soon: true,
    },
  ];

  return (
    <section
      id="tools"
      style={{ padding: "0 0 96px", scrollMarginTop: 80 }}
    >
      <Divider />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 0",
        }}
      >
        <div ref={ref} style={{ marginBottom: 48 }}>
          <Eyebrow>Free tools</Eyebrow>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <h2
              className="text-h2"
              style={{
                maxWidth: 440,
                transition: "opacity 500ms ease, transform 500ms ease",
                transitionDelay: "100ms",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(12px)",
              }}
            >
              Tools spesifik. Gratis, tanpa login.
            </h2>
            <p
              className="text-body"
              style={{
                maxWidth: 300,
                transition: "opacity 500ms ease",
                transitionDelay: "180ms",
                opacity: isVisible ? 1 : 0,
              }}
            >
              Purpose-built tools untuk kebutuhan spesifik — bukan doc bundle generik.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {tools.map((t, i) => (
            <FadeIn key={t.name} index={i} delay={80}>
              <a
                href={t.soon ? undefined : t.href}
                style={{
                  display: "block",
                  background: "var(--color-bg-surface)",
                  border: "0.5px solid var(--color-border-default)",
                  borderRadius: 14,
                  padding: "24px 28px",
                  textDecoration: "none",
                  height: "100%",
                  opacity: t.soon ? 0.6 : 1,
                  cursor: t.soon ? "default" : "pointer",
                  transition: "border-color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!t.soon)
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--color-border-strong)";
                }}
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--color-border-default)")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <h3 className="text-h4">{t.name}</h3>
                  <span
                    className={t.soon ? "badge badge-ghost" : "badge badge-lime"}
                  >
                    {t.label}
                  </span>
                </div>
                <p className="text-body">{t.desc}</p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// 8. FAQ ──────────────────────────────────────────────────────

const faqs = [
  {
    q: "Apa itu ArroBuild?",
    a: "ArroBuild adalah ekosistem untuk developer yang build dengan AI agent — Learn Hub gratis untuk belajar agent engineering, generator dokumentasi proyek (PRD, context, plan, design system, agents), dan export ke tools favorit kamu (Cursor, Claude Code, Windsurf).",
  },
  {
    q: "Untuk siapa ArroBuild?",
    a: "Vibe coders, indie hackers, solo developer, dan siapa pun yang pakai AI coding agent. Kalau kamu langsung coding tanpa planning, dan hasilnya AI-mu sering keliru arah — ini untuk kamu.",
  },
  {
    q: "Learn Hub itu apa?",
    a: "Kumpulan learning path gratis dan terstruktur tentang vibe coding, PRD writing, agent engineering, dan integrasi tools. Semua gratis, tanpa login, tersedia di /learn.",
  },
  {
    q: "Berapa lama proses generate?",
    a: "PRD gratis selesai ~30 detik. Bundle lengkap (5 file) biasanya under 2 menit. Kamu bisa lihat progress real-time saat setiap file di-generate.",
  },
  {
    q: "Framework apa yang didukung?",
    a: "Next.js, Laravel, Django, Rails, dan FastAPI. Setiap preset menyesuaikan dokumentasi dengan konvensi dan ecosystem framework pilihan kamu.",
  },
  {
    q: "Model AI apa yang tersedia?",
    a: "Free: Gemini 2.5 Flash & DeepSeek V3. Paid: tambahan Gemini 2.5 Pro, GPT-4o, dan Claude Sonnet 4.",
  },
  {
    q: "Tools apa yang didukung untuk export?",
    a: "Cursor (via .cursorrules), Claude Code (via CLAUDE.md), Windsurf (via rules file). GitHub, Notion, dan Linear menyusul.",
  },
  {
    q: "Apakah gratis?",
    a: "Ya! Free tier: 1 project, 1 file PRD, tanpa login. Upgrade ke Starter (Rp 49K/bulan) untuk 5 file + semua model AI, atau Unlimited (Rp 199K/bulan) untuk 8 file.",
  },
];

function FAQSection() {
  const { ref, isVisible } = useInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      style={{ padding: "0 0 96px", scrollMarginTop: 80 }}
    >
      <Divider />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 0",
        }}
      >
        <div ref={ref} style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2
            className="text-h2"
            style={{
              transition: "opacity 500ms ease, transform 500ms ease",
              transitionDelay: "100ms",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Pertanyaan? Jawaban.
          </h2>
        </div>

        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <FadeIn key={i} index={i} delay={40}>
                <div
                  style={{
                    background: "var(--color-bg-surface)",
                    border: `0.5px solid ${isOpen ? "var(--color-border-strong)" : "var(--color-border-default)"}`,
                    borderRadius: 12,
                    overflow: "hidden",
                    transition: "border-color 150ms ease",
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                      padding: "18px 20px",
                      gap: 16,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    id={`faq-toggle-${i}`}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {faq.q}
                    </span>
                    <span
                      style={{
                        color: "var(--color-text-tertiary)",
                        flexShrink: 0,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 200ms ease",
                        display: "inline-flex",
                      }}
                    >
                      <ChevronDownIcon />
                    </span>
                  </button>
                  <div
                    style={{
                      maxHeight: isOpen ? 400 : 0,
                      overflow: "hidden",
                      transition: "max-height 200ms ease",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 13,
                        fontWeight: 300,
                        lineHeight: 1.75,
                        color: "var(--color-text-secondary)",
                        padding: "0 20px 18px",
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 9. CTA ──────────────────────────────────────────────────────

function CTASection() {
  const { ref, isVisible } = useInView();

  return (
    <section id="cta" style={{ padding: "0 0 96px" }}>
      <Divider />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 0",
        }}
      >
        <div
          ref={ref}
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-default)",
            borderTop: "2.5px solid var(--color-lime)",
            borderRadius: "0 0 20px 20px",
            padding: "clamp(40px, 6vw, 80px) clamp(24px, 5vw, 80px)",
            textAlign: "center",
            maxWidth: 720,
            margin: "80px auto 0",
            transition: "opacity 600ms ease, transform 600ms ease",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <Eyebrow>Mulai sekarang</Eyebrow>
          <h2 className="text-h2" style={{ marginBottom: 14 }}>
            Ready to build dengan rencana?
          </h2>
          <p
            className="text-body-lg"
            style={{ maxWidth: 400, margin: "0 auto 40px" }}
          >
            Generate PRD gratis sekarang, atau upgrade untuk bundle 5–8 file
            dengan model AI premium.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <a
              href="/generate"
              className="btn btn-primary btn-lg"
              id="cta-start-btn"
              style={{ gap: 8 }}
            >
              <SparklesIcon />
              Mulai generate gratis
              <ArrowRightIcon />
            </a>
            <a
              href="/learn"
              className="btn btn-secondary btn-lg"
              id="cta-learn-btn"
            >
              Mulai belajar →
            </a>
          </div>

          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              fontWeight: 400,
              color: "var(--color-text-tertiary)",
              marginTop: 24,
            }}
          >
            Free tier tanpa login · Pembayaran Midtrans segera hadir
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <PillarSection />
      <SampleOutputSection />
      <SocialProofSection />
      <HowItWorksSection />
      <LearnHubTeaserSection />
      <ToolsTeaserSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
