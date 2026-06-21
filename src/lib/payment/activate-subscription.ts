import { prisma } from "@/lib/db/prisma";

const SUBSCRIPTION_DAYS = 30;

export async function activateSubscriptionForOrder(orderId: string) {
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) {
    return { ok: false as const, error: "Payment not found" };
  }

  if (payment.status === "PAID") {
    return { ok: true as const, alreadyPaid: true };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DAYS);

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: "PAID" },
    }),
    prisma.subscription.upsert({
      where: { userId: payment.userId },
      create: {
        userId: payment.userId,
        tier: payment.tier,
        status: "ACTIVE",
        expiresAt,
      },
      update: {
        tier: payment.tier,
        status: "ACTIVE",
        expiresAt,
      },
    }),
  ]);

  return { ok: true as const, alreadyPaid: false };
}
