# 14 — Prompt Audit & Perbaikan Inkonsistensi ArroBuild (untuk AI Coding Agent)

**Untuk:** Cursor / Claude Code / Windsurf (atau AI coding agent lain yang punya akses langsung ke codebase ArroBuild)
**Diberikan oleh:** Vansico (founder)
**Tujuan:** Audit kondisi nyata di kode & dokumentasi, perbaiki inkonsistensi yang sudah teridentifikasi, lalu laporkan kondisi akhir secara akurat — berdasarkan kode yang sebenarnya, bukan asumsi ulang dari dokumen lama.

---

## 0. Cara Pakai Dokumen Ini

Tempel seluruh isi dokumen ini sebagai instruksi ke AI coding agent yang sedang memegang codebase ArroBuild. Agent **wajib membaca kode sumber terlebih dulu** (`documents.ts`, config tier/kredit, `tier-enforcer`, route files, dsb) sebelum mengubah apa pun — karena beberapa dokumen markdown yang ada (`arrobuild_pricing_monetisasi_v2.md`, PRD) sudah diketahui menyimpang dari kode aktual.

---

## 1. Aturan Kerja (wajib dipatuhi sebelum mengubah apa pun)

1. **Kode sumber = kebenaran utama untuk bug murni** (angka yang seharusnya sinkron tapi ternyata berbeda). Kalau dokumentasi berbeda dari kode karena bug/typo, yang diperbaiki adalah dokumennya — bukan sebaliknya.
2. **Jangan menebak untuk keputusan bisnis.** Kalau sebuah temuan menyangkut keputusan bisnis (harga, akses tier, rename produk), JANGAN diputuskan sendiri. Tandai sebagai **"Perlu Konfirmasi"** di laporan akhir lengkap dengan rekomendasi + alasannya, tapi jangan dieksekusi sampai dikonfirmasi Vansico.
3. **Scope terbatas ke Bagian 2 (poin 2.1–2.6) saja.** Jangan menghapus atau menulis ulang kode/dokumen lain yang tidak terkait temuan ini.
4. Kalau tersedia git, commit terpisah per-temuan (bukan satu commit besar) supaya gampang direview satu per satu.
5. Kalau selama audit ketemu inkonsistensi baru yang tidak tercantum di dokumen ini, **catat di laporan akhir sebagai temuan tambahan** — jangan langsung diperbaiki tanpa dilaporkan dulu.

---

## 2. Temuan yang Harus Diperiksa & Diperbaiki

### 2.1 Multiplier Kredit — dua versi beredar (PRIORITAS TERTINGGI)

**Kondisi yang dilaporkan:**
- Versi lama (`tiers.ts` / dokumen arsitektur lama): Hemat 1× / Menengah 24× / Flagship 35× / Ultra 65×
- Disebut di `mini-tools.md` sebagai "sistem baru": Hemat 1× / Menengah 3× / Flagship 14× / Ultra belum diketahui

**Langkah:**
1. Buka file config kredit yang benar-benar dipakai runtime saat generate (kemungkinan `src/lib/config/tiers.ts` atau setara). Catat angka yang **benar-benar dipakai untuk menghitung potongan kredit**, bukan yang cuma disebut di komentar/dokumen.
2. Bandingkan dengan kedua versi di atas.
3. **Jika kode cuma punya satu versi yang benar-benar berjalan** (baik 24/35/65 maupun 3/14/?): jadikan itu ground truth, lalu update SEMUA dokumen yang menyebut multiplier lama (kalkulasi margin, estimasi kredit/proyek, halaman pricing) supaya konsisten dengan angka ini.
4. **Jika kode belum punya implementasi final** (kedua versi cuma tersirat, belum benar-benar dipakai untuk potong kredit): JANGAN pilih salah satu sendiri. Tandai di laporan sebagai keputusan terbuka, sertakan dampak masing-masing opsi terhadap margin (pakai kalkulasi margin di `arrobuild_pricing_monetisasi_v2.md` Bagian 6 sebagai pembanding).

### 2.2 Token Budget per Dokumen — beda antara dokumen pricing dan kode aktual

**Contoh yang dilaporkan berbeda:** PRD Starter (dokumen: 2.500 vs kode: 4.096), Plan/Task Starter (dokumen: 2.000 vs kode: 3.072).

**Langkah:**
1. Ambil angka `tokenBudget` aktual dari `documents.ts` (atau file config dokumen yang setara) untuk **seluruh 14 dokumen × 3 tier**.
2. Hitung ulang kredit/proyek (skenario default-mix dan worst-case) memakai angka aktual ini, dikombinasikan dengan hasil multiplier dari poin 2.1.
3. Update tabel kredit/proyek dan uji margin di dokumen pricing supaya mencerminkan angka kode yang sebenarnya.
4. Kalau hasil hitung ulang membuat margin salah satu tier turun ke bawah ambang wajar (di bawah ±50% margin kotor), tandai eksplisit di laporan sebagai **"Perlu Keputusan"** — solusinya bisa turunkan token budget di kode atau sesuaikan harga/alokasi kredit, dan itu bukan hal yang boleh diputuskan sepihak oleh agent.

### 2.3 Akses Dokumen Opsional Tier Pro — PRD vs kode+pricing bertentangan

**Kondisi:** Kode dan `arrobuild_pricing_monetisasi_v2.md` sepakat Pro bisa mengakses 5 dari 8 modul opsional (Cost & Infrastructure, Analytics & Metrics, Testing & QA, Onboarding & Email, Competitive Analysis). Tapi tabel fitur di PRD terbaru menulis Pro = ❌ untuk semua dokumen opsional.

