# Stack Advisor — PRD & Plan

**Status:** Siap eksekusi
**Tier:** Core (salah satu dari 3 tools pilihan), otomatis tersedia di Prime
**Beda dari Step 3 Generate Flow:** Step 3 dipakai kalau kamu sudah yakin mau bangun apa, tinggal pilih rakitan teknis. Stack Advisor dipakai kalau kamu **belum yakin** — masih tahap "curhat dulu", bisa diakses bahkan sebelum masuk form Generate sama sekali.

---

## 1. Masalah

User (terutama yang baru mulai atau pindah stack) sering bingung bukan cuma soal framework, tapi seluruh ekosistem: provider AI yang mana, hosting/VPS yang mana, dengan biaya yang masuk akal buat kondisi mereka. Rekomendasi generik dari AI (tanpa basis data nyata) berisiko ngasih saran yang terdengar bagus tapi ketinggalan zaman atau tidak sesuai budget riil.

## 2. Solusi

User "curhat" soal proyeknya, Stack Advisor kasih 2-3 paket rekomendasi lengkap (bukan cuma framework — termasuk provider AI, database, hosting, estimasi biaya bulanan), **ditarik dari basis pengetahuan yang dikurasi manual**, bukan dikarang bebas oleh AI dari ingatan training-nya sendiri. Ini yang bikin rekomendasinya bisa dipercaya dan tetap update.

## 3. Prinsip Desain — AI sebagai "Penyortir", Bukan "Pengarang Bebas"

Sesuai maksud awalmu: **AI tidak boleh mengarang rekomendasi dari kepalanya sendiri.** Tugasnya cuma menyortir dan memilihkan dari basis pengetahuan yang sudah kita siapkan (mirip pola retrieval — AI baca opsi yang tersedia, lalu cocokkan ke kebutuhan user). Ini mencegah rekomendasi yang kedengarannya meyakinkan tapi sebenarnya basi atau tidak akurat.

## 4. Dua Mode Input

| Mode | Bentuk | Kapan dipakai |
|---|---|---|
| **Mode Cepat** | Form terstruktur — mirip Step 1-2 Generate Flow: tipe produk, target user, prioritas (kecepatan/biaya/skalabilitas) | User yang sudah bisa jelasin kebutuhan singkat |
| **Mode Diskusi** | Chat santai, dibatasi giliran, context-capped — reuse pola Mode Dipandu AI/Mode Diskusi Copy Studio | User yang masih bingung dan butuh "digali" dulu |

**Titik keputusan:** kalau curhatan user terlalu vague untuk kasih rekomendasi solid (baik dari Mode Cepat yang field-nya kosong-kosong, atau Mode Diskusi yang jawabannya singkat terus), sistem **tanya balik** — bukan tetap kasih rekomendasi generik asal jalan. Pola sama seperti Mode Dipandu AI yang berhenti nanya kalau sudah 8 giliran tapi field minimal belum terisi.

## 5. Basis Pengetahuan (Knowledge Base)

- Disusun **manual dulu untuk MVP** — bukan live web search. Ini keputusan sadar demi biaya predictable (live search = kelas Menengah minimum tiap query, bisa mahal kalau dipakai sering)
- Isi: kombinasi framework + database + provider AI + hosting/VPS, dikurasi per tipe produk (mirip "Rakitan Siap Pakai" di Step 3, tapi lebih luas cakupannya — termasuk biaya dan alasan pemilihan)
- **Perlu proses update berkala** (bukan sekali disusun lalu dilupakan) — ini kebutuhan operasional, bukan cuma teknis, dan perlu kamu putuskan siapa yang pegang & seberapa sering (lihat Bagian 9)

## 6. Alur Pengguna

```
1. Pilih mode (Cepat / Diskusi)
2. [Cepat: isi form] [Diskusi: chat, sistem tanya balik kalau terlalu vague]
3. Sistem menyortir dari knowledge base → tampilkan 2-3 paket rekomendasi
   dengan alasan tiap pilihan ("Dipilih karena: biaya rendah, cocok untuk
   MVP tahap awal")
4. Preview paket → tombol "Kirim ke Generate Flow" (preset Step 3 otomatis
   terisi) ATAU "Coba lagi dengan prioritas beda"
   → PENTING: preview ini WAJIB tampil dulu sebelum preset benar-benar
     di-apply ke Step 3 — user approve dulu, tidak langsung pindah halaman
     otomatis begitu rekomendasi keluar
```

## 7. Skema Kredit

| Mode | Kelas | Kredit |
|---|---|---|
| Mode Cepat | Menengah | **~8** |
| Mode Diskusi | Mirip Mode Dipandu AI (context capped) | **~6-12** |

## 8. Arsitektur Teknis

- Reuse `/api/tools/run`
- Knowledge base: data terstruktur (bukan AI-generated on the fly), disimpan sebagai config/tabel — AI cuma baca dan menyortir dari sini
- Prompt AI dibatasi eksplisit: "pilih HANYA dari daftar opsi berikut, jangan merekomendasikan di luar daftar" — constraint ini yang menjaga prinsip Bagian 3
- Reuse pola context-capping Mode Dipandu AI untuk Mode Diskusi
- Integrasi ke Step 3 Generate Flow: kirim data preset lewat state/query param yang sama seperti draft system yang sudah ada — bukan mekanisme baru

## 9. Kriteria Sukses

- Tiap rekomendasi yang keluar bisa ditelusuri balik ke entry spesifik di knowledge base (bukan hasil karangan AI) — ini yang paling penting divalidasi sebelum ship
- User dengan curhatan sangat vague benar-benar dapat pertanyaan balik, bukan rekomendasi generik dipaksakan

## 10. Keputusan Final

1. **Knowledge base** — MVP disusun dulu dari riset internal (lihat `src/lib/config/stack-advisor-kb.ts`, versi bertanggal). Kamu review dan lanjutkan nanti. **Update periodik: tiap 2 minggu–1 bulan.**
2. **Handoff Generate** — **preview dulu, baru approve** ke Step 3 (via `arrobuild_fork_presets` + `arrobuild_fork_step=stack`). Tidak auto-apply.
