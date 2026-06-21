import { buildBaseContext, summarizeForContext, GenerationInput } from "./shared";

export function buildGrowthQualityPrompt(
  input: GenerationInput,
  contextMd: string,
  prdMd: string
): string {
  const base = buildBaseContext(input);
  const contextSummary = summarizeForContext(contextMd, 300);
  const prdSummary = summarizeForContext(prdMd, 300);

  return `You are a growth strategist and quality assurance expert for indie SaaS products.

Generate a **growth-quality.md** — a comprehensive growth strategy and quality assurance plan.

${base}

<previous_docs>
${contextSummary}
---
${prdSummary}
</previous_docs>

---

Generate with these sections:

## Part 1: Growth Strategy

1. **Go-To-Market Plan**
   - Launch timeline (pre-launch, launch day, post-launch)
   - Channel strategy (which platforms, in what order)
   - Content marketing plan (topics, format, frequency)
   - Community building approach

2. **User Acquisition**
   - Organic channels (SEO keywords, content, social)
   - Paid channels (budget, targeting, expected CAC)
   - Partnership & collaboration opportunities
   - Referral/viral mechanics

3. **Activation & Onboarding**
   - First-time user experience optimization
   - "Aha moment" definition
   - Onboarding flow with conversion targets
   - Email drip campaign sequence

4. **Retention & Engagement**
   - Feature usage tracking plan
   - Re-engagement triggers
   - Feedback loop (NPS, in-app surveys)
   - Community engagement plan

5. **Monetization Strategy**
   - Pricing psychology & positioning
   - Free-to-paid conversion funnel
   - Upsell opportunities
   - Revenue projections (Month 1, 3, 6, 12)

## Part 2: Quality Assurance

6. **Testing Strategy**
   - Unit test coverage targets
   - Integration test plan
   - E2E test scenarios (critical paths)
   - Manual QA checklist

7. **Code Quality**
   - Linting & formatting standards
   - Code review checklist
   - Technical debt management
   - Documentation standards

8. **User Experience QA**
   - Browser compatibility matrix
   - Mobile responsiveness checklist
   - Accessibility audit (WCAG 2.1 AA)
   - Performance budget enforcement

9. **Analytics & Experimentation**
   - Key metrics dashboard design
   - A/B testing framework
   - Feature flag strategy
   - Data-driven decision process

Rules:
- Output only valid Markdown.
- Include specific, actionable items — not vague advice.
- Revenue projections should include assumptions.
- SEO keywords should be specific to the product niche.`;
}