**Langkah:**
1. Verifikasi langsung di kode (`documents.ts` / tier-enforcer): apakah Pro betul-betul bisa generate 5 dokumen opsional tersebut saat ini.
2. Karena dua sumber (kode + dokumen pricing) sudah sepakat, **default: perbaiki PRD supaya sinkron dengan kode** — bukan mengubah kode mengikuti PRD, karena mengubah kode berarti mencabut fitur yang mungkin sudah dikomunikasikan atau sudah dinikmati user Pro yang sudah bayar.
3. Tetap laporkan perubahan ini secara eksplisit (bukan "otomatis benar, tidak perlu dilaporkan") supaya Vansico bisa membatalkan kalau ternyata PRD justru mencerminkan keputusan terbaru yang belum sempat di-propagate ke kode.

### 2.4 Nama Tier — STARTER/PRO/PRO_MAX vs Base/Core/Prime

**Kondisi:** Kode dan dokumen bisnis konsisten pakai Starter/Pro/Pro Max. Tapi ada draf script landing page baru yang sudah memakai nama Base/Core/Prime.

**Langkah:**
- **Jangan lakukan rename apa pun di kode.** Ini murni keputusan branding, bukan bug.
- Cukup laporkan: apakah nama Base/Core/Prime itu sudah dipakai di UI yang live, atau baru di file draft yang belum diimplementasikan.
- Tandai sebagai **"Perlu Konfirmasi"**: apakah rename ini jadi dieksekusi. Kalau ya, itu scope pekerjaan tersendiri yang lebih besar (menyentuh kode, dokumen bisnis, dan UI sekaligus) — bukan bagian dari audit ini.

### 2.5 Route Lama Belum Direname

**Kondisi:** `/tools/stitch-composer` seharusnya `/tools/arrodesign`, `/tools/landing-copy` seharusnya `/tools/copy-studio`.

**Langkah:**
1. Rename route ke nama baru.
2. Tambahkan redirect dari route lama ke route baru (jangan biarkan URL lama 404 begitu saja — ada risiko bookmark/backlink eksternal yang masih memakai URL lama).
3. Update semua referensi internal (link navigasi, sitemap, dsb) supaya mengarah ke route baru.

### 2.6 Ikon Emoji → Lucide Icons

**Kondisi:** UI produk masih pakai emoji (📝🏗️🗺️🎨🤖🧩💰📊🧪✉️🎯🛡️🗄️⚖️ dst), padahal design system sudah memutuskan pindah ke Lucide Icons.

**Langkah:**
1. Buat mapping emoji → nama ikon Lucide yang setara untuk tiap dokumen (PRD, Architecture, Plan/Task, Design System, Agent Rules, Adaptive Document, dan 8 modul opsional) — kalau mapping ini belum ada di manapun.
2. Ganti pemakaian emoji di komponen UI dengan komponen Lucide.
3. **Bedakan dua konteks:** emoji di UI produk (harus diganti Lucide) vs emoji di dalam ISI dokumen `.md` hasil generate AI yang dibaca user (bukan bagian dari sistem ikon UI). Cek dulu apakah masing-masing kemunculan emoji termasuk salah satu dari dua konteks ini sebelum diubah, supaya tidak menyentuh hal di luar scope temuan ini.

---

## 3. Format Laporan yang Diminta Setelah Selesai

Setelah seluruh langkah di atas dikerjakan, buat **satu dokumen laporan baru** (jangan menimpa dokumen lama) dengan struktur berikut:

1. **Ringkasan** — dari 6 temuan (2.1–2.6), berapa yang selesai diperbaiki dan berapa yang masuk kategori "Perlu Konfirmasi".
2. **Rincian per Temuan (2.1–2.6):**
   - Kondisi sebelum (angka/kode lama, dengan kutipan lokasi file)
   - Kondisi sesudah (angka/kode baru, atau status "belum diubah — menunggu konfirmasi")
   - File yang disentuh (path lengkap)
   - Alasan keputusan yang diambil
3. **Dampak ke Margin & Kredit** — kalau poin 2.1/2.2 mengubah angka kredit/proyek atau margin, tampilkan tabel before/after untuk Starter, Pro, dan Pro Max.
4. **Temuan Baru (kalau ada)** — inkonsistensi lain yang ditemukan selama audit tapi belum tercantum di dokumen ini.
5. **Rekomendasi Prioritas Selanjutnya** — urutan yang disarankan untuk menyelesaikan item "Perlu Konfirmasi", diurutkan berdasarkan risiko (dampak finansial > dampak UX > kosmetik).

---

## 4. Checklist Sebelum Melaporkan "Selesai"

- [ ] Multiplier kredit sudah diverifikasi langsung ke kode, bukan diasumsikan dari dokumen
- [ ] Token budget seluruh 14 dokumen × 3 tier sudah dicek langsung ke `documents.ts`
- [ ] Margin dihitung ulang dengan angka aktual, bukan angka lama dari `pricing_v2`
- [ ] Tidak ada rename tier yang dieksekusi tanpa konfirmasi eksplisit
- [ ] Redirect route lama → baru sudah aktif, bukan sekadar rename tanpa redirect
- [ ] Emoji di UI produk sudah diganti Lucide; emoji di isi dokumen `.md` hasil generate TIDAK ikut diubah kecuali diminta terpisah
- [ ] Laporan akhir dibuat sebagai file baru, bukan menimpa dokumen lama
