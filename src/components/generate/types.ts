// Shared types for all generate step components

export type Platform = "web" | "mobile" | "desktop" | "api";
export type Monetization = "free" | "paid" | "freemium" | "open-source";
export type Scope = "mvp" | "full-product" | "experiment";

export interface Clarifications {
  platform?: Platform;
  monetization?: Monetization;
  scope?: Scope;
}

export type Framework = "nextjs" | "laravel" | "django" | "rails" | "fastapi";
export type Design = "apple" | "linear" | "stripe" | "notion" | "vercel";
export type AgentTool =
  | "cursor"
  | "claude-code"
  | "windsurf"
  | "cline"
  | "opencode";

export interface Presets {
  framework: Framework;
  design: Design;
  agentTool: AgentTool;
}

export type UserTier = "free" | "paid" | "unlimited";

export type AIProvider = "gemini" | "openai" | "anthropic" | "deepseek";

export interface ModelOption {
  id: string;
  provider: AIProvider;
  label: string;
  tier: "free" | "paid";
  icon: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "gemini-2.5-flash", provider: "gemini", label: "Gemini 2.5 Flash", tier: "free", icon: "✦" },
  { id: "deepseek-chat", provider: "deepseek", label: "DeepSeek V3", tier: "free", icon: "🐋" },
  { id: "gemini-2.5-pro", provider: "gemini", label: "Gemini 2.5 Pro", tier: "paid", icon: "✦" },
  { id: "gpt-4o", provider: "openai", label: "GPT-4o", tier: "paid", icon: "◎" },
  { id: "claude-sonnet-4-20250514", provider: "anthropic", label: "Claude Sonnet 4", tier: "paid", icon: "◈" },
];

export function getModelsForTier(tier: UserTier): ModelOption[] {
  if (tier === "free") {
    return MODEL_OPTIONS.filter((m) => m.tier === "free");
  }
  return MODEL_OPTIONS;
}

export type FileKey =
  | "prd"
  | "context"
  | "plan"
  | "design-system"
  | "agents"
  | "production-hardening"
  | "scale-performance"
  | "growth-quality";

export interface GeneratedFiles {
  [key: string]: string;
}

export const FILE_META: Record<
  FileKey,
  { label: string; description: string; icon: string }
> = {
  prd: {
    label: "Product Requirements",
    description: "Features, user stories, and acceptance criteria",
    icon: "📝",
  },
  context: {
    label: "Project Context",
    description: "Vision, goals, and product overview",
    icon: "📋",
  },
  plan: {
    label: "Development Plan",
    description: "Tech stack, tasks, roadmap, and budget",
    icon: "🗺️",
  },
  "design-system": {
    label: "Design System",
    description: "Colors, typography, components, and accessibility",
    icon: "🎨",
  },
  agents: {
    label: "AI Agents & Rules",
    description: "Agent roles, coding rules, and workflow",
    icon: "🤖",
  },
  "production-hardening": {
    label: "Production Hardening",
    description: "Security, monitoring, CI/CD, and incident response",
    icon: "🛡️",
  },
  "scale-performance": {
    label: "Scale & Performance",
    description: "Scaling strategy, performance optimization, cost projection",
    icon: "⚡",
  },
  "growth-quality": {
    label: "Growth & Quality",
    description: "Go-to-market, acquisition, testing, and analytics",
    icon: "📈",
  },
};

/** Files available per tier */
export const TIER_FILE_KEYS: Record<UserTier, FileKey[]> = {
  free: ["prd"],
  paid: ["prd", "context", "plan", "design-system", "agents"],
  unlimited: [
    "prd",
    "context",
    "plan",
    "design-system",
    "agents",
    "production-hardening",
    "scale-performance",
    "growth-quality",
  ],
};
