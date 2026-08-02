import {
  DOCUMENT_DEFINITIONS,
  type DocumentFileKey,
  type ModelClass,
  type UserTier,
} from "@/lib/config/documents";
import { TIER_LABELS } from "@/components/generate/types";
import { TIER_CONFIG, TIER, type TierId } from "@/lib/config/tiers";

const TIER_RANK: Record<UserTier, number> = {
  base: 1,
  core: 2,
  prime: 3,
};

function tierIdToUserTier(tierId: TierId): UserTier {
  switch (tierId) {
    case TIER.BASE:
      return "base";
    case TIER.CORE:
      return "core";
    case TIER.PRIME:
      return "prime";
  }
}

export interface TierRecommendation {
  recommended: UserTier;
  minimum: UserTier;
  reason: string;
}

export function recommendTierForPlan(params: {
  estimatedCredits: number;
  selectedDocs: DocumentFileKey[];
  perDocumentModelClass?: Partial<Record<DocumentFileKey, ModelClass>>;
}): TierRecommendation {
  let minimum: UserTier = "base";

  for (const docKey of params.selectedDocs) {
    const def = DOCUMENT_DEFINITIONS[docKey];
    if (TIER_RANK[def.minTier] > TIER_RANK[minimum]) {
      minimum = def.minTier;
    }
  }

  for (const [, modelClass] of Object.entries(params.perDocumentModelClass ?? {})) {
    if (modelClass === "ultra" || modelClass === "flagship") {
      if (modelClass === "ultra") minimum = "prime";
      else if (TIER_RANK[minimum] < TIER_RANK.core) minimum = "core";
    }
    if (modelClass === "menengah" && TIER_RANK[minimum] < TIER_RANK.core) {
      minimum = "core";
    }
  }

  const starterPool = TIER_CONFIG[TIER.BASE].creditsPerMonth;
  const proPool = TIER_CONFIG[TIER.CORE].creditsPerMonth;

  if (params.estimatedCredits > proPool) {
    minimum = "prime";
  } else if (params.estimatedCredits > starterPool) {
    if (TIER_RANK[minimum] < TIER_RANK.core) minimum = "core";
  }

  let recommended = minimum;
  const reasons: string[] = [];

  if (minimum === "prime") {
    reasons.push("plan butuh dokumen opsional atau kelas model Ultra/Flagship");
  } else if (minimum === "core") {
    reasons.push("plan butuh lebih dari 3 dokumen inti atau model Menengah+");
  }

  if (params.estimatedCredits > starterPool && recommended === "base") {
    recommended = "core";
    reasons.push(`estimasi ${params.estimatedCredits} kredit melebihi pool Base (${starterPool})`);
  }

  if (params.estimatedCredits > proPool && recommended !== "prime") {
    recommended = "prime";
    reasons.push(`estimasi ${params.estimatedCredits} kredit melebihi pool Core (${proPool})`);
  }

  if (reasons.length === 0) {
    reasons.push("plan ini cocok dengan paket Base");
  }

  return {
    recommended,
    minimum,
    reason: reasons.join("; "),
  };
}

export function tierLabel(tier: UserTier): string {
  return TIER_LABELS[tier];
}

export function pricingHrefForTier(tier: UserTier): string {
  return `/dashboard?upgrade=true&plan=${tier}`;
}

export { tierIdToUserTier };
