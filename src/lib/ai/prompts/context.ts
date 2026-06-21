import { buildBaseContext, GenerationInput } from "./shared";

export function buildContextPrompt(input: GenerationInput): string {
  const base = buildBaseContext(input);

  return `You are a senior product strategist helping a developer set up a new software project.

Generate a **context.md** file — the master reference document that all AI coding agents will read at the start of every session.

${base}

---

Generate with these exact sections:

1. **Project Identity** — product name (infer from idea), tagline, category, status (MVP Development)
2. **What is this product?** — 2–3 paragraph description
3. **Tech Stack** — table: Layer | Technology. Use the selected framework preset.
4. **Project Structure** — directory tree of expected folder layout
5. **Database Schema (Summary)** — brief overview of main tables
6. **Main Application Flow** — numbered steps from landing to core feature
7. **AI Generation Architecture** — if the product uses AI internally
8. **Design System** — primary color, theme, font (based on design preset)
9. **Conventions & Rules** — naming, code style, git workflow
10. **Environment Variables** — all required env vars as KEY=

Rules:
- Output only valid Markdown.
- Be specific and concrete — avoid vague statements.
- The context.md must be self-contained enough for an AI agent to understand the full project.
- Do NOT use placeholder text like "[your value here]". Make reasonable assumptions.`;
}
