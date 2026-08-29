/**
 * Authenticated API smoke test — requires dev server + .env.local
 * Usage: node scripts/smoke-test-auth.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const DEMO_PROJECT = "cmwdemo320000seedarrobuild";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return env;
}

function projectRef(url) {
  return new URL(url).hostname.split(".")[0];
}

function authCookieHeader(session) {
  const ref = projectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const payload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: "bearer",
    user: session.user,
  });
  return `sb-${ref}-auth-token=${encodeURIComponent(payload)}`;
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}: ${err instanceof Error ? err.message : err}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const env = loadEnv();
  process.env.NEXT_PUBLIC_SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: "paroarro07@gmail.com",
  });
  if (linkError || !linkData?.properties?.hashed_token) {
    console.error("Failed to generate link:", linkError?.message);
    process.exit(1);
  }

  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await anon.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "email",
  });
  if (error || !data.session) {
    console.error("Failed to verify OTP:", error?.message);
    process.exit(1);
  }

  const cookie = authCookieHeader(data.session);
  const authFetch = (path, opts = {}) =>
    fetch(`${BASE}${path}`, {
      ...opts,
      headers: {
        Cookie: cookie,
        ...(opts.headers ?? {}),
      },
    });

  console.log(`\n=== Authenticated Smoke Test (${BASE}) ===\n`);

  await test("GET /api/user/me → logged in user", async () => {
    const res = await authFetch("/api/user/me");
    const body = await res.json();
    assert(res.status === 200, `status ${res.status}`);
    assert(body.user?.email === "paroarro07@gmail.com", "wrong user");
    assert(body.user.creditBalance >= 100, "credits too low");
  });

  await test("GET /api/project/demo → 200 with files", async () => {
    const res = await authFetch(`/api/project/${DEMO_PROJECT}`);
    const body = await res.json();
    assert(res.status === 200, `status ${res.status}: ${JSON.stringify(body)}`);
    assert(body.project?.id === DEMO_PROJECT, "wrong project");
    assert(
      Array.isArray(body.project?.files) && body.project.files.length >= 1,
      "no files"
    );
  });

  await test("POST /api/interview quota → 200", async () => {
    const res = await authFetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "quota" }),
    });
    const body = await res.json();
    assert(res.status === 200, `status ${res.status}`);
    assert(typeof body.quota?.freeRemaining === "number", "missing quota");
  });

  await test("GET /api/export demo project → zip", async () => {
    const res = await authFetch(`/api/export?projectId=${DEMO_PROJECT}`);
    assert(res.status === 200, `status ${res.status}`);
    assert(res.headers.get("content-type")?.includes("zip"), "not zip");
    const buf = await res.arrayBuffer();
    assert(buf.byteLength > 100, "zip too small");
  });

  await test("GET /api/export wrong project → 403 or 404", async () => {
    const res = await authFetch("/api/export?projectId=notownedproject000");
    assert([403, 404].includes(res.status), `status ${res.status}`);
  });

  await test("POST /api/project/revise preview → 200 or 402", async () => {
    const res = await authFetch(`/api/project/${DEMO_PROJECT}/revise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "preview",
        fileKey: "prd",
        sectionName: "Problem Statement",
        instruction: "Perjelas satu kalimat saja untuk smoke test.",
      }),
    });
    const body = await res.json();
    assert([200, 402, 404, 422].includes(res.status), `status ${res.status}`);
    if (res.status === 200) {
      assert(body.preview || body.diff, "missing preview");
    }
  });

  await test("GET /api/user/credits", async () => {
    const res = await authFetch("/api/user/credits");
    const body = await res.json();
    assert(res.status === 200, `status ${res.status}`);
    assert(typeof body.creditBalance === "number", "missing balance");
  });

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
