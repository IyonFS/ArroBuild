# ArroBuild — Ecosystem Redesign Plan
**Version:** 2.0  
**Status:** Active Planning  
**Last Updated:** June 2026  
**Scope:** Landing Page · Learn Hub · Generate Flow · Docs · Integrations · Prompt Engineering Tools

---

## Vision Statement

ArroBuild bukan sekadar generator dokumentasi. ArroBuild adalah **ekosistem untuk developer yang membangun dengan AI agent** — tempat belajar, merencanakan, dan menghubungkan ide ke tools nyata.

> *"Satu tempat untuk belajar, planning, dan build dengan AI agent."*

---

## Tiga Pilar Ekosistem

```
┌─────────────────────────────────────────────────────┐
│                    ARROBUILD 2.0                    │
│                                                     │
│   ① LEARN           ② BUILD           ③ INTEGRATE  │
│   ─────────         ──────────        ───────────── │
│   Free learning     Doc generator     Export tools  │
│   paths             Multi-model AI    .cursorrules  │
│   Structured        Framework-aware   CLAUDE.md     │
│   courses           output            agents.json   │
│   Gratis semua      Prompt templates  (API menyusul)│
└─────────────────────────────────────────────────────┘
```

Ketiga pilar saling terhubung:
- User **belajar** konsep agent engineering di Learn
- User **praktek langsung** generate dokumen di Build
- User **export** hasil ke tools favorit mereka di Integrate

---

## Peta Halaman (Full Scope)

### Existing → Dirombak
| Halaman | Status Sekarang | Target |
|---|---|---|
| `/` | Landing page generik | Repositioning penuh, tiga pilar |
| `/generate` | 4-step form biasa | UX diperkuat, tanya-jawab spesifik |
| `/docs` | Guide dangkal 4 section | Technical reference hub |
| `/dashboard` | Tidak jelas fungsinya | Project history + versioning |

### New Pages
| Halaman | Fungsi |
|---|---|
| `/learn` | Learning hub utama |
| `/learn/[path]` | Halaman tiap learning path |
| `/learn/[path]/[lesson]` | Halaman tiap lesson |
| `/integrations` | Export formats & tool connections |
| `/tools/[tool-name]` | Halaman per prompt engineering tool (portfolio, dll) |

---

## FASE 1 — Rombak Landing Page
**Prioritas:** Tertinggi  
**Estimasi:** 1–2 minggu  
**Tujuan:** Reframe ArroBuild sebagai ekosistem, bukan sekadar tool

### 1.1 Hero Section (Baru)
- Tagline baru: *"Satu tempat untuk belajar, planning, dan build dengan AI agent."*
- Sub-headline: Jelaskan tiga pilar dalam satu kalimat
- CTA dua jalur: **"Mulai Generate"** (Build) + **"Mulai Belajar"** (Learn)
- Visual: Terminal/code aesthetic, bukan generic SaaS illustration

### 1.2 Tiga Pilar Section
Gantikan "THE PROBLEM" section dengan visual tiga pilar:
```
[ ① LEARN ]        [ ② BUILD ]        [ ③ INTEGRATE ]
Learning path      Doc generator      Export ke tools
gratis & terstruktur multi-model       .cursorrules, dll
```
Tiap pilar punya CTA sendiri dan link ke halaman masing-masing.

### 1.3 Sample Output Gallery (Baru)
- Tab switcher: `prd.md` / `context.md` / `design-system.md` / `agents.md`
- Tampilkan potongan output nyata dalam format code block
- Label "Generated with: Claude Sonnet 4 · Framework: Next.js · Style: Neo-Brutalist"
- CTA: "Generate versimu sendiri →"

### 1.4 Social Proof System (Baru)
- Counter: "X project foundations generated"
- Counter: "X developers joined"
- Quote cards dari beta testers (bisa manual di awal)
- Fix bug counter "0 model AI tersedia"

### 1.5 How It Works (Revised)
- Ganti dari 3 langkah generik ke visual flow yang lebih detail
- Tampilkan step: Describe → Configure → Generate → Export
- Highlight bahwa export siap paste ke Cursor/Claude Code

### 1.6 Learn Hub Teaser (Baru)
- Section singkat yang preview konten Learn Hub
- Tampilkan 2–3 learning path dengan thumbnail
- CTA: "Lihat semua learning path →"

### 1.7 Prompt Engineering Tools Teaser (Baru)
- Section pendek: "Free tools untuk kebutuhan spesifik"
- Preview card: Portfolio Generator, README Generator, dsb.
- Label "Gratis · Tanpa login"

### 1.8 FAQ (Revised)
- Tambah pertanyaan soal Learn Hub, integrasi tools
- Pisahkan antara FAQ produk dan FAQ teknis

---

## FASE 2 — Build Learn Hub
**Prioritas:** Tinggi  
**Estimasi:** 2–4 minggu  
**Tujuan:** Jadi resource edukasi vibe coding & agent engineering terbaik di Indonesia

### 2.1 Arsitektur Learn Hub (`/learn`)

