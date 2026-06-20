# ArroBuild — MVP Plan

**Timeline:** 4 minggu  
**Target:** Produk live, bisa di-share ke komunitas, bisa capture email  
**Builder:** 1 developer (solo)  
**Stack:** Next.js 14 + Tailwind + shadcn/ui + Supabase + Anthropic API + Vercel

---

## Overview Timeline

```
Week 1  → Foundation & Setup
Week 2  → Core Generation Engine
Week 3  → UI Polish & Export
Week 4  → Launch Prep & Go Live
```

---

## Week 1 — Foundation & Setup

**Goal:** Semua infrastruktur siap, bisa akses semua service, halaman dasar sudah ada.

### Day 1–2: Project Setup

- [ ] Init Next.js 14 project dengan TypeScript (`npx create-next-app@latest`)
- [ ] Setup Tailwind CSS + shadcn/ui
- [ ] Konfigurasi ESLint + Prettier
- [ ] Setup `.env.local` dengan semua environment variables
- [ ] Push ke GitHub, setup repository
- [ ] Deploy ke Vercel (empty project, pastikan CI/CD jalan)
- [ ] Setup domain (jika sudah punya) atau gunakan `.vercel.app`

### Day 3: Supabase Setup

- [ ] Buat Supabase project baru
- [ ] Setup Prisma dengan PostgreSQL connection string dari Supabase
- [ ] Buat schema awal:
  ```prisma
  model Project {
    id          String   @id @default(cuid())
    idea        String
    presets     Json
    status      String   @default("pending")
    email       String?
    files       GeneratedFile[]
    createdAt   DateTime @default(now())
  }

  model GeneratedFile {
    id        String   @id @default(cuid())
    projectId String
    fileName  String
    content   String   @db.Text
    project   Project  @relation(fields: [projectId], references: [id])
  }
  ```
- [ ] Run `npx prisma migrate dev` — buat tabel
- [ ] Test koneksi database

### Day 4: Anthropic API Setup

- [ ] Install Anthropic SDK (`npm install @anthropic-ai/sdk`)
- [ ] Buat `/lib/ai/generator.ts` — utility function untuk call API
- [ ] Test simple generation dengan hardcoded prompt
- [ ] Verifikasi response streaming berjalan
- [ ] Estimasi biaya per generation (kalkulasi token)

### Day 5: Landing Page (Skeleton)

- [ ] Buat layout utama dengan sidebar + main content area
- [ ] Landing page dengan: hero section, problem/solution section, CTA button
- [ ] Dark theme sesuai design-system.md diterapkan (warna, font, spacing)
- [ ] Responsive untuk mobile
- [ ] Deploy dan review di production

**Deliverable Week 1:** Project jalan di production, database siap, API terhubung, landing page live.

---

## Week 2 — Core Generation Engine

**Goal:** User bisa input idea → sistem generate file → tampil di UI.

### Day 6–7: Idea Input & Clarification Flow

- [ ] Buat halaman `/generate`
- [ ] Step 1: Textarea untuk idea input
  - Validasi minimal 50 karakter
  - Character counter
  - Contoh placeholder text
- [ ] Step 2: Clarification Questions component
  - 3 pertanyaan: platform, monetization, scope
  - Toggle/select button UI (bukan dropdown)
  - Skip option per pertanyaan
- [ ] State management antar steps (gunakan `useState` atau Zustand)
- [ ] Progress indicator antar steps (dots / step pills)

### Day 8: Preset Selector

- [ ] Step 3: Preset Selection UI
  - 3 kategori: Framework, Design, Agent Tool
  - Card grid dengan icon per pilihan
  - Visual active state (border green, checkmark)
  - Default selection untuk masing-masing kategori
- [ ] Store semua selection ke state

### Day 9–10: AI Generation Engine

- [ ] Buat `/app/api/generate/route.ts` — POST endpoint
- [ ] Buat prompt templates untuk 5 file MVP:
  - `lib/ai/prompts/context.ts`
  - `lib/ai/prompts/prd.ts`
  - `lib/ai/prompts/tech-stack.ts`
  - `lib/ai/prompts/tasks.ts`
  - `lib/ai/prompts/mvp-roadmap.ts`
