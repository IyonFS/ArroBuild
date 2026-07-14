/**
 * tier-enforcer.ts — document & quota gates backed by lib/config/documents.ts + tiers.ts
 */

import { prisma } from "@/lib/db/prisma";
import { getTierConfig, type TierId } from "@/lib/config/tiers";
import {
  type DocumentFileKey,
  type PromptDepthTier,
  type UserTier,
  filterDocumentsForTier,
  getMaxDocumentsForTier,
  DOCUMENT_GENERATION_ORDER,
  legacyTierSlugToUserTier,
  userTierToPromptDepth,
} from "@/lib/config/documents";
import type { ModelId } from "./prompts/shared";
import { normalizeLegacyModelId } from "@/lib/legacy-model-ids";

function normalizeSelectedModel(model?: string): ModelId | undefined {
  const normalized = normalizeLegacyModelId(model);
  return normalized as ModelId | undefined;
}

export type V3Tier = PromptDepthTier;
export type { ModelId };

export { legacyTierSlugToUserTier, userTierToPromptDepth };

/** @deprecated use userTierToPromptDepth(legacyTierSlugToUserTier(tier)) */
export function toV3Tier(tier: string | undefined | null): V3Tier {
  return userTierToPromptDepth(legacyTierSlugToUserTier(tier));
}

export type ExportFormat =
  | "zip"
  | "cursorrules"
  | "claude-md"
  | "agents-json"
  | "system-prompt";

const MODELS_BY_TIER: Record<UserTier, ModelId[]> = {
  starter: ["gemini-3.1-flash-lite", "deepseek-v4-flash"],
  pro: ["gemini-3.1-flash-lite", "deepseek-v4-flash", "gemini-3.5-flash", "gpt-5.4"],
  pro_max: [
    "gemini-3.1-flash-lite",
    "deepseek-v4-flash",
    "gemini-3.5-flash",
    "gpt-5.4",
    "claude-sonnet-4-20250514",
  ],
};

const DEFAULT_MODEL: Record<UserTier, ModelId> = {
  starter: "gemini-3.1-flash-lite",
  pro: "gemini-3.5-flash",
  pro_max: "claude-sonnet-4-20250514",
};

export interface TierEnforcementResult {
  allowed: boolean;
  reason?: string;
  sanitizedDocs: DocumentFileKey[];
  resolvedModel: ModelId;
  tokenLimit: number;
  userTier: UserTier;
  promptDepth: PromptDepthTier;
}

export function enforceTier(
  requestedDocs: DocumentFileKey[],
  selectedModel: string | undefined,
  tierSlug: string | undefined | null
): TierEnforcementResult {
  const userTier = legacyTierSlugToUserTier(tierSlug);
  const promptDepth = userTierToPromptDepth(userTier);
  const config = getTierConfig(
    userTier === "pro_max" ? "PRO_MAX" : userTier === "pro" ? "PRO" : "STARTER"
  );

  const sanitizedDocs = filterDocumentsForTier(requestedDocs, userTier)
    .sort(
      (a, b) =>
        DOCUMENT_GENERATION_ORDER.indexOf(a) - DOCUMENT_GENERATION_ORDER.indexOf(b)
    )
    .slice(0, getMaxDocumentsForTier(userTier));

  const allowedModels = MODELS_BY_TIER[userTier];
  const model = normalizeSelectedModel(selectedModel);
  if (model && !allowedModels.includes(model)) {
    return {
      allowed: false,
      reason: `Model ${model} tidak tersedia di paket ${userTier}. Upgrade untuk model premium.`,
      sanitizedDocs,
      resolvedModel: DEFAULT_MODEL[userTier],
      tokenLimit: config.maxOutputTokensPerDoc,
      userTier,
      promptDepth,
    };
  }

  return {
    allowed: true,
    sanitizedDocs,
    resolvedModel: (model as ModelId) ?? DEFAULT_MODEL[userTier],
    tokenLimit: config.maxOutputTokensPerDoc,
    userTier,
    promptDepth,
  };
}

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  reason?: string;
}

