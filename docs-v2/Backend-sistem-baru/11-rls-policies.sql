-- ===========================================================================
-- RLS POLICIES - Row Level Security untuk ArroBuild
-- 
-- Lokasi: Jalankan di Supabase SQL editor (pergi ke: SQL → New query → paste all)
-- 
-- Filosofi: User hanya bisa akses data milik mereka sendiri
-- Berlapis dengan app-level checks — ini lapisan kedua (defense in depth)
-- 
-- ===========================================================================

-- ============================================================================
-- ENABLE RLS di setiap tabel yang sensitive
-- ============================================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GeneratedDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditLedger" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WhatsappChat" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER TABLE - user hanya bisa akses profil sendiri
-- ============================================================================

CREATE POLICY "users_select_own"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Admin (founder) bisa SELECT semua user — penting untuk customer support
-- Ganti 'INSERT_YOUR_FOUNDER_ID_HERE' dengan actual founder UUID dari Supabase Auth
CREATE POLICY "founder_select_all_users"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'  -- TODO: ganti dengan founder UUID
  );

CREATE POLICY "users_update_own"
  ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ============================================================================
-- PROJECT TABLE - user hanya bisa akses proyek milik sendiri
-- ============================================================================

CREATE POLICY "projects_select_own"
  ON "Project"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "projects_insert_own"
  ON "Project"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "projects_update_own"
  ON "Project"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "projects_delete_own"
  ON "Project"
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- Founder bisa akses semua project (untuk customer support/analytics)
CREATE POLICY "founder_manage_all_projects"
  ON "Project"
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'
  );

-- ============================================================================
-- GENERATED_DOCUMENT TABLE - hanya bisa akses kalau project milik user
-- ============================================================================

CREATE POLICY "documents_select_own_projects"
  ON "GeneratedDocument"
  FOR SELECT
  USING (
    "projectId" IN (
      SELECT id FROM "Project" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "documents_insert_own_projects"
  ON "GeneratedDocument"
  FOR INSERT
  WITH CHECK (
    "projectId" IN (
      SELECT id FROM "Project" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "documents_update_own_projects"
  ON "GeneratedDocument"
  FOR UPDATE
  USING (
    "projectId" IN (
      SELECT id FROM "Project" WHERE "userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    "projectId" IN (
      SELECT id FROM "Project" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "documents_delete_own_projects"
  ON "GeneratedDocument"
  FOR DELETE
  USING (
    "projectId" IN (
      SELECT id FROM "Project" WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- SUBSCRIPTION TABLE - user hanya bisa SELECT/UPDATE milik sendiri
-- ============================================================================

CREATE POLICY "subscriptions_select_own"
  ON "Subscription"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "subscriptions_update_own"
  ON "Subscription"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Founder bisa UPDATE subscription user (misal manual upgrade, kompensasi, dsb)
CREATE POLICY "founder_manage_all_subscriptions"
  ON "Subscription"
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'
  );

-- ============================================================================
-- CREDIT_LEDGER TABLE - user bisa SELECT saja (read-only ledger)
-- ============================================================================

CREATE POLICY "credit_ledger_select_own"
  ON "CreditLedger"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Sistem (service role, dari backend) yang INSERT ke ledger
-- Policy ini tidak perlu karena backend pakai service role key (bypass RLS)
-- Tapi kalau mau extra precaution, bisa lock INSERT:
CREATE POLICY "credit_ledger_insert_system_only"
  ON "CreditLedger"
  FOR INSERT
  WITH CHECK (false);  -- User tidak boleh insert, cuma system (service role)

-- Founder bisa SELECT semua ledger (untuk analytics)
CREATE POLICY "founder_select_all_ledgers"
  ON "CreditLedger"
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'
  );

-- ============================================================================
-- PAYMENT TABLE - user bisa SELECT & UPDATE milik sendiri
-- ============================================================================

CREATE POLICY "payments_select_own"
  ON "Payment"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- User tidak boleh UPDATE status pembayaran sendiri (cuma via webhook)
-- Tapi boleh UPDATE untuk tracking lain kalau ada (misal notes)
CREATE POLICY "payments_update_limited"
  ON "Payment"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId" AND status = "status");  -- Hanya bisa update field non-status

-- Founder bisa akses semua payment (untuk analytics & support)
CREATE POLICY "founder_manage_all_payments"
  ON "Payment"
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'
  );

-- ============================================================================
-- PAYMENT_EVENT TABLE - sistem INSERT saja (read-only untuk user)
-- ============================================================================

CREATE POLICY "payment_events_insert_system"
  ON "PaymentEvent"
  FOR INSERT
  WITH CHECK (false);  -- Cuma service role yang bisa INSERT

CREATE POLICY "payment_events_select_related"
  ON "PaymentEvent"
  FOR SELECT
  USING (
    "paymentId" IN (
      SELECT id FROM "Payment" WHERE "userId" = auth.uid()::text
    )
  );

-- Founder bisa SELECT semua (untuk audit webhook)
CREATE POLICY "founder_select_all_payment_events"
  ON "PaymentEvent"
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'
  );

-- ============================================================================
-- WHATSAPP_CHAT TABLE - user SELECT milik sendiri, founder bisa all
-- ============================================================================

CREATE POLICY "chats_select_own"
  ON "WhatsappChat"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "chats_insert_own"
  ON "WhatsappChat"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "chats_update_own"
  ON "WhatsappChat"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Founder bisa kelola semua chat
CREATE POLICY "founder_manage_all_chats"
  ON "WhatsappChat"
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'
  );

-- ============================================================================
-- DOCUMENT_REVISION TABLE (jika pakai)
-- ============================================================================

-- Assume document_revision linked ke generated_document
-- Maka policy inherit dari GeneratedDocument

-- ============================================================================
-- RATE_LIMIT_EVENT TABLE (optional, untuk tracking)
-- ============================================================================

CREATE POLICY "rate_limit_events_insert_system"
  ON "RateLimitEvent"
  FOR INSERT
  WITH CHECK (false);  -- Cuma sistem yang INSERT

-- Founder bisa query untuk analytics
CREATE POLICY "founder_select_all_rate_limits"
  ON "RateLimitEvent"
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'
  );

-- ============================================================================
-- SYSTEM_CONFIG TABLE - read-only untuk user
-- ============================================================================

CREATE POLICY "system_config_select_public"
  ON "SystemConfig"
  FOR SELECT
  USING (true);  -- Tier config bukan secret, boleh dibaca siapa saja

-- Cuma founder yang bisa UPDATE
CREATE POLICY "system_config_update_founder_only"
  ON "SystemConfig"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'
  )
  WITH CHECK (
    auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE'
  );

-- ============================================================================
-- LANGKAH SETELAH PASTE KE SUPABASE SQL EDITOR:
-- ============================================================================

/*
1. Ganti 'INSERT_YOUR_FOUNDER_ID_HERE' dengan founder UUID kamu
   - Tempat: Supabase Dashboard → Authentication → Users
   - Cari user yang email = founder email kamu, copy ID-nya

2. Test RLS dengan:
   - Login sebagai user A
   - Coba SELECT projects — harus return hanya project user A
   - Coba SELECT projects WHERE user_id = '<user B id>' — harus return empty

3. Verify RLS aktif:
   - SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;
   - Harus return semua tabel di atas

4. Alert: kalau kamu gunakan Supabase Anonymous Key di frontend (misal untuk public signup),
   pastikan tidak ada INSERT/UPDATE/DELETE policy yang menggunakan (true) tanpa auth.uid() check
*/
