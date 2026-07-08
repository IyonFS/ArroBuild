/**
 * lib/services/payment.service.ts
 * 
 * Service untuk mengelola pembayaran, webhook Midtrans, dan subscription
 * 
 * PRINSIP:
 * - Webhook WAJIB pakai signature verification (bukan optional)
 * - Idempotent: webhook yang sama bisa diterima berkali-kali, hanya process 1x
 * - Atomic: payment status + credit refresh + subscription activation dalam 1 transaction
 * 
 * FLOW:
 * 1. User klik "upgrade" → panggil createSnapToken()
 * 2. User bayar via Midtrans Snap
 * 3. Midtrans kirim webhook settlement → handleWebhook()
 * 4. Handler: verify sig + cek UNIQUE orderId + activate subscription + refresh credits
 */

import { Prisma, PaymentStatus, CreditLedgerType, SubscriptionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getTierConfig } from '@/lib/config/tiers';
import { CreditService } from './credit.service';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export interface MidtransWebhookPayload {
  order_id: string;
  transaction_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  transaction_time: string;
  settlement_time?: string;
  signature_key: string;
  // ... ada banyak field lain, tapi ini yang penting
}

export class PaymentServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'PaymentServiceError';
  }
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

export const PaymentService = {
  /**
   * CREATE Midtrans Snap token untuk user yang ingin upgrade
   * 
   * Return: token (buat Snap popup) + redirect_url (kalau user pakai redirect mode)
   */
  async createSnapToken(
    userId: string,
    tier: string,
    clientKey: string
  ): Promise<MidtransSnapResponse> {
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });

      const config = getTierConfig(tier);

      // Generate unique order_id (format: USER_ID-TIMESTAMP-RANDOM)
      const orderId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // TODO: Ganti dengan actual Midtrans API call
      // Saat ini: placeholder, replace dengan real Midtrans SDK
      const midtransResponse = await callMidtransApi('POST', '/snap/v1/transactions', {
        transaction_details: {
          order_id: orderId,
          gross_amount: config.priceIdr,
        },
        customer_details: {
          email: user.email,
          first_name: user.name || 'Customer',
        },
        item_details: [
          {
            id: tier,
            price: config.priceIdr,
            quantity: 1,
            name: `ArroBuild ${tier} - 1 bulan`,
          },
        ],
      });

      // Simpan payment intent ke database (status: PENDING)
      await prisma.payment.create({
        data: {
          userId,
          orderId,
          snapToken: midtransResponse.token,
          tier,
          amountIdr: config.priceIdr,
          status: 'PENDING',
        },
      });

      logger.info('snap_token_created', {
        userId,
        tier,
        orderId,
        amountIdr: config.priceIdr,
      });

      return {
        token: midtransResponse.token,
        redirect_url: midtransResponse.redirect_url,
      };
    } catch (error) {
      logger.error('snap_token_creation_failed', {
        userId,
        tier,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * HANDLE webhook dari Midtrans
   * 
   * Flow:
   * 1. Verify signature (WAJIB)
   * 2. Parse payload
   * 3. Query atau create PaymentEvent dengan orderId (UNIQUE constraint)
   * 4. Kalau already exists: return 200 (idempotent)
   * 5. Kalau baru: proses settlement (activate subscription + refresh credits)
   */
  async handleWebhook(
    payload: MidtransWebhookPayload,
    rawBody: string,
    signatureFromHeader: string,
    serverKey: string
  ): Promise<{ status: string; message: string }> {
    try {
      // 1. Verify signature — WAJIB, jangan ada shortcut
      const isValidSignature = this.verifyMidtransSignature(
        payload.order_id,
        payload.transaction_status,
        payload.gross_amount,
        serverKey,
        signatureFromHeader
      );

      if (!isValidSignature) {
        logger.warn('webhook_signature_invalid', {
          orderId: payload.order_id,
          ipAddress: 'from_header',  // TODO: ambil dari request header
          signature: signatureFromHeader.substring(0, 20) + '...',
        });

        throw new PaymentServiceError(
          'INVALID_SIGNATURE',
          'Webhook signature verification failed',
          401
        );
      }

      // 2. Cek apakah order_id sudah pernah diproses (idempotency)
      const existingEvent = await prisma.paymentEvent.findUnique({
        where: { orderId: payload.order_id },
      });

      if (existingEvent) {
        logger.info('webhook_already_processed', {
          orderId: payload.order_id,
          previouslySentAt: existingEvent.receivedAt,
        });
        // Return 200 (idempotent)
        return {
          status: 'success',
          message: 'Payment event already processed (idempotent)',
        };
      }

      // 3. Proses settlement (atomic transaction)
      return await prisma.$transaction(async (tx) => {
        // 3a. Find payment
        const payment = await tx.payment.findUniqueOrThrow({
          where: { orderId: payload.order_id },
        });

        // 3b. Validate payment amount (double-check)
        if (parseInt(payload.gross_amount) !== payment.amountIdr) {
          throw new PaymentServiceError(
            'AMOUNT_MISMATCH',
            `Amount mismatch: expected ${payment.amountIdr}, got ${payload.gross_amount}`,
            400
          );
        }

        // 3c. Insert PaymentEvent (UNIQUE constraint prevent duplicate)
        const paymentEvent = await tx.paymentEvent.create({
          data: {
            paymentId: payment.id,
            orderId: payload.order_id,
            rawPayload: payload,
            signatureValid: true,
            signature: signatureFromHeader,
            processedAt: new Date(),
          },
        });

        // 3d. Update payment status berdasarkan transaction_status
        let newPaymentStatus: PaymentStatus;
        if (payload.transaction_status === 'settlement' || payload.transaction_status === 'capture') {
          newPaymentStatus = 'SETTLEMENT';
        } else if (payload.transaction_status === 'pending') {
          newPaymentStatus = 'PENDING';
        } else if (payload.transaction_status === 'deny' || payload.transaction_status === 'failure') {
          newPaymentStatus = 'DENY';
        } else {
          newPaymentStatus = payment.status as PaymentStatus;
        }

        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: newPaymentStatus,
            midtransId: payload.transaction_id,
            settledAt: newPaymentStatus === 'SETTLEMENT' ? new Date() : undefined,
          },
        });

        // 3e. Kalau SETTLEMENT: activate/extend subscription + refresh credits
        if (newPaymentStatus === 'SETTLEMENT') {
          const config = getTierConfig(payment.tier);
          const now = new Date();
          const renewalDate = new Date(now);
          renewalDate.setDate(renewalDate.getDate() + 30);  // 30 hari ke depan
          const expiresAt = renewalDate;

          // Cek subscription existing
          let subscription = await tx.subscription.findUnique({
            where: { userId: payment.userId },
          });

          if (subscription) {
            // Update existing
            subscription = await tx.subscription.update({
              where: { userId: payment.userId },
              data: {
                tier: payment.tier,
                startDate: now,
                renewalDate,
                expiresAt,
                status: 'ACTIVE',
              },
            });
          } else {
            // Create new
            subscription = await tx.subscription.create({
              data: {
                userId: payment.userId,
                tier: payment.tier,
                startDate: now,
                renewalDate,
                expiresAt,
                status: 'ACTIVE',
              },
            });
          }

          // Update user tier
          await tx.user.update({
            where: { id: payment.userId },
            data: { tier: payment.tier },
          });

          // Insert credit refresh ke ledger
          await tx.creditLedger.create({
            data: {
              userId: payment.userId,
              type: 'MONTHLY_REFRESH' as CreditLedgerType,
              amount: config.creditsPerMonth,
              paymentId: payment.id,
              metadata: {
                paymentEvent: paymentEvent.id,
                tier: payment.tier,
                reason: 'payment_settlement',
              },
            },
          });

          logger.info('webhook_settlement_processed', {
            orderId: payload.order_id,
            userId: payment.userId,
            tier: payment.tier,
            creditsAdded: config.creditsPerMonth,
            subscriptionExpiresAt: expiresAt,
          });
        }

        return {
          status: 'success',
          message: `Payment processed: ${newPaymentStatus}`,
        };
      });
    } catch (error) {
      // Jangan throw di sini — webhook handler di route harus return 500 supaya Midtrans retry
      logger.error('webhook_processing_failed', {
        orderId: payload.order_id,
        status: payload.transaction_status,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * VERIFY Midtrans webhook signature
   * 
   * Formula: SHA256(order_id + transaction_status + gross_amount + server_key)
   */
  verifyMidtransSignature(
    orderId: string,
    transactionStatus: string,
    grossAmount: string,
    serverKey: string,
    signatureFromHeader: string
  ): boolean {
    // Convert grossAmount to string without decimal/currency if needed
    const grossAmountStr = String(grossAmount);

    const signatureString = `${orderId}${transactionStatus}${grossAmountStr}${serverKey}`;
    const hash = crypto.createHash('sha256').update(signatureString).digest('hex');

    return hash === signatureFromHeader;
  },

  /**
   * GET payment status
   */
  async getPaymentStatus(orderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { events: true },
    });

    if (!payment) {
      throw new PaymentServiceError(
        'PAYMENT_NOT_FOUND',
        `Payment dengan order_id ${orderId} tidak ditemukan`,
        404
      );
    }

    return payment;
  },

  /**
   * CANCEL payment (untuk UI cancel button)
   */
  async cancelPayment(orderId: string, userId: string): Promise<void> {
    const payment = await prisma.payment.findUniqueOrThrow({
      where: { orderId },
    });

    if (payment.userId !== userId) {
      throw new PaymentServiceError(
        'UNAUTHORIZED',
        'Anda tidak punya akses ke payment ini',
        403
      );
    }

    // Cek status bisa di-cancel (belum settlement)
    if (['SETTLEMENT', 'CAPTURE', 'DENY', 'FAILED'].includes(payment.status)) {
      throw new PaymentServiceError(
        'CANNOT_CANCEL',
        `Payment status ${payment.status} tidak bisa di-cancel`,
        400
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CANCEL' },
    });

    logger.info('payment_cancelled', { orderId, userId });
  },

  /**
   * SUBSCRIPTION EXPIRY CHECK (untuk cron job)
   * 
   * Find semua subscription yang expiresAt < now() dan status = ACTIVE
   * → Set status = EXPIRED, downgrade user ke tier free
   */
  async processExpiredSubscriptions(): Promise<number> {
    const now = new Date();

    const expired = await prisma.subscription.findMany({
      where: {
        expiresAt: { lt: now },
        status: 'ACTIVE',
      },
    });

    let count = 0;
    for (const sub of expired) {
      await prisma.$transaction(async (tx) => {
        // Update subscription status
        await tx.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        });

        // Downgrade user ke STARTER tier
        await tx.user.update({
          where: { id: sub.userId },
          data: { tier: 'STARTER' },
        });

        count++;

        logger.info('subscription_expired_processed', {
          userId: sub.userId,
          subscriptionId: sub.id,
          expiresAt: sub.expiresAt,
        });
      });
    }

    logger.info('subscription_expiry_check_completed', { expiredCount: count });
    return count;
  },
};

// ============================================================================
// HELPER - Midtrans API Call (TODO: replace dengan actual SDK)
// ============================================================================

async function callMidtransApi(
  method: 'GET' | 'POST',
  path: string,
  data?: Record<string, any>
): Promise<any> {
  // TODO: Implementasi actual Midtrans API call
  // Gunakan: https://github.com/Midtrans/midtrans-nodejs-client
  // atau: fetch + manual auth

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY not configured');
  }

  // Placeholder
  throw new Error('TODO: implement actual Midtrans API call');
}
