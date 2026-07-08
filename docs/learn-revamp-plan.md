# Learn Hub Revamp Plan
**Status:** Draft for execution  
**Owner:** Content + Product  
**Last Updated:** 2026-07-06  
**Scope:** `/learn`, `/learn/[path]`, `/learn/[path]/[lesson]`, `src/lib/learn-content.ts`

---

## 1) Baseline Testing (Current State)

### Technical Test Results
- `npx eslint src/app/learn src/components/learn src/lib/learn-content.ts src/lib/learn-nav.ts src/lib/learn-search.ts`
  - **Error (1):** `src/components/learn/LearnThemeProvider.tsx` (`react-hooks/set-state-in-effect`)
  - **Warning (1):** `src/components/learn/LearnPrimaryNav.tsx` (`@next/next/no-img-element`)

### Content Integrity Results
- Total learning path: **4**
- Total lesson: **20**
- Total blocks: **125**
- CTA block: **16**
- Duplicate path slug: **0**
- Duplicate lesson slug per path: **0**
- Invalid link di `LEARN_REFERENCE_ITEMS`: **0**
- Distribusi level: **pemula (3 path)**, **menengah (1 path)**, **lanjut (0 path)**

### Key Findings
1. Struktur data konten stabil (slug aman, referensi aman), jadi refactor bisa dilakukan tanpa migrasi database.
2. Komposisi konten masih terlalu berat di level pemula, belum ada progression jelas ke level lanjut.
3. CTA ke `/generate` sangat dominan (16 kali), berisiko terasa terlalu promosional dibanding edukasional.

---

## 2) Target Revamp (What “Done” Looks Like)

### Objective
Menyusun ulang Learn Hub agar:
- progres belajar lebih jelas dari **dasar → praktik → lanjutan**,
- isi materi lebih actionable (checklist, template, mini task),
- tiap lesson punya outcome terukur, bukan hanya penjelasan konsep.

### Success Criteria
- Minimal **6 path**: pemula, menengah, lanjut terdistribusi seimbang.
- Setiap path punya:
  - learning objective,
  - prerequisites,
  - output hasil belajar.
- Setiap lesson punya:
  - estimasi realistis,
  - format konsisten (`heading`, `text`, `list`, `code`, `callout`),
  - section “Practice Task”.
- Rasio CTA edukasi vs CTA promosi lebih seimbang (tidak semua lesson ditutup CTA `/generate`).

---

## 3) Proposed New Learning Architecture

## Track A — Foundation (Pemula)
1. Vibe Coding Fundamentals  
2. Setup Tooling (Cursor, Claude Code, aturan dasar)

## Track B — Building Workflow (Menengah)
3. Product Planning for AI (PRD, context, scope control)  
4. Implementation Workflow (iterasi, debugging, refactor, quality gates)

## Track C — Advanced Agent Engineering (Lanjut)
5. Multi-Agent Orchestration  
6. Reliability & Deployment (observability, safety, maintenance)

### Mapping Existing → New
- `vibe-coding-101` → pecah jadi Foundation + Implementation Workflow
- `prd-dan-dokumentasi` → fokus ke Product Planning
- `agent-engineering` → naikkan depth untuk track lanjut
- `tools-dan-integrasi` → gabungkan ke Setup Tooling + Reliability/Deployment

---

## 4) Content Rewrite Guidelines

### Lesson Template (Standard)
1. **Outcome** (1 kalimat hasil akhir lesson)
2. **Core Concept** (penjelasan ringkas)
3. **Worked Example** (contoh nyata)
4. **Practice Task** (tugas 10-20 menit)
5. **Common Pitfalls** (error yang sering terjadi)
6. **Next Step** (link lesson berikutnya)

### Writing Rules
- Hindari jargon tanpa contoh.
- Maksimalkan poin praktis dan checklist.
- Gunakan bahasa Indonesia yang konsisten dan langsung.
- CTA produk hanya ketika memang relevan dengan exercise.

---

## 5) Execution Plan (Phased)

## Phase 0 — Stabilize Learn Tech (0.5 hari)
- Perbaiki lint error di `LearnThemeProvider`.
- Evaluasi migrasi `<img>` ke `next/image` di `LearnPrimaryNav`.

## Phase 1 — Information Architecture Lock (1 hari)
- Finalisasi 6 path baru + objective masing-masing.
- Tetapkan urutan lesson per path.
- Definisikan tag level yang seimbang (pemula/menengah/lanjut).

## Phase 2 — Content Production (3-5 hari)
- Rewrite semua lesson berdasarkan template standar.
- Tambahkan Practice Task di tiap lesson.
- Kurangi CTA repetitif, ganti sebagian dengan navigasi next action edukasional.

## Phase 3 — Implement in Code (1-2 hari)
- Refactor `src/lib/learn-content.ts` sesuai struktur baru.
- Update referensi di `learn-nav.ts` dan komponen yang pakai path metadata.
- Validasi semua route `/learn/[path]/[lesson]`.

## Phase 4 — QA & Launch (1 hari)
- Lint target area Learn.
- Smoke test route utama:
  - `/learn`
  - `/learn/[path]`
  - `/learn/[path]/[lesson]`
- Cek metadata title/description dan internal links.

---

## 6) Testing Checklist for Revamp

### Automated
- [ ] `npx eslint src/app/learn src/components/learn src/lib/learn-content.ts src/lib/learn-nav.ts src/lib/learn-search.ts`
- [ ] Script validasi slug unik (path + lesson)
- [ ] Script validasi link `LEARN_REFERENCE_ITEMS` ke lesson valid

### Manual
- [ ] Flow belajar dari lesson pertama sampai terakhir pada 1 path
- [ ] Sidebar/nav menandai lesson aktif dengan benar
- [ ] Search menemukan path + lesson sesuai keyword
- [ ] Navigasi prev/next lesson tidak dead-end
- [ ] Semua block type tampil sesuai desain (text/list/code/callout/tip/warning)

---

## 7) Immediate Next Actions (Suggested This Week)

1. Fix lint issue Learn agar baseline teknis bersih.
2. Kunci struktur 6 path + daftar lesson final.
3. Rewrite 1 path sebagai pilot (disarankan: Product Planning for AI).
4. Review pilot dari sisi UX belajar, baru lanjut rewrite path lain.
