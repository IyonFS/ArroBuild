// Shared types for all generate step components

// ─── Legacy (kept for backwards compat with API) ──────────────────────────────
export type Platform = "web" | "mobile" | "desktop" | "api";
export type Monetization = "free" | "paid" | "freemium" | "open-source";
export type Scope = "mvp" | "full-product" | "experiment";

export interface Clarifications {
  platform?: Platform;
  monetization?: Monetization;
  scope?: Scope;
}

// ─── New v2 Types ─────────────────────────────────────────────────────────────

export type ProductType =
  | "saas"
  | "marketplace"
  | "mobile"
  | "api"
  | "portfolio"
  | "internal"
  | "ecommerce"
  | "ai-app"
  | "other";

export type ProjectStage = "idea" | "prototype" | "production";

export interface ContextData {
  // Generic fields (all product types)
  targetUser?: string;
  mainProblem?: string;
  coreFeatures?: string;
  freeText?: string;
  // SaaS extras
  pricingModel?: string;
  // Marketplace extras
  marketplaceSides?: string;
  buyerDesc?: string;
  sellerDesc?: string;
  transactionType?: string;
  category?: string;
  // Mobile extras
  platforms?: string;
  offlineFirst?: boolean;
  nativeFeatures?: string;
  // API extras
  targetDev?: string;
  authMethod?: string;
  inputOutput?: string;
  deploymentTarget?: string;
  // Portfolio extras
  stackHighlight?: string;
  audienceType?: string;
  caseStudy?: string;
  // Internal tool extras
  teamSize?: string;
  replacesTool?: string;
  integrations?: string;
  // E-commerce extras
  productType?: string;
  salesChannel?: string;
  // AI App extras
  aiUseCase?: string;
  aiModel?: string;
  aiPrivacy?: string;
  // Optional extras (accordion)
  productName?: string;
  referenceProducts?: string;
  antiFeatures?: string;
  launchTimeline?: string;
}

// ─── Stack & Presets ──────────────────────────────────────────────────────────

export type Framework =
  | "nextjs"
  | "nuxt"
  | "remix"
  | "sveltekit"
  | "astro"
  | "react-spa"
  | "vue-spa"
  | "vanilla-js"
  | "laravel"
  | "express"
  | "nestjs"
  | "fastapi"
  | "django"
  | "rails"
  | "go-fiber"
  | "hono"
  | "react-native"
  | "flutter"
  | "expo"
  | "ai-recommend";

export type Design =
  | "neo-brutalist"
  | "minimal"
  | "corporate"
  | "bold"
  | "glassmorphism"
  | "dashboard"
  | "apple"
  | "linear"
  | "stripe"
  | "notion"
  | "vercel"
  | "ai-recommend";

export type AgentTool =
  | "cursor"
  | "claude-code"
  | "windsurf"
  | "cline"
  | "opencode"
  | "custom";

export type Database =
  | "postgresql"
  | "mysql"
  | "mongodb"
  | "sqlite"
  | "redis"
  | "supabase"
  | "planetscale"
  | "turso";

export type Deployment =
  | "vercel"
  | "netlify"
  | "railway"
  | "fly-io"
  | "vps"
  | "docker"
  | "aws"
  | "none";

export interface Presets {
  framework: Framework;
  design: Design;
  agentTool: AgentTool;
  database?: Database;
  deployment?: Deployment;
}

// ─── User & Model ─────────────────────────────────────────────────────────────

export type UserTier = "free" | "paid" | "unlimited";

export type AIProvider = "gemini" | "openai" | "anthropic" | "deepseek";

