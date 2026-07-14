"use client";

import { useReducedMotion } from "framer-motion";

const NODES = [
  { cx: 12, cy: 18, r: 3.5, color: "#FFB020", delay: 0 },
  { cx: 88, cy: 12, r: 2.5, color: "#38BDF8", delay: 1.2 },
  { cx: 72, cy: 78, r: 2, color: "#9D4EDD", delay: 2.4 },
  { cx: 28, cy: 62, r: 2.2, color: "#38BDF8", delay: 0.8 },
  { cx: 55, cy: 42, r: 1.8, color: "#FFB020", delay: 1.8 },
] as const;

const EDGES: [number, number][] = [
  [0, 4],
  [4, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 2],
];

export default function HeroBlueprintBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="hero-blueprint-bg"
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Drifting blueprint grid */}
      <div className="hero-blueprint-grid" />

      {/* Slow aurora blobs */}
      <div className="hero-aurora hero-aurora--amber" />
      <div className="hero-aurora hero-aurora--sky" />

      {/* Node cluster field — right side */}
      <svg
        className="hero-node-field"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          right: "-8%",
          top: "8%",
          width: "min(58vw, 720px)",
          height: "min(58vw, 720px)",
          opacity: 0.55,
        }}
      >
        {EDGES.map(([a, b], i) => {
          const n1 = NODES[a]!;
          const n2 = NODES[b]!;
          return (
            <line
              key={i}
              x1={n1.cx}
              y1={n1.cy}
              x2={n2.cx}
              y2={n2.cy}
              stroke="rgba(56,189,248,0.22)"
              strokeWidth="0.35"
              className={reduceMotion ? undefined : "hero-edge-pulse"}
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          );
        })}
        {NODES.map((node, i) => (
          <g key={i}>
            {!reduceMotion && (
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r + 4}
                fill={node.color}
                opacity={0.12}
                className="hero-node-glow"
                style={{ animationDelay: `${node.delay}s` }}
              />
            )}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill={node.color}
              className={reduceMotion ? undefined : "hero-node-float"}
              style={{ animationDelay: `${node.delay}s` }}
            />
          </g>
        ))}
      </svg>

      {/* Secondary smaller cluster — left bottom */}
      <svg
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          left: "-6%",
          bottom: "6%",
          width: "min(36vw, 420px)",
          height: "min(36vw, 420px)",
          opacity: 0.28,
        }}
      >
        <line x1="20" y1="30" x2="70" y2="55" stroke="rgba(255,176,32,0.2)" strokeWidth="0.4" />
        <line x1="70" y1="55" x2="45" y2="80" stroke="rgba(255,176,32,0.15)" strokeWidth="0.4" />
        <circle cx="20" cy="30" r="2.5" fill="#FFB020" className={reduceMotion ? undefined : "hero-node-float"} />
        <circle cx="70" cy="55" r="2" fill="#38BDF8" className={reduceMotion ? undefined : "hero-node-float"} style={{ animationDelay: "1s" }} />
        <circle cx="45" cy="80" r="1.6" fill="#9D4EDD" className={reduceMotion ? undefined : "hero-node-float"} style={{ animationDelay: "2s" }} />
      </svg>

      {/* Scan line */}
      {!reduceMotion && <div className="hero-scanline" />}

      <style>{`
        .hero-blueprint-grid {
          position: absolute;
          inset: -32px;
          background-image: var(--lp-blueprint-texture);
          background-size: var(--lp-blueprint-size);
          opacity: 0.55;
          animation: heroGridDrift 48s linear infinite;
        }

        .hero-aurora {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
        }

        .hero-aurora--amber {
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(255,176,32,0.35) 0%, transparent 70%);
          top: 10%;
          left: 5%;
          animation: heroAuroraA 22s ease-in-out infinite alternate;
        }

        .hero-aurora--sky {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(56,189,248,0.28) 0%, transparent 70%);
          bottom: 5%;
          right: 10%;
          animation: heroAuroraB 28s ease-in-out infinite alternate;
        }

        .hero-node-float {
          animation: heroNodeFloat 6s ease-in-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .hero-node-glow {
          animation: heroNodeGlow 4s ease-in-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .hero-edge-pulse {
          animation: heroEdgePulse 5s ease-in-out infinite;
        }

        .hero-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(56,189,248,0.0) 20%,
            rgba(56,189,248,0.35) 50%,
            rgba(56,189,248,0.0) 80%,
            transparent 100%
          );
          opacity: 0.5;
          animation: heroScanline 8s ease-in-out infinite;
        }

        @keyframes heroGridDrift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(32px, 32px); }
        }

        @keyframes heroAuroraA {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 30px) scale(1.08); }
        }

        @keyframes heroAuroraB {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-50px, -20px) scale(1.12); }
        }

        @keyframes heroNodeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes heroNodeGlow {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.15); }
        }

        @keyframes heroEdgePulse {
          0%, 100% { stroke-opacity: 0.15; }
          50% { stroke-opacity: 0.45; }
        }

        @keyframes heroScanline {
          0% { top: -2%; opacity: 0; }
          8% { opacity: 0.45; }
          92% { opacity: 0.45; }
          100% { top: 102%; opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-blueprint-grid,
          .hero-aurora,
          .hero-scanline {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
