-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('PENDING', 'NOTIFIED', 'CONVERTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waitlist_entries_tier_status_idx" ON "waitlist_entries"("tier", "status");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_email_tier_key" ON "waitlist_entries"("email", "tier");

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS
ALTER TABLE "waitlist_entries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own waitlist entries"
  ON "waitlist_entries" FOR SELECT
  USING (auth.uid()::text = "userId" OR "userId" IS NULL);

CREATE POLICY "Users can insert own waitlist entries"
  ON "waitlist_entries" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId" OR "userId" IS NULL);
