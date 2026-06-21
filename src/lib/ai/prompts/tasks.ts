import { buildBaseContext, summarizeForContext, GenerationInput } from "./shared";

export function buildTasksPrompt(
  input: GenerationInput,
  contextMd: string,
  prdMd: string,
  techStackMd: string
): string {
  const base = buildBaseContext(input);
  const contextSummary = summarizeForContext(contextMd, 400);
  const prdSummary = summarizeForContext(prdMd, 400);
  const techSummary = summarizeForContext(techStackMd, 300);

  return `You are a senior engineering lead helping a solo developer plan their project execution.

Generate a **tasks.md** file — a complete, atomic task breakdown ready for execution.

${base}

<previous_docs>
${contextSummary}
---
${prdSummary}
---
${techSummary}
</previous_docs>

---

Generate with these sections:

1. **Phase 0: Setup & Infrastructure** (Day 1–2) — project init, deps, env, CI/CD
2. **Phase 1: Foundation** (Day 3–5) — DB schema, auth, base layout, landing skeleton
3. **Phase 2: Core Feature** (Week 2) — main user-facing feature from PRD, atomic sub-tasks
4. **Phase 3: Polish & Edge Cases** (Week 3) — error states, loading, mobile, email
5. **Phase 4: Launch Prep** (Week 4) — analytics, SEO, testing, deployment, soft launch
6. **Backlog (Post-MVP)** — High / Medium / Low priority lists

Task format:
- [ ] Task name (est: Xh)
  - Sub-task 1
  - Sub-task 2

Rules:
- Output only valid Markdown.
- Every task must be specific and actionable.
- Estimate hours realistically for a solo developer.
- Indicate dependencies with "(requires: task name)".
- Total Phase 0–4 ≈ 4 weeks.`;
}