export interface ModelOption {
  id: string;
  provider: AIProvider;
  label: string;
  tier: "free" | "paid";
  icon: string;
  speed: string;
  description: string;
  estimatePerDoc: number; // seconds per document
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "gemini-2.5-flash",
    provider: "gemini",
    label: "Gemini Flash",
    tier: "free",
    icon: "✦",
    speed: "~30 dtk/dok",
    description: "Gratis · Cepat, cukup detail",
    estimatePerDoc: 30,
  },
  {
    id: "deepseek-chat",
    provider: "deepseek",
    label: "DeepSeek V3",
    tier: "free",
    icon: "🐋",
    speed: "~45 dtk/dok",
    description: "Gratis · Detail, open source",
    estimatePerDoc: 45,
  },
  {
    id: "gemini-2.5-pro",
    provider: "gemini",
    label: "Gemini 2.5 Pro",
    tier: "paid",
    icon: "✦",
    speed: "~1 mnt/dok",
    description: "Pro · Paling lengkap",
    estimatePerDoc: 60,
  },
  {
    id: "gpt-4o",
    provider: "openai",
    label: "GPT-4o",
    tier: "paid",
    icon: "◎",
    speed: "~1 mnt/dok",
    description: "Pro · Konsisten & akurat",
    estimatePerDoc: 60,
  },
  {
    id: "claude-sonnet-4-20250514",
    provider: "anthropic",
    label: "Claude Sonnet 4",
    tier: "paid",
    icon: "◈",
    speed: "~1 mnt/dok",
    description: "Pro · Terbaik untuk docs",
    estimatePerDoc: 60,
  },
];

export function getModelsForTier(tier: UserTier): ModelOption[] {
  if (tier === "free") {
    return MODEL_OPTIONS.filter((m) => m.tier === "free");
  }
  return MODEL_OPTIONS;
}

// ─── File Keys & Metadata ─────────────────────────────────────────────────────

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
  { label: string; description: string; icon: string; phase: string }
> = {
  prd: {
    label: "Product Requirements",
    description: "Features, user stories, dan acceptance criteria",
    icon: "📝",
    phase: "Semua fase",
  },
  context: {
    label: "Project Context",
    description: "Vision, goals, dan product overview",
    icon: "📋",
    phase: "Semua fase",
  },
  plan: {
    label: "Development Plan",
    description: "Tech stack, tasks, roadmap, dan budget",
    icon: "🗺️",
    phase: "Semua fase",
  },
  "design-system": {
    label: "Design System",
    description: "Colors, typography, components, dan accessibility",
    icon: "🎨",
    phase: "Semua fase",
  },
  agents: {
    label: "AI Agents & Rules",
    description: "Agent roles, coding rules, dan workflow",
    icon: "🤖",
    phase: "Semua fase",
  },
  "production-hardening": {
    label: "Production Hardening",
    description: "Security, monitoring, CI/CD, dan incident response",
    icon: "🛡️",
    phase: "Siap launch / sudah production",
  },
  "scale-performance": {
    label: "Scale & Performance",
    description: "Scaling strategy, performance optimization, cost projection",
    icon: "⚡",
    phase: "Sudah ada traffic nyata",
  },
  "growth-quality": {
    label: "Growth & Quality",
    description: "Go-to-market, acquisition, testing, dan analytics",
    icon: "📈",
    phase: "Optimasi post-launch",
  },
};

/** All available file keys — everyone can pick any document */
export const ALL_FILE_KEYS: FileKey[] = [
  "prd",
  "context",
  "plan",
  "design-system",
  "agents",
  "production-hardening",
  "scale-performance",
  "growth-quality",
];

/** Smart presets based on project stage */
export const STAGE_PRESETS: Record<ProjectStage, FileKey[]> = {
  idea: ["prd", "context", "plan"],
  prototype: ["prd", "context", "plan", "design-system", "agents"],
  production: [
    "prd",
    "context",
    "plan",
    "design-system",
    "agents",
    "production-hardening",
  ],
};

/** Legacy tier mapping — kept for API backwards compat */
export const TIER_FILE_KEYS: Record<UserTier, FileKey[]> = {
  free: ALL_FILE_KEYS,
  paid: ALL_FILE_KEYS,
  unlimited: ALL_FILE_KEYS,
};
