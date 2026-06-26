"use client";

import { useState } from "react";
import type { Presets, Framework, Design, AgentTool, Database, Deployment, ProductType } from "./types";

interface Props {
  value: Presets;
  productType: ProductType;
  onChange: (v: Presets) => void;
  onNext: () => void;
  onBack: () => void;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FRONTEND_FRAMEWORKS: { id: Framework; label: string; icon: string }[] = [
  { id: "nextjs", label: "Next.js", icon: "▲" },
  { id: "nuxt", label: "Nuxt.js", icon: "💚" },
  { id: "remix", label: "Remix", icon: "◎" },
  { id: "sveltekit", label: "SvelteKit", icon: "🔥" },
  { id: "astro", label: "Astro", icon: "🚀" },
  { id: "react-spa", label: "React SPA", icon: "⚛" },
  { id: "vue-spa", label: "Vue SPA", icon: "💚" },
  { id: "vanilla-js", label: "Vanilla JS", icon: "✦" },
];

const BACKEND_FRAMEWORKS: { id: Framework; label: string; icon: string }[] = [
  { id: "laravel", label: "Laravel", icon: "🎯" },
  { id: "express", label: "Express.js", icon: "🟩" },
  { id: "nestjs", label: "NestJS", icon: "🐱" },
  { id: "fastapi", label: "FastAPI", icon: "⚡" },
  { id: "django", label: "Django", icon: "🐍" },
  { id: "rails", label: "Rails", icon: "💎" },
  { id: "go-fiber", label: "Go Fiber", icon: "🐹" },
  { id: "hono", label: "Hono", icon: "🔥" },
];

const MOBILE_FRAMEWORKS: { id: Framework; label: string; icon: string }[] = [
  { id: "react-native", label: "React Native", icon: "⚛" },
  { id: "flutter", label: "Flutter", icon: "🐦" },
  { id: "expo", label: "Expo", icon: "📱" },
];

const DESIGNS: { id: Design; label: string; desc: string; swatch: string }[] = [
  { id: "neo-brutalist", label: "Neo-Brutalist", desc: "Raw, bold, high contrast", swatch: "■" },
  { id: "minimal", label: "Minimal", desc: "Clean, lots of whitespace", swatch: "○" },
  { id: "corporate", label: "Corporate", desc: "Professional, trust-focused", swatch: "□" },
  { id: "bold", label: "Bold & Colorful", desc: "Vibrant, expressive, fun", swatch: "◈" },
  { id: "glassmorphism", label: "Glassmorphism", desc: "Frosted glass, blur layers", swatch: "∷" },
  { id: "dashboard", label: "Dashboard / Data", desc: "Dense, information-rich", swatch: "⊞" },
  { id: "ai-recommend", label: "Biarkan AI", desc: "AI pilihkan sesuai konteks", swatch: "🤖" },
];

const AGENT_TOOLS: {
  id: AgentTool;
  label: string;
  icon: string;
  tooltip: string;
  outputFile: string;
}[] = [
  {
    id: "cursor",
    label: "Cursor",
    icon: "⬡",
    tooltip: "IDE berbasis VS Code dengan AI inline. Output dioptimasi untuk .cursorrules",
    outputFile: ".cursorrules",
  },
  {
    id: "claude-code",
    label: "Claude Code",
    icon: "◈",
    tooltip: "Terminal agent dari Anthropic. Output dioptimasi untuk CLAUDE.md",
    outputFile: "CLAUDE.md",
  },
  {
    id: "windsurf",
    label: "Windsurf",
    icon: "🌊",
    tooltip: "IDE dengan Cascade agent. Output dioptimasi untuk .windsurfrules",
    outputFile: ".windsurfrules",
  },
  {
    id: "cline",
    label: "Cline",
    icon: "⊞",
    tooltip: "VS Code extension agent. Output dioptimasi untuk .clinerules",
    outputFile: ".clinerules",
  },
  {
    id: "opencode",
    label: "OpenCode",
    icon: "◎",
    tooltip: "Terminal agent open source. Output format generik",
    outputFile: "agents.md",
  },
  {
    id: "custom",
    label: "Custom / Lainnya",
    icon: "✦",
    tooltip: "Output generik, tidak ada optimasi khusus untuk tool tertentu",
    outputFile: "agents.md",
  },
];

const DATABASES: { id: Database; label: string }[] = [
  { id: "postgresql", label: "PostgreSQL" },
  { id: "mysql", label: "MySQL" },
  { id: "mongodb", label: "MongoDB" },
  { id: "sqlite", label: "SQLite" },
  { id: "redis", label: "Redis" },
  { id: "supabase", label: "Supabase" },
  { id: "planetscale", label: "PlanetScale" },
  { id: "turso", label: "Turso" },
];

const DEPLOYMENTS: { id: Deployment; label: string }[] = [
  { id: "vercel", label: "Vercel" },
  { id: "netlify", label: "Netlify" },
  { id: "railway", label: "Railway" },
  { id: "fly-io", label: "Fly.io" },
  { id: "vps", label: "VPS / Dedicated" },
  { id: "docker", label: "Docker" },
  { id: "aws", label: "AWS / GCP / Azure" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono font-bold text-[10px] tracking-widest uppercase mb-3"
      style={{ color: "var(--color-text-tertiary)" }}
    >
      {children}
    </p>
  );
}

function FrameworkPill({
  id,
  label,
  icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs transition-all"
      style={{
        background: active ? "rgba(204,255,0,0.08)" : "var(--color-bg-elevated)",
        border: active
          ? "1px solid rgba(204,255,0,0.45)"
          : "0.5px solid var(--color-border-default)",
        color: active ? "var(--color-lime)" : "var(--color-text-secondary)",
      }}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function TooltipIcon({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        role="button"
        tabIndex={0}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onKeyDown={(e) => e.key === "Enter" && setShow((v) => !v)}
        className="w-4 h-4 rounded-full font-mono text-[10px] flex items-center justify-center cursor-default"
        style={{
          background: "var(--color-bg-elevated)",
          border: "0.5px solid var(--color-border-default)",
          color: "var(--color-text-tertiary)",
        }}
        aria-label="Info"
      >
        ⓘ
      </div>
      {show && (
        <div
          className="absolute z-50 bottom-6 left-0 w-56 p-2.5 rounded-lg font-mono text-[11px]"
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-strong)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StackStep({ value, productType, onChange, onNext, onBack }: Props) {
  const [showExtras, setShowExtras] = useState(false);

  const set = <K extends keyof Presets>(key: K, val: Presets[K]) => {
    onChange({ ...value, [key]: val });
  };

  const isMobile = productType === "mobile";
  const selectedTool = AGENT_TOOLS.find((t) => t.id === value.agentTool);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <span
          className="font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-4 inline-block"
          style={{
            background: "rgba(204,255,0,0.08)",
            color: "var(--color-lime)",
            border: "0.5px solid rgba(204,255,0,0.25)",
          }}
        >
          Step 3 of 4 — Stack & Preferences
        </span>
        <h2
          className="font-unbounded font-bold text-xl sm:text-2xl mb-2"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
        >
          Tech stack & style
        </h2>
        <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
          AI akan menyesuaikan output dengan ini.{" "}
          <span style={{ color: "var(--color-text-tertiary)" }}>
            Tidak tahu? Pilih "Biarkan AI".
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-8 mb-8">
        {/* Mobile frameworks — only show for mobile apps */}
        {isMobile && (
          <div>
            <SectionLabel>Mobile Framework</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {MOBILE_FRAMEWORKS.map((fw) => (
                <FrameworkPill
                  key={fw.id}
                  {...fw}
                  active={value.framework === fw.id}
                  onClick={() => set("framework", fw.id)}
                />
              ))}
              <FrameworkPill
                id="ai-recommend"
                label="Biarkan AI rekomendasikan"
                icon="🤖"
                active={value.framework === "ai-recommend"}
                onClick={() => set("framework", "ai-recommend")}
              />
            </div>
          </div>
        )}

        {/* Frontend / Fullstack */}
        {!isMobile && (
          <div>
            <SectionLabel>Frontend / Fullstack</SectionLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {FRONTEND_FRAMEWORKS.map((fw) => (
                <FrameworkPill
                  key={fw.id}
                  {...fw}
                  active={value.framework === fw.id}
                  onClick={() => set("framework", fw.id)}
                />
              ))}
            </div>
            <SectionLabel>Backend / API</SectionLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {BACKEND_FRAMEWORKS.map((fw) => (
                <FrameworkPill
                  key={fw.id}
                  {...fw}
                  active={value.framework === fw.id}
                  onClick={() => set("framework", fw.id)}
                />
              ))}
            </div>
            <button
              onClick={() => set("framework", "ai-recommend")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all"
              style={{
                background:
                  value.framework === "ai-recommend"
                    ? "rgba(204,255,0,0.08)"
                    : "var(--color-bg-elevated)",
                border:
                  value.framework === "ai-recommend"
                    ? "1px solid rgba(204,255,0,0.45)"
                    : "0.5px solid var(--color-border-default)",
                color:
                  value.framework === "ai-recommend"
                    ? "var(--color-lime)"
                    : "var(--color-text-secondary)",
              }}
            >
              <span>🤖</span>
              <span className="font-medium">Belum tahu — biarkan AI rekomendasikan</span>
            </button>
          </div>
        )}

        {/* Design Style */}
        <div>
          <SectionLabel>Design Style</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {DESIGNS.map((d) => {
              const active = value.design === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => set("design", d.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all"
                  style={{
                    background: active
                      ? "rgba(204,255,0,0.08)"
                      : "var(--color-bg-elevated)",
                    border: active
                      ? "1px solid rgba(204,255,0,0.45)"
                      : "0.5px solid var(--color-border-default)",
                    color: active ? "var(--color-lime)" : "var(--color-text-secondary)",
                  }}
                  title={d.desc}
                >
                  <span>{d.swatch}</span>
                  <span className="font-medium">{d.label}</span>
                  <span
                    className="hidden sm:inline text-[10px]"
                    style={{ color: active ? "rgba(204,255,0,0.6)" : "var(--color-text-tertiary)" }}
                  >
                    — {d.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Tool Target */}
        <div>
          <SectionLabel>AI Tool Target</SectionLabel>
          <p
            className="font-mono text-xs mb-3"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Dokumentasi akan dioptimasi untuk tool ini.
          </p>
          <div className="flex flex-wrap gap-2">
            {AGENT_TOOLS.map((tool) => {
              const active = value.agentTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => set("agentTool", tool.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all"
                  style={{
                    background: active
                      ? "rgba(204,255,0,0.08)"
                      : "var(--color-bg-elevated)",
                    border: active
                      ? "1px solid rgba(204,255,0,0.45)"
                      : "0.5px solid var(--color-border-default)",
                    color: active ? "var(--color-lime)" : "var(--color-text-secondary)",
                  }}
                >
                  <span>{tool.icon}</span>
                  <span className="font-medium">{tool.label}</span>
                  <TooltipIcon text={tool.tooltip} />
                </button>
              );
            })}
          </div>
          {selectedTool && (
            <p
              className="font-mono text-[11px] mt-2"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Output akan dioptimasi untuk{" "}
              <code
                className="px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(204,255,0,0.06)",
                  color: "var(--color-lime)",
                  fontSize: 11,
                }}
              >
                {selectedTool.outputFile}
              </code>
            </p>
          )}
        </div>

        {/* Database & Deployment — optional accordion */}
        <div>
          <button
            onClick={() => setShowExtras(!showExtras)}
            className="font-mono text-xs flex items-center gap-2 transition-colors"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <span
              style={{
                transform: showExtras ? "rotate(90deg)" : "none",
                display: "inline-block",
                transition: "transform 0.2s",
              }}
            >
              ▶
            </span>
            {showExtras ? "Sembunyikan" : "▼ Database & Deployment (opsional)"}
          </button>

          {showExtras && (
            <div className="mt-4 flex flex-col gap-5">
              {/* Database */}
              <div>
                <SectionLabel>Database</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {DATABASES.map((db) => {
                    const active = value.database === db.id;
                    return (
                      <button
                        key={db.id}
                        onClick={() =>
                          set("database", active ? undefined : db.id)
                        }
                        className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all"
                        style={{
                          background: active
                            ? "rgba(204,255,0,0.08)"
                            : "var(--color-bg-elevated)",
                          border: active
                            ? "1px solid rgba(204,255,0,0.45)"
                            : "0.5px solid var(--color-border-default)",
                          color: active
                            ? "var(--color-lime)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {db.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deployment */}
              <div>
                <SectionLabel>Deployment</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {DEPLOYMENTS.map((dep) => {
                    const active = value.deployment === dep.id;
                    return (
                      <button
                        key={dep.id}
                        onClick={() =>
                          set("deployment", active ? undefined : dep.id)
                        }
                        className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all"
                        style={{
                          background: active
                            ? "rgba(204,255,0,0.08)"
                            : "var(--color-bg-elevated)",
                          border: active
                            ? "1px solid rgba(204,255,0,0.45)"
                            : "0.5px solid var(--color-border-default)",
                          color: active
                            ? "var(--color-lime)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {dep.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl font-mono text-sm transition-all"
          style={{
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-secondary)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          ← Kembali
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl font-mono font-bold text-sm transition-all"
          style={{
            background: "var(--color-lime)",
            color: "#0A0A0A",
          }}
        >
          Lanjut →
        </button>
      </div>
    </div>
  );
}
