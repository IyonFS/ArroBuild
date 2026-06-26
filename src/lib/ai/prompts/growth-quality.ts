/**
 * growth-quality.ts — Tier-aware growth-quality.md prompt builder (v3)
 *
 * PRO_MAX only: Growth Strategy, Monetization, QA, Analytics.
 */

import { buildBaseContext, type GenerationInput } from "./shared";
import type { V3Tier } from "../tier-enforcer";

export function buildGrowthQualityPrompt(
  input: GenerationInput,
  tier: V3Tier = "PRO_MAX", // eslint-disable-line @typescript-eslint/no-unused-vars
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const contextBlock = accumulatedContext
    ? `\n<accumulated_context>\n${accumulatedContext}\n</accumulated_context>\n`
    : "";

  return `You are a growth strategist and quality assurance expert for indie SaaS products.

Generate a **growth-quality.md** — a comprehensive growth strategy and quality assurance plan.

${base}
${contextBlock}
---

Create a comprehensive guide divided into two parts:

## Part 1: Growth Strategy

**1. Go-To-Market Plan**
- Launch timeline (pre-launch, launch day, post-launch)
- Channel strategy (which platforms, in what order)
- Community building approach (Discord, Twitter, etc.)

**2. User Acquisition**
- Organic channels (SEO keywords specific to niche, content strategy)
- Paid channels (if any)
- Referral/viral mechanics baked into the product

**3. Activation & Retention**
- First-time user experience optimization
- "Aha moment" definition
- Onboarding flow
- Re-engagement triggers (emails, notifications)

**4. Monetization Strategy**
- Pricing psychology & positioning
- Free-to-paid conversion funnel optimization
- Upsell opportunities

## Part 2: Quality Assurance

**5. Testing Strategy**
- Unit test coverage targets
- Integration test plan
- E2E test scenarios (critical paths)

**6. User Experience QA**
- Browser compatibility matrix
- Mobile responsiveness checklist
- Accessibility audit checklist (WCAG 2.1 AA)

**7. Analytics & Experimentation**
- Key metrics dashboard design (what to track on day 1)
- Data-driven decision process (how to analyze the tracked data)

=== OUTPUT RULES ===
- Output ONLY raw markdown. No code block wrapping.
- Start directly with: # Growth & Quality Plan — [product name]
- Include specific, actionable items — not vague advice.
- SEO keywords should be highly specific to the product niche.`;
}
