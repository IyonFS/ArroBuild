import {
  buildBaseContext,
  summarizeForContext,
  GenerationInput,
  FrameworkPreset,
} from "./shared";

const FRAMEWORK_STACK_DEFAULTS: Record<FrameworkPreset, string> = {
  nextjs:
    "Next.js 15+ (App Router) + Tailwind CSS + shadcn/ui + Supabase + Prisma + Vercel",
  laravel:
    "Laravel 12 + Filament 3 + PostgreSQL + Horizon + Cashier + Forge/Vapor",
  django:
    "Django 5 + DRF + PostgreSQL + Celery + Redis + Railway",
  rails:
    "Rails 7 + Hotwire + PostgreSQL + Sidekiq + Fly.io",
  fastapi:
    "FastAPI + SQLAlchemy + PostgreSQL + Redis + Celery + Railway",
};

export function buildPlanPrompt(
  input: GenerationInput,
  contextMd: string,
  prdMd: string
): string {
  const base = buildBaseContext(input);
  const contextSummary = summarizeForContext(contextMd, 500);
  const prdSummary = summarizeForContext(prdMd, 500);
  const frameworkStack = FRAMEWORK_STACK_DEFAULTS[input.presets.framework];

  return `You are a senior software architect and project planner helping a solo developer build their MVP in 4 weeks.

Generate a **plan.md** — a comprehensive development plan covering tech stack, task breakdown, and MVP roadmap in one file.

${base}

Base Framework Stack: ${frameworkStack}

<previous_docs>
${contextSummary}
---
${prdSummary}
</previous_docs>

---

Generate with these sections:

## Part 1: Tech Stack
1. **Stack Overview** — table: Layer | Technology | Justification
2. **Key Dependencies** — list of npm/pip packages with versions
3. **Architecture Decisions** — 3 key decisions with brief rationale
4. **Environment Variables** — table: Variable | Description | Required?

## Part 2: Task Breakdown
5. **Phase 0: Setup** (Day 1–2) — checkboxes with hour estimates
6. **Phase 1: Foundation** (Day 3–5) — checkboxes
7. **Phase 2: Core Feature** (Week 2) — atomic sub-tasks
8. **Phase 3: Polish** (Week 3) — error states, mobile, email
9. **Phase 4: Launch** (Week 4) — analytics, SEO, testing

## Part 3: Roadmap & Budget
10. **4-Week Timeline** — week-by-week deliverables
11. **Risk & Mitigation** — table: Risk | Probability | Impact | Mitigation
12. **Budget Estimation** — table: Item | Monthly Cost at 0/100/1000 users
13. **Definition of Done** — MVP checklist
14. **Post-MVP Backlog** — High/Medium/Low priority

Rules:
- Output only valid Markdown.
- Tasks as checkboxes: \`- [ ] Task (est: Xh)\`
- Be opinionated — one recommendation per category.
- Realistic for solo developer, indie hacker budget.`;
}
