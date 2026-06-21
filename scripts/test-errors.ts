import { formatGenerationError, isQuotaError } from "../src/lib/ai/errors";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

console.log("\n=== Error Formatting Tests ===\n");

const raw429 = `ApiError: {"error":{"message":"quota exceeded free_tier limit: 20","code":429,"status":"RESOURCE_EXHAUSTED"}}`;
const formatted = formatGenerationError(new Error(raw429));
assert("429 free tier → friendly message", formatted.includes("Kuota API Gemini"));
assert("429 free tier → no raw JSON", !formatted.includes("{"));

const rateLimit = formatGenerationError(
  new Error('429 retry in 45.2s RESOURCE_EXHAUSTED')
);
assert("429 with retry → wait message", rateLimit.includes("46"));

assert("isQuotaError detects free tier", isQuotaError(new Error(raw429)));

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
