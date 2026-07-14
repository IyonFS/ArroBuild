"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/**
 * Full document constellation — 6 core + 8 optional.
 * Wide blueprint wiring (viewBox 1400×640), nearly full viewport on desktop.
 */

type Tier = "base" | "core" | "prime";
type Waypoint = { x: number; y: number };

type DocNode = {
  id: string;
  label: string;
  fileName: string;
  blurb: string;
  x: number;
  y: number;
  r: number;
  tier: Tier;
  kind: "core" | "optional";
  /** Orthogonal waypoints toward hub (before final rim connect) */
  cable: Waypoint[];
};

const HUB = { x: 700, y: 320, r: 64 };

const TIER_META: Record<Tier, { color: string; label: string }> = {
  base: { color: "rgba(240,243,250,0.55)", label: "Base" },
  core: { color: "#38BDF8", label: "Core" },
  prime: { color: "#FFB020", label: "Prime" },
};

const DOC_NODES: DocNode[] = [
  // ── Core (larger, closer) ───────────────────────────────────
  {
    id: "prd",
    label: "PRD",
    fileName: "prd.md",
    blurb: "Product requirements, FEAT-ID, dan user stories — kontrak yang disepakati semua tim.",
    x: 420, y: 95, r: 38, tier: "base", kind: "core",
    cable: [
      { x: 420, y: 155 },
      { x: 520, y: 155 },
      { x: 580, y: 220 },
      { x: 640, y: 260 },
    ],
  },
  {
    id: "architecture",
    label: "Architecture",
    fileName: "architecture.md",
    blurb: "Blueprint teknis: skema DB, struktur folder, dan kontrak API untuk AI agent.",
    x: 700, y: 70, r: 40, tier: "base", kind: "core",
    cable: [
      { x: 700, y: 130 },
      { x: 700, y: 180 },
      { x: 700, y: 230 },
    ],
  },
  {
    id: "plan-task",
    label: "Plan-Task",
    fileName: "plan-task.md",
    blurb: "Fase pengerjaan, urutan fitur, dan estimasi — build pondasi dulu, baru yang fancy.",
    x: 980, y: 95, r: 38, tier: "base", kind: "core",
    cable: [
      { x: 980, y: 155 },
      { x: 880, y: 155 },
      { x: 820, y: 220 },
      { x: 760, y: 260 },
    ],
  },
  {
    id: "design-system",
    label: "Design\nSystem",
    fileName: "design-system.md",
    blurb: "Warna, tipografi, dan komponen dasar supaya UI konsisten dari hari pertama.",
    x: 1080, y: 300, r: 40, tier: "core", kind: "core",
    cable: [
      { x: 1020, y: 300 },
      { x: 940, y: 300 },
      { x: 860, y: 300 },
      { x: 790, y: 310 },
    ],
  },
  {
    id: "agent-rules",
    label: "Agent\nRules",
    fileName: "agent-rules.md",
    blurb: "Instruksi coding untuk AI tool target — siap tempel ke .cursorrules atau CLAUDE.md.",
    x: 320, y: 300, r: 40, tier: "core", kind: "core",
    cable: [
      { x: 380, y: 300 },
      { x: 460, y: 300 },
      { x: 540, y: 300 },
      { x: 610, y: 310 },
    ],
  },
  {
    id: "adaptive-document",
    label: "Adaptive\nDoc",
    fileName: "adaptive-document.md",
    blurb: "Strategi khusus per tipe produk (SaaS, marketplace, mobile, dll.) — eksklusif Prime.",
    x: 700, y: 560, r: 40, tier: "prime", kind: "core",
    cable: [
      { x: 700, y: 500 },
      { x: 700, y: 440 },
      { x: 700, y: 400 },
    ],
  },

  // ── Optional — left rail ────────────────────────────────────
  {
    id: "competitive-analysis",
    label: "Competitive",
    fileName: "competitive-analysis.md",
    blurb: "Kompetitor, diferensiasi, dan positioning produk yang tajam.",
    x: 110, y: 100, r: 30, tier: "core", kind: "optional",
    cable: [
      { x: 170, y: 100 },
      { x: 250, y: 100 },
      { x: 320, y: 140 },
      { x: 380, y: 180 },
      { x: 480, y: 240 },
      { x: 580, y: 280 },
    ],
  },
  {
    id: "cost-infrastructure",
    label: "Cost &\nInfra",
    fileName: "cost-infrastructure.md",
    blurb: "Estimasi biaya hosting dan komponen infrastruktur sebelum traffic naik.",
    x: 80, y: 250, r: 30, tier: "core", kind: "optional",
    cable: [
      { x: 140, y: 250 },
      { x: 220, y: 250 },
      { x: 280, y: 270 },
      { x: 360, y: 290 },
      { x: 480, y: 310 },
      { x: 600, y: 318 },
    ],
  },
  {
    id: "onboarding-email",
    label: "Onboarding",
    fileName: "onboarding-email.md",
    blurb: "Alur onboarding dan email transaksional untuk aktivasi pengguna pertama.",
    x: 80, y: 400, r: 30, tier: "core", kind: "optional",
    cable: [
      { x: 140, y: 400 },
      { x: 220, y: 400 },
      { x: 300, y: 380 },
      { x: 400, y: 350 },
      { x: 520, y: 340 },
      { x: 600, y: 330 },
    ],
  },
  {
    id: "compliance-legal",
    label: "Compliance",
    fileName: "compliance-legal.md",
    blurb: "Outline privasi, ToS, dan kepatuhan pembayaran agar produk siap regulasi.",
    x: 150, y: 540, r: 30, tier: "prime", kind: "optional",
    cable: [
      { x: 210, y: 540 },
      { x: 320, y: 540 },
      { x: 420, y: 500 },
      { x: 520, y: 440 },
      { x: 600, y: 380 },
      { x: 650, y: 350 },
    ],
  },

  // ── Optional — right rail ───────────────────────────────────
  {
    id: "analytics-metrics",
    label: "Analytics",
    fileName: "analytics-metrics.md",
    blurb: "Event tracking, funnel, dan dashboard metrik supaya tim baca data yang sama.",
    x: 1290, y: 100, r: 30, tier: "core", kind: "optional",
    cable: [
      { x: 1230, y: 100 },
      { x: 1150, y: 100 },
      { x: 1080, y: 140 },
      { x: 1020, y: 180 },
      { x: 920, y: 240 },
      { x: 820, y: 280 },
    ],
  },
  {
    id: "testing-qa",
    label: "Testing\n& QA",
    fileName: "testing-qa.md",
    blurb: "Strategi test dan skenario prioritas sebelum fitur kritikal go-live.",
    x: 1320, y: 250, r: 30, tier: "core", kind: "optional",
    cable: [
      { x: 1260, y: 250 },
      { x: 1180, y: 250 },
      { x: 1120, y: 270 },
      { x: 1040, y: 290 },
      { x: 920, y: 310 },
      { x: 800, y: 318 },
    ],
  },
  {
    id: "database-deep-dive",
    label: "Database",
    fileName: "database-deep-dive.md",
    blurb: "Indexing, integritas data, dan growth plan — murah sekarang, mahal kalau ditunda.",
    x: 1320, y: 400, r: 30, tier: "prime", kind: "optional",
    cable: [
      { x: 1260, y: 400 },
      { x: 1180, y: 400 },
      { x: 1100, y: 380 },
      { x: 1000, y: 350 },
      { x: 880, y: 340 },
      { x: 800, y: 330 },
    ],
  },
  {
    id: "security-launch",
    label: "Security",
    fileName: "security-launch.md",
    blurb: "Checklist keamanan dan pre-launch supaya tidak miss hal kritikal sebelum rilis.",
    x: 1250, y: 540, r: 30, tier: "prime", kind: "optional",
    cable: [
      { x: 1190, y: 540 },
      { x: 1080, y: 540 },
      { x: 980, y: 500 },
      { x: 880, y: 440 },
      { x: 800, y: 380 },
      { x: 750, y: 350 },
    ],
  },
];

