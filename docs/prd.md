# ArroBuild — Product Requirements Document

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2025  
**Tagline:** Generate everything before your first line of code.

---

## 1. Problem Statement

Mayoritas vibe coders, indie hackers, dan solo developers mengalami pola yang sama: mereka langsung membuka Cursor atau AI coding agent dan mulai coding tanpa perencanaan. Hasilnya adalah:

- **Scope creep** — fitur terus bertambah tanpa batas yang jelas
- **Inkonsistensi** — AI menghasilkan kode yang berbeda gaya dan struktur di setiap sesi
- **Tidak ada "source of truth"** — tidak ada dokumentasi yang bisa dijadikan rujukan saat sesi baru dimulai
- **Design chaos** — tidak ada design system, warna dan komponen dibuat ad-hoc
- **Technical debt dari hari pertama** — struktur database dan arsitektur tidak dipikirkan di awal
- **Lost context** — setiap kali membuka Cursor/Claude Code baru, developer harus menjelaskan ulang proyeknya dari awal

Akibatnya, proyek menjadi sulit dikembangkan, dipelihara, dan diskalakan — bahkan sebelum user pertama datang.

---

## 2. Solution

ArroBuild adalah AI-powered documentation generator yang mengubah deskripsi ide produk menjadi paket fondasi proyek yang lengkap — sebelum satu baris kode pun ditulis.

**Alur utama:**

```
Idea Input → Clarification Questions → Preset Selection → AI Generation → Review & Edit → Export .zip
```

User cukup mendeskripsikan ide mereka dalam 1–2 paragraf. ArroBuild mengajukan 3–5 pertanyaan klarifikasi, lalu menghasilkan 10+ file `.md` yang siap digunakan sebagai panduan bagi AI coding agent maupun developer manusia.

---

## 3. Target Users

### Primary Users

| Segment | Deskripsi | Pain Point Utama |
|---|---|---|
| **Vibe Coders** | Developer yang menggunakan AI agent untuk seluruh proses coding | Tidak punya struktur, AI ngasal setiap sesi |
| **Indie Hackers** | Solo builder yang bangun SaaS / tools dari nol | Terlalu sibuk coding, skip planning |
| **Solo Developers** | Freelancer atau developer individual | Tidak ada tim untuk diskusi arsitektur |
| **AI Builders** | Builder yang eksperimen dengan AI-powered products | Butuh fondasi sebelum experiment |

### Secondary Users

| Segment | Deskripsi |
|---|---|
| **Startup Founders** | Non-teknikal founder yang ingin validasi ide secara terstruktur |
| **Product Designers** | Desainer yang ingin align dengan developer dari awal |
| **Development Agencies** | Agensi yang butuh template onboarding proyek yang konsisten |
| **Freelancers** | Developer lepas yang butuh dokumentasi cepat sebelum mulai proyek klien |

---

## 4. Core Value Proposition

> **Generate everything before your first line of code.**

ArroBuild bukan sekadar PRD generator. ArroBuild adalah **operating system untuk AI builders** — satu langkah wajib sebelum setiap proyek dimulai.

**Diferensiasi:**

- vs **ChatGPT manual prompting** → Hasil terstruktur, konsisten, bisa diulang. Hemat 2–3 jam setup.
- vs **Shipfast / Boilerplate** → Mereka jual kode. Kita jual *dokumentasi sebelum kode*.
- vs **Notion / Linear templates** → Template kosong vs generated *dari konteks produk spesifik user*.
- vs **README generator** → Kita generate *sebelum ada kode*, bukan setelah.

---

## 5. Features

### 5.1 Core Features (MVP)

#### Idea Input
- Textarea untuk deskripsi produk (min 50 karakter, max 2000 karakter)
- Hint text dengan contoh: "Saya ingin membuat aplikasi Study Planner untuk mahasiswa yang..."
- Character counter

#### Clarification Questions
- Sistem mengajukan 3–5 pertanyaan kontekstual berdasarkan input
- Pertanyaan mencakup: target platform (web/mobile/desktop), target monetisasi (free/paid/freemium), scope (MVP/full product), pengguna utama, masalah terbesar yang dipecahkan
- User bisa skip pertanyaan (sistem akan membuat asumsi)

#### Preset Selection
- **Framework Preset:** Laravel, Next.js, Django, Rails, FastAPI
- **Design Style Preset:** Apple, Linear, Stripe, Notion, Vercel
- **Agent Tool Preset:** Cursor, Claude Code, Windsurf, Cline, OpenCode

#### AI Document Generation
- Generasi dilakukan secara sequential dengan progress indicator per file
- Setiap file di-generate satu per satu agar user bisa melihat hasilnya secara bertahap
- Estimasi waktu: 60–120 detik untuk paket lengkap

#### Preview & Edit Mode
- Syntax-highlighted markdown preview untuk setiap file
- Inline editing sebelum download
- Side-by-side view (preview vs raw markdown)

#### Export
- Download sebagai `.zip` berisi semua file `.md`
- Struktur folder: `/arrobuild-[project-name]/`
- Penamaan file konsisten dan siap paste ke root proyek

### 5.2 Generated File Bundle

