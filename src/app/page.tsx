"use client";

import { useState, useEffect, useRef } from "react";

/* ============================================================
   ArroBuild Landing Page
   Dark mode only · Green accent · Linear/Vercel inspired
   ============================================================ */

// ─── SVG Icons (Tabler-style, inline for zero-dependency) ────

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function RocketIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 13a8 8 0 0 1 7 7 6 6 0 0 0 3-5 9 9 0 0 0 6-8 3 3 0 0 0-3-3 9 9 0 0 0-8 6 6 6 0 0 0-5 3" />
      <path d="M7 14a6 6 0 0 0-3 6 6 6 0 0 0 6-3" />
      <circle cx="15" cy="9" r="1" />
    </svg>
  );
}

function FileTextIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function PaletteIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r="2" />
      <circle cx="17.5" cy="10.5" r="2" />
      <circle cx="8.5" cy="7.5" r="2" />
      <circle cx="6.5" cy="12.5" r="2" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function StackIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function ChecklistIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function MapIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function DownloadIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function BulbIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function RobotIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SparklesIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}

function GithubIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function TwitterIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ─── Intersection Observer Hook ──────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ─── Animated Counter Hook ──────────────────────────────────

function useCounter(end: number, isVisible: boolean, duration = 2000) {
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

// ─── Data ────────────────────────────────────────────────────

const generatedFiles = [
  {
    name: "context.md",
    desc: "Master project file — source of truth for every AI agent session",
    icon: FileTextIcon,
  },
  {
    name: "prd.md",
    desc: "Complete Product Requirements Document with user stories & metrics",
    icon: FileTextIcon,
  },
  {
    name: "design-system.md",
    desc: "Color palette, typography scale, spacing, component guidelines",
    icon: PaletteIcon,
  },
  {
    name: "tech-stack.md",
    desc: "Recommended stack with package recommendations & justifications",
    icon: StackIcon,
  },
  {
    name: "tasks.md",
    desc: "Phase-by-phase task breakdown ready to be executed",
    icon: ChecklistIcon,
  },
  {
    name: "mvp-roadmap.md",
    desc: "4-week actionable roadmap from setup to launch",
    icon: MapIcon,
  },
  {
    name: "agents.md",
    desc: "AI agent roles and responsibilities for your project",
    icon: RobotIcon,
  },
  {
    name: "cursor-rules.md",
    desc: "Coding conventions for your AI agent — Cursor, Claude Code, Windsurf",
    icon: ChecklistIcon,
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Describe your idea",
    desc: "Write 1–2 paragraphs about your product. That's it.",
    icon: BulbIcon,
  },
  {
    step: "02",
    title: "Choose your presets",
    desc: "Pick your framework, design style, and AI coding tool.",
    icon: StackIcon,
  },
  {
    step: "03",
    title: "Download your foundation",
    desc: "Get a .zip with 5–11 structured .md files ready for your project root.",
    icon: DownloadIcon,
  },
];

const faqs = [
  {
    q: "What is ArroBuild?",
    a: "ArroBuild is an AI-powered documentation generator that turns your product idea into structured project documentation — PRD, design system, tech stack, tasks, roadmap, and more. All before you write a single line of code.",
  },
  {
    q: "Who is this for?",
    a: "Vibe coders, indie hackers, solo developers, and anyone who uses AI coding agents like Cursor, Claude Code, or Windsurf. If you skip planning and jump straight into coding, this is for you.",
  },
  {
    q: "How long does generation take?",
    a: "Under 2 minutes for the full bundle. Each file is generated sequentially with real-time progress, so you can see results as they come in.",
  },
  {
    q: "What frameworks are supported?",
    a: "We support Next.js, Laravel, Django, Rails, and FastAPI. Each preset customizes the generated documentation to match your framework's conventions and ecosystem.",
  },
  {
    q: "Is it free?",
    a: "Yes! You get 1 free project with 5 core files. The Pro plan ($9/month) unlocks unlimited projects, 11+ files, and all design presets.",
  },
];

// ─── Components ──────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-200 ${
        scrolled
          ? "glass py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group" id="logo-link">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--green-500)" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#052e16"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </div>
          <span
            className="text-[17px] font-medium tracking-[-0.3px]"
            style={{ color: "var(--text-primary)" }}
          >
            ArroBuild
          </span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-[14px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-[14px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            How it works
          </a>
          <a
            href="#faq"
            className="text-[14px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            FAQ
          </a>
        </div>

        {/* CTA */}
        <a
          href="#cta"
          className="btn btn-primary btn-sm"
          id="nav-cta"
        >
          <SparklesIcon />
          Start generating
        </a>
      </div>
    </nav>
  );
}

function HeroSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
        }}
      />
      {/* Floating orbs */}
      <div
        className="absolute top-[15%] left-[10%] w-2 h-2 rounded-full animate-float opacity-40"
        style={{ backgroundColor: "var(--green-500)", animationDelay: "0s" }}
      />
      <div
        className="absolute top-[25%] right-[15%] w-1.5 h-1.5 rounded-full animate-float opacity-30"
        style={{ backgroundColor: "var(--green-text)", animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-[30%] left-[20%] w-1 h-1 rounded-full animate-float opacity-25"
        style={{ backgroundColor: "var(--green-500)", animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-[20%] right-[25%] w-2.5 h-2.5 rounded-full animate-float opacity-20"
        style={{ backgroundColor: "var(--green-text)", animationDelay: "1.5s" }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12 text-center">
        <div
          className={`transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="badge badge-success">
              <RocketIcon className="w-3.5 h-3.5" />
              Now in beta
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.1] tracking-[-1px] mb-6 max-w-3xl mx-auto"
            style={{ color: "#ffffff" }}
          >
            Generate everything{" "}
            <span className="gradient-text">before</span> your first line
            of code
          </h1>

          {/* Subheadline */}
          <p
            className="text-[clamp(1rem,2vw,1.125rem)] leading-relaxed max-w-xl mx-auto mb-10"
            style={{ color: "var(--text-secondary)" }}
          >
            Turn your product idea into structured project documentation — PRD,
            design system, tech stack, tasks & roadmap. All powered by AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#cta"
              className="btn btn-primary btn-lg animate-pulse-glow group"
              id="hero-cta-primary"
            >
              <SparklesIcon />
              Generate your foundation
              <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="btn btn-secondary btn-lg"
              id="hero-cta-secondary"
            >
              See how it works
            </a>
          </div>

          {/* Social proof */}
          <p
            className="mt-8 text-[13px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Free to start · No login required · Download in under 2 minutes
          </p>
        </div>

        {/* Terminal Preview */}
        <div
          className={`mt-16 max-w-2xl mx-auto transition-all duration-700 delay-300 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <TerminalPreview />
        </div>
      </div>
    </section>
  );
}

function TerminalPreview() {
  const [visibleLines, setVisibleLines] = useState(0);
  const { ref, isVisible } = useInView(0.3);

  const lines = [
    { text: "$ arrobuild generate --idea", color: "var(--text-tertiary)" },
    { text: '> "I want to build a study planner app for students..."', color: "var(--green-text)" },
    { text: "", color: "" },
    { text: "⠋ Generating context.md ............ done ✓", color: "var(--green-text)" },
    { text: "⠋ Generating prd.md ................ done ✓", color: "var(--green-text)" },
    { text: "⠋ Generating design-system.md ...... done ✓", color: "var(--green-text)" },
    { text: "⠋ Generating tech-stack.md ......... done ✓", color: "var(--green-text)" },
    { text: "⠋ Generating tasks.md .............. done ✓", color: "var(--green-text)" },
    { text: "", color: "" },
    { text: "✓ 5 files generated in 47s", color: "#ffffff" },
    { text: "✓ Exported to arrobuild-studyplanner.zip", color: "var(--green-text)" },
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
    }, 300);
    return () => clearInterval(interval);
  }, [isVisible, lines.length]);

  return (
    <div ref={ref} className="card glow-green rounded-xl overflow-hidden">
      {/* Terminal Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "var(--bg-border)" }}
      >
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f87171" }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fbbf24" }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22c55e" }} />
        <span
          className="ml-3 text-[12px] font-mono"
          style={{ color: "var(--text-tertiary)" }}
        >
          terminal — arrobuild
        </span>
      </div>

      {/* Terminal Body */}
      <div className="p-5 font-mono text-[13px] leading-6 min-h-[280px]">
        {lines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="animate-fade-in"
            style={{ color: line.color, animationDuration: "0.3s" }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
        {visibleLines < lines.length && (
          <span
            className="inline-block w-2 h-4 animate-pulse"
            style={{ backgroundColor: "var(--green-500)" }}
          />
        )}
      </div>
    </div>
  );
}

function ProblemSection() {
  const { ref, isVisible } = useInView();

  const problems = [
    { emoji: "🎯", title: "Scope creep", desc: "Features keep growing with no clear boundary" },
    { emoji: "🔀", title: "Inconsistency", desc: "AI generates different styles each session" },
    { emoji: "📄", title: "No source of truth", desc: "No docs for AI agents to reference" },
    { emoji: "🎨", title: "Design chaos", desc: "Colors and components made ad-hoc" },
    { emoji: "🏗️", title: "Technical debt", desc: "Architecture not planned from day one" },
    { emoji: "🧠", title: "Lost context", desc: "Re-explain everything each new session" },
  ];

  return (
    <section id="problem" className="py-24 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div ref={ref} className="text-center mb-16">
          <span
            className={`text-label block mb-3 transition-all duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            THE PROBLEM
          </span>
          <h2
            className={`text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.5px] mb-4 transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: "#ffffff" }}
          >
            You jump straight to code.{" "}
            <span style={{ color: "var(--text-tertiary)" }}>We get it.</span>
          </h2>
          <p
            className={`text-body-lg max-w-lg mx-auto transition-all duration-500 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            But without planning, your AI agent makes things up every session.
            Here&apos;s what happens:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((p, i) => {
            const { ref: cardRef, isVisible: cardVisible } = useInView(0.1);
            return (
              <div
                key={i}
                ref={cardRef}
                className={`card card-interactive transition-all duration-500 ${
                  cardVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="text-2xl mb-3 block">{p.emoji}</span>
                <h3 className="text-h3 mb-1">{p.title}</h3>
                <p className="text-body">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { ref, isVisible } = useInView();

  return (
    <section id="features" className="py-24 relative">
      {/* Subtle separator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--bg-border), transparent)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div ref={ref} className="text-center mb-16">
          <span
            className={`text-label block mb-3 transition-all duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            WHAT YOU GET
          </span>
          <h2
            className={`text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.5px] mb-4 transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: "#ffffff" }}
          >
            A complete project foundation.{" "}
            <span className="gradient-text">In minutes.</span>
          </h2>
          <p
            className={`text-body-lg max-w-lg mx-auto transition-all duration-500 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Every file is structured, framework-aware, and ready to paste into
            your project root.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {generatedFiles.map((file, i) => {
            const { ref: cardRef, isVisible: cardVisible } = useInView(0.1);
            const Icon = file.icon;
            return (
              <div
                key={i}
                ref={cardRef}
                className={`card card-interactive group cursor-default transition-all duration-500 ${
                  cardVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors duration-150"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--bg-border)",
                  }}
                >
                  <Icon className="w-5 h-5 text-[var(--green-text)] group-hover:scale-110 transition-transform" />
                </div>
                <h3
                  className="font-mono text-[13px] font-medium mb-2"
                  style={{ color: "var(--green-text)" }}
                >
                  {file.name}
                </h3>
                <p className="text-body text-[13px]">{file.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { ref, isVisible } = useInView();

  return (
    <section id="how-it-works" className="py-24 relative">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--bg-border), transparent)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div ref={ref} className="text-center mb-16">
          <span
            className={`text-label block mb-3 transition-all duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            HOW IT WORKS
          </span>
          <h2
            className={`text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.5px] mb-4 transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: "#ffffff" }}
          >
            Three steps. Under two minutes.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {howItWorks.map((step, i) => {
            const { ref: stepRef, isVisible: stepVisible } = useInView(0.1);
            const Icon = step.icon;
            return (
              <div
                key={i}
                ref={stepRef}
                className={`text-center transition-all duration-600 ${
                  stepVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Step number */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 glow-green-sm"
                  style={{
                    backgroundColor: "var(--green-900)",
                    border: "1px solid var(--green-muted)",
                  }}
                >
                  <Icon className="w-6 h-6 text-[var(--green-text)]" />
                </div>
                <div
                  className="text-[12px] font-mono font-medium mb-2"
                  style={{ color: "var(--green-text)" }}
                >
                  STEP {step.step}
                </div>
                <h3 className="text-h2 mb-2">{step.title}</h3>
                <p className="text-body max-w-[260px] mx-auto">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { ref, isVisible } = useInView();
  const filesCount = useCounter(10, isVisible);
  const secondsCount = useCounter(120, isVisible);
  const frameworksCount = useCounter(5, isVisible);

  return (
    <section id="stats" className="py-20 relative">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--bg-border), transparent)",
        }}
      />

      <div ref={ref} className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { value: `${filesCount}+`, label: "Generated files per project" },
            { value: `< ${secondsCount}s`, label: "Average generation time" },
            { value: `${frameworksCount}`, label: "Framework presets" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`text-center transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div
                className="text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-1px] mb-1 gradient-text"
              >
                {stat.value}
              </div>
              <div className="text-body">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PresetSection() {
  const { ref, isVisible } = useInView();
  const [activeTab, setActiveTab] = useState(0);

  const presets = [
    {
      category: "Framework",
      items: ["Next.js", "Laravel", "Django", "Rails", "FastAPI"],
    },
    {
      category: "Design Style",
      items: ["Linear", "Apple", "Stripe", "Notion", "Vercel"],
    },
    {
      category: "Agent Tool",
      items: ["Cursor", "Claude Code", "Windsurf", "Cline", "OpenCode"],
    },
  ];

  return (
    <section id="presets" className="py-24 relative">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--bg-border), transparent)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div ref={ref} className="text-center mb-12">
          <span
            className={`text-label block mb-3 transition-all duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            CUSTOMIZABLE
          </span>
          <h2
            className={`text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.5px] mb-4 transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: "#ffffff" }}
          >
            Tailored to your stack.{" "}
            <span className="gradient-text">Always.</span>
          </h2>
          <p
            className={`text-body-lg max-w-lg mx-auto transition-all duration-500 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Every generated document adapts to your chosen framework, design
            style, and AI coding tool.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                activeTab === i
                  ? "text-[var(--green-text)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
              style={{
                backgroundColor: activeTab === i ? "var(--green-900)" : "transparent",
                border: `1px solid ${activeTab === i ? "var(--green-muted)" : "var(--bg-border)"}`,
              }}
            >
              {p.category}
            </button>
          ))}
        </div>

        {/* Preset Grid */}
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {presets[activeTab].items.map((item, i) => (
            <div
              key={`${activeTab}-${i}`}
              className="card card-interactive px-6 py-4 flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${i * 60}ms`, animationDuration: "0.3s" }}
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center text-[14px] font-medium"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--bg-border)",
                  color: "var(--green-text)",
                }}
              >
                {item[0]}
              </div>
              <span className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { ref, isVisible } = useInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 relative">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--bg-border), transparent)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div ref={ref} className="text-center mb-16">
          <span
            className={`text-label block mb-3 transition-all duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            FAQ
          </span>
          <h2
            className={`text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.5px] transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: "#ffffff" }}
          >
            Questions? Answers.
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="card overflow-hidden transition-all duration-200"
                style={{
                  borderColor: isOpen ? "var(--green-muted)" : undefined,
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between text-left py-1 cursor-pointer"
                  id={`faq-toggle-${i}`}
                >
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {faq.q}
                  </span>
                  <ChevronDownIcon
                    className={`flex-shrink-0 ml-4 transition-transform duration-200 text-[var(--text-tertiary)] ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "max-h-[300px] mt-3" : "max-h-0"
                  }`}
                >
                  <p className="text-body leading-relaxed pb-1">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { ref, isVisible } = useInView();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section id="cta" className="py-24 relative">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--bg-border), transparent)",
        }}
      />

      <div ref={ref} className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div
          className={`card card-featured max-w-2xl mx-auto text-center py-12 px-8 relative overflow-hidden transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Background glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-6">
              <RocketIcon className="w-6 h-6 text-[var(--green-text)]" />
            </div>

            <h2
              className="text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.5px] mb-3"
              style={{ color: "#ffffff" }}
            >
              Ready to build with a plan?
            </h2>
            <p className="text-body-lg mb-8 max-w-md mx-auto">
              Get notified when ArroBuild launches. Be among the first to
              generate your project foundation.
            </p>

            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  id="cta-email-input"
                  className="flex-1 px-4 py-3 rounded-lg text-[14px] transition-all duration-150 focus:ring-2"
                  style={{
                    backgroundColor: "var(--bg-base)",
                    border: "1px solid var(--bg-border)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--green-500)";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(34,197,94,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--bg-border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-lg whitespace-nowrap"
                  id="cta-submit-btn"
                >
                  <SparklesIcon />
                  Join waitlist
                </button>
              </form>
            ) : (
              <div className="animate-fade-in">
                <div className="badge badge-success text-[14px] px-5 py-2">
                  ✓ You&apos;re on the list!
                </div>
                <p
                  className="mt-3 text-[13px]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  We&apos;ll send you an email when ArroBuild is ready.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="py-12 border-t"
      style={{ borderColor: "var(--bg-border)" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "var(--green-500)" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#052e16"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </div>
            <span
              className="text-[14px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              ArroBuild
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Follow us on X (Twitter)"
            >
              <TwitterIcon />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 hover:text-[var(--text-primary)]"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="View on GitHub"
            >
              <GithubIcon />
            </a>
          </div>

          {/* Copyright */}
          <p
            className="text-[12px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            © {new Date().getFullYear()} ArroBuild. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="flex-1">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <PresetSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
