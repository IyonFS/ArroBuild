import type { CreditLedgerType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getTierConfig, estimateCreditsPerDocument, type ModelClassId } from "@/lib/config/tiers";
import { logger } from "@/lib/logger";
import {
  assertOwnedReservation,
  calculateReservationSettlement,
  CreditServiceError,
  reservationIdFromMetadata,
} from "@/lib/services/credit-ledger";

export { CreditServiceError } from "@/lib/services/credit-ledger";

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

async function sumLedgerBalance(userId: string, tx: Prisma.TransactionClient = prisma) {
  const result = await tx.creditLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

async function findReservationRelease(
  tx: Prisma.TransactionClient,
  userId: string,
  reservationId: string,
) {
  return tx.creditLedger.findFirst({
    where: {
      userId,
      type: "RESERVATION_RELEASE",
      metadata: { path: ["reservationId"], equals: reservationId },
    },
    select: { id: true },
  });
}

export const CreditService = {
  async reserveCredit(
    userId: string,
    estimatedCreditsNeeded: number,
    projectId: string,
    metadata?: Record<string, unknown>,
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
              402,
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
        },
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
      promptVersion?: string;
      modelRoute?: string;
      tokensUsed: number;
    }>,
    metadata?: Record<string, unknown>,
  ): Promise<CreditCommit> {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const reservation = await tx.creditLedger.findUniqueOrThrow({
            where: { id: reservationId },
          });
          const holdedCredits = assertOwnedReservation(reservation, userId, projectId);

          if (await findReservationRelease(tx, userId, reservationId)) {
            throw new CreditServiceError(
              "RESERVATION_SETTLED",
              "Reservation sudah diselesaikan",
              409,
            );
          }

          let actualCreditsUsed = 0;
          for (const doc of documentsGenerated) {
            actualCreditsUsed += estimateCreditsPerDocument(doc.tokensUsed, doc.modelClass);
          }

          const sumBalance = await sumLedgerBalance(userId, tx);
          const settlement = calculateReservationSettlement(
            sumBalance,
            holdedCredits,
            actualCreditsUsed,
          );

          const generateEntry = await tx.creditLedger.create({
            data: {
              userId,
              type: "GENERATE_DOCUMENT" as CreditLedgerType,
              amount: -actualCreditsUsed,
              projectId,
              balanceAfter: settlement.chargeBalanceAfter,
              metadata: {
                ...metadata,
                documentsGenerated,
                reservationId,
              },
            },
          });

          const releaseEntry = await tx.creditLedger.create({
            data: {
              userId,
              type: "RESERVATION_RELEASE" as CreditLedgerType,
              amount: settlement.releaseAmount,
              projectId,
              balanceAfter: settlement.finalBalance,
              metadata: {
                reservationId,
                holdedCredits,
                actualCreditsUsed,
                surplus: settlement.surplus,
                reason: "settle_generation_reservation",
              },
            },
          });
          const finalBalance = releaseEntry.balanceAfter;

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
        },
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
    metadata?: Record<string, unknown>,
  ): Promise<CreditCommit> {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const reservation = await tx.creditLedger.findUniqueOrThrow({
            where: { id: reservationId },
          });
          const holdedCredits = assertOwnedReservation(reservation, userId, projectId);

          if (await findReservationRelease(tx, userId, reservationId)) {
            throw new CreditServiceError(
              "RESERVATION_SETTLED",
              "Reservation sudah diselesaikan",
              409,
            );
          }

          const used = Math.min(Math.max(actualCreditsUsed, 1), holdedCredits);
          const sumBalance = await sumLedgerBalance(userId, tx);
          const settlement = calculateReservationSettlement(sumBalance, holdedCredits, used);

          const revisionEntry = await tx.creditLedger.create({
            data: {
              userId,
              type: "REVISION" as CreditLedgerType,
              amount: -used,
              projectId,
              balanceAfter: settlement.chargeBalanceAfter,
              metadata: {
                ...metadata,
                reservationId,
                holdedCredits,
              },
            },
          });

          const releaseEntry = await tx.creditLedger.create({
            data: {
              userId,
              type: "RESERVATION_RELEASE" as CreditLedgerType,
              amount: settlement.releaseAmount,
              projectId,
              balanceAfter: settlement.finalBalance,
              metadata: {
                reservationId,
                holdedCredits,
                actualCreditsUsed: used,
                surplus: settlement.surplus,
                reason: "settle_revision_reservation",
              },
            },
          });
          const finalBalance = releaseEntry.balanceAfter;

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
        },
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

  async commitFreeRevision(
    userId: string,
    projectId: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditCommit> {
    const sumBalance = await sumLedgerBalance(userId);

    const revisionEntry = await prisma.creditLedger.create({
      data: {
        userId,
        type: "REVISION" as CreditLedgerType,
        amount: 0,
        projectId,
        balanceAfter: sumBalance,
        metadata: {
          ...metadata,
          freeRevision: true,
        },
      },
    });

    logger.info("revision_free_committed", {
      userId,
      projectId,
      transactionId: revisionEntry.id,
    });

    return {
      transactionId: revisionEntry.id,
      balanceAfter: sumBalance,
      actualCreditsUsed: 0,
    };
  },

  async commitToolReservation(
    userId: string,
    reservationId: string,
    toolId: string,
    actualCreditsUsed: number,
    metadata?: Record<string, unknown>,
  ): Promise<CreditCommit> {
    return prisma.$transaction(
      async (tx) => {
        const reservation = await tx.creditLedger.findUniqueOrThrow({
          where: { id: reservationId },
        });
        const holdedCredits = assertOwnedReservation(reservation, userId);

        if (await findReservationRelease(tx, userId, reservationId)) {
          throw new CreditServiceError(
            "RESERVATION_SETTLED",
            "Reservation sudah diselesaikan",
            409,
          );
        }

        const currentBalance = await sumLedgerBalance(userId, tx);
        const settlement = calculateReservationSettlement(
          currentBalance,
          holdedCredits,
          actualCreditsUsed,
        );

        const usageEntry = await tx.creditLedger.create({
          data: {
            userId,
            type: "TOOL_USAGE" as CreditLedgerType,
            amount: -actualCreditsUsed,
            projectId: reservation.projectId,
            toolId,
            balanceAfter: settlement.chargeBalanceAfter,
            metadata: {
              ...metadata,
              tool: toolId,
              reservationId,
              holdedCredits,
            } as Prisma.InputJsonValue,
          },
        });

        await tx.creditLedger.create({
          data: {
            userId,
            type: "RESERVATION_RELEASE" as CreditLedgerType,
            amount: settlement.releaseAmount,
            projectId: reservation.projectId,
            balanceAfter: settlement.finalBalance,
            metadata: {
              reservationId,
              holdedCredits,
              actualCreditsUsed,
              surplus: settlement.surplus,
              reason: "settle_tool_reservation",
            },
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { creditBalance: settlement.finalBalance },
        });

        logger.info("tool_reservation_committed", {
          userId,
          toolId,
          reservationId,
          actualCreditsUsed,
          finalBalance: settlement.finalBalance,
        });

        return {
          transactionId: usageEntry.id,
          balanceAfter: settlement.finalBalance,
          actualCreditsUsed,
        };
      },
      {
        isolationLevel: "Serializable",
        maxWait: 5000,
        timeout: 30000,
      },
    );
  },

  async releaseReservation(
    userId: string,
    reservationId: string,
    reason = "generation_failed",
  ): Promise<void> {
    await prisma.$transaction(
      async (tx) => {
        const reservation = await tx.creditLedger.findUniqueOrThrow({
          where: { id: reservationId },
        });
        const holdedAmount = assertOwnedReservation(reservation, userId);

        if (await findReservationRelease(tx, userId, reservationId)) return;

        const currentBalance = await sumLedgerBalance(userId, tx);
        const newBalance = currentBalance + holdedAmount;

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
      },
      {
        isolationLevel: "Serializable",
        maxWait: 5000,
        timeout: 30000,
      },
    );
  },

  async getBalance(userId: string): Promise<CreditBalance> {
    const ledger = await prisma.creditLedger.findMany({
      where: { userId },
      select: { id: true, amount: true, type: true, projectId: true, metadata: true },
    });

    const current = ledger.reduce((sum, entry) => sum + entry.amount, 0);
    const releasedReservationIds = new Set(
      ledger
        .filter((entry) => entry.type === "RESERVATION_RELEASE")
        .map((entry) => reservationIdFromMetadata(entry.metadata))
        .filter((id): id is string => id !== null),
    );
    const reservedEntries = ledger.filter(
      (entry) => entry.type === "RESERVATION_HOLD" && !releasedReservationIds.has(entry.id),
    );
    const reserved = Math.abs(reservedEntries.reduce((sum, e) => sum + e.amount, 0));

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

  async chargeToolCredits(
    userId: string,
    credits: number,
    toolId: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditCommit> {
    const currentBalance = await sumLedgerBalance(userId);
    if (currentBalance < credits) {
      throw new CreditServiceError(
        "INSUFFICIENT_CREDITS",
        `Kredit tidak cukup. Dibutuhkan ${credits}, tersedia ${currentBalance}`,
        402,
      );
    }

    const newBalance = currentBalance - credits;
    const entry = await prisma.creditLedger.create({
      data: {
        userId,
        type: "TOOL_USAGE",
        amount: -credits,
        balanceAfter: newBalance,
        metadata: {
          tool: toolId,
          ...(metadata ?? {}),
        } as Prisma.InputJsonValue,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { creditBalance: newBalance },
    });

    logger.info("tool_credits_charged", { userId, toolId, credits, balanceAfter: newBalance });

    return {
      transactionId: entry.id,
      balanceAfter: newBalance,
      actualCreditsUsed: credits,
    };
  },

  async topupCredits(
    userId: string,
    credits: number,
    paymentId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditCommit> {
    const currentBalance = await sumLedgerBalance(userId);
    const newBalance = currentBalance + credits;

    const entry = await prisma.creditLedger.create({
      data: {
        userId,
        type: "TOPUP",
        amount: credits,
        paymentId,
        balanceAfter: newBalance,
        metadata: (metadata ?? {}) as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { creditBalance: newBalance },
    });

    return {
      transactionId: entry.id,
      balanceAfter: newBalance,
      actualCreditsUsed: credits,
    };
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
    adminUserId?: string,
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
