import { buildBaseContext, type GenerationInput } from "./shared";
import { buildFeatIdContextBlock } from "./yaml-metadata";
import type { PromptDepthTier } from "@/lib/config/documents";

const ADAPTIVE_SECTIONS: Record<string, string> = {
  saas: "Growth & Retention — onboarding strategy, retention metrics, churn reduction, revenue expansion",
  marketplace:
    "Trust & Transaction — trust building, commission rules, dispute handling, cold start liquidity",
  mobile:
    "Store & Distribution — app store checklist, offline-first, push notifications, versioning",
  api: "API Reference — endpoints, auth, rate limits, code examples, error codes",
  ecommerce:
    "Commerce Ops — inventory, payment flow, cart abandonment, returns/refunds",
  "ai-app":
    "AI Ops & Safety — token cost monitoring, privacy limits, AI fallback, output quality",
  internal:
    "Adoption Runbook — team adoption, legacy integration, training, internal support",
  portfolio: "Visibility Playbook — SEO, personal branding, CTAs",
  other: "Catatan Peluncuran Umum — generic launch checklist from user input",
};

export function buildAdaptiveDocumentPrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "PRIME",
  accumulatedContext = ""
): string {
  const productType = input.productType ?? "saas";
  const section = ADAPTIVE_SECTIONS[productType] ?? ADAPTIVE_SECTIONS.other;
  const base = buildBaseContext(input);
  const featBlock = buildFeatIdContextBlock(input);

  return `You are a senior product strategist.

Generate **adaptive-document.md** — strategic summary for product type "${productType}".

${base}
${featBlock ? `<feat_registry>\n${featBlock}\n</feat_registry>\n` : ""}
${accumulatedContext ? `<context>\n${accumulatedContext}\n</context>\n` : ""}

Focus area: ${section}

Depth: ${tier === "PRIME" ? "Strategic but actionable — 4-6 sections, concrete recommendations" : "Brief summary"}

RULES:
- This is a HIGH-LEVEL strategy doc — not duplicate optional modules in detail
- Reference FEAT-IDs, do not rewrite full feature specs
- Output ONLY raw markdown starting with # Adaptive Document`;
}
