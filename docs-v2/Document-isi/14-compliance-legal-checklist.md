# Template Modul Opsional: Compliance & Legal Checklist

> **Tersedia di tier:** Pro Max saja
> **Kelas model:** Flagship (Claude Sonnet)
> **Token budget:** 3.500
> **Kredit:** 123
> **Paling relevan untuk:** SaaS, Marketplace, E-commerce, AI-App

> [!IMPORTANT]
> **Disclaimer wajib ditampilkan ke user, bukan opsional:** Dokumen ini bukan nasihat hukum. Isinya adalah daftar POIN yang UMUMNYA relevan, bukan teks hukum siap pakai. User tetap harus konsultasi dengan pengacara sebelum mempublikasikan Terms of Service/Privacy Policy final, terutama kalau menyasar pengguna di banyak negara dengan regulasi berbeda. Ini penting dicantumkan di dokumen hasil generate, bukan hanya di template ini.

---

## 1. Kebutuhan Privasi Data (Poin Dasar)
*Bukan teks hukum, tapi daftar hal yang perlu dipikirkan — disesuaikan dengan data yang benar-benar dikumpulkan produk ini (rujuk fitur di PRD).*

- [ ] Data pribadi apa saja yang dikumpulkan (nama, email, lokasi, data pembayaran, dll — sesuaikan dengan fitur nyata)
- [ ] Berapa lama data disimpan, dan kapan/bagaimana dihapus
- [ ] Apakah data dibagikan ke pihak ketiga (contoh: payment gateway, API AI eksternal) — sebutkan pihak ketiga aktual dari stack di `02-architecture.md`

## 2. Struktur Dasar Terms of Service & Privacy Policy
*Poin-poin yang UMUMNYA ada di dokumen semacam ini — bukan teks hukum final.*

| Bagian | Poin yang Biasanya Dibahas |
|---|---|
| Terms of Service | Hak & kewajiban pengguna, batasan tanggung jawab, aturan pembatalan akun |
| Privacy Policy | Data yang dikumpulkan, tujuan penggunaan, hak pengguna atas datanya |

## 3. Kepatuhan Pembayaran (jika produk memproses pembayaran)
- [ ] Gunakan payment gateway berlisensi (contoh: Midtrans) — ini menangani sebagian besar kepatuhan PCI-DSS, produk tidak perlu menyimpan data kartu mentah sama sekali
- [ ] Pastikan tidak ada log yang menyimpan data kartu secara tidak sengaja

## 4. Checklist Khusus AI *(hanya jika `product_type = ai-app` atau ada fitur AI)*
- [ ] Kejelasan ke user: data mereka dikirim ke model AI pihak ketiga atau tidak
- [ ] Kebijakan retensi data yang dikirim ke API AI eksternal

---

**Catatan implementasi:** Dokumen ini WAJIB menyertakan disclaimer di Bagian [!IMPORTANT] di atas sebagai bagian dari output yang digenerate, bukan hanya catatan internal — supaya user ArroBuild tidak salah kira ini pengganti nasihat hukum profesional.
