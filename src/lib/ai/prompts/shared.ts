/**
 * Shared types, context builder, and tier system for all ArroBuild prompt templates.
 */

export type Platform = "web" | "mobile" | "desktop" | "api";
export type Monetization = "free" | "paid" | "freemium" | "open-source";
export type Scope = "mvp" | "full-product" | "experiment";

export type FrameworkPreset =
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

export type DesignPreset =
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

export type AgentToolPreset =
  | "cursor"
  | "claude-code"
  | "windsurf"
  | "cline"
  | "opencode"
  | "custom";

export interface Clarifications {
  platform?: Platform;
  monetization?: Monetization;
  scope?: Scope;
}

export interface Presets {
  framework: FrameworkPreset;
  design: DesignPreset;
  agentTool: AgentToolPreset;
}

export interface GenerationInput {
  idea: string;
  clarifications: Clarifications;
  presets: Presets;
  tier?: UserTier;
  modelId?: string;
  selectedDocs?: FileKey[];
}

// ─── Tier System ────────────────────────────────────────────────────────────

export type UserTier = "free" | "paid" | "unlimited";

export type FileKey =
  | "prd"
  | "context"
  | "plan"
  | "design-system"
  | "agents"
  | "production-hardening"
  | "scale-performance"
  | "growth-quality";

// ─── Multi-Model AI ─────────────────────────────────────────────────────────

export type AIProvider = "gemini" | "openai" | "anthropic" | "deepseek";

export interface ModelOption {
  id: string;
  provider: AIProvider;
  label: string;
  /** 'free' = accessible on FREE tier, 'pro' = PRO+ only, 'pro_max' = PRO_MAX only */
  tier: "free" | "pro" | "pro_max";
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "gemini-2.5-flash", provider: "gemini", label: "Gemini 2.5 Flash", tier: "free" },
  { id: "deepseek-chat", provider: "deepseek", label: "DeepSeek V3", tier: "free" },
  { id: "gemini-2.5-pro", provider: "gemini", label: "Gemini 2.5 Pro", tier: "pro" },
  { id: "gpt-4o", provider: "openai", label: "GPT-4o", tier: "pro" },
  { id: "claude-sonnet-4-20250514", provider: "anthropic", label: "Claude Sonnet 4", tier: "pro_max" },
];

export function getModelsForTier(tier: UserTier): ModelOption[] {
  if (tier === "free") {
    return MODEL_OPTIONS.filter((m) => m.tier === "free");
  }
  if (tier === "paid") {
    return MODEL_OPTIONS.filter((m) => m.tier === "free" || m.tier === "pro");
  }
  // unlimited: all models
  return MODEL_OPTIONS;
}

export function getModelOption(modelId: string): ModelOption | undefined {
  return MODEL_OPTIONS.find((m) => m.id === modelId);
}

export interface TierConfig {
  fileKeys: FileKey[];
  defaultModel: string;
  maxOutputTokens: number;
}

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

/** Files and token limits per legacy tier (used by old prompt builders) */
export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  free: {
    fileKeys: ["prd", "context", "plan"],
    defaultModel: "gemini-2.5-flash",
    maxOutputTokens: 2000,
  },
  paid: {
    fileKeys: ["context", "prd", "plan", "design-system", "agents"],
    defaultModel: "gemini-2.5-pro",
    maxOutputTokens: 4000,
  },
  unlimited: {
    fileKeys: ALL_FILE_KEYS,
    defaultModel: "claude-sonnet-4-20250514",
    maxOutputTokens: 8000,
  },
};

/** Context that accumulates as files are generated sequentially. */
export interface AccumulatedContext {
  prdMd?: string;
  contextMd?: string;
  planMd?: string;
  designSystemMd?: string;
  agentsMd?: string;
}

// ─── Prompt Utilities ────────────────────────────────────────────────────────

/**
 * Summarize a previously-generated markdown document for use as context
 * in subsequent prompts. Extracts headings + first meaningful sentence
 * per section. Keeps it under ~800 tokens.
 */