- [ ] Sequential generation: generate satu file, simpan, lanjut ke file berikutnya
- [ ] Streaming progress ke client via Server-Sent Events (SSE)
- [ ] Simpan setiap file ke database setelah selesai di-generate
- [ ] Error handling: jika 1 file gagal, retry 1x sebelum skip

### Day 11–12: Generation Progress UI

- [ ] Step 4: Generation Progress screen
  - List 5 file dengan status (pending / generating / done)
  - Animated spinner untuk file yang sedang di-generate
  - Green checkmark untuk file yang selesai
  - Real-time update via SSE
- [ ] Setelah semua selesai, auto-redirect ke preview

**Deliverable Week 2:** Full generation flow jalan end-to-end. User bisa input idea dan lihat 5 file di-generate.

---

## Week 3 — Preview, Export & Email Capture

**Goal:** User bisa review hasil, download, dan sistem bisa capture email.

### Day 13–14: Document Preview

- [ ] Step 5: Preview screen
  - Tab navigation per file (context, prd, tech-stack, tasks, roadmap)
  - Markdown renderer (gunakan `react-markdown` + `remark-gfm`)
  - Syntax highlighting untuk code blocks (`highlight.js` atau `shiki`)
  - Scroll per file, fixed tabs di atas
- [ ] Raw markdown toggle (lihat source)
- [ ] Copy to clipboard button per file

### Day 15: Email Capture

- [ ] Modal email capture sebelum download
  - Field email
  - Checkbox: "Beritahu saya saat fitur baru tersedia"
  - CTA: "Download gratis"
- [ ] Simpan email ke database (field di tabel `Project`)
- [ ] Kirim email konfirmasi via Resend:
  - Subject: "ArroBuild — Foundation siap untuk [nama proyek]"
  - Isi: link download (atau instruksi), tips cara menggunakan docs

### Day 16: Zip Export

- [ ] Install `jszip` (`npm install jszip`)
- [ ] Buat `/app/api/export/route.ts`
  - Ambil semua file dari database berdasarkan project ID
  - Zip dengan struktur: `/arrobuild-[project-name]/`
  - Response sebagai binary download
- [ ] Client-side: trigger download setelah email submit
- [ ] Test zip dapat dibuka dan file di dalamnya valid

### Day 17–18: Polish & Edge Cases

- [ ] Loading skeleton saat generation berjalan
- [ ] Error state UI (jika API down, timeout, dll)
- [ ] Toast notifications untuk success/error
- [ ] Mobile responsiveness untuk semua steps
- [ ] Test full flow dari awal sampai download di mobile

**Deliverable Week 3:** Full flow selesai. User bisa generate → preview → input email → download zip.

---

## Week 4 — Launch Prep & Go Live

**Goal:** Produk siap di-share ke publik. Analytics terpasang. Feedback loop terbuka.

### Day 19–20: Landing Page Final

- [ ] Hero section dengan tagline final: "Generate everything before your first line of code."
- [ ] Demo / GIF atau screenshot hasil generation
- [ ] Section: "What you get" — tampilkan semua 5 file dengan deskripsi singkat
- [ ] Section: "How it works" — 3 langkah sederhana
- [ ] Section: FAQ (5 pertanyaan umum)
- [ ] Footer: link ke Twitter/X, email kontak

### Day 21: Analytics & Tracking

- [ ] Pasang Vercel Analytics (sudah built-in, aktifkan di dashboard)
- [ ] Custom events tracking:
  - `idea_submitted` — saat user submit idea
  - `generation_started` — saat generation dimulai
  - `generation_completed` — saat semua file selesai
  - `email_captured` — saat email disubmit
  - `zip_downloaded` — saat zip berhasil didownload
- [ ] Funnel analysis: berapa % yang dari input sampai download

### Day 22: SEO & Meta

- [ ] Title + meta description yang jelas
- [ ] Open Graph image (buat di Figma atau Canva) — 1200×630px
- [ ] Twitter card meta
- [ ] sitemap.xml (gunakan `next-sitemap`)
- [ ] robots.txt
- [ ] Daftarkan ke Google Search Console

### Day 23: Final Testing

