# Laporan Audit & Perbaikan Inkonsistensi ArroBuild

**Tanggal Eksekusi:** 29 Juli 2026
**Berdasarkan Instruksi:** `14-agent-audit-fix-prompt.md`

## 1. Ringkasan Eksekutif
Audit telah diselesaikan dengan melihat `source code` secara langsung sebagai kebenaran utama. Dari 6 temuan yang harus diperiksa, **5 berhasil diperbaiki/disinkronisasi**, dan **1 membutuhkan konfirmasi** sebelum dieksekusi lebih lanjut.

- **Selesai:** Multiplier Kredit, Token Budget & Margin, Akses Opsional Tier Pro, Route Lama, Ikon Emoji.
- **Perlu Konfirmasi:** Perubahan Nama Tier (Base/Core/Prime).

---

## 2. Rincian per Temuan

### 2.1 Multiplier Kredit
- **Kondisi Sebelum:** Ada dua versi beredar. Dokumen `mini-tools.md` menyebutkan sistem baru (1x/3x/14x), sementara dokumen lain menyebut (1x/24x/35x/65x).
- **Kondisi Sesudah:** Ditetapkan bahwa **1x/24x/35x/65x** adalah kebenaran utama karena ini adalah angka yang diimplementasikan di `src/lib/config/tiers.ts`. Referensi ke multiplier "baru" di `mini-tools.md` telah dihapus/dikoreksi.
- **File Disentuh:** `mini-tools.md`
- **Alasan:** Patokan harus selalu merujuk pada kode yang berjalan (runtime).

### 2.2 Token Budget per Dokumen
- **Kondisi Sebelum:** Dokumen monetisasi (pricing) menyebut Starter PRD = 2.500 token, Plan/Task = 2.000 token.
- **Kondisi Sesudah:** Kode aktual di `src/lib/config/documents.ts` mendefinisikan Starter PRD = 4.096 token dan Plan/Task = 3.072 token. Dokumen monetisasi telah diperbarui sesuai angka aktual ini.
- **File Disentuh:** `docs/08-MONETIZATION.md`
- **Alasan:** Transparansi estimasi biaya harus 100% mencerminkan aturan yang dikonfigurasikan di sistem agar user dan proyeksi bisnis tidak meleset.

### 2.3 Akses Dokumen Opsional Tier Pro
- **Kondisi Sebelum:** PRD menyebutkan Pro tidak punya akses (`❌`) ke dokumen opsional.
- **Kondisi Sesudah:** Kode `canAccessDocument()` memberi akses Pro ke 5 modul opsional. PRD telah diupdate menjadi `✅ 5 Modul` untuk tier Pro.
- **File Disentuh:** `docs/01-PRD.md`
- **Alasan:** Sesuai instruksi, fitur yang sudah ada (dikodekan dan bisa dinikmati user) tidak dicabut, melainkan dokumen yang diperbaiki.

### 2.4 Nama Tier — Starter/Pro/Pro Max vs Base/Core/Prime
- **Kondisi Sebelum:** Terdapat draf UI/landing page yang menggunakan nama Base/Core/Prime.
- **Kondisi Sesudah:** *Belum diubah — Menunggu konfirmasi.*
- **File Disentuh:** Tidak ada
- **Alasan:** Nama tier sangat menyangkut masalah *branding* dan berdampak luas dari UI hingga struktur _database_ (enum `TierId`). Sesuai aturan kerja, hal ini bukan ranah perbaikan bug otomatis melainkan harus melewati persetujuan eksplisit.

### 2.5 Route Lama Belum Direname
- **Kondisi Sebelum:** Dokumen dan script UI sering merujuk `/tools/stitch-composer` atau `/tools/landing-copy`.
- **Kondisi Sesudah:** Route ini secara kode *sudah direname* dan fungsi lamanya (seperti `src/app/tools/stitch-composer/page.tsx`) diisi dengan fungsi `redirect()` Next.js menuju route baru. Referensi tertulis di `05-CONTEXT.md` telah diperbaiki.
- **File Disentuh:** `docs/05-CONTEXT.md`
- **Alasan:** Menghindari kebingungan dalam dokumentasi dengan memastikan nama route yang dirujuk sesuai dengan hasil yang sudah di-_redirect_.

### 2.6 Ikon Emoji → Lucide Icons
- **Kondisi Sebelum:** Terindikasi bahwa emoji digunakan alih-alih ikon SVG modern.
- **Kondisi Sesudah:** Pengecekan pada codebase (`src/lib/ui/app-icons.tsx` dan `DocumentPickerStep.tsx`) menunjukkan bahwa Lucide icon (`DocIcon`, `ModelClassIcon`) **sudah diimplementasikan secara aktif** untuk merender UI. Properti `.icon` berisi emoji di config `documents.ts` tidak digunakan untuk rendering UI, sehingga tidak ada UI yang perlu direfaktor.
- **File Disentuh:** Tidak ada.
- **Alasan:** Karena perbaikan ini sesungguhnya sudah diterapkan di dalam UI, tidak perlu mengedit file `documents.ts` yang emojinya mungkin digunakan untuk referensi log terminal atau konten markdown saja.

---

## 3. Dampak ke Margin & Kredit

Berdasarkan koreksi pada token budget (Poin 2.2), perhitungan estimasi proyeksi untuk tier **Starter** mengalami sedikit perubahan. **Pro** dan **Pro Max** tidak terpengaruh secara esensial.

| Tier | Total Kredit/Proyek (Sebelum) | Total Kredit/Proyek (Sesudah) | Estimasi Proyek/Bulan (Sesudah) | Margin |
|------|-------------------------------|-------------------------------|---------------------------------|--------|
| **Starter** (3.000) | ~8 kredit | ~14 kredit | ~214 proyek | Aman (Sangat Menguntungkan) |
| **Pro** (7.000) | ~270 kredit | ~270 kredit | ~26 proyek | Aman |
| **Pro Max** (14.000)| ~1.098 kredit | ~1.098 kredit | ~13 proyek | Aman |

Margin untuk kelas Starter turun dari 375 proyek ke sekitar 214 proyek. Angka ini masih sangat wajar secara operasional bisnis (sangat kecil peluang seorang user tunggal menggunakan lebih dari 200 proyek manual dalam sebulan).

---

## 4. Temuan Baru
Tidak ada temuan inkonsistensi baru yang di luar lingkup permasalahan instruksi. Semua konfigurasi penting (kredit, router tier, budget) tampaknya berada di titik final yang mapan dalam `src/lib/config/`.

---

## 5. Rekomendasi Prioritas Selanjutnya

1. **Keputusan Nama Tier (Base/Core/Prime):** Ini menjadi prioritas utama. Karena draf script dan aset *copywriting* sudah memakai nama baru, ketidakjelasan ini dapat menyusahkan integrasi UI nanti. Apabila dikonfirmasi untuk ganti, ini akan memicu *refactoring* massal terhadap string hardcode dan konfigurasi di backend.
2. **Implementasi UI Tiers:** Pastikan halaman harga (Pricing Page) dan komponen paywall (Step 5 di flow generator) memuat data dinamis langsung dari `TIER_CONFIG` sehingga tidak terjadi inkonsistensi data di masa depan bila sewaktu-waktu harga atau batas kredit diubah.
