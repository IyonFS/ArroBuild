<p align="center">
  <img src="public/Readme-img.svg" width="100%" alt="ArroBuild — Generate everything before your first line of code" />
</p>

<h1 align="center">ArroBuild</h1>

<p align="center">
  <strong>Generate everything before your first line of code.</strong>
</p>

<p align="center">
  AI-powered documentation generator yang mengubah ide produk menjadi paket fondasi proyek lengkap — PRD, arsitektur, design system, agent rules, dan hingga 14 file <code>.md</code> siap pakai untuk Cursor, Claude Code, Windsurf, atau tim manusia.
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel" alt="Vercel" /></a>
</p>

<p align="center">
  <a href="#tentang">Tentang</a> ·
  <a href="#fitur">Fitur</a> ·
  <a href="#alur-produk">Alur</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#getting-started">Setup</a> ·
  <a href="#dokumentasi">Docs</a> ·
  <a href="#deployment">Deploy</a>
</p>

---

## Tentang

ArroBuild dibuat untuk **vibe coders**, indie hackers, dan solo developers yang ingin fondasi proyek rapi sebelum menulis kode pertama.

| Masalah | Solusi ArroBuild |
|---------|------------------|
| Langsung coding tanpa perencanaan → scope creep | Generate PRD, arsitektur, dan plan terstruktur dari awal |
| Context hilang tiap sesi AI baru | Knowledge Model JSON + FEAT-ID lintas dokumen |
| Desain & komponen ad-hoc | Design System & Agent Rules siap diikuti agent |
| Tidak ada source of truth | Workspace IDE + export ZIP dengan folder tree |

> **Prinsip:** Dokumentasi bukan beban — itu fondasi yang membuat AI coding agent bekerja konsisten dari hari pertama.

---

## Fitur

### Generate — dari ide ke 14 dokumen

- **14 tipe dokumen** — PRD, Architecture, Plan/Task, Design System, Agent Rules, Adaptive Document, dan 8 modul opsional
- **4 kelas model AI** — Hemat · Menengah · Flagship · Ultra (pilih per dokumen)
- **Multi-provider** — Gemini, OpenAI, Anthropic, DeepSeek dengan fallback chain
- **Knowledge Model JSON** — data terstruktur dengan pelacakan FEAT-ID
- **SSE streaming** — pantau dokumen ditulis secara real-time

### Mode Dipandu AI

Interview chat ~8 turn yang mengekstrak konteks produk dan mengisi form generate secara otomatis — cocok untuk yang belum punya PRD matang.

### Workspace IDE

```
┌─────────────┬──────────────────────┬─────────────┐
│  File Tree  │   Markdown Editor    │   Preview   │
│  (sidebar)  │   + revisi section   │   + export  │
└─────────────┴──────────────────────┴─────────────┘
```

- Revisi per section dengan diff view
- Regen per file (tier Prime)
- Cross-reference FEAT-ID antar dokumen
- Export ZIP dengan preview folder tree

### Learn Hub

6 learning paths · 24 lessons · 3 tracks (Foundation → Workflow → Advanced). Gratis, tanpa login.

### Mini Tools

| Tool | Fungsi |
|------|--------|
| Prompt Doctor | Rapikan prompt untuk Cursor / Claude Code |
| MVP Scope Cutter | Potong scope ke MVP yang realistis |
| Stitch Composer | Compose prompt untuk Google Stitch |
| README Generator | Generate README + setup script |
| Landing Copy | Hero, value props, FAQ dari konteks produk |
| Schema Visualizer | ER diagram Mermaid dari deskripsi schema |

### Monetisasi & paket

| Paket | Harga | Highlight |
|-------|-------|-----------|
| **Base** | Rp 65K/bulan | 3 dokumen inti · 3.000 kredit · model Hemat |
| **Core** | Rp 145K/bulan | 5 dokumen inti · 7.000 kredit · fork & presets |
| **Prime** | Rp 199K/bulan | 6 inti + 8 opsional · revisi unlimited · semua mini tools |

Pembayaran via **Midtrans** (QRIS, GoPay, OVO, VA, kartu). Top-up kredit tersedia. Sistem kredit dengan multiplier per kelas model.

---

## Alur Produk

```
Login / Signup
    ↓
Generate Flow (tipe produk → konteks → stack → dokumen → konfirmasi)
    ↓                              ↘ Mode Dipandu AI (opsional)
Paywall & Midtrans
    ↓
SSE Generate → Workspace IDE → Revisi / Regen → Export ZIP
```

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js 16.2 (App Router) · React 19 · TypeScript 5 |
| **Styling** | Tailwind CSS v4 · Design System **Neon Blueprint v3.1** |
| **UI** | shadcn/ui · Lucide · Simple Icons · Framer Motion |
| **Database** | PostgreSQL (Supabase) · Prisma 7.8 |
| **Auth** | Supabase Auth (Email + Google OAuth) |
| **AI** | Multi-provider gateway + orchestrator + SSE streaming |
| **Payment** | Midtrans Snap |
| **Rate limit** | Upstash Redis |
| **Validation** | Zod 4.4 |
| **Observability** | Sentry · Vercel Analytics |
| **CI/CD** | GitHub Actions · Vercel |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** 10+
- Supabase project (PostgreSQL)
- Minimal satu AI API key (Gemini direkomendasikan)

