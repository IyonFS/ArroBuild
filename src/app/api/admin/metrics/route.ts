import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { AdminAuthError, assertFounderAccess, ESTIMATED_COST_PER_CREDIT_IDR } from "@/lib/admin";

export async function GET() {
  try {
    await assertFounderAccess();
  } catch (err) {
    const status = err instanceof AdminAuthError ? 403 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Forbidden" },
      { status }
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeSubscriptions,
    revenueAllTime,
    revenueThisMonth,
    creditsConsumedMonth,
    paymentsByTier,
    ledgerByType,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { status: { in: ["SETTLEMENT", "PAID"] } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ["SETTLEMENT", "PAID"] },
        settledAt: { gte: monthStart },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.creditLedger.aggregate({
      where: {
        createdAt: { gte: monthStart },
        type: { in: ["GENERATE_DOCUMENT", "REVISION", "TOOL_USAGE"] },
      },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["tier"],
      where: { status: { in: ["SETTLEMENT", "PAID"] } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.creditLedger.groupBy({
      by: ["type"],
      where: { createdAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const creditsUsed = Math.abs(creditsConsumedMonth._sum.amount ?? 0);
  const estimatedAiCostIdr = Math.round(creditsUsed * ESTIMATED_COST_PER_CREDIT_IDR);
  const revenueMonthIdr = revenueThisMonth._sum.amount ?? 0;
  const grossMarginMonthIdr = revenueMonthIdr - estimatedAiCostIdr;
  const marginPct =
    revenueMonthIdr > 0
      ? Math.round((grossMarginMonthIdr / revenueMonthIdr) * 100)
      : 0;

  return NextResponse.json({
    generatedAt: now.toISOString(),
    users: { total: totalUsers, activeSubscriptions },
    revenue: {
      allTimeIdr: revenueAllTime._sum.amount ?? 0,
      paymentCount: revenueAllTime._count,
      thisMonthIdr: revenueMonthIdr,
      thisMonthPayments: revenueThisMonth._count,
      byTier: paymentsByTier.map((p) => ({
        tier: p.tier,
        totalIdr: p._sum.amount ?? 0,
        count: p._count,
      })),
    },
    credits: {
      consumedThisMonth: creditsUsed,
      estimatedAiCostIdr,
      ledgerByType: ledgerByType.map((e) => ({
        type: e.type,
        amount: e._sum.amount ?? 0,
        count: e._count,
      })),
    },
    margin: {
      grossMarginMonthIdr,
      marginPct,
      note: "Estimasi kasar — biaya AI per kredit dapat disesuaikan di lib/admin.ts",
    },
  });
}
