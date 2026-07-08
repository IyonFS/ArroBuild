# Sistem Dokumen ArroBuild — Overview & Peta Implementasi (v2, terintegrasi)

> **Status:** Diperbarui dan disinkronkan dengan `arrobuild_pricing_monetisasi_v2.md` dan `08-form-flow-redesign-v2.md`. Versi sebelumnya masih pakai 2 tier (Pro/Pro Max) dan nama model lama — sudah diperbaiki di sini.

> [!CAUTION]
> **Urgent:** Alias model DeepSeek lama (`deepseek-chat`, `deepseek-reasoner`) pensiun **24 Juli 2026**. Semua template di bawah sudah memakai nama baru **DeepSeek V4 Flash** — pastikan kode generator juga sudah dipindah sebelum tanggal itu.

---

## 1. Core Module (Wajib — otomatis digenerate untuk semua proyek)

Jumlah dokumen berbeda per tier: **Starter = 3, Pro = 5, Pro Max = 6.**

| # | Dokumen | Tersedia di | Token (Starter/Pro/Pro Max) | Kelas Model (Starter → Pro → Pro Max) | Model Default (Pro / Pro Max) | Kredit/dokumen (Starter/Pro/Pro Max) |
|---|---|---|---|---|---|---|
| 1 | PRD | Starter, Pro, Pro Max | 2.500 / 4.000 / 7.000 | Hemat → Menengah → Flagship | Gemini 2.5 Pro / GPT-5.4 | 3 / 96 / 245 |
| 2 | Architecture & Technical Blueprint | Starter, Pro, Pro Max | 2.500 / 4.000 / 7.000 | Hemat → Menengah → Flagship | Gemini 2.5 Pro / GPT-5.4 | 3 / 96 / 245 |
| 3 | Plan / Task | Starter, Pro, Pro Max | 2.000 / 3.000 / 5.000 | Hemat → Hemat → Menengah | DeepSeek V4 Flash / Gemini 2.5 Pro | 2 / 3 / 120 |
| 4 | Design System | **Pro, Pro Max saja** | — / 3.000 / 5.000 | — → Menengah → Menengah | Gemini 2.5 Pro / Gemini 2.5 Pro | — / 72 / 120 |
| 5 | Agent Rules | **Pro, Pro Max saja** | — / 2.500 / 4.000 | — → Hemat → Flagship | DeepSeek V4 Flash / GPT-5.4 | — / 3 / 140 |
| 6 | Dokumen Adaptif (isi berubah per tipe produk) | **Pro Max saja** | — / — / 6.500 | — → — → Flagship | — / Claude Sonnet | — / — / 228 |

**Total kredit/proyek (default mix, sesuai `arrobuild_pricing_monetisasi_v2.md` Bag. 4.2):** Starter ≈ **8 kredit**, Pro ≈ **270 kredit**, Pro Max ≈ **1.098 kredit**.

> [!TIP]
> Kredit di atas adalah **default** kalau user tidak mengubah apa pun. Sejak form-flow v2 Bagian 3, model AI dipilih **per-dokumen** (bukan flat 1 model untuk semua dokumen dalam 1 proyek) — user boleh menaikkan kelas model untuk 1-2 dokumen tertentu, kelas di luar tier tampil terkunci dengan label "🔒 Upgrade". Estimasi kredit real-time menyesuaikan pilihan ini.

**Kenapa Architecture tetap core, bukan opsional:** AI Coding Agent paling sering "ngaco" bukan karena tidak tahu fitur apa yang dibuat, tapi karena tidak tahu struktur data. Tanpa skema database yang konsisten, AI membuat skema sendiri tiap sesi — dan itu sering beda-beda.

**Kenapa Dokumen Adaptif eksklusif Pro Max:** butuh model paling mahal (Claude Sonnet, kelas Flagship) karena isinya strategi kontekstual, bukan struktur yang bisa ditemplat. Uang mahalnya sengaja dikonsentrasikan di 1 dokumen ini saja, bukan disebar rata ke semua dokumen Pro Max — ini yang menjaga margin tetap positif (lihat `arrobuild_pricing_monetisasi_v2.md` Bag. 6).

---

## 2. Batasan Teknis yang Berlaku ke SEMUA Dokumen di Atas

Ini bukan pengaturan per dokumen, tapi pagar keras di level sistem — berlaku sama untuk PRD, Architecture, Plan/Task, dst, terlepas dari token budget masing-masing dokumen di tabel Bagian 1:

| Batasan | Starter | Pro | Pro Max |
|---|---|---|---|
| Maks token *context* yang di-inject dari dokumen/fitur sebelumnya | 3.000 | 5.000 | 8.000 |
| Maks token input dari form user (freeText, catatan referensi, dll) | 1.500 | 2.500 | 3.500 |

Sumber lengkap termasuk cap output & cap jumlah proyek/bulan ada di `arrobuild_pricing_monetisasi_v2.md` Bagian 3. Poin penting untuk penulisan prompt builder: dokumen lain **tidak boleh** menerima dump penuh dokumen sebelumnya sebagai context — cukup blok YAML FEAT-ID (lihat Bagian 4) + ringkasan singkat, supaya tetap di bawah cap ini berapa pun banyaknya dokumen yang sudah ada di proyek.

---

## 3. Modul Opsional (dipilih user sendiri di Document Picker)

