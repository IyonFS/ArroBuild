# ArroBuild — Project Context

> Ini adalah master file proyek. Baca file ini terlebih dahulu sebelum membaca file lain atau mulai coding.
> Setiap AI coding agent (Cursor, Claude Code, Windsurf, dll) harus menjadikan file ini sebagai referensi utama di setiap sesi.

---

## Identitas Produk

**Nama Produk:** ArroBuild  
**Tagline:** Generate everything before your first line of code.  
**Kategori:** SaaS / AI-powered developer tool  
**Status:** MVP Development  
**Target Launch:** 4 minggu dari sekarang

---

## Apa itu ArroBuild?

ArroBuild adalah aplikasi web yang membantu developer, indie hacker, dan vibe coder menyiapkan seluruh fondasi proyek sebelum mulai menulis kode.

User menginput deskripsi ide produk mereka → sistem menghasilkan paket 10+ file `.md` yang siap digunakan sebagai panduan pengembangan → user download sebagai `.zip` dan paste ke root proyek mereka.

**Masalah yang dipecahkan:** Vibe coders terlalu sering langsung coding tanpa perencanaan, menghasilkan proyek yang tidak terstruktur, AI yang menghasilkan kode berbeda-beda setiap sesi, dan tidak ada dokumentasi sebagai source of truth.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 15 (App Router) |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui |
| **Backend** | Next.js API Routes / Route Handlers |
| **Database** | PostgreSQL (via Supabase) |
| **ORM** | Prisma v7 |
| **Auth** | Supabase Auth (planned) |
| **AI / LLM** | Google Gemini API (gemini-2.5-flash free, gemini-2.5-pro paid) |
| **File Generation** | JSZip (server-side zip) |
| **Email Capture** | Resend (planned) |
| **Payment** | Midtrans (Indonesia) + Stripe (international) |
| **Deployment** | Vercel |
| **Analytics** | Vercel Analytics |

---

## Struktur Proyek

```
arrobuild/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Landing page, pricing
│   │   ├── page.tsx              # Landing page
│   │   └── pricing/page.tsx      # Pricing page
│   ├── (app)/                    # Authenticated area
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   ├── generate/page.tsx     # Main generation flow
│   │   └── projects/[id]/page.tsx # Project detail & preview
│   ├── api/
│   │   ├── generate/route.ts     # Core AI generation endpoint
│   │   ├── export/route.ts       # Zip export endpoint
│   │   └── webhook/stripe/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── generate/                 # Generation flow components
│   │   ├── IdeaInput.tsx
│   │   ├── ClarificationStep.tsx
│   │   ├── PresetSelector.tsx
│   │   ├── GenerationProgress.tsx
│   │   └── DocPreview.tsx
│   └── shared/                   # Shared components
├── lib/
│   ├── ai/
│   │   ├── prompts/              # AI prompt templates per file
│   │   └── generator.ts          # Core generation logic
│   ├── db/
│   │   └── prisma.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
└── public/
```

---

## Database Schema (Ringkasan)

**Tabel utama:**

- `users` — User accounts (via Supabase Auth)
- `projects` — Project records dengan idea, presets, dan status
- `generated_files` — File yang di-generate per project
- `subscriptions` — Stripe subscription data

Detail lengkap lihat: `database-schema.md`

---

## Alur Utama Aplikasi

```
Landing Page
  └── Generate Page (tanpa login untuk 1 project)
        ├── Step 1: Idea Input
        ├── Step 2: Clarification Questions (3 pertanyaan)
        ├── Step 3: Preset Selection (Framework + Design + Agent Tool)
        ├── Step 4: AI Generation (progress per file)
        ├── Step 5: Preview & Edit
        └── Step 6: Email Capture → Download .zip

Dashboard (setelah login)
  └── Project History
        └── Project Detail → Re-download / Iterate
```

Detail lengkap lihat: `user-flow.md`

---

## AI Generation Architecture

Generation engine menggunakan Google Gemini API dengan pendekatan sequential generation dan tier system:

### Tier System
| Tier | Model | File yang dihasilkan |
|------|-------|---------------------|
| Free | `gemini-2.5-flash` | PRD saja |
| Paid | `gemini-2.5-pro` | PRD, Context, Plan, Design-System, Agents |
| Unlimited | `gemini-2.5-pro` | Semua Paid + Production-Hardening, Scale-Performance, Growth-Quality |

### Token Optimization
Menggunakan `summarizeForContext()` untuk mengirim ringkasan dokumen sebelumnya, bukan full content. Menghemat ~72% input tokens.

**Alur generation:**
1. Context → PRD (dengan context summary) → Plan → Design-System → Agents → [Advanced files]
2. Streaming response untuk progress real-time
3. Retry logic (3x) dengan exponential backoff dan markdown validation

**Max tokens per file:** 4096 (free) / 8192 (paid)  
**Temperature:** 0.7

---

## Design System

**Tema:** Dark mode first (inspired by Linear, Vercel)  
**Primary color:** Green `#22c55e`  
**Background:** Dark navy `#0f1117`  
**Font:** Inter (Google Fonts)

Detail lengkap lihat: `design-system.md`

---

## Referensi File Lain

| File | Isi |
|---|---|
| `prd.md` | Product requirements, features, success metrics |
| `design-system.md` | Warna, tipografi, spacing, komponen |
| `ui-rules.md` | Aturan UX dan aksesibilitas |
| `user-flow.md` | Alur lengkap per halaman |
| `database-schema.md` | Skema database lengkap |
| `tech-stack.md` | Stack detail + package recommendations |
| `agents.md` | AI agent roles dan tanggung jawab |
| `cursor-rules.md` | Aturan coding untuk AI agent |
| `tasks.md` | Task breakdown per phase |
| `mvp-roadmap.md` | Timeline 4 minggu |

---

## Conventions & Rules

### Naming
- Komponen: PascalCase (`IdeaInput.tsx`, `PresetSelector.tsx`)
- Fungsi/hooks: camelCase (`useGeneration`, `generateFiles`)
- File API routes: kebab-case dalam folder (`api/generate/route.ts`)
- Database fields: snake_case (`created_at`, `user_id`)
- CSS classes: Tailwind utility classes, custom class hanya jika diperlukan

### Code Style
- TypeScript strict mode aktif
- No `any` types — gunakan proper types atau `unknown`
- Setiap server action dan API route harus punya error handling
- Gunakan Zod untuk validasi input
- Environment variables selalu di `.env.local`, tidak pernah hardcode

### Git
- Branch naming: `feature/nama-fitur`, `fix/nama-bug`, `chore/nama-task`
- Commit message: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)

---

## Environment Variables yang Diperlukan

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Gemini
GEMINI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Pricing Tiers

| Tier | Harga | Projects | Files | Model AI |
|---|---|---|---|---|
| **Free** | Rp 0 | 1 project | PRD saja | Gemini Flash (gratis) |
| **Starter** | Rp 49K/bulan | 10 projects | 5 file | Gemini Pro |
| **Pro** | Rp 99K/bulan | Unlimited | 5 file + revisi | Gemini Pro |
| **Unlimited** | Rp 199K/bulan | Unlimited | 8 file (semua) | Gemini Pro |

---

## Contacts & Links

- **Repository:** github.com/[username]/arrobuild
- **Production:** arrobuild.com (TBD)
- **Staging:** arrobuild.vercel.app (TBD)
