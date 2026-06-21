import {
  buildBaseContext,
  summarizeForContext,
  GenerationInput,
  DesignPreset,
  FrameworkPreset,
} from "./shared";

const DESIGN_PRESET_TRAITS: Record<DesignPreset, string> = {
  apple:
    "SF Pro / system-ui font, generous whitespace, subtle shadows, rounded-xl corners, neutral warm palette, minimal decoration",
  linear:
    "Inter font, dark mode first, purple accent (#5E5CE6), monospace code blocks, tight spacing, velocity-focused feel",
  stripe:
    "Inter font, clean white/light base, indigo/violet accent (#635BFF), enterprise feel, strong type hierarchy",
  notion:
    "Inter font, minimal styling, serif headings, lots of whitespace, neutral light grays, simplicity-first",
  vercel:
    "Geist font, dark mode first, white accent on dark, monospace heavy, sharp corners, high contrast, builder aesthetic",
};

const FRAMEWORK_STACK_DEFAULTS: Record<FrameworkPreset, string> = {
  nextjs:
    "Next.js 15+ (App Router) + Tailwind CSS + shadcn/ui + Supabase + Prisma + Stripe + Vercel",
  laravel:
    "Laravel 12 + Filament 3 + PostgreSQL + Laravel Horizon + Cashier + Forge/Vapor",
  django:
    "Django 5 + Django REST Framework + PostgreSQL + Celery + Redis + Railway",
  rails:
    "Rails 7 + Hotwire (Turbo + Stimulus) + PostgreSQL + Sidekiq + Stripe + Fly.io",
  fastapi:
    "FastAPI + SQLAlchemy + Alembic + PostgreSQL + Redis + Celery + Railway",
};

export function buildTechStackPrompt(
  input: GenerationInput,
  contextMd: string,
  prdMd: string
): string {
  const base = buildBaseContext(input);
  const designTraits = DESIGN_PRESET_TRAITS[input.presets.design];
  const frameworkStack = FRAMEWORK_STACK_DEFAULTS[input.presets.framework];
  const contextSummary = summarizeForContext(contextMd, 600);
  const prdSummary = summarizeForContext(prdMd, 500);

  return `You are a senior software architect helping a solo developer set up a production-ready tech stack.

Generate a **tech-stack.md** file.

${base}

Design Style Traits (${input.presets.design}): ${designTraits}
Base Framework Stack: ${frameworkStack}

<previous_docs>
${contextSummary}
---
${prdSummary}
</previous_docs>

---

Generate with these sections:

1. **Stack Overview** — table: Layer | Technology | Justification (Frontend, Styling, UI, Backend, Database, ORM, Auth, AI/LLM, Email, Payments, Deployment, CI/CD, Analytics)
2. **Framework Detail: ${input.presets.framework}** — specific packages, versions, why chosen
3. **Development Environment** — tools, runtime version, package manager, recommended extensions
4. **Environment Variables** — full list: VARIABLE_NAME | Description | Required?
5. **Project Dependencies** — split: Core, UI, Database, Auth, Payments, Email, Dev Dependencies
6. **Architecture Decisions** — 3–5 key decisions with rationale
7. **Scalability Notes** — what to change at 10k, 100k users
8. **Cost Estimation** — monthly cost at: 0 users (dev), 100 users, 1000 users

Rules:
- Output only valid Markdown.
- Be opinionated — one recommendation per category, not a list of options.
- Focus on indie hacker perspective: low cost, fast iteration, managed services.`;
}
