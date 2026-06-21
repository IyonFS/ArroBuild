# ArroBuild — MVP Plan (v2)

**Timeline:** 4 minggu  
**Target:** Produk live, bisa di-share ke komunitas, bisa capture email  
**Builder:** 1 developer (solo)  
**Stack:** Next.js 15 + Tailwind + shadcn/ui + Supabase + Multi-Model AI (Gemini, GPT, Claude, DeepSeek) + Vercel  
**Target Market:** Indonesia (Bahasa Indonesia first, multi-model AI)

---

## 🗓️ Progress Summary

> Last updated: 2026-06-21

| Phase | Status | Keterangan |
|---|---|---|
| Day 1–2: Project Setup | ✅ Done | Next.js, Tailwind, shadcn/ui, ESLint, Prettier, Vercel CI/CD |
| Day 3: Supabase Setup | ✅ Done | Prisma v7 + pg adapter, migration `init` berhasil |
| Day 4: Google Gemini API | ✅ Done | SDK, generator.ts, orchestrator.ts, prompt templates |
| Day 5: Landing Page | ✅ Done | Landing page, dark theme live |
| Day 6–8: Idea Input + Preset UI | ✅ Done | Halaman `/generate`, 5 step flow |
| Day 9–10: AI Generation Engine | ✅ Done | SSE route, orchestrator, DB integration |
| Day 11–12: Generation Progress UI | ✅ Done | SSE consumer, real-time streaming |
| Week 3: Preview, Export, Email | ✅ Done | Zip export, email capture, toast |
| Week 4: Launch Prep | ✅ Done | Analytics, SEO, OG Image |
| **v2: Tier System** | ✅ Done | 3-tier (Free/Paid/Unlimited), multi-model AI |
| **v2: Token Optimization** | ✅ Done | summarizeForContext(), ~37% token reduction |
| **v2: Bug Fixes** | ✅ Done | Retry logic, markdown validation, stream wrapper fix |
| **v2: New File Templates** | ✅ Done | 8 file templates total (PRD→Growth-Quality) |
| **v2: Multi-Model AI** | ✅ Done | Gemini, GPT-4o, Claude Sonnet 4, DeepSeek V3 |
| **v2: Auth + Payments** | ✅ Done | Google + email/password, Midtrans sandbox, dashboard |

### ⏩ Next Steps

1. **[DONE]** Halaman `/docs` — edukasi vibe coding per level
2. **[DONE]** Midtrans sandbox — Snap + confirm + webhook
3. **[DONE]** Auth — Google + email/password + reset password
4. **[DONE]** Dashboard + polish UI app pages
5. **[IN PROGRESS]** Deploy Vercel — lihat `docs/LAUNCH-CHECKLIST.md`
6. **[TODO]** Cross-browser testing (Chrome, Firefox, Safari, mobile)
7. **[TODO]** Soft launch ke komunitas

---

## Arsitektur AI Generation (v2)

### Tier System

| Tier | Model AI yang Tersedia | File yang Di-generate | Harga |
|------|------------------------|----------------------|-------|
| **Free** | Gemini 2.5 Flash, DeepSeek V3 | PRD saja | Rp 0 |
| **Paid** | Semua Free + Gemini 2.5 Pro, GPT-4o, Claude Sonnet 4 | PRD, Context, Plan, Design-System, Agents | Rp 49K–99K/bulan |
| **Unlimited** | Semua model (5 pilihan) | Semua Paid + Production-Hardening, Scale-Performance, Growth-Quality | Rp 199K/bulan (selamanya) |

### Model AI yang Didukung

| Model | Provider | Tier | Kelebihan |
|-------|----------|------|-----------|
| **Gemini 2.5 Flash** | Google | Free | Cepat, gratis, cocok untuk PRD sederhana |
| **DeepSeek V3** | DeepSeek | Free | Open-source, kualitas tinggi, biaya rendah |
| **Gemini 2.5 Pro** | Google | Paid | Output panjang berkualitas, reasoning kuat |
| **GPT-4o** | OpenAI | Paid | Instruksi akurat, formatting rapi |
| **Claude Sonnet 4** | Anthropic | Paid | Nuansa bahasa terbaik, detail mendalam |

User bisa memilih model AI favorit mereka di halaman preset sebelum generation dimulai. Free tier terbatas pada model gratis, sementara Paid/Unlimited mendapat akses ke semua model premium.

### Token Optimization Strategy

**Masalah sebelumnya:** Setiap prompt mengirim full content file sebelumnya sebagai context → boros token (~20,000 input tokens per generation).

**Solusi:** `summarizeForContext()` — fungsi yang mengekstrak heading + first sentence per section, menjaga context tetap relevan sambil menghemat ~60% token.

| File | Input Tokens (Sebelum) | Input Tokens (Sesudah) | Penghematan |
|------|----------------------|----------------------|-------------|
| PRD | ~500 | ~500 | 0% |
| Context | ~4,500 | ~1,200 | 73% |
| Plan | ~5,000 | ~1,500 | 70% |
| Design-System | ~5,500 | ~1,200 | 78% |
| Agents | ~4,500 | ~1,100 | 76% |
| **Total (Paid)** | **~20,000** | **~5,500** | **~72%** |