| File | Isi |
|---|---|
| `context.md` | Master file proyek — source of truth, selalu dibaca AI agent pertama |
| `prd.md` | Product Requirements Document lengkap |
| `design-system.md` | Color palette, typography, spacing, component guidelines |
| `ui-rules.md` | Aturan UX: mobile-first, aksesibilitas, no horizontal scroll, dll |
| `user-flow.md` | Alur pengguna dari landing page hingga core feature |
| `database-schema.md` | Struktur database awal dengan tabel dan relasi |
| `tech-stack.md` | Stack teknologi yang direkomendasikan + justifikasi |
| `agents.md` | Daftar AI agent dan tanggung jawabnya per area |
| `cursor-rules.md` | Aturan coding untuk AI agent (atau CLAUDE.md / .windsurfrules) |
| `tasks.md` | Project breakdown per phase yang siap dieksekusi |
| `mvp-roadmap.md` | Roadmap 4 minggu dari setup hingga launch |

### 5.3 Premium Features

#### Framework-Aware Output
- Dokumentasi menyesuaikan stack yang dipilih
- `tech-stack.md` berisi package recommendation spesifik (contoh: Laravel → Filament, Sanctum, Horizon)
- `cursor-rules.md` menyesuaikan konvensi framework (contoh: Laravel → Service Pattern, Form Requests)

#### Design Preset Integration
- `design-system.md` dihasilkan berdasarkan referensi desain yang dipilih
- Token warna, tipografi, dan spacing disesuaikan per preset
- Contoh: Linear preset → dark mode first, monospace accent, tight spacing

#### Agent Tool Customization
- File rules disesuaikan per tool:
  - Cursor → `.cursor/rules/`
  - Claude Code → `CLAUDE.md`
  - Windsurf → `.windsurfrules`
  - Cline → `.clinerules`
- Format dan struktur prompt menyesuaikan best practice masing-masing tool

#### Project Iteration
- Setelah MVP selesai, user bisa kembali dan generate dokumen lanjutan
- Contoh: `phase-2-roadmap.md`, `api-contracts.md`, `error-handling.md`
- Konteks proyek tersimpan untuk sesi berikutnya

---

## 6. MVP Scope

### Included in MVP

- [x] Idea input form
- [x] Clarification questions (3 pertanyaan)
- [x] 3 preset selection (Framework, Design, Agent Tool)
- [x] AI generation untuk 5 file inti: `context.md`, `prd.md`, `tech-stack.md`, `tasks.md`, `mvp-roadmap.md`
- [x] Markdown preview
- [x] Download sebagai `.zip`
- [x] 1 free project per user (tanpa login)
- [x] Email capture sebelum download

### Not in MVP

- [ ] User authentication & dashboard
- [ ] Project history & storage
- [ ] Inline editing
- [ ] Full 11-file bundle (Pro feature)
- [ ] Payment integration
- [ ] Framework-specific deep customization
- [ ] Team collaboration

---

## 7. Success Metrics

### Launch Metrics (Week 1–4)
- **Activation rate:** % user yang selesai generate minimal 1 project → Target: >60%
- **Completion rate:** % user yang download file setelah generate → Target: >70%
- **Email capture rate:** % user yang input email sebelum download → Target: >40%

### Growth Metrics (Month 1–3)
- **Weekly active users (WAU):** Target 500 WAU di bulan ke-3
- **Virality:** Jumlah project yang di-share atau di-post di komunitas (Twitter/X, Discord indie hackers)
- **Organic traffic:** Dari SEO keyword "vibe coding", "AI project planning", "cursor rules generator"

### Revenue Metrics (Month 2+)
- **Free-to-Pro conversion:** Target 5–8% dari WAU
- **MRR target Month 3:** $500 MRR
- **Churn rate:** <10% per bulan

---

## 8. User Stories

### Epic 1: First-Time Generation

```
As a vibe coder,
I want to input my product idea in plain language,
So that I can get a complete project foundation without spending hours planning.
```

```
As an indie hacker,
I want to choose my tech stack as a preset,
So that the generated documentation matches my existing workflow.
```

```
As a solo developer,
I want to download all docs as a .zip,
So that I can paste them directly into my project root and start coding with AI.
```

### Epic 2: AI Agent Integration

```
As a Cursor user,
I want the cursor-rules.md to follow Cursor's best practice format,
So that my AI agent follows consistent coding conventions across sessions.
```

```
As a Claude Code user,
I want a CLAUDE.md file generated,
So that Claude always has context about my project at the start of every session.
```

---

## 9. Constraints & Assumptions

**Technical Constraints:**
- Generation time harus <2 menit untuk full bundle
- Output harus valid Markdown (bisa di-render di GitHub, Notion, Obsidian)
- File bundle harus <1MB total

**Business Constraints:**
- MVP harus bisa dibangun oleh 1 developer dalam 4 minggu
- Biaya API AI harus profitable di titik $9/bulan/user

**Assumptions:**
- User sudah familiar dengan konsep AI coding agent (Cursor, Claude Code, dll)
- User nyaman membaca dan mengedit Markdown
- User memiliki ide produk yang cukup jelas untuk dideskripsikan dalam 1–2 paragraf

---

## 10. Open Questions

1. Apakah perlu fitur "re-generate single file" tanpa regenerate seluruh bundle?
2. Bagaimana handling untuk user yang tidak familiar dengan framework apapun?
3. Apakah perlu integrasi langsung ke GitHub (push docs ke repo)?
4. Berapa banyak clarification questions yang optimal — 3 atau 5?
5. Apakah perlu fitur share link untuk project yang sudah di-generate?
