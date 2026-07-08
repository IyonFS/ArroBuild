# Template Modul Opsional: Testing & QA Plan

> **Tersedia di tier:** Pro dan Pro Max
> **Kelas model:** Menengah (Gemini 2.5 Pro) di kedua tier
> **Token budget:** Pro 2.500 | Pro Max 4.000
> **Kredit:** Pro 60 | Pro Max 96
> **Paling relevan untuk:** Semua tipe produk

---

## 1. Strategi Testing
*Rekomendasi proporsi unit test / integration test / end-to-end test, disesuaikan dengan framework di `02-architecture.md`.*

| Jenis Test | Proporsi Disarankan | Tool yang Cocok untuk `{{framework}}` |
|---|---|---|
| Unit Test | ...% | ... |
| Integration Test | ...% | ... |
| End-to-End Test | ...% | ... |

## 2. Skenario Test Prioritas
*Wajib merujuk `FEAT-ID` — fitur berprioritas P0 di PRD harus punya skenario test lebih dulu.*

| Kode | Fitur (FEAT-ID) | Skenario yang Harus Ditest | Prioritas |
|---|---|---|---|
| TEST-001 | FEAT-001 | ... (kondisi normal + minimal 1 kondisi gagal) | P0 |

## 3. Target Test Coverage
*Angka target yang realistis untuk solo developer — jangan asal menuntut 100%.*

> 🔒 **Pro Max saja:**
> - **Checklist Regresi Sebelum Rilis** — daftar hal yang wajib dicek ulang manual sebelum setiap rilis ke production
> - **Checklist QA Manual untuk Alur Kritis** — untuk alur yang menyangkut uang/data sensitif (pembayaran, autentikasi), tetap sertakan langkah cek manual walau sudah ada automated test

---

**Catatan implementasi:** Skenario test yang digenerate harus konkret dan bisa langsung ditulis jadi kode test oleh AI Coding Agent — bukan sekadar "test fitur ini berjalan dengan baik" yang terlalu umum.
