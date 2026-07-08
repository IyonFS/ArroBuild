# Template Modul Opsional: Cost & Infrastructure Estimate

> **Tersedia di tier:** Pro
> **Kelas model:** Hemat (DeepSeek V4 Flash)
> **Token budget:** 2.000
> **Kredit:** 2
> **Paling relevan untuk:** Semua tipe produk, terutama solo developer yang belum pernah hitung biaya hosting sendiri

> [!WARNING]
> **Beda dengan section "Estimasi Biaya Operasional" di `04-plan-task.md`:** Plan/Task hanya kasih 1-2 baris estimasi per fase (sekadar gambaran kasar). Dokumen ini adalah breakdown penuh — per komponen, per skala pengguna, termasuk biaya tersembunyi yang sering luput. Kalau user cuma punya Plan/Task, mereka tahu "kira-kira segini". Kalau mereka beli modul ini, mereka tahu "persis dari mana saja biaya itu datang dan kapan akan naik".

---

## 1. Ringkasan Biaya Bulanan
*Perkiraan biaya saat ini (skala kecil) vs proyeksi 6 bulan ke depan, dalam 1 tabel ringkas.*

| Periode | Estimasi Biaya/bulan | Asumsi |
|---|---|---|
| Saat ini (tahap {{stage}}) | $... | ...pengguna aktif |
| Proyeksi 6 bulan | $... | ...pengguna aktif |

## 2. Breakdown Biaya per Komponen
*Rujuk stack dari `02-architecture.md` — jangan generate ulang keputusan stack, cukup hitung biayanya.*

| Komponen | Layanan yang Dipakai | Tier Gratis Sampai Mana | Biaya Setelah Lewat Tier Gratis |
|---|---|---|---|
| Hosting | `{{deployment_target}}` | ... | $.../bulan |
| Database | `{{database}}` | ... | $.../bulan |
| Storage/CDN | ... | ... | $.../bulan |
| API AI (jika `product_type=ai-app` atau ada fitur AI) | ... | ... | $.../1000 request atau token |
| Payment gateway fee | ... | ... | ...% per transaksi |
| Email service | ... | ... | $.../bulan |

## 3. Biaya per Skala Pengguna
*Tabel proyeksi sederhana — bantu user melihat titik kapan biaya mulai naik signifikan.*

| Jumlah Pengguna Aktif | Estimasi Biaya/bulan |
|---|---|
| 100 | $... |
| 1.000 | $... |
| 10.000 | $... |

## 4. Potensi Biaya Tersembunyi
*Hal yang sering luput dari solo developer: biaya bandwidth keluar (egress), biaya overage otomatis, biaya per-seat kalau pakai tool berbayar tim.*

## 5. Rekomendasi Optimasi Biaya Awal
*2-3 saran konkret untuk menekan biaya di tahap awal tanpa mengorbankan kualitas — contoh: pakai tier gratis dulu sampai traktir X pengguna, cache response AI yang sering diulang.*

---

**Catatan implementasi:** Dokumen ini murni kalkulasi berbasis harga publik layanan yang dipakai — tidak butuh reasoning kreatif, makanya cukup kelas Hemat meski informasinya penting.
