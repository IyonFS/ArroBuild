import {
  CREDIT_MULTIPLIER,
  MODEL_CLASS,
  TIER,
  TIER_CONFIG,
  pricingSlugFromTierId,
  tierIdFromPricingSlug,
} from "../src/lib/config/tiers";
import {
  DEFAULT_CORE_DOCS_BY_TIER,
  OPTIONAL_DOCUMENT_KEYS,
  canAccessDocument,
} from "../src/lib/config/documents";
import { PRICING_TIERS, pricingIdToTierId } from "../src/lib/pricing";
import {
  MODEL_CLASSES,
  TIER_CREDIT_POOL,
  TIER_MODEL_CLASSES,
} from "../src/components/generate/types";
import { readFileSync } from "node:fs";

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

console.log("\n=== Tier Configuration Consistency ===\n");

for (const pricingTier of PRICING_TIERS) {
  const tierId = pricingIdToTierId(pricingTier.id);
  const config = TIER_CONFIG[tierId];

  assert(
    `${pricingTier.name} price matches business config`,
    pricingTier.priceAmount === config.priceIdr,
  );
  assert(
    `${pricingTier.name} credit copy matches business config`,
    pricingTier.features.some((feature) =>
      feature.includes(config.creditsPerMonth.toLocaleString("id-ID")),
    ),
  );
  assert(
    `${pricingTier.name} project limit copy matches business config`,
    pricingTier.features.some((feature) => feature.includes(String(config.maxProjectsPerMonth))),
  );
}

const tierCases = [
  { slug: "base", tierId: TIER.BASE },
  { slug: "core", tierId: TIER.CORE },
  { slug: "prime", tierId: TIER.PRIME },
] as const;

for (const { slug, tierId } of tierCases) {
  assert(
    `${slug} credit pool matches business config`,
    TIER_CREDIT_POOL[slug] === TIER_CONFIG[tierId].creditsPerMonth,
  );
  assert(
    `${slug} core documents match business config`,
    JSON.stringify(DEFAULT_CORE_DOCS_BY_TIER[slug]) ===
      JSON.stringify(TIER_CONFIG[tierId].coreDocuments),
  );
  assert(
    `${slug} model access matches business config`,
    JSON.stringify(TIER_MODEL_CLASSES[slug].map((modelClass) => modelClass.toUpperCase())) ===
      JSON.stringify(TIER_CONFIG[tierId].allowedModelClasses),
  );
}

for (const optionalDocument of OPTIONAL_DOCUMENT_KEYS) {
  assert(
    `${optionalDocument} is restricted to Prime`,
    !canAccessDocument(optionalDocument, "base") &&
      !canAccessDocument(optionalDocument, "core") &&
      canAccessDocument(optionalDocument, "prime"),
  );
}

const knowledgeModelCopy = readFileSync(
  new URL("../src/components/marketing/landing/KnowledgeModelSection.tsx", import.meta.url),
  "utf8",
);
assert(
  "landing states that optional modules are Prime-only",
  knowledgeModelCopy.includes("Prime: semua 14 dokumen termasuk 8 modul") &&
    !knowledgeModelCopy.includes("Core: 5 inti + modul opsional"),
);

const creditMultiplierBySlug = {
  hemat: CREDIT_MULTIPLIER[MODEL_CLASS.HEMAT],
  menengah: CREDIT_MULTIPLIER[MODEL_CLASS.MENENGAH],
  flagship: CREDIT_MULTIPLIER[MODEL_CLASS.FLAGSHIP],
  ultra: CREDIT_MULTIPLIER[MODEL_CLASS.ULTRA],
};

for (const modelClass of MODEL_CLASSES) {
  assert(
    `${modelClass.label} credit multiplier matches business config`,
    modelClass.creditsPer1kTokens === creditMultiplierBySlug[modelClass.id],
  );
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
