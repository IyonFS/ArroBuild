import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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
      _count: { select: { files: true } },
    },
  });

  const projectLimit = profile.hasActiveSubscription
    ? null
    : 0;

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
    tier: profile.plan,
    plan: profile.plan,
    projectCount: projects.length,
    projectLimit,
    projects,
  });
}
