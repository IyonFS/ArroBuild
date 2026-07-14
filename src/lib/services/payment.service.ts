import type { PaymentStatus, CreditLedgerType, SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getTierConfig, parseBillingMonthsFromOrderId, PRO_MAX_FIRST_MONTH_BONUS } from "@/lib/config/tiers";
import { createSnapToken, isSuccessfulTransactionStatus, getTransactionStatus, verifyWebhookSignature } from "@/lib/midtrans";
import { logger } from "@/lib/logger";
import { CreditService } from "@/lib/services/credit.service";
import { getCreditTopupPack } from "@/lib/config/tiers";

export interface MidtransWebhookPayload {
  order_id: string;
  transaction_id?: string;
  gross_amount: string;
  transaction_status: string;
  status_code?: string;
  signature_key?: string;
}

export class PaymentServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "PaymentServiceError";
  }
}

const SUBSCRIPTION_DAYS = 30;

function mapTransactionStatus(status: string): PaymentStatus {
  switch (status) {
    case "settlement":
      return "SETTLEMENT";
    case "capture":
      return "CAPTURE";
    case "deny":
      return "DENY";
    case "cancel":
      return "CANCEL";
    case "expire":
      return "EXPIRE";
    case "failure":
      return "FAILED";
    default:
      return "PENDING";
  }
}

