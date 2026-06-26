"use client";

import type { Presets, Framework, Design, AgentTool, UserTier } from "./types";
import { getModelsForTier } from "./types";

interface PresetSelectorProps {
  presets: Presets;
  onChange: (v: Presets) => void;
  onNext: () => void;
  onBack: () => void;
  tier: UserTier;
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

interface PresetCardProps {
  id: string;
  emoji: string;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function PresetCard({ id, emoji, label, description, active, onClick }: PresetCardProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="card card-interactive text-left w-full relative"
      style={
        active
          ? {
              borderColor: "var(--color-lime)",
              background: "var(--color-bg-elevated)",
            }
          : {}
      }
    >
      {active && (
        <div
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "var(--color-primary-500)" }}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="var(--color-bg-950)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="text-h3 mb-1">{label}</p>
      <p className="text-small">{description}</p>
    </button>
  );
}

const FRAMEWORKS: { value: Framework; emoji: string; label: string; description: string }[] = [
  { value: "nextjs", emoji: "▲", label: "Next.js", description: "React full-stack, SSR/SSG, Vercel-optimized" },
  { value: "laravel", emoji: "🔴", label: "Laravel", description: "PHP MVC framework, batteries included" },
  { value: "django", emoji: "🐍", label: "Django", description: "Python, built-in admin, rapid development" },
  { value: "rails", emoji: "💎", label: "Rails", description: "Ruby, convention over configuration" },
  { value: "fastapi", emoji: "⚡", label: "FastAPI", description: "Python async API with auto docs" },
];

const DESIGNS: { value: Design; emoji: string; label: string; description: string }[] = [
  { value: "linear", emoji: "◆", label: "Linear", description: "Dark, sharp, high-contrast UI" },
  { value: "apple", emoji: "⬜", label: "Apple", description: "Clean, minimal, lots of whitespace" },
  { value: "stripe", emoji: "💜", label: "Stripe", description: "Professional, gradient accents" },
  { value: "notion", emoji: "📓", label: "Notion", description: "Content-first, clean typography" },
  { value: "vercel", emoji: "🔲", label: "Vercel", description: "Monochrome, developer-focused" },
];

const AGENT_TOOLS: { value: AgentTool; emoji: string; label: string; description: string }[] = [
  { value: "cursor", emoji: "🖱️", label: "Cursor", description: "AI-first code editor, .cursorrules" },
  { value: "claude-code", emoji: "🤖", label: "Claude Code", description: "Anthropic CLI, CLAUDE.md" },
  { value: "windsurf", emoji: "🏄", label: "Windsurf", description: "Codeium's agentic IDE, .windsurfrules" },
  { value: "cline", emoji: "🔧", label: "Cline", description: "VS Code extension, agentic coding" },
  { value: "opencode", emoji: "💻", label: "OpenCode", description: "Open-source terminal AI agent" },
];

export default function PresetSelector({
  presets,
  onChange,
  onNext,
  onBack,
  tier,
  selectedModelId,
  onModelChange,
}: PresetSelectorProps) {
  const availableModels = getModelsForTier(tier);

  return (
    <div className="animate-fade-in-up">
      {/* Heading */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 badge badge-success mb-5">
          <span>Step 3 of 4</span>
        </div>
        <h1 className="text-h1 mb-3">Choose your stack</h1>
        <p className="text-body-lg max-w-lg mx-auto">
          Select your preferred framework, design aesthetic, AI coding tool,
          and AI model for generation.
        </p>
      </div>

      {/* Framework */}
      <div className="mb-8">
        <p className="text-label mb-3">Framework</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FRAMEWORKS.map((f) => (
            <PresetCard
              key={f.value}
              id={`preset-framework-${f.value}`}
              emoji={f.emoji}
              label={f.label}
              description={f.description}
              active={presets.framework === f.value}
              onClick={() => onChange({ ...presets, framework: f.value })}
            />
          ))}
        </div>
      </div>

      {/* Design */}
      <div className="mb-8">
        <p className="text-label mb-3">Design Aesthetic</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DESIGNS.map((d) => (
            <PresetCard
              key={d.value}
              id={`preset-design-${d.value}`}
              emoji={d.emoji}
              label={d.label}
              description={d.description}
              active={presets.design === d.value}
              onClick={() => onChange({ ...presets, design: d.value })}
            />
          ))}
        </div>
      </div>

      {/* Agent Tool */}
      <div className="mb-8">
        <p className="text-label mb-3">AI Coding Tool</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AGENT_TOOLS.map((a) => (
            <PresetCard
              key={a.value}
              id={`preset-agent-${a.value}`}
              emoji={a.emoji}
              label={a.label}
              description={a.description}
              active={presets.agentTool === a.value}
              onClick={() => onChange({ ...presets, agentTool: a.value })}
            />
          ))}
        </div>
      </div>

      {/* AI Model */}
      <div className="mb-8">
        <p className="text-label mb-3">AI Model</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableModels.map((m) => (
            <button
              key={m.id}
              id={`preset-model-${m.id}`}
              onClick={() => onModelChange(m.id)}
              className="card card-interactive text-left w-full relative"
              style={
                selectedModelId === m.id
                  ? { borderColor: "var(--color-lime)", background: "var(--color-bg-elevated)" }
                  : {}
              }
            >
              {selectedModelId === m.id && (
                <div
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--color-lime)" }}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#052e16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <div className="text-2xl mb-2">{m.icon}</div>
              <p className="text-h3 mb-1">{m.label}</p>
              <p className="text-small">
                {m.provider.charAt(0).toUpperCase() + m.provider.slice(1)}
                {m.tier === "free" && (
                  <span className="ml-1 badge badge-success text-xs">Free</span>
                )}
                {m.tier === "paid" && (
                  <span className="ml-1 badge badge-info text-xs">Premium</span>
                )}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button id="preset-back-btn" onClick={onBack} className="btn btn-secondary flex-1">
          ← Back
        </button>
        <button id="preset-generate-btn" onClick={onNext} className="btn btn-primary flex-[2]">
          ✨ Generate Documentation
        </button>
      </div>
    </div>
  );
}
