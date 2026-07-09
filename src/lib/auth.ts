import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import type { UserTier } from "@/lib/ai/prompts/shared";
import { getModelsForTier } from "@/lib/ai/prompts/shared";
import {
  getUserSubscriptionTier,
  tierToOrchestratorUserTier,
  resolveTierId,
  tierIdToUserPlan,
} from "@/lib/services/tier.service";
import { CreditService } from "@/lib/services/credit.service";
import { getTierConfig, TIER, type TierId } from "@/lib/config/tiers";

export async function getSupabaseUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function syncDbUser(supabaseUser: SupabaseUser) {
  const email = supabaseUser.email;
  if (!email) {
    throw new Error("Authenticated user is missing an email address");
  }

  const metadata = supabaseUser.user_metadata ?? {};
  const name =
    (metadata.full_name as string | undefined) ??
    (metadata.name as string | undefined);
  const avatarUrl = metadata.avatar_url as string | undefined;

  return prisma.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,
      email,
      name,
      avatarUrl,
      tier: TIER.STARTER,
      creditBalance: 0,
    },
    update: {
      email,
      name,
      avatarUrl,
    },
    include: { subscription: true },
  });
}

export function subscriptionToUserTier(tier: SubscriptionTier | null): UserTier {
  return tierToOrchestratorUserTier(tier);
}

export async function getEffectiveTier(userId?: string | null): Promise<UserTier> {
  if (!userId) return "free";
  const subscriptionTier = await getUserSubscriptionTier(userId);
  return subscriptionToUserTier(subscriptionTier);
}

export async function getActiveTierId(userId: string): Promise<TierId | null> {
  return resolveTierId(userId);
}

export function isModelAllowedForTier(modelId: string, tier: UserTier): boolean {
  return getModelsForTier(tier).some((model) => model.id === modelId);
}

export async function assertCanGenerate(
  userId: string | null | undefined,
  tier: UserTier,
  modelId?: string,
  estimatedCredits = 8
): Promise<{ ok: true; tierId: TierId } | { ok: false; status: number; error: string }> {
  if (!userId) {
    return {
      ok: false,
      status: 401,
      error: "Login wajib untuk generate dokumen. Silakan masuk atau daftar terlebih dahulu.",
    };
  }

  const tierId = await resolveTierId(userId);
  if (!tierId) {
    return {
      ok: false,
      status: 402,
      error:
        "Paket berlangganan belum aktif. Pilih Starter, Pro, atau Pro Max untuk mulai generate.",
    };
  }

  if (modelId && !isModelAllowedForTier(modelId, tier)) {
    return {
      ok: false,
      status: 403,
      error:
        "Model AI ini memerlukan paket berbayar. Upgrade akun kamu untuk mengakses model premium.",
    };
  }

  const config = getTierConfig(tierId);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyCount = await prisma.project.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
      status: { not: "FAILED" },
    },
  });

  if (monthlyCount >= config.maxProjectsPerMonth) {
    return {
      ok: false,
      status: 429,
      error: `Kuota bulanan tercapai (${config.maxProjectsPerMonth} proyek/bulan).`,
    };
  }

  const balance = await CreditService.getBalance(userId);
  if (balance.current < estimatedCredits) {
    return {
      ok: false,
      status: 402,
      error: `Kredit tidak cukup. Dibutuhkan ~${estimatedCredits}, tersedia ${balance.current}.`,
    };
  }

  return { ok: true, tierId };
}

export async function getSessionProfile() {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return null;
  }

  const dbUser = await syncDbUser(supabaseUser);
  const tier = await getEffectiveTier(dbUser.id);
  const tierId = await resolveTierId(dbUser.id);
  const creditBalance = dbUser.creditBalance;
  const plan = tierIdToUserPlan(tierId);

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
    tier,
    plan,
    tierId,
    creditBalance,
    subscriptionTier: dbUser.subscription?.tier ?? null,
    subscriptionStatus: dbUser.subscription?.status ?? null,
    hasActiveSubscription: tierId !== null,
  };
}