export async function checkMonthlyQuota(
  userId: string,
  tierSlug: string | undefined | null
): Promise<QuotaCheckResult> {
  const userTier = legacyTierSlugToUserTier(tierSlug);
  const tierId =
    userTier === "pro_max" ? "PRO_MAX" : userTier === "pro" ? "PRO" : "STARTER";
  const limit = getTierConfig(tierId).maxProjectsPerMonth;

  const used = await countProjectsThisMonth(userId);

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      reason: `Kuota bulanan tercapai (${used}/${limit} project). Tunggu bulan depan atau upgrade tier.`,
    };
  }

  return { allowed: true, used, limit };
}

export async function checkDailyLimit(
  userId: string,
  tierSlug: string | undefined | null
): Promise<QuotaCheckResult> {
  const userTier = legacyTierSlugToUserTier(tierSlug);
  const tierId =
    userTier === "pro_max" ? "PRO_MAX" : userTier === "pro" ? "PRO" : "STARTER";
  const baseLimit = getTierConfig(tierId).maxProjectsPerDay;
  const limit =
    process.env.NODE_ENV === "development"
      ? Math.max(baseLimit, 30)
      : baseLimit;

  const used = await countProjectsToday(userId);

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      reason: `Limit harian tercapai (${used}/${limit} proyek hari ini). Proyek gagal tidak dihitung — coba lagi besok.`,
    };
  }

  return { allowed: true, used, limit };
}

/** Tier limits shown in dashboard UI (not dev-boosted daily cap). */
export function getTierQuotaLimits(tierSlug: string | undefined | null) {
  const userTier = legacyTierSlugToUserTier(tierSlug);
  const tierId =
    userTier === "pro_max" ? "PRO_MAX" : userTier === "pro" ? "PRO" : "STARTER";
  const config = getTierConfig(tierId);
  return {
    monthlyLimit: config.maxProjectsPerMonth,
    dailyLimit: config.maxProjectsPerDay,
  };
}

async function countProjectsThisMonth(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return prisma.project.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
      status: { not: "FAILED" },
    },
  });
}

async function countProjectsToday(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.project.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
      status: { not: "FAILED" },
    },
  });
}

/** Usage stats for dashboard display (paket limits, not dev enforcement cap). */
export async function getDashboardQuota(
  userId: string,
  tierSlug: string | undefined | null
) {
  const tierLimits = getTierQuotaLimits(tierSlug);
  const [monthlyUsed, dailyUsed] = await Promise.all([
    countProjectsThisMonth(userId),
    countProjectsToday(userId),
  ]);

  return {
    monthlyUsed,
    monthlyLimit: tierLimits.monthlyLimit,
    monthlyRemaining: Math.max(0, tierLimits.monthlyLimit - monthlyUsed),
    dailyUsed,
    dailyLimit: tierLimits.dailyLimit,
    dailyRemaining: Math.max(0, tierLimits.dailyLimit - dailyUsed),
  };
}

export function modelToProvider(modelId: ModelId): import("./prompts/shared").AIProvider {
  if (modelId.startsWith("gemini")) return "gemini";
  if (modelId.startsWith("gpt")) return "openai";
  if (modelId.startsWith("claude")) return "anthropic";
  if (modelId.startsWith("deepseek")) return "deepseek";
  return "gemini";
}

/** Backward compat for orchestrator token lookup */
export const V3_TIER_CONFIG = {
  STARTER: { maxTokensPerDoc: 2500, allowedModels: MODELS_BY_TIER.starter },
  PRO: { maxTokensPerDoc: 5000, allowedModels: MODELS_BY_TIER.pro },
  PRO_MAX: { maxTokensPerDoc: 10000, allowedModels: MODELS_BY_TIER.pro_max },
  // legacy aliases
  FREE: { maxTokensPerDoc: 2500, allowedModels: MODELS_BY_TIER.starter },
} as const;

export function getFilesForTierConfig(tierSlug: string): DocumentFileKey[] {
  const userTier = legacyTierSlugToUserTier(tierSlug);
  return filterDocumentsForTier(
    [
      "prd",
      "architecture",
      "plan-task",
      "design-system",
      "agent-rules",
      "adaptive-document",
      "cost-infrastructure",
      "analytics-metrics",
      "testing-qa",
      "onboarding-email",
      "competitive-analysis",
      "security-launch",
      "database-deep-dive",
      "compliance-legal",
    ],
    userTier
  );
}
