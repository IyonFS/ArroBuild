/*
  Warnings:

  - The values [EXPIRED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [FREE,UNLIMITED] on the enum `SubscriptionTier` will be removed. If these variants are still used in the database, this will fail.

*/
-- ── Step 1: Convert enum columns to TEXT so we can remap old values ──
ALTER TABLE "payments" ALTER COLUMN "status" TYPE TEXT USING "status"::text;
ALTER TABLE "subscriptions" ALTER COLUMN "tier" TYPE TEXT USING "tier"::text;
ALTER TABLE "payments" ALTER COLUMN "tier" TYPE TEXT USING "tier"::text;

UPDATE "payments" SET "status" = 'FAILED' WHERE "status" = 'EXPIRED';
UPDATE "subscriptions" SET "tier" = 'PRO_MAX' WHERE "tier" = 'UNLIMITED';
UPDATE "subscriptions" SET "tier" = 'STARTER' WHERE "tier" = 'FREE';
UPDATE "payments" SET "tier" = 'PRO_MAX' WHERE "tier" = 'UNLIMITED';
UPDATE "payments" SET "tier" = 'STARTER' WHERE "tier" = 'FREE';

-- CreateEnum
CREATE TYPE "CreditLedgerType" AS ENUM ('MONTHLY_REFRESH', 'ROLLOVER', 'TOPUP', 'MANUAL_ADJUSTMENT', 'GENERATE_DOCUMENT', 'REVISION', 'TOOL_USAGE', 'RESERVATION_HOLD', 'RESERVATION_RELEASE');

-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('OPEN', 'WAITING_FOUNDER_RESPONSE', 'WAITING_USER_RESPONSE', 'CLOSED');

-- AlterEnum PaymentStatus
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'SETTLEMENT', 'CAPTURE', 'DENY', 'CANCEL', 'EXPIRE', 'FAILED', 'PAID');
ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PAUSED';

-- AlterEnum SubscriptionTier
BEGIN;
CREATE TYPE "SubscriptionTier_new" AS ENUM ('STARTER', 'PRO', 'PRO_MAX');
ALTER TABLE "subscriptions" ALTER COLUMN "tier" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "tier" TYPE "SubscriptionTier_new" USING ("tier"::"SubscriptionTier_new");
ALTER TABLE "payments" ALTER COLUMN "tier" TYPE "SubscriptionTier_new" USING ("tier"::"SubscriptionTier_new");
ALTER TYPE "SubscriptionTier" RENAME TO "SubscriptionTier_old";
ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier";
DROP TYPE "public"."SubscriptionTier_old";
ALTER TABLE "subscriptions" ALTER COLUMN "tier" SET DEFAULT 'STARTER';
COMMIT;

-- AlterTable
ALTER TABLE "generated_files" ADD COLUMN     "modelClass" TEXT,
ADD COLUMN     "tokensUsed" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "midtransId" TEXT,
ADD COLUMN     "settledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "planData" JSONB;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "midtransSubscriptionId" TEXT,
ADD COLUMN     "renewalDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ALTER COLUMN "tier" SET DEFAULT 'STARTER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "creditBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tier" "SubscriptionTier" NOT NULL DEFAULT 'STARTER';

-- CreateTable
CREATE TABLE "document_revisions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "revisionType" TEXT NOT NULL,
    "sectionName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_events" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "signatureValid" BOOLEAN NOT NULL DEFAULT false,
    "signature" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CreditLedgerType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "projectId" TEXT,
    "paymentId" TEXT,
    "documentType" TEXT,
    "toolId" TEXT,
    "metadata" JSONB,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL DEFAULT 'tier_config',
    "tierConfig" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_chats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "status" "ChatStatus" NOT NULL DEFAULT 'OPEN',
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "whatsapp_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "limitType" TEXT NOT NULL,
    "rejectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_revisions_documentId_version_idx" ON "document_revisions"("documentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "payment_events_orderId_key" ON "payment_events"("orderId");

-- CreateIndex
CREATE INDEX "payment_events_paymentId_idx" ON "payment_events"("paymentId");

-- CreateIndex
CREATE INDEX "credit_ledger_userId_createdAt_idx" ON "credit_ledger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "credit_ledger_type_idx" ON "credit_ledger"("type");

-- CreateIndex
CREATE INDEX "whatsapp_chats_userId_month_year_idx" ON "whatsapp_chats"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "rate_limit_events_userId_rejectedAt_idx" ON "rate_limit_events"("userId", "rejectedAt");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "subscriptions_expiresAt_status_idx" ON "subscriptions"("expiresAt", "status");

-- AddForeignKey
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "generated_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_chats" ADD CONSTRAINT "whatsapp_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
