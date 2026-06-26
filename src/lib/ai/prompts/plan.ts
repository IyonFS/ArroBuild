/**
 * plan.ts — Tier-aware plan.md prompt builder (v3)
 *
 * FREE:    Development plan sederhana — setup, core features, deploy. Checklist format.
 * PRO:     Terstruktur — phase breakdown + estimasi waktu + dependency order + testing.
 * PRO_MAX: Production-grade sprint plan — per-sprint goals, DoD, spesifik per tech stack.
 */

import { buildBaseContext, type GenerationInput, type FrameworkPreset } from "./shared";
import type { V3Tier } from "../tier-enforcer";

const FRAMEWORK_STACK_DEFAULTS: Partial<Record<FrameworkPreset, string>> = {
  nextjs:
    "Next.js 15+ (App Router) + Tailwind CSS + shadcn/ui + Supabase + Prisma + Vercel",
  nuxt: "Nuxt 3 + Tailwind CSS + Supabase + Pinia + Vercel",
  remix: "Remix + Tailwind CSS + Prisma + PostgreSQL + Fly.io",
  sveltekit: "SvelteKit + Tailwind CSS + Supabase + Prisma + Vercel",
  astro: "Astro + Tailwind CSS + Sanity CMS + Cloudflare Pages",
  "react-spa": "React (Vite) + Tailwind CSS + React Query + Supabase + Netlify",
  "vue-spa": "Vue 3 (Vite) + Tailwind CSS + Pinia + Supabase + Netlify",
  "vanilla-js": "Vanilla JS + Vite + Tailwind CSS + Supabase + Netlify",
  laravel:
    "Laravel 12 + Filament 3 + PostgreSQL + Horizon + Cashier + Forge/Vapor",
  express: "Express.js + TypeScript + Prisma + PostgreSQL + Redis + Railway",
  nestjs: "NestJS + TypeScript + Prisma + PostgreSQL + Redis + AWS",
  django: "Django 5 + DRF + PostgreSQL + Celery + Redis + Railway",
  rails: "Rails 7 + Hotwire + PostgreSQL + Sidekiq + Fly.io",
  fastapi: "FastAPI + SQLAlchemy + PostgreSQL + Redis + Celery + Railway",
  "go-fiber": "Go Fiber + GORM + PostgreSQL + Redis + Docker + Fly.io",
  hono: "Hono + Cloudflare Workers + D1 + R2 + Supabase",
  "react-native": "React Native (Expo) + Supabase + Zustand + Stripe + EAS Build",
  flutter: "Flutter + Supabase + Riverpod + Stripe + Firebase",
  expo: "Expo (React Native) + Supabase + Jotai + EAS Build",
  "ai-recommend": "AI will recommend the best stack based on product requirements.",
};

const DEPTH_INSTRUCTIONS: Record<V3Tier, string> = {
  FREE: `
Buat development plan sederhana dalam format checklist markdown:

## Phase 1: Setup & Foundation (Hari 1-2)
- Setup environment, install dependencies, konfigurasi dasar

## Phase 2: Core Features (Minggu 1-2)
- Implementasi fitur-fitur utama MVP, satu per satu

## Phase 3: Polish & Deploy (Minggu 3-4)
- Testing, bugfix, dan deployment ke production

Format setiap task sebagai: \`- [ ] Nama task (est: Xh)\`
Sertakan command-command setup yang spesifik (npm install, dsb).
Realistis untuk solo developer.`,

  PRO: `
Buat development plan yang terstruktur dengan 4 phase:

Setiap phase sertakan:
- Estimasi durasi (dalam hari/minggu)
- Daftar task spesifik dengan acceptance criteria singkat
- Dependency order (task mana yang harus selesai sebelum task lain)
- Testing checkpoint di akhir setiap phase

Bagian yang HARUS ada:
1. **Tech Stack** — tabel dengan layer, teknologi, dan justifikasi pemilihan
2. **Setup & Prerequisites** — command-by-command untuk setup awal
3. **Phase 1: Foundation** — project scaffold, auth, database, routing dasar
4. **Phase 2: Core Features** — implementasi fitur P0 dengan sub-task atomik
5. **Phase 3: Enhancement** — fitur P1, error handling, loading states
6. **Phase 4: Launch Preparation** — testing, performance, SEO, deployment
7. **Deployment Checklist** — langkah deploy ke production dengan platform yang dipilih
8. **Post-launch Monitoring** — metric yang harus dipantau minggu pertama

Format task: \`- [ ] Task name (est: Xh)\``,

  PRO_MAX: `
Buat development plan production-grade berbasis sprint (1-2 minggu per sprint):

Setiap sprint sertakan:
- Sprint Goal — apa yang dicapai di sprint ini
- Task list dengan granularitas: tiap task bisa diselesaikan dalam 1 sesi coding (2-4 jam)
- Definition of Done per task
- Testing requirements

Bagian yang HARUS ada:
1. **Tech Stack Decision** — tabel lengkap dengan justifikasi + trade-off
2. **Architecture Overview** — diagram folder structure + aliran data
3. **Database Schema** — tabel utama dengan kolom dan relasi
4. **API Endpoint Checklist** — semua endpoint yang perlu dibuat per fitur
5. **Sprint 0: Setup** (Hari 1-3) — environment, CI/CD, project scaffold
   Sertakan command exacts yang spesifik untuk framework yang dipilih
6. **Sprint 1: Foundation** — auth, database, routing, layout dasar
7. **Sprint 2: Core Feature 1** — fitur P0 pertama, complete dengan tests
8. **Sprint 3: Core Feature 2** — fitur P0 kedua
9. **Sprint 4: Enhancement & Integration** — fitur P1, third-party integrations
10. **Sprint 5: Hardening & Launch** — security, performance, monitoring, deploy
11. **Testing Strategy** — unit test + integration test + E2E per layer
12. **CI/CD Pipeline** — GitHub Actions / platform CI workflow
13. **Risk Register** — risiko teknis + mitigation

Format task: \`- [ ] Task name (est: Xh)\` dengan acceptance criteria`,
};

export function buildPlanPrompt(
  input: GenerationInput,
  tier: V3Tier = "FREE",
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const frameworkStack =
    FRAMEWORK_STACK_DEFAULTS[input.presets.framework] ??
    `${input.presets.framework} with appropriate modern packages`;
  const contextBlock = accumulatedContext
    ? `\n<accumulated_context>\n${accumulatedContext}\n</accumulated_context>\n`
    : "";

  return `You are a senior engineering manager and technical lead.

Generate a **plan.md** (Development Plan).

${base}

Base Framework Stack: ${frameworkStack}
${contextBlock}
---

${DEPTH_INSTRUCTIONS[tier]}

=== OUTPUT RULES ===
- Output ONLY raw markdown. No code block wrapping.
- Start directly with: # Development Plan — [product name]
- Tasks must be specific to ${input.presets.framework} ecosystem.
- Include actual commands where relevant (npm install, prisma migrate, etc).
- Be opinionated — one recommendation per category.
- Realistic for solo developer / indie hacker budget.`;
}
