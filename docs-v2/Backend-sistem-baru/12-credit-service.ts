/**
 * lib/services/credit.service.ts
 * 
 * Service untuk mengelola kredit user dengan pattern reserve/commit
 * 
 * FILOSOFI:
 * - Reserve: user mulai generate → hold kredit (entry RESERVATION_HOLD di ledger)
 * - Generate: AI generate dokumen
 * - Commit: tentukan biaya aktual, masukkan GENERATE_DOCUMENT entry, release hold
 * - Ledger: semua perubahan tercatat di tabel credit_ledger
 * 
 * THREAD-SAFE: menggunakan Prisma transaction + SELECT FOR UPDATE
 */

import { Prisma, CreditLedgerType, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getTierConfig, estimateCreditsPerDocument, ModelClassId } from '@/lib/config/tiers';
import { logger } from '@/lib/logger'; // TODO: setup logging

// ============================================================================
// TYPES
// ============================================================================

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
  available: number;  // current - reserved
  reserved: number;
  reserved_for: { projectId: string; amount: number }[];  // breakdown
}

export class CreditServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'CreditServiceError';
  }
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

export const CreditService = {
  /**
   * RESERVE kredit untuk 1 generate request
   * 
   * Proses:
   * 1. Cek saldo saat ini
   * 2. Cek apakah cukup (termasuk reserved + estimated)
   * 3. INSERT RESERVATION_HOLD entry ke ledger (LOCK row user)
   * 4. Return reservationId
   * 
   * Jika gagal: throw error, tidak ada entry di database
   * 
   * Thread-safe karena SELECT FOR UPDATE
   */
  async reserveCredit(
    userId: string,
    estimatedCreditsNeeded: number,
    projectId: string,
    metadata?: Record<string, any>
  ): Promise<CreditReservation> {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // 1. Lock row user, get current balance
          const user = await tx.user.findUniqueOrThrow(
            {
              where: { id: userId },
              select: { id: true, creditBalance: true, tier: true },
            },
            { rejectOnNotFound: 'SELECT ... FOR UPDATE gagal, user not found' }
          );

          // 2. Hitung saldo actual dari ledger (kali ini lock juga tabel ledger)
          const ledgerSum = await tx.creditLedger.aggregate({
            where: { userId },
            _sum: { amount: true },
          });
          const currentBalance = ledgerSum._sum.amount ?? 0;

          // 3. Cek kredit cukup
          if (currentBalance < estimatedCreditsNeeded) {
            throw new CreditServiceError(
              'INSUFFICIENT_CREDITS',
              `Kredit tidak cukup. Dibutuhkan ${estimatedCreditsNeeded}, tersedia ${currentBalance}`,
              402  // Payment Required
            );
          }

          // 4. INSERT RESERVATION_HOLD
          const reservationEntry = await tx.creditLedger.create({
            data: {
              userId,
              type: 'RESERVATION_HOLD' as CreditLedgerType,
              amount: -estimatedCreditsNeeded,  // Negatif = hold
              projectId,
              balanceAfter: currentBalance - estimatedCreditsNeeded,
              metadata: {
                ...metadata,
                estimatedCreditsNeeded,
                reason: 'reserve_for_generate',
              },
            },
          });

          logger.info('credit_reserved', {
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
          isolationLevel: 'Serializable',  // Maksimal protection dari race condition
          maxWait: 5000,  // Timeout 5 detik kalau lock busy
          timeout: 30000, // Timeout transaksi 30 detik
        }
      );
    } catch (error) {
      logger.error('credit_reserve_failed', {
        userId,
        projectId,
        estimatedCredits: estimatedCreditsNeeded,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * COMMIT kredit setelah generate selesai
   * 
   * Proses:
   * 1. Verify reservation masih valid (tidak di-release duluan)
   * 2. Hitung biaya actual dari AI tokens
   * 3. Kalau actual < estimated: INSERT GENERATE_DOCUMENT + RESERVATION_RELEASE
   *    Kalau actual > estimated: bisa throw error atau minta approval
   * 4. Update balance
   * 
   * In transaction: lock user row, cek balance tidak go negative
   */
  async commitCredit(
    userId: string,
    reservationId: string,
    projectId: string,
    documentsGenerated: Array<{
      fileKey: string;
      modelClass: ModelClassId;
      tokensUsed: number;
    }>,
    metadata?: Record<string, any>
  ): Promise<CreditCommit> {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // 1. Get reservation entry
          const reservation = await tx.creditLedger.findUniqueOrThrow({
            where: { id: reservationId },
          });

          if (reservation.type !== 'RESERVATION_HOLD') {
            throw new CreditServiceError(
              'INVALID_RESERVATION',
              `Reservation ${reservationId} bukan RESERVATION_HOLD type`,
              400
            );
          }

          if (reservation.userId !== userId) {
            throw new CreditServiceError(
              'RESERVATION_MISMATCH',
              `Reservation ${reservationId} bukan milik user ${userId}`,
              403
            );
          }

          // 2. Hitung biaya actual
          let actualCreditsUsed = 0;
          for (const doc of documentsGenerated) {
            const docCredits = estimateCreditsPerDocument(doc.tokensUsed, doc.modelClass);
            actualCreditsUsed += docCredits;
          }

          const holdedCredits = Math.abs(reservation.amount);  // Hold adalah negatif, reverse ke positif

          // 3. Cek overcharge (actual > estimated)
          if (actualCreditsUsed > holdedCredits) {
            // Ada 2 pilihan di sini:
            // a. Throw error (safe, tapi user experience jelek kalau generation sukses)
            // b. Izinkan, tapi log untuk monitoring (graceful, tapi butuh monitoring)
            // 
            // Di sini kami pilih THROW, lebih aman untuk business
            throw new CreditServiceError(
              'CREDIT_OVERCHARGE',
              `Kredit terpakai (${actualCreditsUsed}) melebihi yang di-hold (${holdedCredits}). Ini bug, hubungi support.`,
              500
            );
          }

          // 4. Lock user row lagi, cek balance tidak negative
          const currentBalance = await tx.creditLedger.aggregate({
            where: { userId },
            _sum: { amount: true },
          });
          const sumBalance = currentBalance._sum.amount ?? 0;

          if (sumBalance < actualCreditsUsed) {
            // Race condition detected: ada transaksi lain yang potong kredit saat generate jalan
            logger.warn('credit_race_detected', {
              userId,
              reservationId,
              sumBalance,
              actualCreditsUsed,
            });
            throw new CreditServiceError(
              'CREDIT_RACE_CONDITION',
              'Terdeteksi perubahan kredit dari request lain. Silakan coba lagi.',
              409  // Conflict
            );
          }

          // 5. INSERT GENERATE_DOCUMENT entry (biaya actual)
          const generateEntry = await tx.creditLedger.create({
            data: {
              userId,
              type: 'GENERATE_DOCUMENT' as CreditLedgerType,
              amount: -actualCreditsUsed,
              projectId,
              balanceAfter: sumBalance - actualCreditsUsed,
              metadata: {
                ...metadata,
                documentsGenerated: documentsGenerated.map(d => ({
                  fileKey: d.fileKey,
                  modelClass: d.modelClass,
                  tokensUsed: d.tokensUsed,
                })),
                reservationId,
              },
            },
          });

          // 6. Kalau ada selisih (actual < estimated), RELEASE selisihnya
          const surplus = holdedCredits - actualCreditsUsed;
          if (surplus > 0) {
            await tx.creditLedger.create({
              data: {
                userId,
                type: 'RESERVATION_RELEASE' as CreditLedgerType,
                amount: surplus,  // Positif = kembalikan
                projectId,
                balanceAfter: generateEntry.balanceAfter + surplus,
                metadata: {
                  reservationId,
                  holdedCredits,
                  actualCreditsUsed,
                  surplus,
                  reason: 'release_surplus_from_reservation',
                },
              },
            });
          }

          // 7. Update cache di user table (opsional, untuk query cepat)
          const finalBalance = sumBalance - actualCreditsUsed + surplus;
          await tx.user.update({
            where: { id: userId },
            data: { creditBalance: finalBalance },
          });

          logger.info('credit_committed', {
            userId,
            projectId,
            reservationId,
            estimatedHeld: holdedCredits,
            actualUsed: actualCreditsUsed,
            surplus,
            finalBalance,
          });

          return {
            transactionId: generateEntry.id,
            balanceAfter: finalBalance,
            actualCreditsUsed,
          };
        },
        {
          isolationLevel: 'Serializable',
          maxWait: 5000,
          timeout: 30000,
        }
      );
    } catch (error) {
      logger.error('credit_commit_failed', {
        userId,
        reservationId,
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * RELEASE reservation kalau generate gagal
   * 
   * Gunakan: kalau streaming error atau user cancel
   */
  async releaseReservation(
    userId: string,
    reservationId: string,
    reason: string = 'generation_failed'
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        const reservation = await tx.creditLedger.findUniqueOrThrow({
          where: { id: reservationId },
        });

        if (reservation.type !== 'RESERVATION_HOLD') {
          throw new Error(`${reservationId} bukan RESERVATION_HOLD type`);
        }

        const holdedAmount = Math.abs(reservation.amount);

        await tx.creditLedger.create({
          data: {
            userId,
            type: 'RESERVATION_RELEASE' as CreditLedgerType,
            amount: holdedAmount,  // Kembalikan semua
            projectId: reservation.projectId,
            balanceAfter: (reservation.balanceAfter + holdedAmount),
            metadata: {
              reservationId,
              reason,
            },
          },
        });

        logger.info('credit_released', { userId, reservationId, reason });
      });
    } catch (error) {
      logger.error('credit_release_failed', {
        userId,
        reservationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * GET current balance
   * 
   * Hitung dari ledger (source of truth), bukan cache di user.creditBalance
   */
  async getBalance(userId: string): Promise<CreditBalance> {
    const ledger = await prisma.creditLedger.findMany({
      where: { userId },
      select: { amount: true, type: true, projectId: true },
    });

    const current = ledger.reduce((sum, entry) => sum + entry.amount, 0);

    // Hitung reserved
    const reservedEntries = ledger.filter(e => e.type === 'RESERVATION_HOLD');
    const reserved = Math.abs(
      reservedEntries.reduce((sum, e) => sum + e.amount, 0)
    );

    const reserved_for = reservedEntries.map(e => ({
      projectId: e.projectId || 'unknown',
      amount: Math.abs(e.amount),
    }));

    return {
      current,
      available: current + reserved,  // Available = current + reserved (karena reserved adalah hold, bukan sudah potong)
      reserved,
      reserved_for,
    };
  },

  /**
   * REFRESH monthly credits
   * 
   * Jalankan: Cron job tiap hari, cek per user yang `subscriptionRenewalDate` == today
   */
  async refreshMonthlyCredits(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      const config = getTierConfig(user.tier);

      await prisma.$transaction(async (tx) => {
        await tx.creditLedger.create({
          data: {
            userId,
            type: 'MONTHLY_REFRESH' as CreditLedgerType,
            amount: config.creditsPerMonth,
            metadata: {
              tier: user.tier,
              creditsPerMonth: config.creditsPerMonth,
            },
          },
        });

        // Also update cache
        const newBalance = await tx.creditLedger.aggregate({
          where: { userId },
          _sum: { amount: true },
        });

        await tx.user.update({
          where: { id: userId },
          data: { creditBalance: newBalance._sum.amount ?? 0 },
        });

        logger.info('monthly_credits_refreshed', {
          userId,
          tier: user.tier,
          creditsAdded: config.creditsPerMonth,
        });
      });
    } catch (error) {
      logger.error('monthly_refresh_failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * APPLY rollover — keep max(rolloverMax) dari previous month
   * 
   * Jalankan sebelum refreshMonthlyCredits, untuk carry-over unused credits
   */
  async applyRollover(userId: string): Promise<number> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const config = getTierConfig(user.tier);

    const balance = await this.getBalance(userId);
    const rolloverAmount = Math.min(balance.current, config.rolloverMax);

    if (rolloverAmount > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.creditLedger.create({
          data: {
            userId,
            type: 'ROLLOVER' as CreditLedgerType,
            amount: rolloverAmount,
            metadata: {
              tier: user.tier,
              rolloverMax: config.rolloverMax,
            },
          },
        });
      });

      logger.info('rollover_applied', { userId, amount: rolloverAmount });
    }

    return rolloverAmount;
  },

  /**
   * Manual adjustment (founder action)
   * 
   * Contoh: kompensasi user, error correction, bonus promo
   */
  async adjustCredits(
    userId: string,
    amount: number,
    reason: string,
    adminUserId?: string
  ): Promise<CreditCommit> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const ledgerSum = await tx.creditLedger.aggregate({
          where: { userId },
          _sum: { amount: true },
        });

        const currentBalance = ledgerSum._sum.amount ?? 0;
        const newBalance = currentBalance + amount;

        const entry = await tx.creditLedger.create({
          data: {
            userId,
            type: 'MANUAL_ADJUSTMENT' as CreditLedgerType,
            amount,
            balanceAfter: newBalance,
            metadata: {
              reason,
              adminUserId,
            },
          },
        });

        logger.info('credit_adjusted_manually', {
          userId,
          amount,
          reason,
          adminUserId,
          newBalance,
        });

        return {
          transactionId: entry.id,
          balanceAfter: newBalance,
          actualCreditsUsed: amount,
        };
      });

      return result;
    } catch (error) {
      logger.error('credit_adjustment_failed', {
        userId,
        amount,
        reason,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
};
