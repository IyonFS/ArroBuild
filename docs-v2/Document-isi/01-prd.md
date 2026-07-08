# Template: PRD (Product Requirements Document) — v2, terintegrasi

> **Tipe dokumen:** Wajib (Core Module) — dokumen #1
> **Tersedia di tier:** Starter, Pro, Pro Max
> **Kelas model:** Starter → Hemat (Gemini 2.5 Flash-Lite / DeepSeek V4 Flash) | Pro → Menengah (Gemini 2.5 Pro) | Pro Max → Flagship (GPT-5.4)
> **Token budget:** Starter 2.500 | Pro 4.000 | Pro Max 7.000
> **Kredit (default mix):** Starter 3 | Pro 96 | Pro Max 245
> **Berlaku untuk:** Semua tipe produk (ada 1 section tambahan sesuai tipe, lihat Bagian 8)
> **Catatan:** Kelas model di atas adalah default per tier. User bisa menaikkan kelas model khusus untuk dokumen ini lewat Model Picker per-dokumen di Step 4 — kredit di atas akan berubah mengikuti kelas yang dipilih.

---

## Metadata Terstruktur (wajib disisipkan di paling awal hasil generate)

Blok ini adalah "Single Source of Truth". Dokumen lain (Architecture, Plan/Task, Agent Rules, Dokumen Adaptif) WAJIB merujuk `feature_id` dari sini, bukan menulis ulang deskripsi fitur sendiri.

> **Penting:** Isi `features[]` di bawah **berasal dari Feature Builder di Step 2 form** (input user), bukan dikarang AI. Saat generate, AI hanya boleh menambah detail (deskripsi, kriteria selesai) pada FEAT-ID yang sudah ada — tidak boleh mengubah/menghapus ID yang sudah ditentukan user.

```yaml
---
project_id: "{{project_id}}"
product_type: "{{product_type}}"   # saas | marketplace | mobile | api | ai-app | ecommerce | internal | portfolio | other
stage: "{{stage}}"                 # idea | prototype | production
generated_at: "{{timestamp}}"
features:
  - id: FEAT-001
    name: "{{nama_fitur}}"
    priority: P0   # P0 = wajib, P1 = bisa nyusul, P2 = nice-to-have
  - id: FEAT-002
    name: "{{nama_fitur}}"
    priority: P0
---
```

---

## 1. Ringkasan Produk
*2-3 kalimat: produk ini apa, untuk siapa, kenapa dibuat.*

## 2. Masalah yang Diselesaikan
*Masalah nyata yang dialami target pengguna sebelum produk ini ada.*

## 3. Target Pengguna
*Siapa yang memakai produk ini, kebutuhan utama mereka. Boleh lebih dari 1 tipe pengguna (contoh: marketplace punya penjual & pembeli).*

## 4. Fitur Utama
*Daftar fitur, tiap fitur wajib punya kode FEAT-XXX (samakan dengan blok metadata) dan prioritas.*

| Kode | Nama Fitur | Prioritas | Deskripsi Singkat |
|---|---|---|---|
| FEAT-001 | ... | P0 | ... |
| FEAT-002 | ... | P0 | ... |
| FEAT-003 | ... | P1 | ... |

## 5. Cara Kerja Tiap Fitur
*Untuk tiap fitur P0 dan P1:*

> **FEAT-001 — {{nama fitur}}**
> Sebagai [tipe pengguna], saya mau [aksi], supaya [manfaat].
> **Kriteria selesai:** [kondisi yang menandakan fitur ini berfungsi dengan benar]
>
> 🔷 **Pro ke atas:** kriteria selesai wajib ditulis lengkap seperti di atas (Starter cukup deskripsi 1 baris tanpa kriteria selesai formal).
> 🔒 **Pro Max saja:** tambahkan juga kondisi gagal/edge case, contoh: "Jika [kondisi tidak umum terjadi], maka sistem harus [perilaku yang diharapkan]."

## 6. Alur Pengguna Utama
*Langkah pengguna dari awal sampai tujuan tercapai (format bernomor).*

> ⚪ **Starter:** 1 alur utama, ringkas.
> 🔒 **Pro Max saja:** tambahkan minimal 1 alur alternatif — contoh: alur ketika pembayaran gagal, alur ketika data tidak valid.

## 7. Batasan
*Hal yang sudah pasti dan tidak bisa diubah — batasan teknis, anggaran, waktu, atau kebijakan dari form.*

## 8. Section Khusus Sesuai Tipe Produk
*Section ini WAJIB ada di setiap PRD, semua tier termasuk Starter. Judul & isinya mengikuti `product_type`:*

| product_type | Judul Section | Yang harus dibahas |
|---|---|---|
| `saas` | Model Harga & Langganan | Tier harga, siklus tagihan, batasan fitur per tier |
| `marketplace` | Peran Dua Sisi & Aturan Transaksi | Peran penjual/pembeli, skema komisi, aturan dispute dasar |
| `mobile` | Kebutuhan Platform | iOS/Android/keduanya, dukungan mode offline, native feature yang dipakai |
| `api` | Pengguna API & Kasus Pakai | Siapa developer yang memakai, 2–3 contoh skenario pakai konkret |
| `ecommerce` | Katalog & Alur Checkout | Struktur kategori produk, metode pembayaran, alur dari keranjang sampai konfirmasi |
| `ai-app` | Kasus Pakai AI & Batasan Model | Model AI yang dipakai, batasan privasi data, sikap sistem jika AI gagal merespons |
| `internal` | Pengguna Internal & Sistem Existing | Divisi/tim yang memakai, sistem lama yang harus terintegrasi |
| `portfolio` | Proyek yang Ditonjolkan | Proyek/skill utama yang ingin ditampilkan, target audiens (recruiter/klien) |
| `other` | *(boleh generik sesuai freeText user)* | — |

---

**Catatan implementasi:** Prompt builder wajib menerima `product_type` sebagai parameter (sebelumnya hilang di `GenerationInput`, temuan cross-cutting issue #1 di analisis awal). Context yang dikirim ke dokumen lain (Architecture, Plan/Task) cukup blok YAML di atas — jangan kirim isi PRD penuh, ini yang menjaga penggunaan token tetap di bawah cap Bagian 2 di `00-overview.md`.
