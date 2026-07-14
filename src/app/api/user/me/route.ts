import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { getTierConfig } from "@/lib/config/tiers";
import { getDashboardQuota } from "@/lib/ai/tier-enforcer";
import { tierIdToUserPlan, resolveTierId } from "@/lib/services/tier.service";
import { getRevisionQuota, getWhatsappQuota } from "@/lib/services/tier-capabilities";

export async function GET() {
  const profile = await getSessionProfile();

  if (!profile) {
    return NextResponse.json({ user: null, tier: "none" as const, plan: "none" as const });
  }

  const projects = await prisma.project.findMany({
    where: { userId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      idea: true,
      status: true,
      createdAt: true,
      clarifications: true,
      presets: true,
      planData: true,
      _count: { select: { files: true } },
    },
  });

  const tierId = await resolveTierId(profile.id);
  const tierConfig = tierId ? getTierConfig(tierId) : null;
  const planSlug = tierIdToUserPlan(tierId);
  const quota = profile.id
    ? await getDashboardQuota(profile.id, planSlug)
    : {
        monthlyUsed: 0,
        monthlyLimit: 0,
        monthlyRemaining: 0,
        dailyUsed: 0,
        dailyLimit: 0,
        dailyRemaining: 0,
      };
  const revisionQuota = profile.id ? await getRevisionQuota(profile.id) : null;
  const whatsappQuota = profile.id ? await getWhatsappQuota(profile.id) : null;

  return NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      subscriptionTier: profile.subscriptionTier,
      subscriptionStatus: profile.subscriptionStatus,
      creditBalance: profile.creditBalance,
      hasActiveSubscription: profile.hasActiveSubscription,
    },
    tier: planSlug,
    plan: planSlug,
    projectCount: projects.length,
    projectLimit: quota.monthlyLimit,
    monthlyProjectCount: quota.monthlyUsed,
    monthlyProjectLimit: quota.monthlyLimit,
    monthlyProjectRemaining: quota.monthlyRemaining,
    dailyProjectCount: quota.dailyUsed,
    dailyProjectLimit: quota.dailyLimit,
    dailyProjectRemaining: quota.dailyRemaining,
    creditPool: tierConfig?.creditsPerMonth ?? 0,
    canForkProject: tierConfig?.canForkProject ?? false,
    revisionQuota: revisionQuota
      ? {
          freeRemaining: revisionQuota.freeRemaining,
          hasFreeRevision: revisionQuota.hasFreeRevision,
          unlimited: revisionQuota.unlimitedCount,
        }
      : null,
    whatsappQuota: whatsappQuota
      ? {
          limit: whatsappQuota.limit,
          used: whatsappQuota.used,
          remaining: whatsappQuota.remaining,
          available: whatsappQuota.available,
          priority: whatsappQuota.priority,
        }
      : null,
    projects,
  });
}