export const PaymentService = {
  async createPaymentSnap(params: {
    userId: string;
    email: string;
    name?: string | null;
    tierSlug: string;
    amount: number;
    subscriptionTier: SubscriptionTier;
    billingMonths?: number;
  }) {
    const months = params.billingMonths ?? 1;
    const monthTag = months > 1 ? `m${months}-` : "";
    const orderId = `arro-${params.userId.slice(0, 8)}-${params.tierSlug}-${monthTag}${Date.now()}`;

    const { token: snapToken, redirectUrl } = await createSnapToken({
      orderId,
      amount: params.amount,
      tierId: params.tierSlug as "starter" | "pro" | "pro_max",
      customer: { email: params.email, name: params.name },
    });

    await prisma.payment.create({
      data: {
        orderId,
        userId: params.userId,
        tier: params.subscriptionTier,
        amount: params.amount,
        snapToken,
        status: "PENDING",
      },
    });

    logger.info("snap_token_created", {
      userId: params.userId,
      tier: params.subscriptionTier,
      orderId,
      amount: params.amount,
    });

    return { snapToken, orderId, redirectUrl };
  },

  async createTopupSnap(params: {
    userId: string;
    email: string;
    name?: string | null;
    packId: string;
    subscriptionTier: SubscriptionTier;
  }) {
    const pack = getCreditTopupPack(params.packId);
    if (!pack) {
      throw new PaymentServiceError("INVALID_PACK", "Paket top-up tidak valid", 422);
    }

    const orderId = `arro-topup-${params.userId.slice(0, 8)}-${pack.credits}-${Date.now()}`;

    const { token: snapToken, redirectUrl } = await createSnapToken({
      orderId,
      amount: pack.priceIdr,
      tierId: "starter",
      customer: { email: params.email, name: params.name },
      itemName: pack.label,
    });

    await prisma.payment.create({
      data: {
        orderId,
        userId: params.userId,
        tier: params.subscriptionTier,
        amount: pack.priceIdr,
        snapToken,
        status: "PENDING",
      },
    });

    logger.info("topup_snap_created", {
      userId: params.userId,
      packId: params.packId,
      credits: pack.credits,
      orderId,
    });

    return { snapToken, orderId, redirectUrl, credits: pack.credits };
  },

  parseTopupCreditsFromOrderId(orderId: string): number | null {
    if (!orderId.startsWith("arro-topup-")) return null;
    const parts = orderId.split("-");
    const credits = parseInt(parts[3] ?? "", 10);
    return Number.isFinite(credits) && credits > 0 ? credits : null;
  },

  async handleWebhook(payload: MidtransWebhookPayload): Promise<{ status: string; message: string }> {
    const orderId = payload.order_id;
    const transactionStatus = payload.transaction_status ?? "";
    const statusCode = payload.status_code ?? "";
    const grossAmount = payload.gross_amount ?? "";
    const signatureKey = payload.signature_key ?? "";

    if (!orderId) {
      throw new PaymentServiceError("MISSING_ORDER_ID", "Missing order_id", 400);
    }

    if (!signatureKey || !statusCode || !grossAmount) {
      throw new PaymentServiceError(
        "MISSING_SIGNATURE",
        "Webhook signature fields wajib ada",
        401
      );
    }

    const valid = verifyWebhookSignature({
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
    });

    if (!valid) {
      logger.warn("webhook_signature_invalid", { orderId });
      throw new PaymentServiceError("INVALID_SIGNATURE", "Webhook signature invalid", 401);
    }

    const existingEvent = await prisma.paymentEvent.findUnique({
      where: { orderId },
    });

    if (existingEvent) {
      return {
        status: "success",
        message: "Payment event already processed (idempotent)",
      };
    }

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { orderId } });
      if (!payment) {
        throw new PaymentServiceError("PAYMENT_NOT_FOUND", "Payment not found", 404);
      }

      if (parseInt(grossAmount, 10) !== payment.amount) {
        throw new PaymentServiceError(
          "AMOUNT_MISMATCH",
          `Amount mismatch: expected ${payment.amount}, got ${grossAmount}`,
          400
        );
      }

      const paymentEvent = await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          orderId,
          rawPayload: payload as object,
          signatureValid: true,
          signature: signatureKey,
          processedAt: new Date(),
        },
      });

      const newStatus = mapTransactionStatus(transactionStatus);

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccessfulTransactionStatus(transactionStatus) ? "SETTLEMENT" : newStatus,
          midtransId: payload.transaction_id,
          settledAt: isSuccessfulTransactionStatus(transactionStatus) ? new Date() : undefined,
        },
      });

      if (isSuccessfulTransactionStatus(transactionStatus)) {
        const topupCredits = PaymentService.parseTopupCreditsFromOrderId(orderId);

        if (topupCredits) {
          await CreditService.topupCredits(payment.userId, topupCredits, payment.id, {
            paymentEventId: paymentEvent.id,
            orderId,
            reason: "topup_settlement",
          });

          logger.info("webhook_topup_processed", {
            orderId,
            userId: payment.userId,
            creditsAdded: topupCredits,
          });
        } else {
        const now = new Date();
        const billingMonths = parseBillingMonthsFromOrderId(orderId);
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DAYS * billingMonths);
        const config = getTierConfig(payment.tier);

        const priorProMaxPayments = await tx.payment.count({
          where: {
            userId: payment.userId,
            tier: "PRO_MAX",
            status: { in: ["SETTLEMENT", "PAID"] },
            id: { not: payment.id },
          },
        });
        const firstProMaxBonus =
          payment.tier === "PRO_MAX" && priorProMaxPayments === 0
            ? PRO_MAX_FIRST_MONTH_BONUS
            : 0;
        const creditsToAdd = config.creditsPerMonth + firstProMaxBonus;

        await tx.subscription.upsert({
          where: { userId: payment.userId },
          create: {
            userId: payment.userId,
            tier: payment.tier,
            status: "ACTIVE",
            startDate: now,
            renewalDate: expiresAt,
            expiresAt,
          },
          update: {
            tier: payment.tier,
            status: "ACTIVE",
            startDate: now,
            renewalDate: expiresAt,
            expiresAt,
          },
        });

        const currentBalance = await tx.creditLedger.aggregate({
          where: { userId: payment.userId },
          _sum: { amount: true },
        });
        const balance = currentBalance._sum.amount ?? 0;

        await tx.creditLedger.create({
          data: {
            userId: payment.userId,
            type: "MONTHLY_REFRESH" as CreditLedgerType,
            amount: creditsToAdd,
            paymentId: payment.id,
            balanceAfter: balance + creditsToAdd,
            metadata: {
              paymentEventId: paymentEvent.id,
              tier: payment.tier,
              reason: "payment_settlement",
              billingMonths,
              firstProMaxBonus,
            },
          },
        });

        await tx.user.update({
          where: { id: payment.userId },
          data: {
            tier: payment.tier,
            creditBalance: balance + creditsToAdd,
          },
        });

        logger.info("webhook_settlement_processed", {
          orderId,
          userId: payment.userId,
          tier: payment.tier,
          creditsAdded: creditsToAdd,
          billingMonths,
          firstProMaxBonus,
        });
        }
      } else if (["deny", "cancel", "expire", "failure"].includes(transactionStatus)) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: newStatus === "PENDING" ? "FAILED" : newStatus },
        });
      }

      return {
        status: "success",
        message: `Payment processed: ${transactionStatus}`,
      };
    });
  },

  async processExpiredSubscriptions(): Promise<number> {
    const now = new Date();
    const expired = await prisma.subscription.findMany({
      where: { expiresAt: { lt: now }, status: "ACTIVE" },
    });

    let count = 0;
    for (const sub of expired) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "EXPIRED" },
      });
      count++;
      logger.info("subscription_expired_processed", {
        userId: sub.userId,
        subscriptionId: sub.id,
      });
    }

    return count;
  },

  async processMonthlyCreditRenewals(): Promise<number> {
    const now = new Date();
    const activeSubs = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      include: { user: true },
    });

    let refreshed = 0;
    for (const sub of activeSubs) {
      const lastRefresh = await prisma.creditLedger.findFirst({
        where: { userId: sub.userId, type: "MONTHLY_REFRESH" },
        orderBy: { createdAt: "desc" },
      });

      const daysSince = lastRefresh
        ? (now.getTime() - lastRefresh.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      if (daysSince < 28) continue;

      await CreditService.applyRollover(sub.userId);
      await CreditService.refreshMonthlyCredits(sub.userId);

      const nextRenewal = new Date(now);
      nextRenewal.setDate(nextRenewal.getDate() + SUBSCRIPTION_DAYS);
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { renewalDate: nextRenewal },
      });

      refreshed++;
      logger.info("subscription_monthly_refresh", { userId: sub.userId, tier: sub.tier });
    }

    return refreshed;
  },
};

// Keep legacy helper for confirm route (localhost without webhook)
export async function activateSubscriptionForOrder(orderId: string) {
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) return { ok: false as const, error: "Payment not found" };
  if (payment.status === "SETTLEMENT" || payment.status === "PAID") {
    return { ok: true as const, alreadyPaid: true };
  }

  const tx = await getTransactionStatus(orderId);
  if (!tx || !isSuccessfulTransactionStatus(tx.transaction_status)) {
    return { ok: false as const, error: "Payment belum settlement" };
  }

  if (!tx.signature_key) {
    return { ok: false as const, error: "Signature tidak tersedia dari Midtrans" };
  }

  await PaymentService.handleWebhook({
    order_id: tx.order_id,
    transaction_id: tx.order_id,
    gross_amount: tx.gross_amount,
    transaction_status: tx.transaction_status,
    status_code: tx.status_code,
    signature_key: tx.signature_key,
  });

  return { ok: true as const, alreadyPaid: false };
}
