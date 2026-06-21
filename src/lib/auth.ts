import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import type { UserTier } from "@/lib/ai/prompts/shared";
import { getModelsForTier } from "@/lib/ai/prompts/shared";

const FREE_PROJECT_LIMIT = 1;

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
      subscription: {
        create: {
          tier: "FREE",
          status: "ACTIVE",
        },
      },
    },
    update: {
      email,
      name,
      avatarUrl,
    },
    include: { subscription: true },
  });
}

export function subscriptionToUserTier(tier: SubscriptionTier): UserTier {
  switch (tier) {
    case "STARTER":
    case "PRO":
      return "paid";
    case "UNLIMITED":
      return "unlimited";
    default:
      return "free";
  }
}

export async function getEffectiveTier(userId?: string | null): Promise<UserTier> {
  if (!userId) return "free";

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || subscription.status !== "ACTIVE") {
    return "free";
  }

  if (subscription.expiresAt && subscription.expiresAt < new Date()) {
    return "free";
  }

  return subscriptionToUserTier(subscription.tier);
}

export function isModelAllowedForTier(modelId: string, tier: UserTier): boolean {
  return getModelsForTier(tier).some((model) => model.id === modelId);
}

export async function assertCanGenerate(
  userId: string | null | undefined,
  tier: UserTier,
  modelId?: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (modelId && !isModelAllowedForTier(modelId, tier)) {
    return {
      ok: false,
      status: 403,
      error:
        "Model AI ini memerlukan paket berbayar. Upgrade akun kamu untuk mengakses model premium.",
    };
  }

  if (tier === "free" && userId) {
    const projectCount = await prisma.project.count({
      where: { userId },
    });

    if (projectCount >= FREE_PROJECT_LIMIT) {
      return {
        ok: false,
        status: 403,
        error:
          "Limit free tier tercapai (1 project). Upgrade ke Starter untuk generate lebih banyak.",
      };
    }
  }

  return { ok: true };
}

export async function getSessionProfile() {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return null;
  }

  const dbUser = await syncDbUser(supabaseUser);
  const tier = await getEffectiveTier(dbUser.id);

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
    tier,
    subscriptionTier: dbUser.subscription?.tier ?? "FREE",
    subscriptionStatus: dbUser.subscription?.status ?? "ACTIVE",
  };
}