/** Secondary sync links between related docs */
const CROSS_LINKS: { from: string; to: string; mid: Waypoint[] }[] = [
  { from: "prd", to: "architecture", mid: [{ x: 520, y: 48 }, { x: 620, y: 48 }] },
  { from: "architecture", to: "plan-task", mid: [{ x: 780, y: 48 }, { x: 880, y: 48 }] },
  { from: "prd", to: "agent-rules", mid: [{ x: 340, y: 160 }, { x: 300, y: 220 }] },
  { from: "plan-task", to: "design-system", mid: [{ x: 1060, y: 160 }, { x: 1100, y: 220 }] },
  { from: "design-system", to: "adaptive-document", mid: [{ x: 1000, y: 420 }, { x: 860, y: 500 }] },
  { from: "agent-rules", to: "adaptive-document", mid: [{ x: 400, y: 420 }, { x: 540, y: 500 }] },
  { from: "architecture", to: "database-deep-dive", mid: [{ x: 900, y: 90 }, { x: 1200, y: 200 }] },
  { from: "testing-qa", to: "security-launch", mid: [{ x: 1360, y: 340 }, { x: 1340, y: 460 }] },
  { from: "competitive-analysis", to: "compliance-legal", mid: [{ x: 50, y: 200 }, { x: 40, y: 420 }] },
  { from: "cost-infrastructure", to: "onboarding-email", mid: [{ x: 40, y: 310 }] },
];

