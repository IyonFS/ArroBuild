# Template Modul Opsional: Analytics & Metrics Spec

> **Tersedia di tier:** Pro (versi ringkas) dan Pro Max (versi lengkap)
> **Kelas model:** Pro → Hemat (DeepSeek V4 Flash) | Pro Max → Menengah (Gemini 2.5 Pro)
> **Token budget:** Pro 2.000 | Pro Max 3.500
> **Kredit:** Pro 2 | Pro Max 84
> **Paling relevan untuk:** SaaS, Marketplace, E-commerce, Mobile App

> [!WARNING]
> **Beda dengan `06-adaptive-documents.md` (SaaS: "Metrik Retensi Utama"):** Dokumen Adaptif hanya menyebut metrik APA yang penting dan KENAPA (2-3 kalimat). Modul ini berisi daftar EVENT lengkap siap diimplementasikan ke tool seperti GA4/Mixpanel — nama event, kapan terpicu, properti apa yang ikut terkirim.

---

## 1. Daftar Event yang Dilacak
*Setiap event wajib merujuk `FEAT-ID` dari PRD yang menjadi alasan event itu perlu dilacak.*

| Nama Event | Terpicu Saat | Properti yang Disertakan | Terkait Fitur |
|---|---|---|---|
| `user_signed_up` | Pendaftaran berhasil | `signup_method`, `referral_source` | FEAT-001 |
| `{{event_name}}` | ... | ... | FEAT-00X |

## 2. Funnel Utama yang Dipantau
*Petakan alur acquisition → activation → retention menggunakan event di atas.*

```
Acquisition: user_signed_up
      ↓
Activation: {{event fitur inti pertama kali dipakai}}
      ↓
Retention: {{event yang menandakan user kembali memakai produk}}
```

> ⚪ **Pro:** 1 funnel utama saja.
> 🔒 **Pro Max saja:** tambahkan breakdown funnel per segmen pengguna (contoh: funnel berbeda untuk pengguna gratis vs berbayar), dan definisikan 1 **North Star Metric** — metrik tunggal yang paling mewakili "produk ini berhasil atau tidak".

## 3. Dashboard Metrik Inti
*Metrik yang sebaiknya dipantau harian/mingguan.*

| Metrik | Cara Hitung | Target Awal |
|---|---|---|
| ... | ... | ... |

---

**Catatan implementasi:** Event yang direkomendasikan harus benar-benar bisa diimplementasikan dengan tool analytics umum (GA4, Mixpanel, PostHog) — jangan generate nama event yang terlalu abstrak untuk diimplementasikan developer.
