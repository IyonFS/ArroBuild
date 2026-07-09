/**
 * Comprehensive smoke test — run with dev server on :3000
 * Usage: node scripts/smoke-test.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
let passed = 0;
let failed = 0;
const failures = [];

function loadCronSecret() {
  try {
    const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    const m = env.match(/^CRON_SECRET=(.+)$/m);
    return m?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    failures.push({ name, msg });
    console.error(`  ✗ ${name}: ${msg}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function json(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { res, body };
}

async function main() {
  console.log(`\n=== Smoke Test (${BASE}) ===\n`);

  // --- Pages ---
  console.log("Pages:");
  for (const path of ["/", "/generate", "/dashboard", "/auth/login"]) {
    await test(`GET ${path} → 200`, async () => {
      const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
      assert(res.status === 200 || res.status === 307, `got ${res.status}`);
    });
  }

  await test("GET /project/cmwdemo320000seedarrobuild → 200 or redirect", async () => {
    const res = await fetch(`${BASE}/project/cmwdemo320000seedarrobuild`, {
      redirect: "manual",
    });
    assert([200, 307, 308].includes(res.status), `got ${res.status}`);
  });

  // --- Auth guards ---
  console.log("\nAuth guards (expect 401):");
  for (const [name, path, opts] of [
    ["GET /api/user/me", "/api/user/me", {}],
    ["GET /api/project/[id]", "/api/project/cmwdemo320000seedarrobuild", {}],
    ["POST /api/interview quota", "/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "quota" }),
    }],
    ["POST /api/payment/create", "/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId: "starter" }),
    }],
  ]) {
    await test(name, async () => {
      const { res } = await json(path, opts);
      assert(res.status === 401, `expected 401, got ${res.status}`);
    });
  }

  // --- Public / semi-public APIs ---
  console.log("\nPublic APIs:");
  await test("GET /api/waitlist → capacities", async () => {
    const { res, body } = await json("/api/waitlist");
    assert(res.status === 200, `got ${res.status}`);
    assert(body.capacities, "missing capacities");
    assert(typeof body.capacities.starter?.maxSeats === "number", "starter capacity");
  });

  await test("GET /api/waitlist?tier=starter", async () => {
    const { res, body } = await json("/api/waitlist?tier=starter");
    assert(res.status === 200, `got ${res.status}`);
    assert(body.capacity?.tier === "starter", "wrong tier");
  });

  await test("GET /api/payment/config", async () => {
    const { res, body } = await json("/api/payment/config");
    assert(res.status === 200, `got ${res.status}`);
    assert(body.clientKey, "missing clientKey");
  });

  // --- Cron ---
  console.log("\nCron:");
  const cronSecret = loadCronSecret();
  await test("POST /api/cron/expire-subscriptions no auth → 401", async () => {
    const { res } = await json("/api/cron/expire-subscriptions", { method: "POST" });
    assert(res.status === 401, `got ${res.status}`);
  });

  if (cronSecret) {
    await test("POST /api/cron/expire-subscriptions with secret → 200", async () => {
      const { res, body } = await json("/api/cron/expire-subscriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${cronSecret}` },
      });
      assert(res.status === 200, `got ${res.status}: ${JSON.stringify(body)}`);
      assert(body.ok === true, "missing ok:true");
    });
  } else {
    console.log("  ⚠ skip cron auth test — CRON_SECRET not in .env.local");
  }

  // --- Validation ---
  console.log("\nValidation:");
  await test("POST /api/waitlist invalid tier → 422", async () => {
    const { res } = await json("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierId: "invalid-tier" }),
    });
    assert(res.status === 422, `got ${res.status}`);
  });

  await test("POST /api/export no auth → 401", async () => {
    const { res } = await json("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: "fake" }),
    });
    assert(res.status === 401, `got ${res.status}`);
  });

  // --- DB-backed demo project files ---
  console.log("\nDemo project (unauth page only):");
  await test("Demo project API blocked without login", async () => {
    const { res, body } = await json("/api/project/cmwdemo320000seedarrobuild");
    assert(res.status === 401, `got ${res.status}`);
    assert(body?.code === "UNAUTHORIZED" || body?.error, "expected error body");
  });

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  - ${f.name}: ${f.msg}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
