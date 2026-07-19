# Copy Studio — PRD & Plan

**Status:** Siap eksekusi (dengan 1 catatan dependensi, lihat Bagian 8)
**Menggantikan/mengevolusi:** "Landing Page Copy" (scaffold lama, Prime, 108 kredit)
**Tier baru:** Core (salah satu dari 3 tools pilihan), otomatis tersedia di Prime
**Pasangan:** ArroDesign menjawab "bagaimana tampilannya", Copy Studio menjawab "apa yang dikatakan"

---

## 1. Masalah

User yang mau bikin landing page (profile perusahaan, promosi UMKM, portfolio) sering sudah punya desain (dari ArroDesign atau tempat lain) tapi buntu di bagian teks — konten per section apa, kata-kata seperti apa yang meyakinkan. Atau sebaliknya: belum punya apa-apa sama sekali, cuma ide di kepala.

## 2. Solusi

Tiga jalur masuk tergantung sejauh mana user sudah punya materi, dengan prinsip yang sama seperti README Generator: **tidak ada keputusan yang diambil diam-diam** — kalau sistem tidak yakin soal sesuatu (misal baca screenshot yang teksnya kepotong), tandai jelas dan minta konfirmasi, bukan menebak.

## 3. Tiga Mode Input

| Mode | Sumber | Kapan dipakai |
|---|---|---|
| **Mode ArroDesign** | Reuse breakdown per-section dari hasil ArroDesign yang pernah dibuat | User sudah generate desain lewat ArroDesign — termurah, nol biaya vision baru |
| **Mode Screenshot** | Upload screenshot per section dari desain yang sudah jadi (dari luar ArroBuild) | User punya desain siap tapi bukan dari ArroDesign |
| **Mode Mulai dari Nol** | Pilih template struktur (galeri visual) ATAU mode diskusi santai | User belum punya desain sama sekali |

## 4. Galeri Template (untuk Mode Mulai dari Nol)

Berdasarkan arketipe, bukan gaya visual (itu urusan ArroDesign) — arketipe **struktur konten**:
- SaaS Product Launch
- Profile Perusahaan / Company Profile
- Promosi UMKM
- Portfolio Personal
- Event / Promo Page

Tiap template preview menunjukkan **urutan section dan jenis konten tiap section** (bukan cuma nama arketipe) — konsisten dengan pola preview visual yang sudah ditetapkan di README Generator dan Generate Flow utama.

## 5. Alur Pengguna Lengkap (dengan Titik Keputusan)

```
1. Pilih mode (ArroDesign / Screenshot / Mulai dari Nol)

1a. [Mode ArroDesign]
    Pilih dari daftar hasil ArroDesign yang pernah dibuat.
    → Belum pernah pakai ArroDesign: state kosong, "Kamu belum punya hasil
      ArroDesign. Coba mode lain, atau mulai dari ArroDesign dulu →"

1b. [Mode Screenshot]
    Upload screenshot per section (bisa lebih dari satu gambar).
    → Tiap section dianalisis vision, hasil copy ditandai [CONFIRMED] kalau
      teksnya jelas terbaca dari gambar, [PERLU DIKONFIRMASI] kalau
      ambigu/terpotong/buram — sama persis prinsip confidence tagging yang
      sudah ditetapkan di ArroDesign, dipakai ulang di sini karena situasinya
      serupa (analisis visual dengan tingkat kepastian bervariasi)
    → Section yang [PERLU DIKONFIRMASI]: tampil dengan highlight, user bisa
      edit langsung sebelum lanjut — bukan disembunyikan atau ditembak asal

1c. [Mode Mulai dari Nol]
    Pilih: Template (galeri visual) atau Mode Diskusi
    → [Template] Isi form singkat (nama produk, target user, value utama)
      → generate mengikuti struktur template
    → [Mode Diskusi] Chat santai, dibatasi giliran (sama seperti Mode
      Dipandu AI: ringkasan field terisi + 2 giliran mentah terakhir,
      hard cap giliran) — bukan chat bebas tanpa batas token

2. Preview estimasi kredit (beda-beda per mode & jumlah section, lihat
   Bagian 6) → tombol "✏️ Ubah pilihan" tersedia → Generate

3. Output: markdown script per section, preview + raw + copy + download .md
```

## 6. Skema Kredit

| Mode | Basis | Kredit |
|---|---|---|
| ArroDesign (reuse) | ~2.500 output, Menengah | **8** |
| Template | ~2.500 output, Menengah | **8** |
| Mode Diskusi | Mirip Mode Dipandu AI (context capped) | **~6-12** |
| Screenshot | **Per section**, vision + copy, Flagship, ~800 output/section | **~12/section** |

Screenshot ditampilkan **per section**, bukan flat rate — supaya user dengan 3 section bayar jauh lebih murah dari user dengan 10 section, transparan sejak awal sebelum klik generate.

## 7. Arsitektur Teknis

- Reuse `/api/tools/run` — bukan endpoint baru
- Mode ArroDesign: query ke tabel `DesignAnalysis` (dari arsitektur ArroDesign) — **lihat catatan dependensi Bagian 8**
- Mode Screenshot: **terverifikasi** — GLM-5.2 dan Qwen3.7-Max ternyata text-only (sempat diasumsikan support vision, salah). Model vision yang dipakai: **Qwen3-VL-235B-A22B-Instruct** via OpenRouter (infrastruktur sama, tidak perlu integrasi baru), aktif otomatis kalau input mengandung gambar, tetap dikenakan tarif kredit setingkat Flagship
- Mode Diskusi: reuse pola context-capping dari Mode Dipandu AI (jangan bikin mekanisme cap baru terpisah)
- Reuse retry-handler + fallback chain yang sudah ada

## 8. Catatan Dependensi — Mode ArroDesign

> [!IMPORTANT]
> Mode ArroDesign baru bisa berfungsi **setelah ArroDesign sendiri selesai dibangun** (belum, ini masih di tahap arsitektur). Rekomendasi urutan kerja: **bangun Copy Studio dengan Mode Screenshot + Mode Mulai dari Nol dulu** (keduanya berdiri sendiri, tidak butuh ArroDesign), tampilkan Mode ArroDesign sebagai "Segera" di dalam tool-nya sendiri, aktifkan begitu ArroDesign sudah jalan.

## 9. Kriteria Sukses

- Mode Screenshot: section yang [PERLU DIKONFIRMASI] benar-benar muncul saat gambar memang ambigu (diuji manual dengan screenshot buram sengaja) — bukan cuma fitur yang ada tapi tidak pernah aktif
- Mode Diskusi tidak pernah melebihi hard cap giliran, konsisten dengan Mode Dipandu AI

## 10. Keputusan Final

1. **Vision** — sudah diverifikasi dan diselesaikan (lihat Bagian 7). Qwen3-VL-235B-A22B-Instruct via OpenRouter, aktif otomatis saat ada gambar.
2. **Urutan bangun** — **Mode Screenshot + Mode Mulai dari Nol dulu**, Mode ArroDesign menyusul setelah ArroDesign sendiri jalan. Ini urutan yang paling logis: dua mode pertama berdiri sendiri dan sudah bisa dikerjakan sekarang tanpa menunggu apa pun, sementara Mode ArroDesign secara struktural memang tidak bisa duluan — bukan pilihan gaya, tapi konsekuensi dari dependensi yang sudah dijelaskan di Bagian 8.

**Dokumen ini final, siap eksekusi ke kode.**
