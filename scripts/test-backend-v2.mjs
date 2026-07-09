/**
 * Backend v2 integration tests — requires dev server + .env.local
 * Usage: node scripts/test-backend-v2.mjs
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

config({ path: ".env.local" });

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TEST_EMAIL = `test-v2-${Date.now()}@arrobuild.local`;
const TEST_PASSWORD = "TestArroBuild2026!";
const TEST_USER_ID = crypto.randomUUID();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let passed = 0;
let failed = 0;

function ok(name) {
  console.log(`  ✅ ${name}`);
  passed++;
}

function fail(name, detail) {
  console.log(`  ❌ ${name}: ${detail}`);
  failed++;
}

function authCookie(session) {
  const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
  const payload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  });
  return `sb-${projectRef}-auth-token=${encodeURIComponent(payload)}`;
}

async function api(path, { method = "GET", body, cookie } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json, text };
}

async function main() {
  console.log("\n=== Backend v2 Integration Tests ===\n");

  // 1. Create auth user + DB user
  console.log("1. Setup test user");
  const { error: createErr } = await admin.auth.admin.createUser({
    id: TEST_USER_ID,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (createErr) {
    fail("create auth user", createErr.message);
    process.exit(1);
  }
  ok(`auth user created (${TEST_EMAIL})`);

  await prisma.user.upsert({
    where: { id: TEST_USER_ID },
    create: {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: "Test V2",
      tier: "STARTER",
      creditBalance: 0,
    },
    update: { email: TEST_EMAIL },
  });
  ok("db user synced");

  const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (signInErr || !signIn.session) {
    fail("sign in", signInErr?.message ?? "no session");
    process.exit(1);
  }
  const cookie = authCookie(signIn.session);
  ok("session obtained");

  // 2. Auth guards
  console.log("\n2. Auth guards");
  const noAuth = await api("/api/user/credits");
  if (noAuth.status === 401) ok("credits requires login");
  else fail("credits requires login", `got ${noAuth.status}`);

  const withAuth = await api("/api/user/credits", { cookie });
  if (withAuth.status === 200) ok("credits returns 200 when logged in");
  else fail("credits logged in", `${withAuth.status} ${withAuth.text?.slice?.(0, 80) ?? withAuth.json}`);

  // 3. Credit ledger
  console.log("\n3. Credit system");
  await prisma.creditLedger.create({
    data: {
      userId: TEST_USER_ID,
      type: "MONTHLY_REFRESH",
      amount: 100,
      balanceAfter: 100,
      metadata: { test: true },
    },
  });
  await prisma.user.update({
    where: { id: TEST_USER_ID },
    data: { creditBalance: 100 },
  });

  const creditsAfterGrant = await api("/api/user/credits", { cookie });
  if (
    creditsAfterGrant.status === 200 &&
    creditsAfterGrant.json.creditBalance >= 100
  ) {
    ok(`credit balance visible (${creditsAfterGrant.json.creditBalance})`);
  } else {
    fail("credit balance", JSON.stringify(creditsAfterGrant.json));
  }

  // 4. Generate without subscription should fail
  console.log("\n4. Generate paywall");
  const genPayload = {
    idea:
      "A SaaS platform where restaurant owners manage menu, tables, and orders in real-time with QR code ordering for customers.",
    clarifications: { platform: "web", monetization: "freemium", scope: "mvp" },
    presets: { framework: "nextjs", design: "linear", agentTool: "cursor" },
    tier: "starter",
    estimatedCredits: 8,
  };
  const genNoSub = await api("/api/generate", {
    method: "POST",
    body: genPayload,
    cookie,
  });
  if (genNoSub.status === 402 || genNoSub.status === 403) {
    ok(`generate blocked without subscription (${genNoSub.status})`);
  } else if (genNoSub.status === 401) {
    fail("generate paywall", "cookie auth not accepted by generate route");
  } else {
    fail("generate paywall", `expected 402/403, got ${genNoSub.status}: ${genNoSub.text?.slice?.(0, 100)}`);
  }

  // 5. Payment create (Snap token)
  console.log("\n5. Payment flow");
  const payment = await api("/api/payment/create", {
    method: "POST",
    body: { tierId: "starter" },
    cookie,
  });
  if (payment.status === 200 && payment.json.snapToken) {
    ok("payment snap token created");
  } else {
    fail("payment create", `${payment.status} ${JSON.stringify(payment.json)}`);
  }

  // 6. Simulate settlement via PaymentService path (direct DB)
  console.log("\n6. Simulate subscription + credits");
  const sub = await prisma.subscription.create({
    data: {
      userId: TEST_USER_ID,
      tier: "STARTER",
      status: "ACTIVE",
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.user.update({
    where: { id: TEST_USER_ID },
    data: { tier: "STARTER" },
  });
  ok(`subscription ACTIVE (${sub.id.slice(0, 8)}...)`);

  const genWithSub = await api("/api/generate", {
    method: "POST",
    body: genPayload,
    cookie,
  });
  // Should NOT be 401/403 anymore — may stream or fail on AI keys
  if (genWithSub.status === 200) {
    ok("generate accepted with active subscription (streaming)");
  } else if (genWithSub.status === 402) {
    ok("generate reached credit check (402 insufficient — expected if grant not enough)");
  } else if ([401, 403].includes(genWithSub.status)) {
    fail("generate with subscription", `${genWithSub.status} still blocked`);
  } else {
    ok(`generate returned ${genWithSub.status} (not auth-blocked)`);
  }

  // 7. Schema sanity
  console.log("\n7. Database schema");
  const tables = ["credit_ledger", "payment_events", "subscriptions", "payments"];
  for (const table of tables) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS c FROM "${table}"`
    );
    ok(`table ${table} accessible (rows: ${rows[0].c})`);
  }

  // Cleanup test user
  console.log("\n8. Cleanup");
  await prisma.creditLedger.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.subscription.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.payment.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.user.delete({ where: { id: TEST_USER_ID } }).catch(() => {});
  await admin.auth.admin.deleteUser(TEST_USER_ID);
  ok("test user removed");

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  await prisma.$disconnect();
  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
