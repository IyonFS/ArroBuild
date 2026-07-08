# Template Modul Opsional: Onboarding & Email Flow

> **Tersedia di tier:** Pro dan Pro Max
> **Kelas model:** Menengah (Gemini 2.5 Pro) di kedua tier
> **Token budget:** Pro 2.500 | Pro Max 4.000
> **Kredit:** Pro 60 | Pro Max 96
> **Paling relevan untuk:** SaaS, Marketplace, E-commerce

> [!WARNING]
> **Beda dengan `06-adaptive-documents.md` (SaaS: "Strategi Onboarding"):** Dokumen Adaptif hanya kasih arahan besar (2-3 kalimat). Modul ini berisi peta alur konkret + daftar email yang benar-benar bisa dikirim.

---

## 1. Peta Alur Onboarding (Pengalaman Pertama di Produk)
*Langkah pengguna baru dari pertama masuk sampai merasakan "aha moment" — momen pertama kali manfaat inti produk terasa.*

```
1. Daftar → 2. {{langkah verifikasi/setup}} → 3. {{momen aha}} → 4. {{ajakan aksi lanjutan}}
```

## 2. Daftar Email Transaksional
*Email yang terkirim otomatis karena aksi user, bukan campaign marketing.*

| Nama Email | Terpicu Saat | Tujuan |
|---|---|---|
| Welcome Email | Setelah daftar berhasil | Konfirmasi + arahkan ke langkah pertama |
| Verifikasi Email | Setelah daftar | Konfirmasi kepemilikan email |
| {{email lain sesuai fitur, misal notifikasi transaksi}} | ... | ... |

## 3. Sequence Email Retensi
*Khusus untuk `product_type=saas`: rangkaian email yang mendorong user aktif kembali atau mencegah churn.*

| Urutan | Kapan Dikirim | Tujuan |
|---|---|---|
| 1 | Hari ke-1 setelah daftar, jika belum pakai fitur inti | Dorong coba fitur inti |
| 2 | Beberapa hari sebelum trial berakhir (jika ada trial) | Dorong upgrade |

> 🔒 **Pro Max saja:** tambahkan draf copy tiap email (subject line + isi singkat 3-4 kalimat) dan rekomendasi interval waktu pengiriman yang konkret (bukan cuma "beberapa hari", tapi angka pasti).

---

**Catatan implementasi:** Untuk `product_type` selain saas/marketplace/ecommerce, dokumen ini sebaiknya tidak ditawarkan di Document Picker karena kurang relevan (contoh: internal tool/portfolio tidak butuh sequence email retensi).