export function summarizeForContext(markdown: string, maxLength = 1500): string {
  if (!markdown) return "";

  const lines = markdown.split("\n");
  const summary: string[] = [];
  let charCount = 0;

  for (const line of lines) {
    // Always keep headings
    if (line.startsWith("#")) {
      summary.push(line);
      charCount += line.length;
      continue;
    }

    // Keep the first non-empty paragraph line after a heading
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("|") &&
      !trimmed.startsWith("```") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("*") &&
      summary.length > 0 &&
      summary[summary.length - 1].startsWith("#")
    ) {
      // Only take first sentence
      const firstSentence = trimmed.split(/[.!?]\s/)[0] + ".";
      summary.push(firstSentence);
      charCount += firstSentence.length;
    }

    // Keep key bullet points (those with bold markers)
    if ((trimmed.startsWith("- **") || trimmed.startsWith("* **")) && charCount < maxLength * 0.7) {
      summary.push(trimmed);
      charCount += trimmed.length;
    }

    if (charCount >= maxLength) break;
  }

  return summary.join("\n");
}

export function buildBaseContext(input: GenerationInput): string {
  const { idea, clarifications, presets } = input;
  return `<instructions>
Output ONLY raw markdown content. DO NOT wrap in \`\`\`markdown code blocks. Start immediately with markdown headings.
Write in the SAME LANGUAGE as the user's idea (detect: Indonesian or English).
Be specific and concrete — avoid vague statements.
Write the COMPLETE document — all sections must be fully written. Never stop mid-sentence or mid-section.
Minimum length: 2500 characters for PRD, 1800+ for other files.
</instructions>

<user_input>
Idea: ${idea}
Platform: ${clarifications.platform ?? "web"}
Monetization: ${clarifications.monetization ?? "freemium"}
Scope: ${clarifications.scope ?? "mvp"}
Framework: ${presets.framework}
Design Style: ${presets.design}
Agent Tool: ${presets.agentTool}
</user_input>`;
}

// ─── Prompt Dispatcher (v3) ───────────────────────────────────────────────────

/**
 * Dispatches to the appropriate prompt builder based on fileKey and V3Tier.
 * Used by the slim orchestrator v3.
 * Each prompt builder is responsible for incorporating accumulated context.
 */
export function buildPromptForTier(
  fileKey: FileKey,
  input: GenerationInput,
  tier: "FREE" | "PRO" | "PRO_MAX",
  accumulatedContext: string
): string {
  // Lazy imports to avoid circular dependency at module load time
  const { buildContextPrompt } = require("./context");
  const { buildPrdPrompt } = require("./prd");
  const { buildPlanPrompt } = require("./plan");
  const { buildDesignSystemPrompt } = require("./design-system");
  const { buildAgentsPrompt } = require("./agents-prompt");
  const { buildProductionHardeningPrompt } = require("./production-hardening");
  const { buildScalePerformancePrompt } = require("./scale-performance");
  const { buildGrowthQualityPrompt } = require("./growth-quality");

  switch (fileKey) {
    case "context":
      return buildContextPrompt(input, tier, accumulatedContext);
    case "prd":
      return buildPrdPrompt(input, tier, accumulatedContext);
    case "plan":
      return buildPlanPrompt(input, tier, accumulatedContext);
    case "design-system":
      return buildDesignSystemPrompt(input, tier, accumulatedContext);
    case "agents":
      return buildAgentsPrompt(input, tier, accumulatedContext);
    case "production-hardening":
      return buildProductionHardeningPrompt(input, tier, accumulatedContext);
    case "scale-performance":
      return buildScalePerformancePrompt(input, tier, accumulatedContext);
    case "growth-quality":
      return buildGrowthQualityPrompt(input, tier, accumulatedContext);
    default:
      throw new Error(`Unknown fileKey: ${fileKey}`);
  }
}