### Generation Flow

```
User Input → Tier Check → User Picks AI Model → Sequential Generation:
  
  Free:      Model (Flash/DeepSeek) → PRD
  Paid:      Model (5 pilihan) → Context → PRD → Plan → Design-System → Agents
  Unlimited: Model (5 pilihan) → Context → PRD → Plan → Design → Agents → Prod → Scale → Growth
```

### Bug Fixes Applied
- ✅ Retry logic dengan exponential backoff (1.5s → 3s → 6s)
- ✅ Markdown validation (cek heading, min length 800 chars)
- ✅ Auto-strip markdown code block wrapper dari output AI
- ✅ Retry event dikirim ke UI agar chunks di-reset
- ✅ Prompt optimization: XML-style instructions, kurangi redundansi

---

## Perhitungan Modal & Biaya

### Biaya AI Per Generation

**Free Tier:**

| Model | File | Input Tokens | Output Tokens | Cost |
|-------|------|-------------|--------------|------|
| Gemini 2.5 Flash | PRD | ~500 | ~3,000 | **$0.00** (free tier Google) |
| DeepSeek V3 | PRD | ~500 | ~3,000 | **~$0.001** |

**Paid Tier (5 files) — per model:**

| Model | Est. Cost per Generation | Pricing Ref |
|-------|-------------------------|-------------|
| Gemini 2.5 Pro | ~$0.024 | $1.25/1M in, $10/1M out |
| GPT-4o | ~$0.035 | $2.50/1M in, $10/1M out |
| Claude Sonnet 4 | ~$0.038 | $3/1M in, $15/1M out |
| DeepSeek V3 | ~$0.005 | $0.27/1M in, $1.10/1M out |

**Unlimited Tier (8 files) — per model:**

| Model | Est. Cost per Generation |
|-------|-------------------------|
| Gemini 2.5 Pro | ~$0.036 |
| GPT-4o | ~$0.053 |
| Claude Sonnet 4 | ~$0.057 |
| DeepSeek V3 | ~$0.008 |

### Analisis Profitabilitas

| Tier | Harga/bulan | Avg Cost/gen (worst case) | Generations break-even |
|------|------------|--------------------------|------------------------|
| Free | Rp 0 | ~$0.001 (DeepSeek) | N/A (lead gen) |
| Starter | Rp 49K (~$3) | ~$0.038 (Claude) | ~79 generations |
| Pro | Rp 99K (~$6) | ~$0.038 (Claude) | ~158 generations |
| Unlimited | Rp 199K (~$12) | ~$0.057 (Claude) | ~211 generations |

> **Margin tetap tinggi!** Worst case (user selalu pilih Claude Sonnet): Starter user generate 10 project/bulan = ~$0.38 biaya AI → profit margin 87%. Jika user pilih DeepSeek/Gemini, margin bisa 95%+.

### Total Modal Operasional Bulanan

| Item | Free (dev) | 100 users | 1000 users |
|------|-----------|-----------|------------|
| AI API (Gemini/GPT/Claude/DeepSeek) | $0 | ~$5 | ~$50 |
| Supabase (Free→Pro) | $0 | $0 | $25 |
| Vercel (Hobby→Pro) | $0 | $0 | $20 |
| Domain (arrobuild.com) | $1/bulan | $1 | $1 |
| Midtrans (payment fee) | $0 | ~$5 | ~$50 |
| **Total** | **~$1** | **~$11** | **~$146** |

### Revenue Projection

| Bulan | Users | Konversi 5% | MRR (avg Rp 75K) | Profit |
|-------|-------|-------------|-------------------|--------|
| 1 | 100 | 5 | Rp 375K | Rp 240K |
| 3 | 500 | 25 | Rp 1.875M | Rp 1.6M |
| 6 | 1,000 | 50 | Rp 3.75M | Rp 1.9M |
| 12 | 3,000 | 150 | Rp 11.25M | Rp 9M |

---

## Strategi Penjualan & Go-To-Market

### Pricing (Pasar Indonesia)

| Tier | Harga | Fitur |
|------|-------|-------|
| **Free** | Rp 0 | 1 project, PRD saja, 2 model gratis (Gemini Flash, DeepSeek V3) |
| **Starter** | Rp 49K/bulan | 10 projects, 5 file, semua 5 model AI (termasuk GPT-4o, Claude Sonnet 4) |
| **Pro** | Rp 99K/bulan | Unlimited projects, 5 file, semua model, revisi via chat, custom presets |
| **Unlimited** | Rp 199K/bulan | Semua Pro + 3 file advanced, semua model, selamanya |

### Payment Gateway
- **Midtrans** — QRIS, GoPay, OVO, Dana, Transfer Bank (pasar Indonesia)
- **Stripe** — kartu kredit international (fallback)

