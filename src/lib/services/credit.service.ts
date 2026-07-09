import type { CreditLedgerType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  getTierConfig,
  estimateCreditsPerDocument,
  type ModelClassId,
} from "@/lib/config/tiers";
import { logger } from "@/lib/logger";

export interface CreditReservation {
  reservationId: string;
  balanceAfter: number;
  message: string;
}

export interface CreditCommit {
  transactionId: string;
  balanceAfter: number;
  actualCreditsUsed: number;
}

export interface CreditBalance {
  current: number;
  available: number;
  reserved: number;
  reserved_for: { projectId: string; amount: number }[];
}

export class CreditServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "CreditServiceError";
  }
}

async function sumLedgerBalance(
  userId: string,
  tx: Prisma.TransactionClient = prisma
) {
  const result = await tx.creditLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export const CreditService = {
  async reserveCredit(
    userId: string,
    estimatedCreditsNeeded: number,
    projectId: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditReservation> {
    try {
      return await prisma.$transaction(
        async (tx) => {
          await tx.user.findUniqueOrThrow({ where: { id: userId } });

          const currentBalance = await sumLedgerBalance(userId, tx);

          if (currentBalance < estimatedCreditsNeeded) {
            throw new CreditServiceError(
              "INSUFFICIENT_CREDITS",
              `Kredit tidak cukup. Dibutuhkan ${estimatedCreditsNeeded}, tersedia ${currentBalance}`,
              402
            );
          }

          const reservationEntry = await tx.creditLedger.create({
            data: {
              userId,
              type: "RESERVATION_HOLD" as CreditLedgerType,
              amount: -estimatedCreditsNeeded,
              projectId,
              balanceAfter: currentBalance - estimatedCreditsNeeded,
              metadata: {
                ...metadata,
                estimatedCreditsNeeded,
                reason: "reserve_for_generate",
              },
            },
          });

          logger.info("credit_reserved", {
            userId,
            projectId,
            estimatedCredits: estimatedCreditsNeeded,
            balanceAfter: reservationEntry.balanceAfter,
            reservationId: reservationEntry.id,
          });

          return {
            reservationId: reservationEntry.id,
            balanceAfter: reservationEntry.balanceAfter,
            message: `Reserved ${estimatedCreditsNeeded} credits`,
          };
        },
        {
          isolationLevel: "Serializable",
          maxWait: 5000,
          timeout: 30000,
        }
      );
    } catch (error) {
      logger.error("credit_reserve_failed", {
        userId,
        projectId,
        estimatedCredits: estimatedCreditsNeeded,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  async commitCredit(
    userId: string,
    reservationId: string,
    projectId: string,
    documentsGenerated: Array<{
      fileKey: string;
      modelClass: ModelClassId;
      tokensUsed: number;
    }>,
    metadata?: Record<string, unknown>
  ): Promise<CreditCommit> {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const reservation = await tx.creditLedger.findUniqueOrThrow({
            where: { id: reservationId },
          });

          if (reservation.type !== "RESERVATION_HOLD") {
            throw new CreditServiceError(
              "INVALID_RESERVATION",
              `Reservation ${reservationId} bukan RESERVATION_HOLD`,
              400
            );
          }

          if (reservation.userId !== userId) {
            throw new CreditServiceError(
              "RESERVATION_MISMATCH",
              `Reservation ${reservationId} bukan milik user ${userId}`,
              403
            );
          }

          let actualCreditsUsed = 0;
          for (const doc of documentsGenerated) {
            actualCreditsUsed += estimateCreditsPerDocument(doc.tokensUsed, doc.modelClass);
          }

          const holdedCredits = Math.abs(reservation.amount);
          const sumBalance = await sumLedgerBalance(userId, tx);

          if (actualCreditsUsed > holdedCredits) {
            throw new CreditServiceError(
              "CREDIT_OVERCHARGE",
              `Kredit terpakai (${actualCreditsUsed}) melebihi hold (${holdedCredits})`,
              500
            );
          }

          const generateEntry = await tx.creditLedger.create({
            data: {
              userId,
              type: "GENERATE_DOCUMENT" as CreditLedgerType,
              amount: -actualCreditsUsed,
              projectId,
              balanceAfter: sumBalance - actualCreditsUsed,
              metadata: {
                ...metadata,
                documentsGenerated,
                reservationId,
              },
            },
          });

          const surplus = holdedCredits - actualCreditsUsed;
          let finalBalance = generateEntry.balanceAfter;

          if (surplus > 0) {
            const releaseEntry = await tx.creditLedger.create({
              data: {
                userId,
                type: "RESERVATION_RELEASE" as CreditLedgerType,
                amount: surplus,
                projectId,
                balanceAfter: generateEntry.balanceAfter + surplus,
                metadata: {
                  reservationId,
                  holdedCredits,
                  actualCreditsUsed,
                  surplus,
                  reason: "release_surplus_from_reservation",
                },
              },
            });
            finalBalance = releaseEntry.balanceAfter;
          }

          await tx.user.update({
            where: { id: userId },
            data: { creditBalance: finalBalance },
          });

          logger.info("credit_committed", {
            userId,
            projectId,
            reservationId,
            actualCreditsUsed,
            finalBalance,
          });

          return {
            transactionId: generateEntry.id,
            balanceAfter: finalBalance,
            actualCreditsUsed,
          };
        },
        {
          isolationLevel: "Serializable",
          maxWait: 5000,
          timeout: 30000,
        }
      );
    } catch (error) {
      logger.error("credit_commit_failed", {
        userId,
        reservationId,
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  async commitRevision(
    userId: string,
    reservationId: string,
    projectId: string,
    actualCreditsUsed: number,
    metadata?: Record<string, unknown>
  ): Promise<CreditCommit> {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const reservation = await tx.creditLedger.findUniqueOrThrow({
            where: { id: reservationId },
          });

          if (reservation.type !== "RESERVATION_HOLD") {
            throw new CreditServiceError(
              "INVALID_RESERVATION",
              `Reservation ${reservationId} bukan RESERVATION_HOLD`,
              400
            );
          }

          if (reservation.userId !== userId) {
            throw new CreditServiceError(
              "RESERVATION_MISMATCH",
              `Reservation ${reservationId} bukan milik user ${userId}`,
              403
            );
          }

          const holdedCredits = Math.abs(reservation.amount);
          const used = Math.min(Math.max(actualCreditsUsed, 1), holdedCredits);
          const sumBalance = await sumLedgerBalance(userId, tx);

          const revisionEntry = await tx.creditLedger.create({
            data: {
              userId,
              type: "REVISION" as CreditLedgerType,
              amount: -used,
              projectId,
              balanceAfter: sumBalance - used,
              metadata: {
                ...metadata,
                reservationId,
                holdedCredits,
              },
            },
          });

          const surplus = holdedCredits - used;
          let finalBalance = revisionEntry.balanceAfter;

          if (surplus > 0) {
            const releaseEntry = await tx.creditLedger.create({
              data: {
                userId,
                type: "RESERVATION_RELEASE" as CreditLedgerType,
                amount: surplus,
                projectId,
                balanceAfter: revisionEntry.balanceAfter + surplus,
                metadata: {
                  reservationId,
                  reason: "revision_surplus_release",
                },
              },
            });
            finalBalance = releaseEntry.balanceAfter;
          }

          await tx.user.update({
            where: { id: userId },
            data: { creditBalance: finalBalance },
          });

          logger.info("revision_credit_committed", {
            userId,
            projectId,
            reservationId,
            actualCreditsUsed: used,
            finalBalance,
          });

          return {
            transactionId: revisionEntry.id,
            balanceAfter: finalBalance,
            actualCreditsUsed: used,
          };
        },
        {
          isolationLevel: "Serializable",
          maxWait: 5000,
          timeout: 30000,
        }
      );
    } catch (error) {
      logger.error("revision_credit_commit_failed", {
        userId,
        reservationId,
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  async releaseReservation(
    userId: string,
    reservationId: string,
    reason = "generation_failed"
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const reservation = await tx.creditLedger.findUniqueOrThrow({
        where: { id: reservationId },
      });

      if (reservation.type !== "RESERVATION_HOLD") {
        throw new Error(`${reservationId} bukan RESERVATION_HOLD`);
      }

      const holdedAmount = Math.abs(reservation.amount);
      const newBalance = reservation.balanceAfter + holdedAmount;

      await tx.creditLedger.create({
        data: {
          userId,
          type: "RESERVATION_RELEASE" as CreditLedgerType,
          amount: holdedAmount,
          projectId: reservation.projectId,
          balanceAfter: newBalance,
          metadata: { reservationId, reason },
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: newBalance },
      });

      logger.info("credit_released", { userId, reservationId, reason });
    });
  },

  async getBalance(userId: string): Promise<CreditBalance> {
    const ledger = await prisma.creditLedger.findMany({
      where: { userId },
      select: { amount: true, type: true, projectId: true },
    });

    const current = ledger.reduce((sum, entry) => sum + entry.amount, 0);
    const reservedEntries = ledger.filter((e) => e.type === "RESERVATION_HOLD");
    const reserved = Math.abs(
      reservedEntries.reduce((sum, e) => sum + e.amount, 0)
    );

    return {
      current,
      available: current,
      reserved,
      reserved_for: reservedEntries.map((e) => ({
        projectId: e.projectId || "unknown",
        amount: Math.abs(e.amount),
      })),
    };
  },

  async refreshMonthlyCredits(userId: string, paymentId?: string): Promise<void> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const config = getTierConfig(user.tier);
    const currentBalance = await sumLedgerBalance(userId);

    await prisma.$transaction(async (tx) => {
      await tx.creditLedger.create({
        data: {
          userId,
          type: "MONTHLY_REFRESH",
          amount: config.creditsPerMonth,
          paymentId,
          balanceAfter: currentBalance + config.creditsPerMonth,
          metadata: {
            tier: user.tier,
            creditsPerMonth: config.creditsPerMonth,
          },
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: currentBalance + config.creditsPerMonth },
      });
    });

    logger.info("monthly_credits_refreshed", {
      userId,
      tier: user.tier,
      creditsAdded: config.creditsPerMonth,
    });
  },

  async applyRollover(userId: string): Promise<number> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const config = getTierConfig(user.tier);
    const balance = await this.getBalance(userId);
    const rolloverAmount = Math.min(Math.max(balance.current, 0), config.rolloverMax);

    if (rolloverAmount > 0) {
      const currentBalance = await sumLedgerBalance(userId);
      await prisma.creditLedger.create({
        data: {
          userId,
          type: "ROLLOVER",
          amount: rolloverAmount,
          balanceAfter: currentBalance + rolloverAmount,
          metadata: { tier: user.tier, rolloverMax: config.rolloverMax },
        },
      });
      logger.info("rollover_applied", { userId, amount: rolloverAmount });
    }

    return rolloverAmount;
  },

  async adjustCredits(
    userId: string,
    amount: number,
    reason: string,
    adminUserId?: string
  ): Promise<CreditCommit> {
    const currentBalance = await sumLedgerBalance(userId);
    const newBalance = currentBalance + amount;

    const entry = await prisma.creditLedger.create({
      data: {
        userId,
        type: "MANUAL_ADJUSTMENT",
        amount,
        balanceAfter: newBalance,
        metadata: { reason, adminUserId },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { creditBalance: newBalance },
    });

    return {
      transactionId: entry.id,
      balanceAfter: newBalance,
      actualCreditsUsed: amount,
    };
  },
};
