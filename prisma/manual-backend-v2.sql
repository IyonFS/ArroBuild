-- Manual migration: Backend v2 (jalankan di Supabase SQL Editor jika `prisma migrate` gagal)
-- Backup database dulu sebelum menjalankan!

-- 1. Enum tier baru (handle data lama)
DO $$ BEGIN
  CREATE TYPE "SubscriptionTier_new" AS ENUM ('STARTER', 'PRO', 'PRO_MAX');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Kolom baru di users
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'STARTER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "creditBalance" INTEGER NOT NULL DEFAULT 0;

-- 3. Kolom baru di subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "renewalDate" TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "midtransSubscriptionId" TEXT;

-- 4. Kolom baru di projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "planData" JSONB;

-- 5. Kolom baru di generated_files
ALTER TABLE generated_files ADD COLUMN IF NOT EXISTS "modelClass" TEXT;
ALTER TABLE generated_files ADD COLUMN IF NOT EXISTS "tokensUsed" INTEGER;
ALTER TABLE generated_files ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE generated_files ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 6. Kolom baru di payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS "midtransId" TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS "settledAt" TIMESTAMPTZ;

-- 7. Tabel credit_ledger
CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  "projectId" TEXT,
  "paymentId" TEXT,
  "documentType" TEXT,
  "toolId" TEXT,
  metadata JSONB,
  "balanceAfter" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS credit_ledger_user_created ON credit_ledger("userId", "createdAt");

-- 8. Tabel payment_events
CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  "paymentId" TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  "orderId" TEXT NOT NULL UNIQUE,
  "rawPayload" JSONB NOT NULL,
  "signatureValid" BOOLEAN NOT NULL DEFAULT false,
  signature TEXT,
  "receivedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "processedAt" TIMESTAMPTZ
);

-- 9. Tabel lainnya
CREATE TABLE IF NOT EXISTS document_revisions (
  id TEXT PRIMARY KEY,
  "documentId" TEXT NOT NULL REFERENCES generated_files(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  "revisionType" TEXT NOT NULL,
  "sectionName" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_chats (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "closedAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS system_config (
  id TEXT PRIMARY KEY DEFAULT 'tier_config',
  "tierConfig" JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedBy" TEXT
);

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  "ipAddress" TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  "limitType" TEXT NOT NULL,
  "rejectedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Migrasi tier lama (sesuaikan jika perlu)
-- UPDATE subscriptions SET tier = 'PRO_MAX' WHERE tier::text = 'UNLIMITED';
-- UPDATE subscriptions SET tier = 'STARTER' WHERE tier::text = 'FREE';

-- Setelah enum migration manual, jalankan RLS dari src/lib/security/rls-policies.sql
