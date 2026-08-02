import type { SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  getTierConfig,
  type TierId,
  TIER,
  validateModelClassForTier,
  pricingSlugFromTierId,
  type ModelClassId,
} from "@/lib/config/tiers";
import type { UserPlanStatus, UserTier } from "@/components/generate/types";

export type { TierId, ModelClassId };

export function isPaidTier(tier: SubscriptionTier | null | undefined): tier is SubscriptionTier {
  return tier === TIER.BASE || tier === TIER.CORE || tier === TIER.PRIME;
}

export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || subscription.status !== "ACTIVE") {
    return null;
  }

  if (subscription.expiresAt && subscription.expiresAt < new Date()) {
    return null;
  }

  return subscription.tier;
}

export async function resolveTierId(userId: string): Promise<TierId | null> {
  const tier = await getUserSubscriptionTier(userId);
  if (!tier) return null;
  return tier as TierId;
}

export async function getTierConfigForUser(userId: string) {
  const tierId = await resolveTierId(userId);
  if (!tierId) return null;
  return getTierConfig(tierId);
}

export function assertModelClassAllowed(tierId: TierId, modelClass: string): void {
  if (!validateModelClassForTier(tierId, modelClass)) {
    throw new Error(
      `Model class ${modelClass} tidak tersedia di tier ${tierId}. Upgrade paket untuk akses model ini.`
    );
  }
}

export function tierIdToUserPlan(tierId: TierId | null): UserPlanStatus {
  if (!tierId) return "none";
  return pricingSlugFromTierId(tierId) as UserTier;
}

/** Maps Prisma tier to orchestrator legacy UserTier strings */
export function tierToOrchestratorUserTier(
  tier: SubscriptionTier | null
): "free" | "paid" | "unlimited" {
  if (!tier) return "free";
  switch (tier) {
    case TIER.PRIME:
      return "unlimited";
    case TIER.CORE:
    case TIER.BASE:
      return "paid";
    default:
      return "free";
  }
}

export async function syncUserTierCache(userId: string, tier: SubscriptionTier): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { tier },
  });
}
