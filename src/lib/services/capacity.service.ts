import { prisma } from "@/lib/db/prisma";
import {
  TIER,
  TIER_CONFIG,
  type TierId,
  getTierConfig,
} from "@/lib/config/tiers";
import type { SubscriptionTier } from "@prisma/client";

export interface TierCapacity {
  tier: TierId;
  activeSeats: number;
  maxActiveSeats: number;
  remaining: number;
  isFull: boolean;
}

const TIER_ORDER: TierId[] = [TIER.STARTER, TIER.PRO, TIER.PRO_MAX];

export async function countActiveSeats(tier: TierId): Promise<number> {
  return prisma.subscription.count({
    where: {
      tier: tier as SubscriptionTier,
      status: "ACTIVE",
    },
  });
}

export async function getTierCapacity(tier: TierId): Promise<TierCapacity> {
  const config = getTierConfig(tier);
  const activeSeats = await countActiveSeats(tier);
  const remaining = Math.max(0, config.maxActiveSeats - activeSeats);
  return {
    tier,
    activeSeats,
    maxActiveSeats: config.maxActiveSeats,
    remaining,
    isFull: remaining <= 0,
  };
}

export async function getAllTierCapacity(): Promise<TierCapacity[]> {
  return Promise.all(TIER_ORDER.map((t) => getTierCapacity(t)));
}

export async function assertTierHasCapacity(tier: TierId): Promise<TierCapacity> {
  const capacity = await getTierCapacity(tier);
  if (capacity.isFull) {
    const err = new Error(
      `Slot ${tier} penuh (${capacity.activeSeats}/${capacity.maxActiveSeats}). Masuk waitlist dulu.`
    );
    (err as Error & { code?: string; capacity?: TierCapacity }).code = "TIER_FULL";
    (err as Error & { capacity?: TierCapacity }).capacity = capacity;
    throw err;
  }
  return capacity;
}

export { TIER_CONFIG, TIER };