**Struktur konten:**
```
/learn
├── Vibe Coding 101          ← Untuk total pemula
│   ├── Apa itu vibe coding?
│   ├── Setup AI agent pertama
│   ├── Cara buat PRD yang baik
│   ├── Iterasi cepat dengan AI
│   └── Deploy project pertamamu
│
├── PRD & Documentation      ← Core ArroBuild use case
│   ├── Kenapa dokumentasi penting
│   ├── Anatomi PRD yang baik
│   ├── context.md: master reference
│   ├── design-system.md: panduan konsistensi
│   └── agents.md: role AI agent
│
├── Agent Engineering        ← Level menengah-lanjut
│   ├── Apa itu AI agent?
│   ├── Multi-agent workflow
│   ├── Prompt engineering dasar
│   ├── Context window management
│   └── Debugging output AI
│
└── Tools & Integrations     ← Praktis & teknis
    ├── Setup Cursor dari nol
    ├── Claude Code workflow
    ├── .cursorrules explained
    ├── CLAUDE.md best practices
    └── Export & integrasi ArroBuild
```

### 2.2 Halaman `/learn` (Hub)
- Grid semua learning path dengan progress indicator
- Filter: Pemula / Menengah / Lanjut
- Tag: Gratis / Free semua
- Featured path di bagian atas
- Search lessons

### 2.3 Halaman `/learn/[path]`
- Header path: judul, deskripsi, estimasi waktu, level
- Daftar lesson dalam urutan (numbered)
- Progress bar (untuk user yang login)
- Sidebar: navigasi antar lesson
- "Start Learning" CTA prominent

### 2.4 Halaman `/learn/[path]/[lesson]`
- Layout: sidebar navigasi + konten utama
- Konten: teks + code block + callout box + tip/warning cards
- Di tiap lesson yang relevan: **"Coba langsung →"** deep link ke `/generate` dengan pre-filled context
- Navigasi: Previous / Next lesson
- Progress tracking (login-based, opsional)

### 2.5 Konten Awal (MVP)
Minimal launch dengan **satu path lengkap**: *Vibe Coding 101* (5 lessons).  
Ini cukup untuk validate bahwa format-nya works.

---

## FASE 3 — Perkuat Generate Flow
**Prioritas:** Tinggi  
**Estimasi:** 2–3 minggu  
**Tujuan:** UX tanya-jawab yang lebih user-friendly dan spesifik

### 3.1 Rancang Ulang Step Flow

**Masalah sekarang:** Step terlalu generik, hanya deskripsi bebas + pilih preset.

**Target baru:** Tanya-jawab yang *kontekstual* dan *spesifik* per tipe produk.

**Flow baru (5 steps):**

```
Step 1: Tipe Produk
  → Pilih kategori: SaaS / Marketplace / Mobile App / API Tool / 
                    Portfolio / Internal Tool / Lainnya
  → Tiap kategori memunculkan pertanyaan yang berbeda di step berikutnya

Step 2: Deskripsi & Konteks
  → Bukan hanya textarea bebas — tapi guided questions:
    - "Siapa target user utama kamu?"
    - "Masalah utama apa yang dipecahkan?"
    - "Fitur inti yang harus ada (core features)?"
  → Bisa tetap ada textarea bebas sebagai opsi "advanced"

Step 3: Stack & Design
  → Framework: Next.js / Laravel / Django / Rails / FastAPI / lainnya
  → Design style: Neo-Brutalist / Minimal / Corporate / Bold & Colorful
  → AI tool target: Cursor / Claude Code / Windsurf / Custom

Step 4: Pilih Dokumen yang Di-generate
  → Checklist dokumen (bukan hanya tier-based)
  → Free: PRD saja
  → Paid: bisa pilih combinasi bebas dari 8 dokumen
  → Preview singkat tiap dokumen (tooltip/modal)

Step 5: Pilih Model AI & Generate
  → Pilih model (dengan label gratis/premium)
  → Estimasi waktu generate ditampilkan
  → Progress real-time per file
```

### 3.2 Prompt Templates (Internal)
Tiap kombinasi (tipe produk × dokumen × framework) akan punya **prompt template khusus** yang menghasilkan output lebih relevan dan dalam.

Dokumen yang perlu prompt template dedicated:
- `prd.md` — per tipe produk (SaaS, marketplace, dll)
- `context.md` — per framework
- `design-system.md` — per design style
- `agents.md` — per AI tool target
- `plan.md` — per complexity level
- `production-hardening.md` — per stack
- `scale-performance.md` — per expected scale
- `growth-quality.md` — per business model

### 3.3 Output Quality Improvements
- Setiap file output harus punya **struktur heading yang konsisten**
- Tambahkan metadata di atas tiap file: `generated-by`, `model`, `framework`, `date`
- Tambahkan section `## Quick Start` di tiap file — instruksi singkat cara pakai file itu di AI agent

---

## FASE 4 — Export Formats & Integrations
**Prioritas:** Menengah  
**Estimasi:** 1–2 minggu (setelah Fase 3)  
**Tujuan:** Output ArroBuild langsung siap pakai di tools tanpa modifikasi