Angka token/kredit di bawah sudah final, diambil dari `arrobuild_pricing_monetisasi_v2.md` Bagian 4.3. **Isi/section detail tiap dokumen SUDAH ditemplat** (lihat file `07` s/d `14`) — status berubah dari draft sebelumnya yang baru berupa ide.

| Dokumen Opsional | File Template | Tersedia di | Token | Model | Kelas | Kredit |
|---|---|---|---|---|---|---|
| Cost & Infrastructure Estimate | `07-cost-infrastructure-estimate.md` | Pro | 2.000 | DeepSeek V4 Flash | Hemat | 2 |
| Analytics & Metrics Spec | `08-analytics-metrics-spec.md` | Pro | 2.000 | DeepSeek V4 Flash | Hemat | 2 |
| Analytics & Metrics Spec | `08-analytics-metrics-spec.md` | Pro Max | 3.500 | Gemini 2.5 Pro | Menengah | 84 |
| Testing & QA Plan | `09-testing-qa-plan.md` | Pro | 2.500 | Gemini 2.5 Pro | Menengah | 60 |
| Testing & QA Plan | `09-testing-qa-plan.md` | Pro Max | 4.000 | Gemini 2.5 Pro | Menengah | 96 |
| Onboarding & Email Flow | `10-onboarding-email-flow.md` | Pro | 2.500 | Gemini 2.5 Pro | Menengah | 60 |
| Onboarding & Email Flow | `10-onboarding-email-flow.md` | Pro Max | 4.000 | Gemini 2.5 Pro | Menengah | 96 |
| Competitive Analysis | `11-competitive-analysis.md` | Pro | 3.000 | Claude Sonnet | Flagship | 105 |
| Security & Launch Checklist | `12-security-launch-checklist.md` | Pro Max | 5.000 | Claude Sonnet | Flagship | 175 |
| Database Deep-Dive | `13-database-deep-dive.md` | Pro Max | 4.500 | Claude Sonnet | Flagship | 158 |
| Compliance & Legal Checklist | `14-compliance-legal-checklist.md` | Pro Max | 3.500 | Claude Sonnet | Flagship | 123 |

> [!IMPORTANT]
> **Starter tidak dapat akses modul opsional apa pun** — konsisten dengan pricing final, Starter murni 3 dokumen inti saja.

> [!WARNING]
> **Potensi tumpang tindih yang harus dijaga saat menulis prompt:** Dokumen Adaptif (Bagian 1, #6) untuk `product_type=saas` sudah membahas "Strategi Onboarding" secara ringkas di section Growth & Retention-nya. Modul opsional "Onboarding & Email Flow" membahas hal yang sama tapi jauh lebih dalam (isi email sungguhan, timing tiap email). **Aturan pembeda:** Dokumen Adaptif = ringkasan strategi (beberapa paragraf, arahan besar). Modul opsional = eksekusi detail (siap pakai, bukan cuma arahan). Jangan biarkan keduanya menghasilkan isi yang sama persis — kalau user beli keduanya, mereka harus dapat 2 lapisan informasi yang berbeda kedalamannya, bukan pengulangan.

---

## 4. Sistem Knowledge Model (fondasi fitur revisi)

Blok YAML di awal PRD (lihat `01-prd.md`) adalah "kartu identitas" proyek. Semua dokumen lain merujuk `FEAT-ID` dari blok ini, bukan menulis ulang deskripsi fitur sendiri-sendiri.

> [!IMPORTANT]
> **Klarifikasi asal FEAT-ID** (menyelaraskan dengan `08-form-flow-redesign-v2.md` Bag. 7.1): FEAT-ID **lahir sejak Feature Builder di Step 2 form** — bukan diciptakan AI saat generate. Saat generate, AI hanya mengonfirmasi/merapikan/memberi detail tambahan pada FEAT-ID yang sudah ada dari input user. Ini penting untuk prompt builder: field `features[]` di blok YAML datang dari state form, AI tidak boleh mengubah ID yang sudah ada, hanya boleh menambah detail di sekitarnya.

**Manfaat langsung:**
- Revisi 1 fitur tidak perlu generate ulang seluruh dokumen — cukup kirim ulang blok YAML (~200-400 token) + bagian yang direvisi.
- Context yang di-inject ke dokumen lain otomatis di bawah cap Bagian 2, karena yang dikirim adalah ringkasan terstruktur, bukan flat text penuh.

---

## 5. Cross-Reference ke Implementasi Kode

Metadata tier/model/token/kredit di tiap file template (`01` s/d `06`) **harus identik** dengan `10-tiers-config.ts` yang sudah disiapkan di backend (lihat `00-RINGKASAN-BACKEND-FINAL.md`) — itu yang jadi single source of truth di level kode. Kalau ada perubahan angka di masa depan, update dulu di `10-tiers-config.ts`, baru sinkronkan balik ke dokumen ini, jangan sebaliknya.

---

## 6. Index File Template

**Core Module (wajib):**
- `01-prd.md`
- `02-architecture.md`
- `03-design-system.md`
- `04-plan-task.md`
- `05-agent-rules.md`
- `06-adaptive-documents.md`

**Modul Opsional:**
- `07-cost-infrastructure-estimate.md`
- `08-analytics-metrics-spec.md`
- `09-testing-qa-plan.md`
- `10-onboarding-email-flow.md`
- `11-competitive-analysis.md`
- `12-security-launch-checklist.md`
- `13-database-deep-dive.md`
- `14-compliance-legal-checklist.md`
