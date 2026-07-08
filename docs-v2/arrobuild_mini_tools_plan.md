# 🧰 Rencana Mini Tools ArroBuild

> Pelengkap dari `arrobuild_pricing_monetisasi_v2.md` Bagian 8.3. Dokumen ini fokus ke isi konkret mini tools: apa yang sudah ada, ide baru, prioritas pembangunan, dan estimasi biaya AI (token → kredit) tiap tool supaya bisa langsung dipetakan ke sistem kredit yang sudah ada.

---

## Daftar Isi
1. [Kenapa Mini Tools Penting](#1-kenapa-mini-tools-penting)
2. [Tool yang Sudah Ada](#2-tool-yang-sudah-ada)
3. [Ide Baru — Diusulkan Kamu](#3-ide-baru--diusulkan-kamu)
4. [Ide Baru — Usulan Saya](#4-ide-baru--usulan-saya)
5. [Estimasi Token & Kredit per Tool](#5-estimasi-token--kredit-per-tool)
6. [Prioritas Pembangunan](#6-prioritas-pembangunan)
7. [Pemetaan Akses per Tier](#7-pemetaan-akses-per-tier)
8. [Estimasi Total Biaya Kalau Semua Tool Dipakai Penuh](#8-estimasi-total-biaya-kalau-semua-tool-dipakai-penuh)

---

## 1. Kenapa Mini Tools Penting

Selain nilai tambah langsung buat user, mini tools punya dua fungsi bisnis:
- **Retention** — alasan untuk buka aplikasi di luar momen "generate dokumen baru" (yang mungkin cuma sekali per proyek), menjaga ArroBuild relevan sehari-hari.
- **Diferensiasi tanpa menaikkan biaya AI signifikan** — sebagian besar tool di bawah ini murah karena bisa **reuse data yang sudah digenerate** (Architecture, PRD, Design System) alih-alih mulai dari nol.

---

## 2. Tool yang Sudah Ada

| Tool | Fungsi | Status |
|---|---|---|
| Generator Prompt Portfolio | Generate prompt untuk membuat portfolio berbasis HTML/CSS/JS murni | ✅ Sudah live |

---

## 3. Ide Baru — Diusulkan Kamu

### 3.1 Stitch Prompt Composer
Ambil data `design-system.md` yang sudah digenerate (token warna, tipografi, spacing) + konteks produk dari PRD, lalu susun jadi prompt siap-paste untuk **Google Stitch** — tool desain AI gratis dari Google Labs yang mengubah bahasa natural jadi UI screen lengkap dan bisa ekspor ke kode (HTML/CSS/Tailwind/Vue/Angular/Flutter/SwiftUI) atau Figma. Stitch bahkan sudah punya MCP server untuk sinkronisasi dua arah dengan coding agent seperti Cursor — jadi ada potensi integrasi lebih dalam ke depan, bukan cuma generate teks prompt manual.

**Kenapa prioritas tinggi**: data yang dibutuhkan sudah ada di sistem (tidak perlu generate baru dari nol), jadi ini murni kerja *reformatting*, bukan generation berat.

### 3.2 Design Reference Scraper → design.md
User kasih link website yang desainnya dia suka, sistem scrape (warna, tipografi, spacing, gaya komponen) lalu generate `design-system.md` yang mengikuti "DNA desain" situs itu.

**Catatan teknis & etika**:
- Butuh headless browser (Playwright/Puppeteer) untuk ambil computed CSS — bukan cuma screenshot. Ini kerja infrastruktur tambahan (bukan cuma biaya token AI), jadi effort bangunnya lebih besar dari tool lain di daftar ini.
- Framing hasil harus **"terinspirasi dari"**, bukan **"identik dengan"** — ekstrak palet warna/skala tipografi/ritme spacing/gaya komponen (design language), bukan aset atau copy literal. Ini lebih aman secara etika dan branding.

---

## 4. Ide Baru — Usulan Saya

| Tool | Fungsi | Kenapa relevan |
|---|---|---|
| **Prompt Doctor** | User paste prompt kasar yang mau dikirim ke Cursor/Claude Code, AI merapikan jadi lebih spesifik & terstruktur | Solo developer paling sering rugi waktu karena instruksi vague ke AI agent — pain point harian, bukan cuma di awal proyek |
| **MVP Scope Cutter** | User kasih daftar fitur, AI "memaksa" pilih mana yang wajib ada di v1 dan mana yang harus ditunda | Solo dev/vibe coder klasiknya over-scope sampai proyek tidak pernah selesai |
| **README + Setup Script Generator** | Reuse data `02-architecture.md`, generate README.md + `.env.example` + script setup siap pakai | Data sudah ada di sistem, hampir tanpa biaya tambahan |
| **Landing Page Copy Generator** | Reuse data PRD, generate copy hero section + value proposition | Developer solo biasanya jago coding tapi lemah di copywriting jualan |
| **Database Schema Visualizer** | Ambil skema dari Architecture doc, tampilkan sebagai diagram ER visual | Melengkapi modul opsional "Database Deep-Dive" yang sudah direncanakan |

---

## 5. Estimasi Token & Kredit per Tool

Dihitung dari pola pemakaian wajar (bukan skenario ekstrem), pakai kelas model dari sistem kredit yang sudah ada (`arrobuild_pricing_monetisasi_v2.md` Bagian 2):

| Tool | Token Input (estimasi) | Token Output (estimasi) | Kelas Model | Kredit/pemakaian |
|---|---|---|---|---|
| Prompt Doctor | 400 | 700 | Hemat | **1 kredit** |
| Database Schema Visualizer | 2.000 | 1.000 | Hemat | **3 kredit** |
| README + Setup Script Generator | 4.000 | 2.000 | Hemat | **6 kredit** |
| Stitch Prompt Composer | 3.000 | 1.200 | Hemat | **5 kredit** |
| MVP Scope Cutter | 1.500 | 1.500 | Menengah | **60 kredit** |
| Landing Page Copy Generator | 3.000 | 1.500 | Menengah | **108 kredit** |
| Design Reference Scraper → design.md | 4.000 | 4.000 | Menengah | **192 kredit** (+ biaya infra scraping, non-token) |

> [!TIP]
> Tool yang murni *reformatting* data yang sudah ada (Prompt Doctor, Schema Visualizer, README Generator, Stitch Composer) sengaja dipakaikan model Hemat — hasilnya tidak akan jauh beda kualitasnya dipakaikan model mahal, jadi tidak ada alasan bakar kredit user di situ. Yang butuh *judgment*/kreativitas (MVP Scope Cutter, Landing Page Copy, Design Scraper) baru pakai kelas Menengah.

---

## 6. Prioritas Pembangunan

| Urutan | Tool | Alasan |
|---|---|---|
| 1 | **Stitch Prompt Composer** | Reuse data 100%, tanpa infra baru, value tinggi karena melengkapi output desain yang sudah ada |
| 2 | **Prompt Doctor** | Effort sangat kecil (1 panggilan AI sederhana), tapi dipakai harian — bagus untuk retention |
| 3 | **MVP Scope Cutter** | Effort kecil, langsung menjawab pain point solo dev yang sering over-scope |
| 4 | **README + Setup Script Generator** | Reuse data, effort kecil-menengah |
| 5 | **Landing Page Copy Generator** | Reuse data PRD, effort menengah |
| 6 | **Database Schema Visualizer** | Butuh kerja render diagram (bukan cuma teks), effort menengah |
| 7 | **Design Reference Scraper** | Effort paling besar (infra scraping baru) — realistis dikerjakan setelah ada modal dari tool-tool sebelumnya |

---

## 7. Pemetaan Akses per Tier

Konsisten dengan `arrobuild_pricing_monetisasi_v2.md` Bagian 4 & 8.3 — mini tools memotong dari pool kredit bulanan yang sama seperti dokumen, "unlimited" di sini berarti tidak ada batas *jumlah pemakaian* terpisah, bukan gratis tanpa kredit:

| Tier | Akses |
|---|---|
| **Starter** | 1 tool trial (rekomendasi: **Prompt Doctor** — termurah, paling universal, kuat sebagai pemicu upgrade begitu user kena batas trial, misal 3x/bulan) |
| **Pro** | 3 tools pilihan (rekomendasi default: Prompt Doctor, MVP Scope Cutter, Stitch Prompt Composer), unlimited pemakaian (tetap potong kredit dari pool) |
| **Pro Max** | Semua tools, unlimited pemakaian, plus akses lebih dulu ke tools baru yang dirilis |

---

## 8. Estimasi Total Biaya Kalau Semua Tool Dipakai Penuh

Contoh ilustratif: satu user Pro Max memakai tiap tool 10x dalam sebulan (skenario cukup agresif):

```
Prompt Doctor            10 × 1   =   10 kredit
Database Schema Viz      10 × 3   =   30 kredit
README Generator         10 × 6   =   60 kredit
Stitch Prompt Composer   10 × 5   =   50 kredit
MVP Scope Cutter         10 × 60  =  600 kredit
Landing Page Copy        10 × 108 = 1.080 kredit
Design Reference Scraper 10 × 192 = 1.920 kredit
──────────────────────────────────────────────
Total                            ≈ 3.750 kredit
```

Dibanding kredit bulanan Pro Max (14.000 kredit), pemakaian mini tools yang cukup agresif ini masih menyisakan **±73% kredit** untuk generate dokumen proyek — jadi aman dimasukkan sebagai fitur "unlimited" tanpa mengancam margin, asal tetap dari pool kredit yang sama (bukan kuota terpisah tanpa batas).
