# ArroBuild — Mini Tools: Peta Konteks Lengkap

**Status:** Living document — diupdate tiap kali ada tool baru diputuskan
**Tujuan:** Satu sumber kebenaran soal tool apa saja yang ada, statusnya, dan bagaimana konsep lama berevolusi jadi konsep baru

---

## 1. Kenapa Mini Tools Penting (Tidak Berubah)

- **Retention** — alasan buka aplikasi di luar momen generate dokumen utama
- **Diferensiasi murah** — sebagian besar tool reuse data yang sudah digenerate (Architecture, PRD, Design System), bukan mulai dari nol

---

## 2. Status Legend

| Status | Arti |
|---|---|
| 🟢 Live | Sudah jalan production, bisa dipakai user sekarang |
| 🟡 Scaffold | UI sudah ada di halaman `/tools`, backend belum/belum lengkap |
| 🔵 Coming Soon | Direncanakan, ditampilkan di UI dengan badge "Segera", belum ada scaffold |
| ⚪ Ditunda | Ide tercatat, belum masuk roadmap aktif |

---

## 3. Peta Lengkap

| Tool | Status | Tier | Kredit | Evolusi dari |
|---|---|---|---|---|
| Portfolio Generator | 🟢 Live | Gratis | — | — |
| Prompt Doctor | 🟡 Scaffold | Base | 1 | Tidak berubah |
| MVP Scope Cutter | 🟡 Scaffold | Core | **60** | Sudah sesuai kode |
| Database Schema Visualizer | 🟡 Scaffold | Prime | **3** | Sudah sesuai kode |
| **README Generator** | 🟢 Live | Core | 6 | Evolusi dari "README + Setup Script" |
| **Copy Studio** | 🟢 Live | Prime | ~108 | Evolusi dari "Landing Page Copy" |
| **Stack Advisor** | 📋 PRD siap | Core | ~40 / sesi | Baru, dari ide kamu |
| **ArroDesign (Design Studio)** | 📋 Arsitektur siap | Core+ | ~150-250 (estimasi) | Evolusi dari "Stitch Prompt Composer" |
| Error Whisperer (Konsultan Error) | 🔵 Coming Soon | Base | ~30 | Baru — jelaskan error + generate prompt fix untuk AI agent |
| Konsultan Penamaan | 🔵 Coming Soon | Base | 1 | Baru — saran nama variabel/fungsi/file sesuai konvensi Agent Rules proyek |
| Env Var Doctor | 🔵 Coming Soon | Base | 2 | Baru — cross-check `.env.example` ke Architecture.md, tandai yang hilang/tidak konsisten |
| Devlog/Standup Composer | 🔵 Coming Soon | Base | 2 | Baru — rapikan catatan kerja berantakan jadi devlog, otomatis tag FEAT-ID |
| Cost Reality Check | 🔵 Coming Soon | Core | Minimal (mayoritas kalkulasi deterministik, bukan AI) | Proyeksi biaya interaktif (slider user), pelengkap Stack Advisor |
| Mock API Generator | 🔵 Coming Soon | Core | ~15 | Reuse Architecture.md → generate koleksi mock API siap import Postman/Insomnia |

---

## 4. Catatan Kredit Mini Tools

> [!NOTE]
> Sistem kredit aktual yang berjalan di kode sumber (`src/lib/config/tiers.ts`) menggunakan multiplier: **Hemat 1×, Menengah 24×, Flagship 35×, Ultra 65×**. Angka kredit pada UI Scaffold (MVP Scope Cutter 60, Copy Studio 108) sebenarnya **sudah sejalan** dengan multiplier ini.

| Tool | Kredit (Sesuai Multiplier Aktual) |
|---|---|
| MVP Scope Cutter | **60** |
| Landing Page Copy → Copy Studio | **108** |
| README + Setup Script → README Generator | **6** |
| Database Schema Visualizer | **3** |

---

## 5. Kelompok Berdasarkan Pola Biaya

**A — Reuse Data (murah, Hemat):** Prompt Doctor, README Generator, Database Schema Visualizer, Konsultan Penamaan, Env Var Doctor, Devlog Composer, Mock API Generator
**B — Butuh Reasoning (Menengah/Flagship):** MVP Scope Cutter, Copy Studio, Stack Advisor, Error Whisperer
**C — Pack Generator (analisis berat, Flagship-setara):** ArroDesign
**D — Deterministik (nyaris tanpa biaya AI):** Cost Reality Check

---

## 6. Rename yang Perlu Disinkronkan di Kode

| Nama lama (masih di UI) | Nama baru |
|---|---|
| Stitch Prompt Composer | ArroDesign |
| Landing Page Copy | Copy Studio |
| README + Setup Script | README Generator |

Kalau route lama (`/tools/stitch-composer`, dst.) masih dipakai, sinkronkan sebelum ada dua identitas untuk tool yang sama — sama seperti catatan yang sudah pernah muncul soal ArroDesign.

---

## 7. Roadmap Prioritas

1. ~~README Generator~~ ✅ Selesai
2. ~~Copy Studio~~ ✅ Selesai
3. ~~Koreksi harga 2 tool scaffold (MVP Scope Cutter, Database Schema Visualizer)~~ ✅ Tidak perlu, angka di scaffold sudah sejalan dengan multiplier kode (24x/35x).
4. **Stack Advisor** — PRD + knowledge base (`stack-advisor-knowledge.md`) sudah siap, tinggal eksekusi
5. **ArroDesign** — arsitektur siap, semua blocker (vision, search API) sudah lepas
6. Tools "Coming Soon" baru (Error Whisperer, Konsultan Penamaan, Env Var Doctor, Devlog Composer, Cost Reality Check, Mock API Generator) — belum ada PRD, disusun setelah 4 tools utama beres. Kalau mau urutan di dalam kelompok ini: **Error Whisperer duluan** (potensi dipakai harian, bukan cuma sekali per proyek)

---

## 8. Dokumen Terkait

- `arrodesign-architecture.md` — arsitektur lengkap ArroDesign
- `readme-generator-prd.md` — PRD README Generator
- `copy-studio-prd.md` — PRD Copy Studio
- `stack-advisor-prd.md` — PRD Stack Advisor
- `stack-advisor-knowledge.md` — basis data yang dipakai Stack Advisor untuk menyortir rekomendasi
- `arrobuild_mini_tools_plan.md` — rencana asli (sumber sebagian nama/konsep lama di atas)
