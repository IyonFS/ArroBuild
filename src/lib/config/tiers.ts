/**
 * Single source of truth for tier, credit, and business configuration.
 * Single source of truth — see docs/08-MONETIZATION.md for business context
 */

export const TIER = {
  BASE: "BASE",
  CORE: "CORE",
  PRIME: "PRIME",
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
  [TIER.BASE]: {
    priceIdr: 65_000,
    creditsPerMonth: 3_000,
    rolloverMax: 0,
    maxActiveSeats: 150,
    coreDocuments: ["prd", "architecture", "plan-task"],
    allowedModelClasses: ["HEMAT"],
    maxOutputTokensPerDoc: 4_096,
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
  [TIER.CORE]: {
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
  [TIER.PRIME]: {
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
    case "base":
    case "starter": // legacy compatibility
      return TIER.BASE;
    case "core":
    case "pro": // legacy compatibility
      return TIER.CORE;
    case "prime":
    case "pro_max": // legacy compatibility
    case "unlimited":
      return TIER.PRIME;
    default:
      return null;
  }
}

export function pricingSlugFromTierId(tierId: TierId): string {
  switch (tierId) {
    case TIER.BASE:
      return "base";
    case TIER.CORE:
      return "core";
    case TIER.PRIME:
      return "prime";
  }
}

/** One-time credit top-up packs (IDR) — docs/12-DECISIONS-LOG.md */
export const CREDIT_TOPUP_PACKS = [
  { id: "topup_1k", credits: 1_000, priceIdr: 20_000, label: "+1.000 kredit" },
  { id: "topup_2_5k", credits: 2_500, priceIdr: 45_000, label: "+2.500 kredit" },
  { id: "topup_5k", credits: 5_000, priceIdr: 85_000, label: "+5.000 kredit" },
] as const;

export type CreditTopupPackId = (typeof CREDIT_TOPUP_PACKS)[number]["id"];

export function getCreditTopupPack(packId: string) {
  return CREDIT_TOPUP_PACKS.find((p) => p.id === packId) ?? null;
}

/** Bonus kredit bulan pertama langganan Prime — docs/08-MONETIZATION.md pricing */
export const PRIME_FIRST_MONTH_BONUS = 500;

export type BillingMonths = 1 | 3 | 4;

export interface SubscriptionPack {
  tierId: typeof TIER.CORE | typeof TIER.PRIME;
  months: BillingMonths;
  priceIdr: number;
  label: string;
  savingsNote?: string;
}

/** Multi-bulan Core/Prime — kredit refresh tetap bulanan via cron */
export const SUBSCRIPTION_PACKS: SubscriptionPack[] = [
  {
    tierId: TIER.CORE,
    months: 3,
    priceIdr: 365_000,
    label: "Core 3 bulan",
    savingsNote: "Hemat vs 3× bulanan",
  },
  {
    tierId: TIER.CORE,
    months: 4,
    priceIdr: 459_000,
    label: "Core 4 bulan",
    savingsNote: "Hemat vs 4× bulanan",
  },
  {
    tierId: TIER.PRIME,
    months: 3,
    priceIdr: 499_000,
    label: "Prime 3 bulan",
    savingsNote: "Hemat vs 3× bulanan",
  },
  {
    tierId: TIER.PRIME,
    months: 4,
    priceIdr: 629_000,
    label: "Prime 4 bulan",
    savingsNote: "Hemat vs 4× bulanan",
  },
];

export function getMonthlyPriceIdr(tierId: TierId): number {
  return getTierConfig(tierId).priceIdr;
}

export function resolveSubscriptionPrice(
  tierId: TierId,
  months: BillingMonths
): { priceIdr: number; label: string } | null {
  if (months === 1) {
    return {
      priceIdr: getMonthlyPriceIdr(tierId),
      label: "Bulanan",
    };
  }
  if (tierId !== TIER.CORE && tierId !== TIER.PRIME) return null;
  const pack = SUBSCRIPTION_PACKS.find(
    (p) => p.tierId === tierId && p.months === months
  );
  if (!pack) return null;
  return { priceIdr: pack.priceIdr, label: pack.label };
}

export function parseBillingMonthsFromOrderId(orderId: string): BillingMonths {
  const match = orderId.match(/-m([134])-/);
  if (!match) return 1;
  const n = Number(match[1]);
  if (n === 3 || n === 4) return n;
  return 1;
}
