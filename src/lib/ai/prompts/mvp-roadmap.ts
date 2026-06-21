import { buildBaseContext, summarizeForContext, GenerationInput } from "./shared";

export function buildMvpRoadmapPrompt(
  input: GenerationInput,
  contextMd: string,
  prdMd: string
): string {
  const base = buildBaseContext(input);
  const contextSummary = summarizeForContext(contextMd, 400);
  const prdSummary = summarizeForContext(prdMd, 400);

  return `You are a product launch strategist helping a solo developer ship their MVP in 4 weeks.

Generate a **mvp-roadmap.md** file — a detailed 4-week sprint plan from zero to live product.

${base}

<previous_docs>
${contextSummary}
---
${prdSummary}
</previous_docs>

---

Generate with these sections:

1. **Overview** — timeline (4 weeks), goal, builder profile, stack
2. **Week 1 — Foundation & Setup** — Day 1–5 with checkboxes, deliverable
3. **Week 2 — Core Feature** — Day 6–12 with checkboxes, deliverable
4. **Week 3 — Polish & Export** — Days with checkboxes, deliverable
5. **Week 4 — Launch Prep & Go Live** — Landing, analytics, SEO, testing, launch
6. **Post-MVP Backlog (Phase 2)** — High/Medium/Low
7. **Definition of Done (MVP)** — checklist
8. **Risk & Mitigation** — table: Risk | Probability | Impact | Mitigation
9. **Budget Estimation (Month 1)** — table: Item | Estimated Cost | Notes

Rules:
- Output only valid Markdown.
- All tasks as actionable checkboxes: \`- [ ] Task description\`
- Be realistic about 4 weeks solo developer capacity.
- Include specific tool commands where relevant.
- Budget: AI API, database, hosting, domain, email service.`;
}
