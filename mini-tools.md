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

| Tool | Status | Tier | Kredit (sistem baru) | Evolusi dari |
|---|---|---|---|---|
| Portfolio Generator | 🟢 Live | Gratis | — | — |
| Prompt Doctor | 🟡 Scaffold | Base | 1 | Tidak berubah |
| MVP Scope Cutter | 🟡 Scaffold | Core | **5** (turun dari 60) | Perlu koreksi harga, lihat Bagian 4 |
| Database Schema Visualizer | 🟡 Scaffold | Prime | **1** (turun dari 3) | Perlu koreksi harga |
| **README Generator** | 🟢 Live | Core | 2 | Evolusi dari "README + Setup Script" |
| **Copy Studio** | 🟢 Live | Prime | ~21 | Evolusi dari "Landing Page Copy" |
| **Stack Advisor** | 📋 PRD siap | Core | ~8 / sesi | Baru, dari ide kamu |
| **ArroDesign (Design Studio)** | 📋 Arsitektur siap | Core+ | ~150-250 (estimasi) | Evolusi dari "Stitch Prompt Composer" |
| Error Whisperer (Konsultan Error) | 🔵 Coming Soon | Base | ~6 | Baru — jelaskan error + generate prompt fix untuk AI agent |
| Konsultan Penamaan | 🔵 Coming Soon | Base | 1 | Baru — saran nama variabel/fungsi/file sesuai konvensi Agent Rules proyek |
| Env Var Doctor | 🔵 Coming Soon | Base | 2 | Baru — cross-check `.env.example` ke Architecture.md, tandai yang hilang/tidak konsisten |
| Devlog/Standup Composer | 🔵 Coming Soon | Base | 2 | Baru — rapikan catatan kerja berantakan jadi devlog, otomatis tag FEAT-ID |
| Cost Reality Check | 🔵 Coming Soon | Core | Minimal (mayoritas kalkulasi deterministik, bukan AI) | Proyeksi biaya interaktif (slider user), pelengkap Stack Advisor |
| Mock API Generator | 🔵 Coming Soon | Core | ~3 | Reuse Architecture.md → generate koleksi mock API siap import Postman/Insomnia |

---

## 4. Koreksi Penting — Harga di Scaffold Masih Pakai Sistem Lama

> [!CAUTION]
> Kartu yang sudah tampil di `/tools` sekarang (MVP Scope Cutter 60 kredit, Landing Page Copy 108 kredit di rencana lama) dihitung pakai multiplier lama (Menengah 24×, Flagship 35×). Sistem kredit sekarang pakai multiplier baru (Menengah 3×, Flagship 14×) — **jauh lebih murah**. Sebelum tools ini dianggap final, semua angka kreditnya perlu dihitung ulang, bukan cuma dipindah apa adanya dari rencana lama.

| Tool | Kredit lama | Kredit sistem baru |
|---|---|---|
| MVP Scope Cutter | 60 | **5** |
| Landing Page Copy → Copy Studio | 108 | **~21** |
| README + Setup Script → README Generator | 6 | **2** |
| Database Schema Visualizer | 3 | **1** |

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
3. **Koreksi harga 2 tool scaffold** (MVP Scope Cutter, Database Schema Visualizer) — kerja kecil, jangan sampai lupa sebelum production
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
