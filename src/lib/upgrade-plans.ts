import type { UserPlanStatus } from "@/components/generate/types";
import type { PricingTierId } from "@/lib/pricing";
import { PRICING_TIERS } from "@/lib/pricing";

const TIER_RANK: Record<PricingTierId, number> = {
  starter: 1,
  pro: 2,
  pro_max: 3,
};

export function tierRank(tierId: PricingTierId): number {
  return TIER_RANK[tierId];
}

export function planToPricingId(plan: UserPlanStatus): PricingTierId | null {
  if (plan === "none") return null;
  return plan;
}

/** Tiers the user can purchase (new sub or upgrade). */
export function getPurchasableTiers(current: UserPlanStatus): PricingTierId[] {
  if (current === "none") {
    return ["starter", "pro", "pro_max"];
  }
  const currentRank = TIER_RANK[current];
  return (["starter", "pro", "pro_max"] as PricingTierId[]).filter(
    (id) => TIER_RANK[id] > currentRank
  );
}

export function isCurrentTier(tierId: PricingTierId, current: UserPlanStatus): boolean {
  return current === tierId;
}

export function canPurchaseTier(tierId: PricingTierId, current: UserPlanStatus): boolean {
  if (current === "none") return true;
  return TIER_RANK[tierId] > TIER_RANK[current];
}

export function getTierCardState(
  tierId: PricingTierId,
  current: UserPlanStatus
): "current" | "upgrade" | "locked" | "subscribe" {
  if (current === "none") return "subscribe";
  if (current === tierId) return "current";
  if (canPurchaseTier(tierId, current)) return "upgrade";
  return "locked";
}

export function getUpgradeButtonLabel(tierId: PricingTierId, current: UserPlanStatus): string {
  const tier = PRICING_TIERS.find((t) => t.id === tierId);
  if (!tier) return "Pilih paket";

  if (current === "none") return tier.cta;
  if (current === tierId) return "Paket aktif";
  if (canPurchaseTier(tierId, current)) return `Upgrade ke ${tier.name}`;
  return "Sudah termasuk";
}

export function getNextUpgradeTarget(current: UserPlanStatus): PricingTierId | null {
  const targets = getPurchasableTiers(current);
  return targets[0] ?? null;
}
