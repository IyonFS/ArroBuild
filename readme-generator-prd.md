# README Generator — PRD & Plan

**Status:** Siap eksekusi — v2, sudah menutup celah dari review pertama
**Menggantikan/mengevolusi:** "README + Setup Script" (scaffold lama, Prime, 6 kredit)
**Tier baru:** Core (salah satu dari 3 tools pilihan), otomatis tersedia di Prime

---

## 1. Masalah

README yang di-generate AI asal-asalan itu masalah yang sudah kamu identifikasi sendiri: hasilnya acak, terstruktur tapi user tidak paham kenapa strukturnya begitu, dan tidak ada pilihan gaya. Developer solo sering skip bikin README yang layak, padahal README yang bagus langsung mempengaruhi kredibilitas proyek.

## 2. Solusi

Generate README **dengan user memilih gaya dulu** lewat galeri preview visual, data diambil dari sumber paling sedikit usaha, dan — prinsip baru yang jadi inti dokumen ini — **tidak ada satu pun keputusan yang diambil diam-diam atas nama user.**

## 3. Prinsip Desain — Semua Keputusan Eksplisit ke User

Ini prinsip yang berlaku di seluruh alur tool ini, bukan cuma di satu titik: begitu sistem harus menebak atau memilihkan sesuatu untuk user (gaya referensi, data yang terdeteksi, dst), **berhenti dan tanya lewat popup** — jangan asumsikan diam-diam. Ini yang membedakan tool yang terasa "berkualitas" dari yang terasa "asal jalan sendiri".

## 4. Tiga Mode Input

| Mode | Sumber data | Kapan dipakai |
|---|---|---|
| **Mode Proyek** | Reuse `architecture.md` + `prd.md` dari project ArroBuild yang sudah ada | User yang proyeknya dibuat lewat ArroBuild |
| **Mode Repo** | Tempel URL GitHub repo publik → fetch `package.json`, bahasa utama, struktur folder, README lama (kalau ada) | User dengan repo publik di luar ArroBuild |
| **Mode Manual** | Form singkat: nama proyek, deskripsi, tech stack, fitur utama | Tanpa project ArroBuild dan tanpa repo publik |

## 5. Galeri Template

**Untuk Repository:** Minimal · Dokumentasi Lengkap · Open Source Friendly
**Untuk Profile GitHub:** Personal Card · Portfolio Style

Tiap template ditampilkan sebagai **preview render nyata** dari sample content (bukan cuma nama) — dirender langsung dari markdown contoh saat halaman dibuka, bukan gambar statis yang perlu di-maintain terpisah.

## 6. Alur Pengguna Lengkap (dengan Titik Keputusan)

```
1. Pilih mode input (Proyek / Repo / Manual)

2a. [Mode Proyek]
    Pilih dari daftar project.
    → Kalau user belum punya project sama sekali: state kosong,
      "Kamu belum punya project. Generate project dulu →", Mode Proyek
      dinonaktifkan (bukan ditampilkan kosong tanpa penjelasan)

2b. [Mode Repo]
    Tempel URL.
    → URL format salah:
      POPUP — "URL tidak valid. Format yang benar: github.com/username/repo"
      [Coba lagi]

    → Repo private / tidak ditemukan:
      POPUP — "Repo ini private atau tidak ditemukan. ArroBuild cuma bisa
      baca repo publik."
      [Coba URL lain]  [Pindah ke Mode Manual]

    → Repo ditemukan tapi strukturnya tidak bisa dibaca (repo kosong atau
      `package.json` tidak ada) — pesan beda dari kasus di atas, karena
      repo-nya valid, cuma datanya yang tidak lengkap:
      POPUP — "Repo ditemukan, tapi kami tidak bisa membaca strukturnya
      (repo kosong atau tidak ada package.json). Lengkapi beberapa info
      dasar secara manual, atau pindah ke Mode Manual sepenuhnya."
      [Lengkapi manual]  [Pindah ke Mode Manual]

    → Fetch berhasil:
      Tampilkan data yang terdeteksi (bahasa, framework, tech stack) di layar
      untuk DIKONFIRMASI/DIEDIT user — bukan langsung dipakai diam-diam.
      "Kami deteksi: Next.js, TypeScript, Tailwind — betul? [Edit] [Lanjut]"

    → Kalau repo punya README lama:
      POPUP — "Kami menemukan README lama di repo ini. Mau dipakai sebagai
      referensi gaya, atau generate dari nol sesuai template pilihanmu?"
      [Pakai sebagai referensi]  [Generate dari nol]

2c. [Mode Manual]
    Isi form singkat.

3. Pilih kategori (Repository/Profile) → pilih template dari galeri visual

4. Preview estimasi kredit → klik Generate
   → Tombol "✏️ Ubah pilihan" tersedia di step ini — lompat balik ke pemilihan
     mode/kategori/template manapun yang mau diubah, bukan cuma tombol back
     linear. Pola sama seperti "klik bagian manapun untuk edit" di Review &
     Generate screen alur utama — konsisten, tidak menciptakan interaksi baru
   → Kredit di-reserve saat ini, di-commit setelah generate sukses
     (pola reserve/commit yang sama seperti sistem generate dokumen utama —
     bukan mekanisme baru terpisah)

5. Output: markdown preview + raw + copy + download .md
```

## 7. Skema Kredit

| Mode | Token estimasi | Kelas | Kredit |
|---|---|---|---|
| Mode Proyek | ~1.500 output | Hemat | **2** |
| Mode Repo | ~2.000 output | Hemat | **2** |
| Mode Manual | ~1.500 output | Hemat | **2** |

## 8. Arsitektur Teknis

- Reuse endpoint generik `/api/tools/run` — bukan endpoint baru
- Mode Repo: 1 pemanggilan GitHub API. **Pakai token server-side (bukan anonymous)** — rate limit anonymous cuma 60 request/jam per IP, gampang habis kalau tool ini rame; dengan token naik ke 5.000/jam
- Generation failure/timeout: reuse retry-handler + fallback chain yang sudah ada di sistem utama (jangan bikin mekanisme retry terpisah khusus tool ini)
- Template preview: live-render dari sample markdown, bukan gambar statis
- Tidak butuh tabel database baru — reuse pola generic mini-tools history

## 9. Kriteria Sukses

- Selesai dari pilih mode sampai dapat README dalam <30 detik
- Hasil README Mode Proyek konsisten menyebut fitur yang sama seperti PRD/Architecture project tersebut
- Tidak ada satu pun titik di alur yang mengambil keputusan diam-diam atas nama user (validasi manual checklist sebelum ship: cek tiap titik di Bagian 6)

## 10. Status Kekomprehensifan (Jawaban Jujur)

Semua celah yang sempat terbuka — state kosong Mode Proyek, rate limit GitHub API, timing reserve/commit kredit, metode render preview template, reuse retry-handler, pesan berbeda untuk repo kosong/tidak terbaca, dan tombol Ubah Pilihan — sudah ditutup. **Dokumen ini final, siap eksekusi ke kode.**
