import {
  assertSafeIntegrationEnvironment,
  integrationEnvironmentViolations,
} from "./lib/integration-environment.mjs";

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

console.log("\n=== Integration Environment Safety Tests ===\n");

const safe = {
  ALLOW_INTEGRATION_TESTS: "true",
  INTEGRATION_TEST_ENV: "test",
  NODE_ENV: "test",
  VERCEL_ENV: "preview",
  MIDTRANS_IS_PRODUCTION: "false",
};

assert("explicit test environment is accepted", integrationEnvironmentViolations(safe).length === 0);
assert(
  "missing opt-in is rejected",
  integrationEnvironmentViolations({ ...safe, ALLOW_INTEGRATION_TESTS: undefined }).length === 1
);
assert(
  "missing test label is rejected",
  integrationEnvironmentViolations({ ...safe, INTEGRATION_TEST_ENV: undefined }).length === 1
);
assert(
  "production Node environment is rejected",
  integrationEnvironmentViolations({ ...safe, NODE_ENV: "production" }).length === 1
);
assert(
  "production Vercel environment is rejected",
  integrationEnvironmentViolations({ ...safe, VERCEL_ENV: "production" }).length === 1
);
assert(
  "production Midtrans mode is rejected",
  integrationEnvironmentViolations({ ...safe, MIDTRANS_IS_PRODUCTION: "true" }).length === 1
);

let threw = false;
try {
  assertSafeIntegrationEnvironment({});
} catch (error) {
  threw = error instanceof Error && error.message.includes("dibatalkan");
}
assert("unsafe environment fails closed", threw);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
