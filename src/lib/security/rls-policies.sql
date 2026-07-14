-- RLS policies for ArroBuild (table names match Prisma @@map)
-- Run manually in Supabase SQL Editor after migration.
-- Replace INSERT_YOUR_FOUNDER_ID_HERE with your Supabase Auth UUID.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "projects_select_own" ON projects FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "projects_insert_own" ON projects FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "projects_update_own" ON projects FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "projects_delete_own" ON projects FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "files_select_own" ON generated_files FOR SELECT
  USING ("projectId" IN (SELECT id FROM projects WHERE "userId" = auth.uid()::text));

CREATE POLICY "subscriptions_select_own" ON subscriptions FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "credit_ledger_select_own" ON credit_ledger FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "credit_ledger_insert_system" ON credit_ledger FOR INSERT WITH CHECK (false);

CREATE POLICY "payments_select_own" ON payments FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "payment_events_select_own" ON payment_events FOR SELECT
  USING ("paymentId" IN (SELECT id FROM payments WHERE "userId" = auth.uid()::text));
CREATE POLICY "payment_events_insert_system" ON payment_events FOR INSERT WITH CHECK (false);

CREATE POLICY "document_revisions_select_own" ON document_revisions FOR SELECT
  USING ("documentId" IN (
    SELECT gf.id FROM generated_files gf
    JOIN projects p ON p.id = gf."projectId"
    WHERE p."userId" = auth.uid()::text
  ));
CREATE POLICY "document_revisions_insert_own" ON document_revisions FOR INSERT
  WITH CHECK ("documentId" IN (
    SELECT gf.id FROM generated_files gf
    JOIN projects p ON p.id = gf."projectId"
    WHERE p."userId" = auth.uid()::text
  ));

CREATE POLICY "whatsapp_chats_select_own" ON whatsapp_chats FOR SELECT
  USING (auth.uid()::text = "userId");
CREATE POLICY "whatsapp_chats_insert_own" ON whatsapp_chats FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "system_config_select_authenticated" ON system_config FOR SELECT
  TO authenticated USING (true);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interview_select_own" ON interview_sessions FOR SELECT
  USING (auth.uid()::text = "userId");
CREATE POLICY "interview_insert_own" ON interview_sessions FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "interview_update_own" ON interview_sessions FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "waitlist_select_own" ON waitlist_entries FOR SELECT
  USING (
    auth.uid()::text = "userId"
    OR email = (auth.jwt() ->> 'email')
  );
CREATE POLICY "waitlist_insert_authenticated" ON waitlist_entries FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "waitlist_update_own" ON waitlist_entries FOR UPDATE
  USING (
    auth.uid()::text = "userId"
    OR email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "rate_limit_events_deny_all" ON rate_limit_events FOR ALL
  USING (false) WITH CHECK (false);