### Installation

```bash
git clone https://github.com/IyonFS/ArroBuild.git
cd ArroBuild

npm install

cp .env.example .env.local
# Isi variabel di .env.local (Supabase, AI keys, Midtrans, Upstash)

npx prisma generate
npx prisma migrate dev

npm run dev
```

Buka **[http://localhost:3000](http://localhost:3000)**.

### Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:validation` | Validasi AI output |
| `npm run test:generate` | Test API generate |
| `npm run test:backend` | Test suite backend |
| `npm run test:production` | Automated production checks |

---

## Arsitektur

```
┌──────────────────────────────────────────┐
│              Browser (React 19)           │
└─────────────────┬────────────────────────┘
                  │ HTTPS / SSE
┌─────────────────┴────────────────────────┐
│           Next.js Server (Vercel)         │
│                                           │
│  Middleware → API Routes → Service Layer  │
│                    ↓                      │
│              AI Pipeline                  │
│  Orchestrator → Generator → Streaming     │
└──────┬──────────┬──────────┬─────────────┘
       │          │          │
  Supabase    Upstash    LLM APIs
  (Postgres)  (Redis)    (4 providers)
```

**Keputusan desain utama**

- **Modular monolith** — service layer terpisah tanpa overhead microservices
- **SSE streaming** — output AI real-time tanpa kompleksitas WebSocket
- **Reserve / Commit / Release** — pola kredit anti race condition
- **Knowledge Model JSON** — data terstruktur untuk prediktabilitas AI
- **Multi-provider LLM** — fallback chain untuk reliabilitas

---

## Struktur Proyek

```
ArroBuild/
├── prisma/                 # Schema, migrations, RLS
├── public/                 # Static assets (termasuk Readme-img.svg)
├── scripts/                # Test & automation scripts
├── docs/                   # Dokumentasi proyek (12 file)
├── src/
│   ├── app/                # App Router — pages & API routes
│   │   ├── api/            # generate, payment, project, tools, cron, …
│   │   ├── dashboard/      # Overview, upgrade, support
│   │   ├── generate/       # Multi-step generate flow
│   │   ├── project/        # Workspace IDE
│   │   ├── learn/          # Learn Hub
│   │   └── tools/          # Mini Tools
│   ├── components/         # UI per domain (auth, dashboard, generate, …)
│   └── lib/
│       ├── ai/             # Pipeline, prompts, orchestrator
│       ├── config/         # Tiers, documents, mini-tools
│       ├── services/       # Credit, payment, draft, …
│       └── ui/             # App icons, tech logos
├── next.config.ts
├── vercel.json             # Cron jobs
└── .env.example
```

---

## Dokumentasi

Semua spesifikasi produk & teknis ada di folder [`docs/`](docs/):

| Dokumen | Isi |
|---------|-----|
| [`01-PRD.md`](docs/01-PRD.md) | Product requirements & scope |
| [`02-ARCHITECTURE.md`](docs/02-ARCHITECTURE.md) | Arsitektur teknis & blueprint |
| [`03-DESIGN-SYSTEM.md`](docs/03-DESIGN-SYSTEM.md) | Design system Neon Blueprint v3.1 |
| [`04-AGENTS.md`](docs/04-AGENTS.md) | Aturan AI agent & konvensi kode |
| [`05-CONTEXT.md`](docs/05-CONTEXT.md) | Master context untuk AI agents |
| [`06-BACKEND.md`](docs/06-BACKEND.md) | API, services, payment, cron |
| [`07-FRONTEND.md`](docs/07-FRONTEND.md) | Struktur frontend & komponen |
| [`08-MONETIZATION.md`](docs/08-MONETIZATION.md) | Pricing, kredit, bisnis model |
| [`09-LEARN-HUB.md`](docs/09-LEARN-HUB.md) | Learn Hub structure |
| [`10-DEPLOYMENT.md`](docs/10-DEPLOYMENT.md) | Deploy, env, infrastruktur |
| [`11-TESTING.md`](docs/11-TESTING.md) | Strategi testing & scripts |
| [`12-DECISIONS-LOG.md`](docs/12-DECISIONS-LOG.md) | Log keputusan arsitektur |

---

## Deployment

### Vercel (recommended)

1. Push branch ke GitHub
2. Import project di Vercel
3. Set environment variables (lihat [`.env.example`](.env.example))
4. Jalankan `npx prisma migrate deploy`

Detail: [`docs/10-DEPLOYMENT.md`](docs/10-DEPLOYMENT.md)

### Cron jobs (`vercel.json`)

| Job | Jadwal | Fungsi |
|-----|--------|--------|
| `expire-subscriptions` | Harian 01:00 UTC | Nonaktifkan langganan kedaluwarsa |
| `renew-credits` | Harian 02:00 UTC | Refresh kredit bulanan |
| `reconcile-ledger` | Mingguan 03:00 UTC | Rekonsiliasi ledger kredit |

---

## Kontribusi & lisensi

Repository ini **private / proprietary**. Kontribusi eksternal hanya dengan persetujuan pemilik proyek.

---

<p align="center">
  <sub>Built for the vibe coding community · Indonesia</sub>
</p>

<p align="center">
  <img src="public/favicon.ico" width="32" height="32" alt="ArroBuild" />
</p>
