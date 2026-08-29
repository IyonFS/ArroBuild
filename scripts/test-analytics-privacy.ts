import assert from "node:assert/strict";
import {
  classifyGenerationFailure,
  sanitizeAnalyticsProperties,
} from "../src/lib/analytics-policy";

let passed = 0;

function test(name: string, run: () => void) {
  run();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log("\n=== Analytics Privacy Tests ===\n");

test("raw error and prompt properties are removed", () => {
  const safe = sanitizeAnalyticsProperties("generation_failed", {
    errorCode: "timeout",
    error: "provider response containing user input",
    prompt: "private product idea",
  });
  assert.deepEqual(safe, { errorCode: "timeout" });
});

test("email is removed from capture analytics", () => {
  const safe = sanitizeAnalyticsProperties("email_captured", {
    optIn: true,
    email: "private@example.com",
  });
  assert.deepEqual(safe, { optIn: true });
});

test("non-scalar values are removed", () => {
  const safe = sanitizeAnalyticsProperties("generation_started", {
    tier: "core",
    mode: { unsafe: true },
  });
  assert.deepEqual(safe, { tier: "core" });
});

test("quota errors receive a stable code", () => {
  assert.equal(
    classifyGenerationFailure("429 RESOURCE_EXHAUSTED quota exceeded"),
    "provider_quota",
  );
});

test("credit errors receive a stable code", () => {
  assert.equal(classifyGenerationFailure("402: Kredit tidak cukup"), "insufficient_credit");
});

test("network errors receive a stable code", () => {
  assert.equal(classifyGenerationFailure("fetch failed: ENOTFOUND"), "network");
});

test("unrecognized provider detail becomes unknown", () => {
  assert.equal(
    classifyGenerationFailure("Provider rejected private payload: project Acme"),
    "unknown",
  );
});

console.log(`\n=== Results: ${passed} passed, 0 failed ===\n`);