### 4.1 Export Formats (MVP)

Selain `.zip` standar, tambahkan opsi export:

| Format | Untuk | Isi |
|---|---|---|
| `CLAUDE.md` | Claude Code | context.md + agents.md digabung, format khusus |
| `.cursorrules` | Cursor | design-system + coding conventions |
| `agents.json` | Custom AI agents | agents.md dalam format JSON |
| `system-prompt.txt` | Semua AI tools | Distilasi semua docs jadi satu system prompt |

### 4.2 Halaman `/integrations`
- Daftar semua tools yang didukung
- Per tool: cara setup, cara pakai file dari ArroBuild
- Link ke lesson relevan di Learn Hub
- Status: "Supported" / "Coming Soon"

**Tools roadmap:**
- ✅ Cursor (via `.cursorrules`)
- ✅ Claude Code (via `CLAUDE.md`)
- ✅ Windsurf (via rules file)
- 🔜 GitHub (auto-create repo dengan docs di-commit)
- 🔜 Notion (sync docs ke Notion workspace)
- 🔜 Linear (auto-create issues dari `plan.md`)

---

## FASE 5 — Prompt Engineering Tools
**Prioritas:** Menengah-Rendah (build setelah Fase 1–3 stabil)  
**Estimasi:** 1–2 minggu per tool  
**Tujuan:** Free tools spesifik sebagai lead magnet dan nilai tambah ekosistem

### 5.1 Konsep
Tools ini **gratis, tanpa login**, purpose-built untuk kebutuhan spesifik — bukan doc bundle generik.

Setiap tool punya halaman sendiri di `/tools/[nama]`.

### 5.2 Roadmap Tools

**Launch pertama:**
- `/tools/portfolio` — Portfolio Generator
  - Input: nama, skills, projects, bio
  - Output: `README.md` portfolio, `context.md` untuk AI, struktur folder
  - Extra: generate prompt siap pakai untuk Claude Code / Cursor

**Selanjutnya:**
- `/tools/readme` — README Generator (untuk open source project)
- `/tools/api-docs` — API Documentation Generator
- `/tools/pitch` — Pitch Deck Outline Generator
- `/tools/changelog` — Changelog Writer dari commit history

### 5.3 Struktur Halaman Per Tool
```
/tools/portfolio
├── Hero: nama tool + deskripsi singkat
├── Form input (tanya-jawab spesifik)
├── Generate button
├── Preview output (inline, bisa di-copy)
├── Download opsi
└── Link ke Learn Hub yang relevan
```

---

## Docs Page Redesign (`/docs`)
**Tujuan:** Dari "vibe coding guide" → technical reference hub

### Struktur Baru
```
/docs
├── Overview — apa itu ArroBuild, cara kerja ekosistem
├── Output Files Reference
│   ├── prd.md — struktur, field-by-field explanation
│   ├── context.md — cara pakai di AI agent
│   ├── design-system.md — integrasi ke project
│   ├── agents.md — role setup per tool
│   └── ... (semua 8 files)
├── Export Formats
│   ├── CLAUDE.md format
│   ├── .cursorrules format
│   └── agents.json schema
├── API Reference (coming soon)
└── Changelog
```

Docs ini bukan edukasi — itu ada di `/learn`. Docs adalah **referensi teknis** untuk user yang sudah tahu apa yang mereka cari.

---

## Dashboard (`/dashboard`) Redesign
**Tujuan:** Jelas fungsinya, jadi alasan untuk login

### Fitur Dashboard
- **Project list** — semua generate session dengan nama, tanggal, tipe produk
- **Re-download** — download ulang bundle lama tanpa generate ulang
- **Fork project** — jadikan project lama sebagai basis generate baru
- **Usage stats** — berapa project sudah di-generate bulan ini
- **Quick actions** — langsung ke `/generate` atau `/learn`

---

## Urutan Eksekusi yang Disarankan

```
Week 1–2:   FASE 1 — Landing Page Redesign
Week 3–4:   FASE 2 — Learn Hub (MVP: Vibe Coding 101)
Week 5–6:   FASE 3 — Generate Flow Redesign + Prompt Templates
Week 7:     FASE 4 — Export Formats
Week 8:     Docs Redesign + Dashboard Improvements
Week 9+:    FASE 5 — Prompt Engineering Tools (Portfolio first)
            Fase 4 lanjut — Integrasi GitHub, Notion, Linear
```

---

## Catatan Penting

### Yang Tidak Dibahas di Plan Ini (Sengaja)
- **Pricing** — akan diputuskan setelah ekosistem terbentuk
- **Payment gateway** — menyusul setelah Midtrans siap
- **Komunitas/Discord** — opsi masa depan, bukan prioritas sekarang

### Diskusi Lanjutan (Belum di-spec)
- [ ] UX detail tanya-jawab generate flow (akan dibahas terpisah)
- [ ] Prompt template & isi tiap file output (akan dibahas terpisah)
- [ ] Prompt engineering tool Portfolio — form & output spec (akan dibahas terpisah)

---

*Plan ini adalah living document — akan diupdate seiring diskusi dan iterasi.*
