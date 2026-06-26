/**
 * tier-enforcer.ts
 * Gerbang pertama untuk setiap generate request.
 * Mendefinisikan TIER_CONFIG dan enforces document/model access per tier.
 *
 * Tier mapping ke Prisma SubscriptionTier:
 *   FREE     → SubscriptionTier.FREE
 *   PRO      → SubscriptionTier.STARTER / SubscriptionTier.PRO
 *   PRO_MAX  → SubscriptionTier.UNLIMITED
 */

import { prisma } from "@/lib/db/prisma";
import type { FileKey, AIProvider } from "./prompts/shared";

// ─── Tier Types ────────────────────────────────────────────────────────────

export type V3Tier = "FREE" | "PRO" | "PRO_MAX";

export type ModelId =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "deepseek-chat"
  | "gpt-4o"
  | "claude-sonnet-4-20250514";

export type ExportFormat =
  | "zip"
  | "cursorrules"
  | "claude-md"
  | "agents-json"
  | "system-prompt";

// ─── Tier Configuration ────────────────────────────────────────────────────

export interface V3TierConfig {
  maxDocuments: number;
  allowedDocuments: FileKey[];
  maxProjectsPerMonth: number; // -1 = unlimited
  allowedModels: ModelId[];
  defaultModel: ModelId;
  maxTokensPerDoc: number;
  streamingEnabled: boolean;
  exportFormats: ExportFormat[];
  customPresets: boolean;
  projectHistory: boolean;
  forkProject: boolean;
  regenPerFile: boolean;
  dailySoftLimit: number | null; // null = no daily limit
}

export const V3_TIER_CONFIG: Record<V3Tier, V3TierConfig> = {
  FREE: {
    maxDocuments: 3,
    allowedDocuments: ["context", "prd", "plan"],
    maxProjectsPerMonth: 5,
    allowedModels: ["gemini-2.5-flash", "deepseek-chat"],
    defaultModel: "gemini-2.5-flash",
    maxTokensPerDoc: 2000,
    streamingEnabled: true,
    exportFormats: ["zip"],
    customPresets: false,
    projectHistory: false,
    forkProject: false,
    regenPerFile: false,
    dailySoftLimit: null,
  },
  PRO: {
    maxDocuments: 5,
    allowedDocuments: ["context", "prd", "plan", "design-system", "agents"],
    maxProjectsPerMonth: 30,
    allowedModels: [
      "gemini-2.5-flash",
      "deepseek-chat",
      "gemini-2.5-pro",
      "gpt-4o",
    ],
    defaultModel: "gemini-2.5-pro",
    maxTokensPerDoc: 4000,
    streamingEnabled: true,
    exportFormats: ["zip", "cursorrules", "claude-md", "system-prompt"],
    customPresets: true,
    projectHistory: true,
    forkProject: true,
    regenPerFile: false,
    dailySoftLimit: null,
  },
  PRO_MAX: {
    maxDocuments: 8,
    allowedDocuments: [
      "context",
      "prd",
      "plan",
      "design-system",
      "agents",
      "production-hardening",
      "scale-performance",
      "growth-quality",
    ],
    maxProjectsPerMonth: -1, // unlimited
    allowedModels: [
      "gemini-2.5-flash",
      "deepseek-chat",
      "gemini-2.5-pro",
      "gpt-4o",
      "claude-sonnet-4-20250514",
    ],
    defaultModel: "claude-sonnet-4-20250514",
    maxTokensPerDoc: 8000,
    streamingEnabled: true,
    exportFormats: [
      "zip",
      "cursorrules",
      "claude-md",
      "agents-json",
      "system-prompt",
    ],
    customPresets: true,
    projectHistory: true,
    forkProject: true,
    regenPerFile: true,
    dailySoftLimit: 10, // max 10 generates/day to prevent abuse
  },
};

// ─── Tier Mapper ────────────────────────────────────────────────────────────

/**
 * Maps old UserTier strings (free/paid/unlimited) to V3Tier.
 * Also maps Prisma SubscriptionTier enum values.
 */