- [ ] Test full flow di Chrome, Firefox, Safari
- [ ] Test di mobile (iOS Safari, Android Chrome)
- [ ] Test dengan slow 3G connection (Chrome DevTools)
- [ ] Test error scenarios: API timeout, invalid input, network error
- [ ] Pastikan tidak ada console errors di production

### Day 24: Soft Launch

- [ ] Post di komunitas:
  - Indie Hackers
  - Reddit r/SideProject
  - Twitter/X dengan demo GIF atau screen recording
  - WhatsApp/Telegram group developer lokal
- [ ] Share ke 5–10 orang yang bisa memberikan feedback
- [ ] Monitor Vercel logs dan Supabase dashboard
- [ ] Siapkan form feedback (Tally atau Google Form sederhana)

### Day 25–28: Buffer & Iteration

- [ ] Perbaiki bug yang ditemukan dari soft launch
- [ ] Implementasi feedback kritis dari early users
- [ ] Hard launch: Product Hunt submission (opsional, tergantung kesiapan)
- [ ] Mulai pikirkan fitur Phase 2 berdasarkan feedback

**Deliverable Week 4:** Produk live dan sudah di-share ke komunitas. Ada setidaknya 10 orang yang sudah menggunakannya.

---

## Post-MVP Backlog (Phase 2)

Fitur-fitur ini tidak masuk MVP tapi sudah diidentifikasi berdasarkan kebutuhan user:

### High Priority
- [ ] User authentication (Supabase Auth)
- [ ] Project dashboard — history semua project
- [ ] Full 11-file bundle (tambah: design-system, ui-rules, user-flow, database-schema, agents, cursor-rules)
- [ ] Framework-specific deep customization
- [ ] Agent tool-specific file format (CLAUDE.md, .windsurfrules, dll)

### Medium Priority
- [ ] Stripe integration — Pro plan $9/bulan
- [ ] Inline markdown editing sebelum download
- [ ] Project sharing (share link untuk preview docs)
- [ ] Design preset dengan token yang lebih spesifik
- [ ] Re-generate single file tanpa regenerate semua

### Low Priority
- [ ] GitHub integration — push docs langsung ke repo
- [ ] Notion export
- [ ] Team collaboration
- [ ] Template library dari community
- [ ] API untuk third-party integration

---

## Definition of Done (MVP)

MVP dianggap selesai dan siap launch ketika:

- [ ] User bisa generate 5 file dari idea dalam <2 menit
- [ ] Download zip berjalan tanpa error
- [ ] Email capture berjalan dan email konfirmasi terkirim
- [ ] Tidak ada blocking bug di Chrome, Firefox, Safari
- [ ] Mobile-usable (bisa digunakan di smartphone meski bukan dioptimalkan)
- [ ] Landing page menjelaskan produk dengan jelas kepada orang yang belum tahu
- [ ] Analytics terpasang dan tracking key events
- [ ] Setidaknya 1 non-developer bisa mengerti cara menggunakannya

---

## Risk & Mitigation

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Anthropic API rate limit saat launch | Medium | High | Implement queue + retry logic. Set rate limit 10 generations/jam |
| Generation terlalu lama (>3 menit) | Medium | High | Stream progress real-time, set timeout 2 menit per file, fallback ke shorter prompt |
| AI output tidak konsisten / berkualitas rendah | High | High | A/B test prompt templates minggu 2. Iterasi prompt sebelum launch |
| Biaya API melebihi ekspektasi | Low | Medium | Monitor cost per generation. Set usage limit di Anthropic dashboard |
| Tidak ada traction setelah launch | Medium | Medium | Sudah ada plan distribusi ke komunitas. Fokus pada 1 channel dulu |

---

## Budget Estimasi (Month 1)

| Item | Estimasi Cost |
|---|---|
| Anthropic API (100 free generations) | ~$15–30 |
| Supabase (Free tier) | $0 |
| Vercel (Hobby plan) | $0 |
| Domain (arrobuild.com) | ~$12/tahun |
| Resend (Free tier: 3000 email/bulan) | $0 |
| **Total Month 1** | **~$30–45** |

Break-even point: 4–5 Pro subscribers ($9/bulan) sudah cover semua biaya operasional.
