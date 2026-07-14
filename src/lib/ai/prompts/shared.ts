/**
 * Shared types and helpers for ArroBuild v2 documents.
 */

import type { DocumentFileKey } from "@/lib/config/documents";

export type {
  DocumentFileKey,
  DocumentFileKey as FileKey,
} from "@/lib/config/documents";

export type Platform = "web" | "mobile" | "desktop" | "api";
export type Monetization = "free" | "paid" | "freemium" | "open-source";
export type Scope = "mvp" | "full-product" | "experiment";

export type FrameworkPreset =
  | "nextjs" | "nuxt" | "remix" | "sveltekit" | "astro"
  | "react-spa" | "vue-spa" | "vanilla-js"
  | "laravel" | "express" | "nestjs" | "fastapi" | "django" | "rails"
  | "go-fiber" | "hono" | "react-native" | "flutter" | "expo"
  | "native-ios" | "native-android" | "ai-recommend";

export type DesignPreset =
  | "neo-brutalist" | "minimal" | "corporate" | "bold"
  | "glassmorphism" | "dashboard"
  | "apple" | "linear" | "stripe" | "notion" | "vercel" | "ai-recommend";

export type AgentToolPreset =
  | "cursor" | "claude-code" | "windsurf" | "cline" | "opencode" | "custom";

export interface Clarifications {
  platform?: Platform;
  monetization?: Monetization;
  scope?: Scope;
}

export interface Presets {
  framework: FrameworkPreset;
  backendFramework?: FrameworkPreset;
  design: DesignPreset;
  agentTool: AgentToolPreset;
  database?: string;
  deployment?: string;
  programmingLanguage?: string;
  animationLibrary?: string;
  stackBundle?: string;
  designReferenceNote?: string;
  versionControl?: string;
  designHandoffTool?: string;
  projectManagementTool?: string;
}

export interface GenerationInput {
  idea: string;
  clarifications: Clarifications;
  presets: Presets;
  tier?: string;
  modelId?: string;
  selectedDocs?: DocumentFileKey[];
  productType?: string;
  projectStage?: string;
  features?: Array<{
    id: string;
    title: string;
    description?: string;
    priority?: "must-have" | "nice-to-have";
  }>;
  perDocumentModelClass?: Partial<
    Record<DocumentFileKey, "hemat" | "menengah" | "flagship" | "ultra">
  >;
  estimatedCredits?: number;
}

export type ModelId =
  | "gemini-3.1-flash-lite"
  | "deepseek-v4-flash"
  | "gemini-3.5-flash"
  | "gpt-5.4"
  | "claude-sonnet-4-20250514";

export type UserTier = "free" | "paid" | "unlimited";
export type AIProvider = "gemini" | "openai" | "anthropic" | "deepseek";

export interface ModelOption {
  id: string;
  provider: AIProvider;
  label: string;
  tier: "free" | "pro" | "pro_max";
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "gemini-3.1-flash-lite", provider: "gemini", label: "Gemini 3.1 Flash Lite", tier: "free" },
  { id: "deepseek-v4-flash", provider: "deepseek", label: "DeepSeek V4 Flash", tier: "free" },
  { id: "gemini-3.5-flash", provider: "gemini", label: "Gemini 3.5 Flash", tier: "pro" },
  { id: "gpt-5.4", provider: "openai", label: "GPT-5.4", tier: "pro" },
  { id: "claude-sonnet-4-20250514", provider: "anthropic", label: "Claude Sonnet 4", tier: "pro_max" },
];

export function summarizeForContext(content: string, maxChars: number): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}\n…[truncated]`;
}

export function buildBaseContext(input: GenerationInput): string {
  const { idea, clarifications, presets } = input;
  return `<instructions>
Output ONLY raw markdown content. DO NOT wrap in \`\`\`markdown code blocks.
LANGUAGE (mandatory): Write the ENTIRE document — every heading, bullet, and sentence — in the SAME language as the user's Idea below.
If the idea is in Indonesian, the full output MUST be in Indonesian (technical terms like Next.js, PostgreSQL, API are OK in English).
Do NOT default to English when the idea is Indonesian.
Reference FEAT-IDs from the form — do not rename or delete user-defined IDs.
</instructions>

<user_input>
Idea: ${idea}
Platform: ${clarifications.platform ?? "web"}
Product type: ${input.productType ?? "saas"}
Stage: ${input.projectStage ?? "idea"}
Framework: ${presets.framework}${presets.backendFramework ? `\nBackend: ${presets.backendFramework}` : ""}
Design: ${presets.design}
Agent tool: ${presets.agentTool}
</user_input>`;
}