export function toV3Tier(tier: string | undefined | null): V3Tier {
  switch (tier) {
    case "unlimited":
    case "UNLIMITED":
      return "PRO_MAX";
    case "paid":
    case "PRO":
    case "STARTER":
      return "PRO";
    case "free":
    case "FREE":
    default:
      return "FREE";
  }
}

// ─── Enforce Tier ──────────────────────────────────────────────────────────

export interface TierEnforcementResult {
  allowed: boolean;
  reason?: string;
  sanitizedDocs: FileKey[];
  resolvedModel: ModelId;
  tokenLimit: number;
}

/**
 * Validates requested docs and model against tier config.
 * Returns sanitized (filtered) docs that are actually allowed.
 */
export function enforceTier(
  requestedDocs: FileKey[],
  selectedModel: string | undefined,
  tier: V3Tier
): TierEnforcementResult {
  const config = V3_TIER_CONFIG[tier];

  // Filter docs to only those allowed for this tier
  const sanitizedDocs = requestedDocs.filter((doc) =>
    config.allowedDocuments.includes(doc)
  );

  // Resolve and validate model
  const model = selectedModel as ModelId | undefined;
  if (model && !config.allowedModels.includes(model)) {
    return {
      allowed: false,
      reason: `Model ${model} tidak tersedia di tier ${tier}. Upgrade akun untuk mengakses model premium.`,
      sanitizedDocs,
      resolvedModel: config.defaultModel,
      tokenLimit: config.maxTokensPerDoc,
    };
  }

  // Enforce document count
  const cappedDocs = sanitizedDocs.slice(0, config.maxDocuments);

  return {
    allowed: true,
    sanitizedDocs: cappedDocs,
    resolvedModel: (model as ModelId) ?? config.defaultModel,
    tokenLimit: config.maxTokensPerDoc,
  };
}

// ─── Quota Check ───────────────────────────────────────────────────────────

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  reason?: string;
}

/**
 * Checks monthly project generation quota for a user.
 * Failed projects are NOT counted against the quota.
 */
export async function checkMonthlyQuota(
  userId: string,
  tier: V3Tier
): Promise<QuotaCheckResult> {
  const config = V3_TIER_CONFIG[tier];

  if (config.maxProjectsPerMonth === -1) {
    return { allowed: true, used: 0, limit: -1 };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.project.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
      status: { not: "FAILED" },
    },
  });

  if (used >= config.maxProjectsPerMonth) {
    return {
      allowed: false,
      used,
      limit: config.maxProjectsPerMonth,
      reason: `Kuota bulanan tercapai (${used}/${config.maxProjectsPerMonth} project). Tunggu bulan depan atau upgrade tier.`,
    };
  }

  return { allowed: true, used, limit: config.maxProjectsPerMonth };
}

/**
 * Checks daily soft limit for PRO_MAX tier to prevent abuse.
 * Other tiers have no daily limit.
 */
export async function checkDailyLimit(
  userId: string,
  tier: V3Tier
): Promise<QuotaCheckResult> {
  const config = V3_TIER_CONFIG[tier];

  if (!config.dailySoftLimit) {
    return { allowed: true, used: 0, limit: -1 };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const used = await prisma.project.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
      status: { not: "FAILED" },
    },
  });

  if (used >= config.dailySoftLimit) {
    return {
      allowed: false,
      used,
      limit: config.dailySoftLimit,
      reason: `Limit harian tercapai (${used}/${config.dailySoftLimit} project hari ini). Coba lagi besok.`,
    };
  }

  return { allowed: true, used, limit: config.dailySoftLimit };
}

// ─── Provider Resolver ─────────────────────────────────────────────────────

export function modelToProvider(modelId: ModelId): AIProvider {
  if (modelId.startsWith("gemini")) return "gemini";
  if (modelId.startsWith("gpt")) return "openai";
  if (modelId.startsWith("claude")) return "anthropic";
  if (modelId.startsWith("deepseek")) return "deepseek";
  return "gemini";
}
