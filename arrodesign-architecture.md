# ArroDesign — Arsitektur & Planning

**Status:** Draft untuk approval — target Fase 2 (MVP single-input)
**Basis:** `design-studio.md` (metodologi tervalidasi manual, 2 studi kasus)
**Bagian dari:** Mini Tools, akses Core+ (lihat Bagian 4)

---

## 1. Apa itu ArroDesign

ArroDesign mengubah referensi visual — screenshot atau URL situs yang desainnya kamu suka — jadi dua hal siap pakai: **`design.md` terstruktur** (token warna, tipografi, breakdown per section) dan **prompt siap tempel ke Google Stitch**. Stitch yang mengerjakan bagian generate visualnya; ArroDesign fokus di bagian analisis dan penyusunan instruksi.

**Dua cara mulai:**
- **Mode Proyek** — pakai data yang sudah ada dari proyek yang sebelumnya kamu generate lewat ArroBuild (PRD, konteks produk)
- **Mode Ide Baru** — mulai dari nol, cukup upload gambar atau tempel URL

**Yang membedakan ArroDesign dari tool "screenshot to code" biasa:** setiap klaim di hasil analisisnya ditandai jelas — mana yang **benar-benar diambil dari data** (warna asli dari gambar, konten asli dari situs) dan mana yang **cuma dugaan terarah** (misal, menebak font berdasarkan gaya industri sejenis). Ini bukan cuma detail teknis — ini yang bikin user tahu persis bagian mana yang perlu mereka cek ulang sebelum dipakai.

---

## 2. Koreksi Penting — Soal Biaya

> [!CAUTION]
> Rencana lama menaruh tool sejenis ini di kelas kredit termurah (Hemat) dengan asumsi "cuma reformatting teks". Itu **tidak berlaku lagi** untuk versi yang sudah tervalidasi ini.

ArroDesign versi ini melakukan: analisis vision (untuk gambar) atau fetch+cross-reference eksternal (untuk URL), lalu analisis berlapis (cerita/konsep, bahasa desain, breakdown per section). Ini kerja kelas **Flagship**, setara dengan generate satu PRD lengkap — bukan kerja ringan.

**Estimasi awal:** ~150-250 kredit per analisis lengkap, tergantung jumlah section yang dianalisis dan apakah inputnya gambar (lebih murah, langsung vision) atau URL (lebih mahal, butuh fetch + search tambahan). **Ini estimasi awal yang perlu dikalibrasi dari testing nyata** — bukan angka final, sama seperti buffer biaya di dokumen monetisasi.

---

## 3. Yang Perlu Disiapkan

### 3.1 Teknis
| Item | Detail |
|---|---|
| Model vision-capable | **Sudah terverifikasi** — GLM-5.2 dan Qwen3.7-Max (kelas Flagship di stack sekarang) ternyata text-only, sempat diasumsikan salah. Dipakai: **Qwen3-VL-235B-A22B-Instruct via OpenRouter** (infrastruktur sama, tidak perlu integrasi baru), aktif otomatis untuk jalur upload gambar, tetap ditagih tarif Flagship |
| Kapabilitas web search | **Sudah diputuskan: Tavily.** Free tier 1.000 kredit/bulan (terus-menerus, bukan sekali habis) — di volume pemakaian first launch (~20-100 pencarian/bulan), ini nyaris pasti Rp0 biaya tambahan. Satu integrasi sudah termasuk pencarian + ekstraksi konten sekaligus, tidak perlu bangun fetch/parsing terpisah. Kalau nanti volume naik jauh melebihi 1.000 kredit/bulan, pertimbangkan pindah ke Serper (lebih murah per unit tapi butuh fetch/parsing sendiri) — itu optimasi untuk skala besar, bukan kebutuhan sekarang |
| Web fetch untuk struktur HTML | Perlu fetcher terpisah (bisa reuse pattern yang sudah ada di stack kamu) untuk ambil konten mentah situs |

### 3.2 Data
| Item | Detail |
|---|---|
| Tabel baru | `DesignAnalysis` — simpan tipe input (gambar/URL), sumber, hasil `design.md`, tag confidence, kredit terpakai, `projectId` (nullable, terisi kalau Mode Proyek) |
| Riwayat | User bisa lihat analisis sebelumnya, bukan sekali pakai lalu hilang |

### 3.3 Legal/Etika
| Item | Detail |
|---|---|
| Framing wajib | Sistem prompt internal + copy UI harus eksplisit: hasil ini **"terinspirasi dari"**, bukan **"identik dengan"** — sama seperti prinsip yang sudah kamu tetapkan untuk Design Reference Scraper. Ini bukan cuma dicatat di dokumentasi, harus benar-benar muncul sebagai disclaimer di UI output |
| Batas cross-reference | Web search cuma untuk konteks (nama studio, brief resmi kalau memang dipublikasikan terbuka) — bukan untuk menyalin aset/konten berhak cipta |

