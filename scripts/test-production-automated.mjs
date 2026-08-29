/**
 * Automated production-readiness checks — dev server + .env.local required.
 * Usage: node scripts/test-production-automated.mjs
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { assertSafeIntegrationEnvironment } from "./lib/integration-environment.mjs";

config({ path: ".env.local" });
assertSafeIntegrationEnvironment();

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
const userIds = [];

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

async function api(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers ?? {}) };
  if (opts.cookie) headers.Cookie = opts.cookie;
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json, text, headers: res.headers };
}

async function createTestUser(label) {
  const id = crypto.randomUUID();
  const email = `auto-${label}-${Date.now()}@arrobuild.local`;
  const password = "TestAuto2026!";
  const { error } = await admin.auth.admin.createUser({
    id,
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser ${label}: ${error.message}`);
  await prisma.user.upsert({
    where: { id },
    create: { id, email, name: `Auto ${label}`, tier: "STARTER", creditBalance: 5000 },
    update: { email },
  });
  const { data, error: signErr } = await anon.auth.signInWithPassword({ email, password });
  if (signErr || !data.session) throw new Error(`signIn ${label}: ${signErr?.message}`);
  userIds.push(id);
  return { id, email, cookie: authCookie(data.session) };
}

async function cleanup() {
  for (const id of userIds) {
    await prisma.creditLedger.deleteMany({ where: { userId: id } });
    await prisma.generatedFile.deleteMany({ where: { project: { userId: id } } });
    await prisma.project.deleteMany({ where: { userId: id } });
    await prisma.subscription.deleteMany({ where: { userId: id } });
    await prisma.payment.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } }).catch(() => {});
    await admin.auth.admin.deleteUser(id).catch(() => {});
  }
}

async function main() {
  console.log("\n=== Automated Production Checks ===\n");

  // --- Marketing / static ---
  console.log("A. Landing & static pages");
  const home = await fetch(`${BASE}/`);
  const homeHtml = await home.text();
  if (home.status === 200) ok("GET / returns 200");
  else fail("GET /", String(home.status));

  const badPhrases = ["free tanpa login", "coba gratis tanpa", "Rp 49K", "unlimited tanpa"];
  const foundBad = badPhrases.filter((p) => homeHtml.toLowerCase().includes(p));
  if (foundBad.length === 0) ok("landing tanpa copy misleading");
  else fail("landing copy", `found: ${foundBad.join(", ")}`);

  for (const path of ["/terms", "/privacy", "/tools"]) {
    const r = await fetch(`${BASE}${path}`);
    if (r.status === 200) ok(`GET ${path} → 200`);
    else fail(`GET ${path}`, String(r.status));
  }

  // --- Security headers ---
  console.log("\nB. Security headers");
  const hdrs = home.headers;
  const required = [
    ["x-frame-options", "DENY"],
    ["x-content-type-options", "nosniff"],
    ["content-security-policy", null],
    ["referrer-policy", null],
  ];
  for (const [key, expected] of required) {
    const val = hdrs.get(key);
    if (!val) fail(`header ${key}`, "missing");
    else if (expected && val.toLowerCase() !== expected.toLowerCase()) fail(`header ${key}`, val);
    else ok(`header ${key}`);
  }

  // --- Anonymous auth guards ---
  console.log("\nC. Anonymous API guards (401)");
  for (const [path, method, body] of [
    ["/api/generate", "POST", { idea: "x", presets: {}, clarifications: {} }],
    ["/api/export?projectId=fake", "GET", null],
    ["/api/project/draft", "GET", null],
    ["/api/payment/create", "POST", { tierId: "starter" }],
    ["/api/tools/run", "POST", { toolId: "prompt-doctor", input: { rawPrompt: "hi" } }],
  ]) {
    const r = await api(path, { method, body });
    if (r.status === 401) ok(`${method} ${path} → 401`);
    else fail(`${method} ${path}`, `expected 401, got ${r.status}`);
  }

  // --- Webhook invalid signature ---
  console.log("\nD. Webhook security");
  const badWebhook = await api("/api/payment/webhook", {
    method: "POST",
    body: {
      order_id: "fake-order",
      gross_amount: "65000",
      transaction_status: "settlement",
      status_code: "200",
      signature_key: "invalid-signature",
    },
  });
  if (badWebhook.status === 401) ok("webhook invalid signature → 401");
  else fail("webhook invalid signature", `got ${badWebhook.status}`);

  // --- Cross-user isolation ---
  console.log("\nE. Cross-user isolation");
  const userA = await createTestUser("a");
  const userB = await createTestUser("b");

  const project = await prisma.project.create({
    data: {
      userId: userA.id,
      idea: "Secret project A",
      status: "DONE",
      clarifications: {},
      presets: { agentTool: "cursor" },
      files: {
        create: [
          {
            fileKey: "prd",
            fileName: "PRD.md",
            label: "PRD",
            content: "# PRD",
            tokensUsed: 100,
          },
        ],
      },
    },
    include: { files: true },
  });

  const exportB = await api(`/api/export?projectId=${project.id}`, { cookie: userB.cookie });
  if (exportB.status === 403) ok("User B export project A → 403");
  else fail("cross-user export", `got ${exportB.status}`);

  const projectApiB = await api(`/api/project/${project.id}`, { cookie: userB.cookie });
  if (projectApiB.status === 403 || projectApiB.status === 404) {
    ok(`User B GET project A → ${projectApiB.status}`);
  } else fail("cross-user project", `got ${projectApiB.status}`);

  const filePatchB = await api(`/api/project/${project.id}/files/prd`, {
    method: "PATCH",
    cookie: userB.cookie,
    body: { content: "# Unauthorized replacement" },
  });
  if (filePatchB.status === 403 || filePatchB.status === 404) {
    ok(`User B PATCH file project A → ${filePatchB.status}`);
  } else fail("cross-user file patch", `got ${filePatchB.status}`);

  const deleteProjectB = await api(`/api/project/${project.id}`, {
    method: "DELETE",
    cookie: userB.cookie,
  });
  if (deleteProjectB.status === 403 || deleteProjectB.status === 404) {
    ok(`User B DELETE project A → ${deleteProjectB.status}`);
  } else fail("cross-user project delete", `got ${deleteProjectB.status}`);

  const { tsImport } = await import("tsx/esm/api");
  const { CreditService, CreditServiceError } = await tsImport(
    "../src/lib/services/credit.service.ts",
    import.meta.url
  );
  await prisma.creditLedger.create({
    data: {
      userId: userA.id,
      type: "MONTHLY_REFRESH",
      amount: 100,
      balanceAfter: 100,
      metadata: { automatedTest: true },
    },
  });
  const reservation = await CreditService.reserveCredit(userA.id, 8, project.id, {
    automatedTest: true,
  });
  let ownershipError = null;
  try {
    await CreditService.releaseReservation(userB.id, reservation.reservationId, "cross_user_test");
  } catch (error) {
    ownershipError = error;
  }
  if (
    ownershipError instanceof CreditServiceError &&
    ownershipError.code === "RESERVATION_MISMATCH" &&
    ownershipError.statusCode === 403
  ) {
    ok("User B release reservation user A → 403");
  } else {
    fail("cross-user reservation release", ownershipError?.message ?? "release unexpectedly worked");
  }

  await CreditService.releaseReservation(userA.id, reservation.reservationId, "automated_test");
  await CreditService.releaseReservation(userA.id, reservation.reservationId, "automated_test_retry");
  const releaseCount = await prisma.creditLedger.count({
    where: {
      userId: userA.id,
      type: "RESERVATION_RELEASE",
      metadata: { path: ["reservationId"], equals: reservation.reservationId },
    },
  });
  if (releaseCount === 1) ok("reservation release retry is idempotent");
  else fail("reservation release idempotency", `created ${releaseCount} release rows`);

  // --- Draft limit ---
  console.log("\nF. Draft server-side");
  const draftUser = await createTestUser("draft");
  for (let i = 1; i <= 5; i++) {
    const r = await api("/api/project/draft", {
      method: "POST",
      cookie: draftUser.cookie,
      body: {
        idea: `Draft idea ${i} — automated test`,
        planData: { step: i },
        presets: { framework: "nextjs" },
      },
    });
    if (r.status !== 200) {
      fail(`draft save ${i}`, `${r.status} ${JSON.stringify(r.json)}`);
      break;
    }
    if (i === 5) ok("5 draft saves succeed");
  }
  const sixth = await api("/api/project/draft", {
    method: "POST",
    cookie: draftUser.cookie,
    body: {
      idea: "Draft ke-6 should fail",
      planData: { step: 6 },
    },
  });
  if (sixth.status === 409) ok("6th draft → 409");
  else fail("draft limit", `expected 409, got ${sixth.status}`);

  const listDrafts = await api("/api/project/draft", { cookie: draftUser.cookie });
  if (listDrafts.status === 200 && Array.isArray(listDrafts.json.drafts)) {
    ok(`GET drafts returns ${listDrafts.json.drafts.length} entries`);
  } else fail("list drafts", JSON.stringify(listDrafts.json));

  // --- Multi-month payment ---
  console.log("\nG. Multi-bulan payment");
  const payUser = await createTestUser("pay");
  const multi = await api("/api/payment/create", {
    method: "POST",
    cookie: payUser.cookie,
    body: { tierId: "pro", billingMonths: 3 },
  });
  if (multi.status === 200 && multi.json.snapToken) {
    ok("Pro 3 bulan snap token created");
    if (multi.json.orderId?.includes("m3-")) ok("orderId contains m3- tag");
    else fail("orderId multi-bulan", multi.json.orderId ?? "missing");
  } else {
    fail("multi-bulan payment", `${multi.status} ${JSON.stringify(multi.json)}`);
  }

  // --- Tier gating ---
  console.log("\nK. Tier capabilities");
  const starterUser = await createTestUser("starter-cap");
  await prisma.user.update({
    where: { id: starterUser.id },
    data: { tier: "STARTER" },
  });
  await prisma.subscription.create({
    data: {
      userId: starterUser.id,
      tier: "STARTER",
      status: "ACTIVE",
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 86400000),
      expiresAt: new Date(Date.now() + 30 * 86400000),
    },
  });
  const starterProject = await prisma.project.create({
    data: {
      userId: starterUser.id,
      idea: "Starter regen test",
      status: "DONE",
      clarifications: {},
      presets: { agentTool: "cursor" },
      files: {
        create: [
          {
            fileKey: "prd",
            fileName: "PRD.md",
            label: "PRD",
            content: "# PRD\n\n## Problem\nTest",
            tokensUsed: 50,
          },
        ],
      },
    },
  });
  const regenStarter = await api(`/api/project/${starterProject.id}/regen`, {
    method: "POST",
    cookie: starterUser.cookie,
    body: { fileKey: "prd" },
  });
  if (regenStarter.status === 403) ok("Starter regen per file → 403");
  else fail("Starter regen", `expected 403, got ${regenStarter.status}`);

  const proUser = await createTestUser("pro-cap");
  await prisma.user.update({ where: { id: proUser.id }, data: { tier: "PRO" } });
  await prisma.subscription.create({
    data: {
      userId: proUser.id,
      tier: "PRO",
      status: "ACTIVE",
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 86400000),
      expiresAt: new Date(Date.now() + 30 * 86400000),
    },
  });
  await prisma.creditLedger.create({
    data: {
      userId: proUser.id,
      type: "MONTHLY_REFRESH",
      amount: 7000,
      balanceAfter: 7000,
    },
  });
  await prisma.user.update({
    where: { id: proUser.id },
    data: { creditBalance: 7000 },
  });
  const mePro = await api("/api/user/me", { cookie: proUser.cookie });
  if (mePro.status === 200 && (mePro.json.tier === "pro" || mePro.json.plan === "pro")) {
    ok("Pro user /api/user/me shows pro tier");
  } else {
    fail("Pro user me", JSON.stringify(mePro.json?.tier ?? mePro.json));
  }

  // --- Export tree via tsx (real module) ---
  console.log("\nH. Export tree module");
  try {
    const { execSync } = await import("node:child_process");
    const out = execSync(
      `npx tsx -e "import { buildExportTree } from './src/lib/export-tree.ts'; const t = buildExportTree([{fileName:'PRD.md'}],{agentTool:'cursor'}); console.log(JSON.stringify(t.children?.map(c=>c.name)))"`,
      { cwd: process.cwd(), encoding: "utf8" }
    ).trim();
    const names = JSON.parse(out);
    if (names.includes("PRD.md") && names.includes(".cursorrules")) {
      ok("buildExportTree cursor → PRD.md + .cursorrules");
    } else fail("buildExportTree", out);
  } catch (e) {
    fail("buildExportTree", e.message?.slice(0, 120) ?? String(e));
  }

  // --- RLS via SQL ---
  console.log("\nI. RLS (database)");
  const rls = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('users','projects','payments','interview_sessions','waitlist_entries')
    ORDER BY tablename
  `);
  const allRls = rls.every((r) => r.rowsecurity === true);
  if (allRls && rls.length >= 5) ok(`RLS enabled on ${rls.length} tables`);
  else fail("RLS", JSON.stringify(rls));

  // --- Env sanity ---
  console.log("\nJ. Environment");
  const envChecks = [
    ["GEMINI_API_KEY", Boolean(process.env.GEMINI_API_KEY)],
    ["UPSTASH_REDIS_REST_URL", Boolean(process.env.UPSTASH_REDIS_REST_URL)],
    ["CRON_SECRET", Boolean(process.env.CRON_SECRET)],
    ["RATE_LIMIT_REQUIRED", process.env.RATE_LIMIT_REQUIRED === "true"],
    ["MIDTRANS_SERVER_KEY", Boolean(process.env.MIDTRANS_SERVER_KEY)],
  ];
  for (const [name, okVal] of envChecks) {
    if (okVal) ok(`env ${name}`);
    else fail(`env ${name}`, "missing or false");
  }

  console.log("\n--- Cleanup ---");
  await cleanup();
  ok("test users removed");

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  await prisma.$disconnect();
  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await cleanup().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
