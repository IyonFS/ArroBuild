/**
 * Single source of truth for tier, credit, and business configuration.
 * Adapted from docs-v2/Backend-sistem-baru/10-tiers-config.ts
 */

export const TIER = {
  STARTER: "STARTER",
  PRO: "PRO",
  PRO_MAX: "PRO_MAX",
} as const;

export type TierId = (typeof TIER)[keyof typeof TIER];

export const MODEL_CLASS = {
  HEMAT: "HEMAT",
  MENENGAH: "MENENGAH",
  FLAGSHIP: "FLAGSHIP",
  ULTRA: "ULTRA",
} as const;

export type ModelClassId = (typeof MODEL_CLASS)[keyof typeof MODEL_CLASS];

export const CREDIT_MULTIPLIER: Record<ModelClassId, number> = {
  HEMAT: 1,
  MENENGAH: 24,
  FLAGSHIP: 35,
  ULTRA: 65,
};

export const CREDIT_COST_IDR: Record<ModelClassId, number> = {
  HEMAT: 5.58,
  MENENGAH: 134,
  FLAGSHIP: 196,
  ULTRA: 364,
};

export const CREDIT_VALUE_IDR = 20;

export interface TierConfig {
  priceIdr: number;
  creditsPerMonth: number;
  rolloverMax: number;
  /** Fase 1 soft-cap active subscribers (waitlist when full). */
  maxActiveSeats: number;
  coreDocuments: readonly string[];
  allowedModelClasses: readonly ModelClassId[];
  maxOutputTokensPerDoc: number;
  maxContextInjectionTokens: number;
  maxFormInputTokens: number;
  maxProjectsPerMonth: number;
  maxProjectsPerDay: number;
  canForkProject: boolean;
  canCustomizePreset: boolean;
  canRegenPerFile: boolean;
  canReviseUnlimited: boolean;
  canAccessOptionalModules: boolean;
  miniToolsIncluded: number | "all";
  miniToolTrialLimit?: number;
  whatsappChatPerMonth: number;
  whatsappChatPriority: "normal" | "priority";
}

export const TIER_CONFIG: Record<TierId, TierConfig> = {
  [TIER.STARTER]: {
    priceIdr: 65_000,
    creditsPerMonth: 3_000,
    rolloverMax: 0,
    maxActiveSeats: 150,
    coreDocuments: ["prd", "architecture", "plan-task"],
    allowedModelClasses: ["HEMAT"],
    maxOutputTokensPerDoc: 2_500,
    maxContextInjectionTokens: 3_000,
    maxFormInputTokens: 1_500,
    maxProjectsPerMonth: 10,
    maxProjectsPerDay: 3,
    canForkProject: false,
    canCustomizePreset: false,
    canRegenPerFile: false,
    canReviseUnlimited: false,
    canAccessOptionalModules: false,
    miniToolsIncluded: 1,
    miniToolTrialLimit: 3,
    whatsappChatPerMonth: 0,
    whatsappChatPriority: "normal",
  },
  [TIER.PRO]: {
    priceIdr: 145_000,
    creditsPerMonth: 7_000,
    rolloverMax: 2_000,
    maxActiveSeats: 60,
    coreDocuments: ["prd", "architecture", "plan-task", "design-system", "agent-rules"],
    allowedModelClasses: ["HEMAT", "MENENGAH", "FLAGSHIP"],
    maxOutputTokensPerDoc: 5_000,
    maxContextInjectionTokens: 5_000,
    maxFormInputTokens: 2_500,
    maxProjectsPerMonth: 30,
    maxProjectsPerDay: 8,
    canForkProject: true,
    canCustomizePreset: true,
    canRegenPerFile: false,
    canReviseUnlimited: false,
    canAccessOptionalModules: false,
    miniToolsIncluded: 3,
    whatsappChatPerMonth: 2,
    whatsappChatPriority: "normal",
  },
  [TIER.PRO_MAX]: {
    priceIdr: 199_000,
    creditsPerMonth: 14_000,
    rolloverMax: 4_000,
    maxActiveSeats: 15,
    coreDocuments: [
      "prd",
      "architecture",
      "plan-task",
      "design-system",
      "agent-rules",
      "adaptive-document",
    ],
    allowedModelClasses: ["HEMAT", "MENENGAH", "FLAGSHIP", "ULTRA"],
    maxOutputTokensPerDoc: 10_000,
    maxContextInjectionTokens: 8_000,
    maxFormInputTokens: 3_500,
    maxProjectsPerMonth: 60,
    maxProjectsPerDay: 15,
    canForkProject: true,
    canCustomizePreset: true,
    canRegenPerFile: true,
    canReviseUnlimited: true,
    canAccessOptionalModules: true,
    miniToolsIncluded: "all",
    whatsappChatPerMonth: 5,
    whatsappChatPriority: "priority",
  },
};

export function getTierConfig(tierId: TierId | string): TierConfig {
  if (tierId in TIER_CONFIG) {
    return TIER_CONFIG[tierId as TierId];
  }
  throw new Error(`Invalid tier ID: ${tierId}`);
}

export function estimateCreditsPerDocument(
  outputTokens: number,
  modelClass: ModelClassId
): number {
  const multiplier = CREDIT_MULTIPLIER[modelClass];
  return Math.ceil((outputTokens * multiplier) / 1000);
}

export function estimateTotalCredits(
  documentConfigs: Array<{ outputTokens: number; modelClass: ModelClassId }>
): number {
  return documentConfigs.reduce(
    (total, doc) => total + estimateCreditsPerDocument(doc.outputTokens, doc.modelClass),
    0
  );
}

export function validateModelClassForTier(tierId: TierId, modelClass: string): boolean {
  const config = getTierConfig(tierId);
  return (config.allowedModelClasses as string[]).includes(modelClass);
}

export function tierIdFromPricingSlug(
  slug: string
): TierId | null {
  switch (slug) {
    case "starter":
      return TIER.STARTER;
    case "pro":
      return TIER.PRO;
    case "pro_max":
    case "unlimited":
      return TIER.PRO_MAX;
    default:
      return null;
  }
}

export function pricingSlugFromTierId(tierId: TierId): string {
  switch (tierId) {
    case TIER.STARTER:
      return "starter";
    case TIER.PRO:
      return "pro";
    case TIER.PRO_MAX:
      return "pro_max";
  }
}
