import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { CreditService } from "@/lib/services/credit.service";
import { getTierConfigForUser } from "@/lib/services/tier.service";

export async function GET() {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  const [balance, tierConfig] = await Promise.all([
    CreditService.getBalance(profile.id),
    getTierConfigForUser(profile.id),
  ]);

  return NextResponse.json({
    creditBalance: balance.current,
    availableCredits: balance.available,
    reservedCredits: balance.reserved,
    tierId: profile.tierId,
    hasActiveSubscription: profile.hasActiveSubscription,
    creditsPerMonth: tierConfig?.creditsPerMonth ?? null,
    maxProjectsPerMonth: tierConfig?.maxProjectsPerMonth ?? null,
  });
}