### 3.4 Prompt Engineering (kerja konten, bukan cuma kerja teknis)
Ini bagian yang paling sering diremehkan waktu estimasi timeline: pola **"Zoom-Out-Zoom-In"** + strict constraint list + refinement kit yang sudah terbukti manual di `design-studio.md` perlu dijadikan template prompt yang reusable dan diuji ulang — bukan cuma "port" satu kali dari hasil chat manual ke kode. Ini butuh sesi kerja terpisah, bukan bagian dari setup teknis biasa.

---

## 4. Skema Akses & Kredit

| Tier | Akses ArroDesign |
|---|---|
| **Base** | ❌ tidak termasuk — kelasnya (Flagship) di luar jangkauan kelas model Base (Hemat saja) |
| **Core** | ✅ salah satu dari 3 mini tools pilihan |
| **Prime** | ✅ termasuk otomatis (semua tools) |

**Kredit dipotong dari pool bulanan yang sama** seperti dokumen — bukan skema pembayaran terpisah, konsisten dengan seluruh sistem mini tools yang sudah ada.

> [!TIP]
> Karena biayanya setara Flagship, pertimbangkan **tidak** memasukkan ArroDesign ke trial gratis 3× di tier Base — itu akan membuka kerja kelas mahal ke tier yang basisnya cuma kelas Hemat, merusak unit economics yang sudah dihitung hati-hati di dokumen monetisasi.

---

## 5. Arsitektur (Ringkas dari `design-studio.md`)

```
Input (gambar / URL)
   │
   ▼
Context Gathering — vision langsung (gambar) ATAU fetch+search (URL)
   │
   ▼
Analysis Engine — cerita/konsep → bahasa desain → breakdown per section
   │              (dengan confidence tagging otomatis di tiap klaim)
   ▼
Output Generator — design.md terstruktur + prompt Stitch (Zoom-Out-Zoom-In
   │                + strict constraints + refinement kit)
   ▼
Export — download design.md, copy prompt, (nanti) bundling ke dokumen lain
```

Detail komponen lengkap sudah ada di `design-studio.md` Bagian 4.2 — tidak diulang di sini, tetap jadi rujukan teknis utama.

---

## 6. Rencana Bertahap — Fase 2 (MVP)

Scope MVP: **1 gambar ATAU 1 URL → 1 `design.md` + 1 prompt Stitch**, end-to-end, stabil.

| Tahap kerja | Isi |
|---|---|
| 1. Input Handler | Terima gambar (upload) atau URL, validasi format, branching ke 2 pipeline berbeda |
| 2. Context Gathering | Jalur gambar: vision call langsung. Jalur URL: fetch HTML + (kalau search API sudah siap) cross-reference eksternal |
| 3. Analysis Engine | Prompt role-play "UI/UX Designer + Frontend Professional", 3 layer analisis + confidence tagging, kelas model Flagship |
| 4. Output Generator | Template `design.md` konsisten (struktur sama tiap run — token warna/tipografi/spacing, layout, component library, section breakdown, responsive notes, content checklist) |
| 5. Prompt Generator | Formatter khusus Stitch (satu-satunya target di Fase 2 — multi-target lain ditunda ke fase berikutnya) |
| 6. UI Output | Preview `design.md`, toggle tampilkan/sembunyikan tag `[INFERRED]`, tombol copy prompt, disclaimer "terinspirasi dari" yang selalu terlihat |
| 7. Progress UX | Status streaming "Analysis Engine sedang membaca referensi..." selama proses jalan — jangan biarkan user menatap layar kosong menunggu, ini poin yang sudah diidentifikasi sendiri di `design-studio.md` |

**Yang sengaja ditunda dari Fase 2** (sesuai roadmap `design-studio.md` sendiri): multi-target prompt (v0/Lovable/Bolt), fidelity feedback loop, bundling penuh ke context.md/plan.md/agent.md. Fase 2 fokus satu pipeline yang benar-benar solid dulu.

---

## 7. Kriteria Sukses & Testing

Karena metodologinya sudah tervalidasi manual (~80% fidelity, 2 studi kasus), jangan biarkan hasil itu jadi validasi satu kali lalu terlupakan — jadikan **benchmark tetap**:

- Simpan 2-3 situs referensi (termasuk yang sudah dipakai manual) sebagai test case tetap
- Tiap kali prompt template diubah/ditingkatkan, jalankan ulang ke benchmark yang sama, bandingkan hasilnya — supaya tahu perubahan itu benar-benar membaik, bukan cuma terasa membaik
- Target awal MVP: mempertahankan kualitas ~80% fidelity yang sudah dicapai manual, bukan cuma "berhasil jalan tanpa error"

---

## 8. Pertanyaan Terbuka

1. **Nama final** — "ArroDesign" dipakai konsisten di dokumen ini, tapi kalau di kode masih ada sisa route lama (`/tools/stitch-composer`), itu perlu diselaraskan sebelum launch supaya tidak ada dua identitas untuk satu tool.
2. Setuju dengan estimasi 150-250 kredit per analisis sebagai starting point, atau ada preferensi angka lain sebelum masuk testing nyata?