### Channel Distribusi

1. **Discord & Telegram** — Developer communities Indonesia
2. **YouTube/TikTok** — Tutorial "Cara Vibe Coding dengan ArroBuild"
3. **SEO** — Target keywords: "bikin PRD AI", "vibe coding Indonesia", "cursor rules generator", "AI project planning"
4. **Partnership** — Kolaborasi dengan Raf Dev (ngodingpakeai), channel YouTube dev Indonesia
5. **WhatsApp groups** — Developer lokal, bootcamp alumni

### Kompetitor: ngodingpakeai.com

| Aspek | ngodingpakeai | ArroBuild |
|-------|--------------|-----------|
| Output | 1 PRD | 1–8 file bundle |
| Model | Multi-model (GPT, Claude, DeepSeek) | **5 model**: Gemini Flash, DeepSeek V3, Gemini Pro, GPT-4o, Claude Sonnet 4 |
| Pricing | Rp 75K–349K/bulan | Rp 0–199K/bulan |
| Unique Value | Komunitas besar, AndalAI chat | Bundle lengkap, preset system, zip export, pilih model |
| Payment | Midtrans | Midtrans + Stripe |

**Diferensiasi utama ArroBuild:**
- Generate **bundle lengkap** (bukan cuma PRD)
- **Multi-model AI** — user pilih model favorit (Gemini, GPT, Claude, DeepSeek)
- **Preset system** (Framework × Design × Agent Tool)
- **Zero friction** — no login untuk free tier
- **Harga lebih kompetitif** — free tier yang berguna + 2 model gratis

---

## Halaman Docs / Edukasi

Halaman `/docs` akan berisi panduan vibe coding per level:

### Struktur Konten

1. **Pemula (Free tier)** — "Apa itu Vibe Coding?"
   - Apa itu AI coding agent
   - Cara pakai Cursor / Claude Code dasar
   - Kenapa PRD penting sebelum coding
   - Tutorial: generate PRD pertama kamu

2. **Intermediate (Starter/Pro)** — "Menjadi Vibe Coder Produktif"
   - Setup project dengan dokumen fondasi lengkap
   - Cara pakai context.md sebagai master reference
   - Design system integration
   - AI agent workflow: PM → Architect → UI → Code → Review

3. **Advanced (Unlimited)** — "Production-Ready Vibe Coding"
   - Production hardening checklist
   - Scaling dari 0 ke 10K users
   - Growth hacking untuk indie SaaS
   - CI/CD dan monitoring setup

---

## Post-MVP Backlog (Phase 2)

### High Priority
- [ ] User authentication (Google login via Supabase Auth)
- [ ] Payment integration (Midtrans untuk Indonesia)
- [ ] Project dashboard — history semua project
- [ ] Halaman `/docs` — edukasi vibe coding per level
- [ ] Chat/revision flow — revisi file yang sudah di-generate
- [x] Multi-model support (GPT-4o, Claude Sonnet 4, DeepSeek V3 + Gemini)

### Medium Priority
- [ ] Re-generate single file tanpa regenerate semua
- [ ] Inline markdown editing sebelum download
- [ ] Project sharing (share link untuk preview docs)
- [ ] Design preset dengan token yang lebih spesifik
- [ ] Custom template library

### Low Priority
- [ ] GitHub integration — push docs langsung ke repo
- [ ] Notion export
- [ ] Team collaboration
- [ ] Template library dari community
- [ ] API untuk third-party integration

---

## Definition of Done (MVP v2)

- [x] User bisa generate PRD gratis dari idea
- [x] Tier system (Free/Paid/Unlimited) berfungsi
- [x] Multi-model AI (Gemini, GPT-4o, Claude Sonnet 4, DeepSeek) sesuai tier
- [x] File bundle sesuai tier (1/5/8 files)
- [x] Download zip berjalan tanpa error
- [x] Email capture berjalan
- [x] Token optimization terpasang (summarizeForContext)
- [x] Retry logic dan markdown validation berfungsi
- [x] Landing page menjelaskan produk dengan jelas
- [x] Analytics terpasang
- [ ] Halaman docs/edukasi live
- [ ] Payment gateway terpasang
- [ ] User auth terpasang
- [ ] Testing cross-browser selesai

---

## Risk & Mitigation (Updated)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| API rate limit saat launch | Medium | High | Queue + retry. Rate limit 10 gen/jam |
| Generation terlalu lama (>3 min) | Medium | High | Stream progress, timeout 2 min/file, fallback shorter prompt |
| AI output tidak konsisten | High | High | Markdown validation + auto-strip wrapper + retry 3x |
| Biaya API melebihi ekspektasi | Low | Medium | Token optimization (72% hemat). Monitor di Google AI Studio |
| Kompetisi ngodingpakeai | Medium | Medium | Diferensiasi: bundle, presets, zero-friction free tier |
| Payment gateway issues (Midtrans) | Low | High | Fallback ke Stripe. Test thorough sebelum launch |
