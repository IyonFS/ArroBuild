import { buildBaseContext, GenerationInput } from "./shared";

export function buildPrdPrompt(
  input: GenerationInput,
  contextMd?: string
): string {
  const base = buildBaseContext(input);

  // If contextMd is provided (paid tier), include a brief reference
  const contextRef = contextMd
    ? `\n<previous_context summary="true">\n${contextMd.slice(0, 800)}\n</previous_context>\n`
    : "";

  return `You are a senior product strategist with experience building B2B SaaS and developer tools.

Generate a **prd.md** (Product Requirements Document).

${base}
${contextRef}
---

Generate with these sections:

1. **Problem Statement** — 4–6 specific pain points
2. **Solution** — what the product does, main flow as numbered steps
3. **Target Users** — primary and secondary as tables: Segment | Description | Pain Point
4. **Core Value Proposition** — 1 headline + differentiators vs alternatives
5. **Features**
   - 5.1 Core Features (MVP) — detailed breakdown
   - 5.2 Premium Features — post-MVP features
6. **MVP Scope** — checkbox list: IN vs NOT in MVP
7. **Success Metrics** — Launch, Growth, Revenue with specific targets
8. **User Stories** — grouped by Epic: As a [user], I want [action], So that [benefit]
9. **Constraints & Assumptions** — Technical, Business, User
10. **Open Questions** — 4–5 unresolved design/business questions

Rules:
- Output only valid Markdown, no prose before or after.
- Be specific with numbers in metrics.
- Focus on clarity, specificity, realistic MVP scope.
- You MUST write ALL 10 sections completely. Do not stop until section 10 (Open Questions) is finished.
- Target at least 2500 characters total output.`;
}