const HUB_BLURB =
  "Sumber kebenaran tunggal. Semua dokumen merujuk FEAT-ID yang sama lewat Knowledge Model — tanpa drift antar file.";

function polylinePath(points: Waypoint[]): string {
  if (!points.length) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function smoothPath(points: Waypoint[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const c = points[i];
    const n = points[i + 1];
    d += ` Q ${c.x} ${c.y} ${(c.x + n.x) / 2} ${(c.y + n.y) / 2}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y}`;
  return d;
}

function cableToHub(node: DocNode): Waypoint[] {
  const last = node.cable[node.cable.length - 1] ?? { x: node.x, y: node.y };
  const dx = HUB.x - last.x;
  const dy = HUB.y - last.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const startDx = last.x - node.x || (HUB.x - node.x);
  const startDy = last.y - node.y || (HUB.y - node.y);
  // Prefer cable direction for rim exit; fall back to hub vector
  const exitDx = node.cable.length ? startDx : HUB.x - node.x;
  const exitDy = node.cable.length ? startDy : HUB.y - node.y;
  const exitDist = Math.sqrt(exitDx * exitDx + exitDy * exitDy) || 1;
  const start = {
    x: node.x + (exitDx / exitDist) * node.r,
    y: node.y + (exitDy / exitDist) * node.r,
  };
  const end = {
    x: HUB.x - (dx / dist) * HUB.r,
    y: HUB.y - (dy / dist) * HUB.r,
  };
  return [start, ...node.cable, end];
}

function nodeFill(tier: Tier, kind: "core" | "optional") {
  if (tier === "prime") return "rgba(30,25,10,0.94)";
  if (tier === "core") return "rgba(20,40,65,0.94)";
  return kind === "optional" ? "rgba(24,32,52,0.94)" : "rgba(30,40,70,0.94)";
}

function KnowledgeDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [inViewTriggered, setInViewTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (inView && !inViewTriggered) {
      const t = setTimeout(() => setInViewTriggered(true), 60);
      return () => clearTimeout(t);
    }
  }, [inView, inViewTriggered]);

  const activeNode = hovered && hovered !== "hub"
    ? DOC_NODES.find((n) => n.id === hovered) ?? null
    : null;

  return (
    <div ref={ref} className="km-diagram-wrap">
      <svg
        viewBox="20 10 1360 620"
        width="100%"
        height="auto"
        className="km-diagram-svg"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Knowledge Model menghubungkan 6 dokumen inti dan 8 modul opsional"
      >
        <defs>
          <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="edgeGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {DOC_NODES.map((n) => (
            <linearGradient
              key={n.id}
              id={`grad-${n.id}`}
              gradientUnits="userSpaceOnUse"
              x1={n.x}
              y1={n.y}
              x2={HUB.x}
              y2={HUB.y}
            >
              <stop offset="0%" stopColor={TIER_META[n.tier].color} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFB020" stopOpacity="0.5" />
            </linearGradient>
          ))}
        </defs>

        {/* Blueprint frame + guides */}
        <rect
          x={48}
          y={24}
          width={1304}
          height={592}
          rx={6}
          fill="none"
          stroke="rgba(240,243,250,0.04)"
          strokeWidth="1"
        />
        <line x1={48} y1={320} x2={1352} y2={320} stroke="rgba(240,243,250,0.028)" strokeDasharray="4 12" />
        <line x1={700} y1={24} x2={700} y2={616} stroke="rgba(240,243,250,0.028)" strokeDasharray="4 12" />
        {/* Side rail labels */}
        <text x={90} y={42} className="km-rail-label" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 9, fill: "rgba(240,243,250,0.22)", letterSpacing: "0.12em" }}>
          OPSIONAL · KIRI
        </text>
        <text x={1220} y={42} textAnchor="end" className="km-rail-label" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 9, fill: "rgba(240,243,250,0.22)", letterSpacing: "0.12em" }}>
          OPSIONAL · KANAN
        </text>
        <text x={700} y={48} textAnchor="middle" className="km-rail-label" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 9, fill: "rgba(240,243,250,0.22)", letterSpacing: "0.12em" }}>
          DOKUMEN INTI
        </text>

        {/* Cross-links */}
        {CROSS_LINKS.map((link, i) => {
          const a = DOC_NODES.find((n) => n.id === link.from);
          const b = DOC_NODES.find((n) => n.id === link.to);
          if (!a || !b) return null;
          const related =
            hovered === link.from || hovered === link.to || hovered === "hub";
          const pts = [{ x: a.x, y: a.y }, ...link.mid, { x: b.x, y: b.y }];
          return (
            <g key={`x-${i}`}>
              <path
                d={smoothPath(pts)}
                fill="none"
                stroke={related ? "rgba(56,189,248,0.4)" : "rgba(56,189,248,0.09)"}
                strokeWidth={related ? 1.15 : 0.75}
                strokeDasharray="3 5"
                style={{ transition: "stroke 0.2s" }}
              />
              {link.mid.map((m, mi) => (
                <circle
                  key={mi}
                  cx={m.x}
                  cy={m.y}
                  r={1.8}
                  fill={related ? "rgba(56,189,248,0.55)" : "rgba(56,189,248,0.12)"}
                />
              ))}
            </g>
          );
        })}

        {/* Primary cables */}
        {DOC_NODES.map((n, i) => {
          const isActive = hovered === n.id || hovered === "hub";
          const isDimmed = hovered !== null && !isActive;
          const points = cableToHub(n);
          const path = polylinePath(points);

          return (
            <g
              key={n.id}
              filter={isActive ? "url(#edgeGlow)" : undefined}
              opacity={isDimmed ? 0.18 : 1}
              style={{ transition: "opacity 0.2s" }}
            >
              <motion.path
                d={path}
                fill="none"
                stroke={isActive ? `url(#grad-${n.id})` : "rgba(46,142,255,0.1)"}
                strokeWidth={n.kind === "core" ? (isActive ? 4.5 : 3.2) : isActive ? 3.2 : 2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inViewTriggered ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.85, ease: "easeInOut", delay: 0.12 + i * 0.045 }}
              />
              <motion.path
                d={path}
                fill="none"
                stroke={isActive ? `url(#grad-${n.id})` : "rgba(46,142,255,0.32)"}
                strokeWidth={isActive ? 1.6 : n.kind === "optional" ? 0.9 : 1.15}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={n.kind === "optional" ? "5 4" : i % 3 === 0 ? "8 5" : undefined}
                initial={{ pathLength: 0 }}
                animate={inViewTriggered ? { pathLength: 1 } : {}}
                transition={{ duration: 0.85, ease: "easeInOut", delay: 0.16 + i * 0.045 }}
              />
              {isActive && (
                <motion.path
                  d={path}
                  fill="none"
                  stroke={TIER_META[n.tier].color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="4 14"
                  opacity={0.75}
                  animate={{ strokeDashoffset: [-18, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
              {n.cable.map((j, ji) => (
                <g key={ji}>
                  <circle
                    cx={j.x}
                    cy={j.y}
                    r={isActive ? 3.5 : n.kind === "optional" ? 2.2 : 2.8}
                    fill="rgba(13,19,33,0.95)"
                    stroke={isActive ? TIER_META[n.tier].color : "rgba(56,189,248,0.4)"}
                    strokeWidth="1"
                  />
                  <circle
                    cx={j.x}
                    cy={j.y}
                    r={1.1}
                    fill={isActive ? TIER_META[n.tier].color : "rgba(240,243,250,0.3)"}
                  />
                </g>
              ))}
            </g>
          );
        })}

        {/* Hub */}
        <motion.g
          onHoverStart={() => setHovered("hub")}
          onHoverEnd={() => setHovered(null)}
          style={{ cursor: "pointer" }}
          initial={{ opacity: 0, scale: 0.55 }}
          animate={inViewTriggered ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.circle
            cx={HUB.x}
            cy={HUB.y}
            r={HUB.r + 16}
            fill="none"
            stroke="rgba(255,176,32,0.12)"
            strokeWidth="1"
            animate={{ r: [HUB.r + 14, HUB.r + 26, HUB.r + 14], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle
            cx={HUB.x}
            cy={HUB.y}
            r={HUB.r + 7}
            fill="none"
            stroke="rgba(255,176,32,0.2)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <circle
            cx={HUB.x}
            cy={HUB.y}
            r={HUB.r}
            fill="rgba(20,28,52,0.98)"
            stroke={hovered === "hub" ? "#FFB020" : "rgba(255,176,32,0.55)"}
            strokeWidth={hovered === "hub" ? 2 : 1.5}
            filter="url(#hubGlow)"
            style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
          />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={deg}
                cx={HUB.x + Math.cos(rad) * HUB.r}
                cy={HUB.y + Math.sin(rad) * HUB.r}
                r={2}
                fill="rgba(255,176,32,0.5)"
              />
            );
          })}
          <text
            x={HUB.x}
            y={HUB.y - 12}
            textAnchor="middle"
            className="km-hub-text"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 13,
              fontWeight: 700,
              fill: "#FFB020",
              letterSpacing: "0.04em",
            }}
          >
            Knowledge
          </text>
          <text
            x={HUB.x}
            y={HUB.y + 5}
            textAnchor="middle"
            className="km-hub-text"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 13,
              fontWeight: 700,
              fill: "#FFB020",
              letterSpacing: "0.04em",
            }}
          >
            Model
          </text>
          <text
            x={HUB.x}
            y={HUB.y + 22}
            textAnchor="middle"
            className="km-hub-sub"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10,
              fill: "rgba(240,243,250,0.4)",
              letterSpacing: "0.08em",
            }}
          >
            .json · 14 docs
          </text>
        </motion.g>

        {/* Nodes */}
        {DOC_NODES.map((n, i) => {
          const isActive = hovered === n.id;
          const isDimmed = hovered !== null && hovered !== n.id && hovered !== "hub";
          const color = TIER_META[n.tier].color;
          const border =
            n.tier === "prime"
              ? "#FFB020"
              : n.tier === "core"
                ? "#38BDF8"
                : "rgba(240,243,250,0.32)";

          return (
            <motion.g
              key={n.id}
              onHoverStart={() => setHovered(n.id)}
              onHoverEnd={() => setHovered(null)}
              style={{ cursor: "pointer" }}
              initial={{ opacity: 0, scale: 0.45 }}
              animate={
                inViewTriggered
                  ? { opacity: isDimmed ? 0.28 : 1, scale: isActive ? 1.08 : 1 }
                  : {}
              }
              transition={{
                opacity: { duration: 0.2 },
                scale: { type: "spring", stiffness: 320, damping: 22 },
                default: { duration: 0.35, delay: 0.2 + i * 0.035, ease: [0.16, 1, 0.3, 1] },
              }}
            >
              {n.kind === "optional" && (
                <rect
                  x={n.x - n.r - 4}
                  y={n.y - n.r - 4}
                  width={(n.r + 4) * 2}
                  height={(n.r + 4) * 2}
                  rx={6}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.8"
                  opacity={isActive ? 0.45 : 0.12}
                  strokeDasharray="3 3"
                />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r + (n.kind === "core" ? 5 : 3)}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity={isActive ? 0.5 : 0.1}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={nodeFill(n.tier, n.kind)}
                stroke={isActive ? border : border.replace("0.32", "0.2")}
                strokeWidth={isActive ? 1.6 : 0.8}
              />
              {n.label.split("\n").map((line, li) => {
                const lines = n.label.split("\n").length;
                const offsetY = lines === 2 ? (li === 0 ? -5 : 7) : 1;
                return (
                  <text
                    key={li}
                    x={n.x}
                    y={n.y + offsetY}
                    textAnchor="middle"
                    className={n.kind === "core" ? "km-node-text" : "km-node-text-sm"}
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: n.kind === "core" ? 11 : 9,
                      fontWeight: isActive ? 700 : 500,
                      fill: isActive ? color : "var(--lp-text-secondary)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {line}
                  </text>
                );
              })}
              <circle
                cx={n.x + n.r - 5}
                cy={n.y - n.r + 5}
                r={n.kind === "core" ? 3.5 : 2.8}
                fill={color}
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Hover detail card */}
      <AnimatePresence>
        {(activeNode || hovered === "hub") && (
          <motion.div
            key={hovered}
            className="km-tooltip"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderColor:
                hovered === "hub"
                  ? "rgba(255,176,32,0.45)"
                  : TIER_META[activeNode!.tier].color,
            }}
          >
            <div className="km-tooltip-top">
              <span className="km-tooltip-title">
                {hovered === "hub"
                  ? "Knowledge Model"
                  : activeNode!.label.replace("\n", " ")}
              </span>
              <span
                className="km-tooltip-badge"
                style={{
                  color:
                    hovered === "hub"
                      ? "#FFB020"
                      : TIER_META[activeNode!.tier].color,
                  borderColor:
                    hovered === "hub"
                      ? "rgba(255,176,32,0.35)"
                      : `${TIER_META[activeNode!.tier].color}55`,
                  background:
                    hovered === "hub"
                      ? "rgba(255,176,32,0.1)"
                      : `${TIER_META[activeNode!.tier].color}18`,
                }}
              >
                {hovered === "hub"
                  ? "HUB"
                  : activeNode!.kind === "optional"
                    ? `OPSIONAL · ${TIER_META[activeNode!.tier].label}`
                    : `INTI · ${TIER_META[activeNode!.tier].label}`}
              </span>
            </div>
            <div className="km-tooltip-file">
              {hovered === "hub" ? "knowledge-model.json" : activeNode!.fileName}
            </div>
            <p className="km-tooltip-blurb">
              {hovered === "hub" ? HUB_BLURB : activeNode!.blurb}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KnowledgeModelSection() {
  return (
    <section className="km-section">
      <div className="km-section-inner">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.3 }}
          className="km-legend"
        >
          {[
            { key: "base" as const, label: "Base" },
            { key: "core" as const, label: "Core" },
            { key: "prime" as const, label: "Prime" },
          ].map((item) => (
            <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: TIER_META[item.key].color,
                }}
              />
              <span className="km-legend-label">{item.label}</span>
            </div>
          ))}
          <div className="km-legend-sep" aria-hidden />
          <span className="km-legend-meta">6 inti · 8 opsional</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="km-title"
        >
          Satu ide. Empat belas dokumen yang saling tahu satu sama lain.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="km-desc"
        >
          FEAT-ID lahir begitu kamu tulis fitur pertama. Enam file inti plus delapan modul opsional merujuk ID yang sama — tanpa drift antar dokumen.
        </motion.p>

        <motion.div
          className="km-hint-desktop"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          hover node untuk detail ↓
        </motion.div>

        <KnowledgeDiagram />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="km-caption"
        >
          Base: 3 file inti · Core: 5 inti + modul opsional tertentu · Prime: semua 14 dokumen.
        </motion.p>
      </div>

      <style>{`
        .km-section {
          background: var(--lp-bg-blueprint);
          background-image: var(--lp-blueprint-texture);
          background-size: var(--lp-blueprint-size);
          padding: 72px 16px 88px;
          overflow: hidden;
        }

        .km-section-inner {
          max-width: 1380px;
          margin: 0 auto;
        }

        .km-legend {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .km-legend-label {
          font-family: var(--font-jetbrains-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--lp-text-tertiary);
        }

        .km-legend-sep {
          width: 1px;
          height: 12px;
          background: rgba(240,243,250,0.12);
        }

        .km-legend-meta {
          font-family: var(--font-jetbrains-mono);
          font-size: 11px;
          color: var(--lp-text-tertiary);
          letter-spacing: 0.04em;
        }

        .km-title {
          font-family: var(--font-unbounded);
          font-weight: 800;
          font-size: clamp(22px, 2.8vw, 32px);
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: var(--lp-text-primary);
          text-align: center;
          margin: 0 auto 12px;
          max-width: 720px;
        }

        .km-desc {
          font-family: var(--font-jetbrains-mono);
          font-size: 14px;
          line-height: 1.7;
          color: var(--lp-text-secondary);
          text-align: center;
          max-width: 520px;
          margin: 0 auto 14px;
          letter-spacing: -0.005em;
        }

        .km-hint-desktop {
          text-align: center;
          font-family: var(--font-jetbrains-mono);
          font-size: 10px;
          color: var(--lp-text-tertiary);
          letter-spacing: 0.06em;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .km-caption {
          margin-top: 16px;
          font-family: var(--font-jetbrains-mono);
          font-size: 12px;
          color: var(--lp-text-tertiary);
          text-align: center;
          letter-spacing: 0.02em;
        }

        .km-diagram-wrap {
          position: relative;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding-bottom: 112px;
        }

        .km-diagram-svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .km-tooltip {
          position: absolute;
          left: 50%;
          bottom: 8px;
          transform: translateX(-50%);
          width: min(440px, calc(100% - 24px));
          padding: 14px 16px;
          border-radius: 10px;
          background: rgba(31, 42, 68, 0.96);
          border: 1px solid rgba(56,189,248,0.35);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
          pointer-events: none;
          backdrop-filter: blur(8px);
          z-index: 2;
        }

        .km-tooltip-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }

        .km-tooltip-title {
          font-family: var(--font-jetbrains-mono);
          font-size: 13px;
          font-weight: 700;
          color: var(--lp-text-primary);
          letter-spacing: 0.01em;
        }

        .km-tooltip-badge {
          flex-shrink: 0;
          font-family: var(--font-jetbrains-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid;
        }

        .km-tooltip-file {
          font-family: var(--font-jetbrains-mono);
          font-size: 11px;
          color: var(--lp-sky, #38BDF8);
          margin-bottom: 8px;
          letter-spacing: 0.02em;
        }

        .km-tooltip-blurb {
          margin: 0;
          font-family: var(--font-jetbrains-mono);
          font-size: 12px;
          line-height: 1.55;
          color: var(--lp-text-secondary);
        }

        @media (min-width: 1100px) {
          .km-section {
            padding-left: 24px;
            padding-right: 24px;
          }
        }

        @media (max-width: 900px) {
          .km-section {
            padding: 56px 10px 72px;
          }

          .km-tooltip {
            bottom: 4px;
            width: min(360px, calc(100% - 16px));
            padding: 12px 14px;
          }

          .km-tooltip-blurb {
            font-size: 11px;
          }
        }

        @media (max-width: 640px) {
          .km-hint-desktop {
            display: none;
          }

          .km-rail-label {
            display: none;
          }

          .km-diagram-svg .km-hub-text {
            font-size: 11px !important;
          }

          .km-diagram-svg .km-node-text {
            font-size: 9px !important;
          }

          .km-diagram-svg .km-node-text-sm {
            font-size: 7.5px !important;
          }

          .km-caption {
            font-size: 11px;
            padding: 0 8px;
          }

          .km-title {
            font-size: clamp(20px, 5.5vw, 26px);
          }
        }
      `}</style>
    </section>
  );
}
