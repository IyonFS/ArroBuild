import { TIER, pricingSlugFromTierId, tierIdFromPricingSlug } from "../src/lib/config/tiers";

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

console.log("\n=== Tier Mapping Tests ===\n");

assert("base maps to BASE", tierIdFromPricingSlug("base") === TIER.BASE);
assert("core maps to CORE", tierIdFromPricingSlug("core") === TIER.CORE);
assert("prime maps to PRIME", tierIdFromPricingSlug("prime") === TIER.PRIME);
assert("legacy starter maps to BASE", tierIdFromPricingSlug("starter") === TIER.BASE);
assert("legacy pro maps to CORE", tierIdFromPricingSlug("pro") === TIER.CORE);
assert("legacy pro_max maps to PRIME", tierIdFromPricingSlug("pro_max") === TIER.PRIME);
assert("legacy unlimited maps to PRIME", tierIdFromPricingSlug("unlimited") === TIER.PRIME);
assert("unknown plan is rejected", tierIdFromPricingSlug("enterprise") === null);
assert("BASE emits canonical base slug", pricingSlugFromTierId(TIER.BASE) === "base");
assert("CORE emits canonical core slug", pricingSlugFromTierId(TIER.CORE) === "core");
assert("PRIME emits canonical prime slug", pricingSlugFromTierId(TIER.PRIME) === "prime");

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
