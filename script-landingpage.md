# ArroBuild — Script Landing Page v2

**Status:** Draft untuk approval
**Basis:** `docs/03-DESIGN-SYSTEM.md` v3.1
**Beda dari draf sebelumnya:** urutan dan struktur section dirombak total (bukan cuma reskin warna), tidak ada lagi anotasi `// 0N` di depan tiap section, statistik jadi badge live berbasis data real, copywriting ditulis ulang penuh, paket harga jadi Base/Core/Prime.

**Urutan section (baru, tidak meniru landing page lama):**
```
Hero → Masalah → Knowledge Model (blueprint) → Isi Paket (file listing) → Cara Kerja
→ Ekosistem (tab switcher) → Mini Tools (scroll strip) → Harga → FAQ → CTA Final
```

**Urutan tone latar:** base → surface → blueprint → surface → base → surface → base → base → surface → base

**Catatan struktur:** perhatikan tidak ada section berturut-turut yang pakai kerangka layout sama — grid kartu cuma dipakai 2× di seluruh halaman (Cara Kerja dan Harga), dan keduanya punya alasan fungsional beda (proses vs perbandingan), bukan default yang dipakai asal.

---

## 1. Hero

**Background:** `--bg-base`, vignette radial sangat halus di sudut (tanpa tekstur).

**Layout:** center, max-width 640px.

**Elemen:**
1. Badge status: `● Sistem aktif · Beta` — dot amber pulsing
2. **Live Stats Badge** (lihat `docs/03-DESIGN-SYSTEM.md` 8.4) tepat di bawah badge status, ukuran lebih kecil, warna sky: `1.204 dokumen di-generate · 89 developer aktif` — data real dari `/api/stats/public`, animate count-up sekali saat data resolve
3. H1 (Unbounded 900, dua baris):
   - "Coding tanpa plan itu"
   - "compile tanpa **syntax check.**" (kata terakhir amber)
4. Paragraf: "ArroBuild ubah ide kamu jadi PRD, arsitektur, dan dokumen fondasi lain. Sebelum AI agent sempat ngasal karena nggak punya konteks."
5. CTA: primary amber "▸ Mulai compile" + secondary outline blue "Lihat cara kerja"
6. Terminal panel (Blueprint Panel, sudut kiri-atas terpotong): animasi ketik loop 3 contoh prompt, diikuti daftar file "done ✓", ditutup ringkasan

**Framer Motion:** Hero konten fade+rise sekali saat load (bukan whileInView, karena ini section pertama yang langsung terlihat). Terminal mulai animasi ketik 400ms setelah headline selesai animasi masuk (delay berurutan, bukan barengan).

**Responsive:** mobile — H1 34px, terminal panel full width, CTA row jadi stack vertikal.

---

## 2. Masalah

**Background:** `--bg-surface`.

**Layout:** Dua kolom asimetris (60/40), bukan grid kartu — kiri lebih lebar berisi "log" gaya terminal, kanan pernyataan singkat. Di mobile: log dulu, baru pernyataan.

**Elemen:**
1. **Tidak ada label section di atas** — heading langsung mulai, tanpa meta line
2. H2: "Kamu udah kenal pola ini."
3. Kolom kiri — daftar bergaya log error/warning, font mono, tiap baris beda ikon status:
   ```
   ⚠ scope creep — fitur nambah terus tanpa batas jelas
   ✗ nggak ada source of truth — sesi baru, jelasin ulang dari nol
   ⚠ AI ganti gaya kode tiap sesi, nggak konsisten
   ✗ database & arsitektur nggak dipikir dari awal
   ```
4. Kolom kanan — paragraf singkat: "Proyek jadi susah dikembangkan bahkan sebelum user pertama datang. Bukan karena kamu nggak bisa coding — karena nggak ada yang dibaca AI agent kamu selain memori jangka pendeknya sendiri."

**Framer Motion:** baris log muncul satu-satu (stagger 80ms), tiap baris slide-in dari kiri 8px + fade. Kolom kanan fade biasa, tanpa stagger (beda ritme dari kolom kiri, sengaja).

**Responsive:** dua kolom jadi satu kolom stack, log tetap monospace tapi ukuran turun ke 13px biar tidak overflow.

---

## 3. Knowledge Model

**Background:** `--bg-blueprint` — satu-satunya section dengan grid tekstur di seluruh halaman.

**Layout:** H2 center, diagram full-width max 1000px, tab-switcher kode di bawah.

**Elemen:**
1. H2: "Satu ide. Enam dokumen yang saling tahu satu sama lain."
2. Subtext: "FEAT-ID lahir begitu kamu tulis fitur pertama. Semua dokumen turunan merujuk ID yang sama — nggak ada versi fitur yang saling beda antar file."
3. Legend kecil: dot netral=Base, dot sky=Core, dot amber=Prime
4. Diagram: hub "Knowledge Model / JSON" (border amber) → 6 node dokumen (PRD/Architecture/Plan-Task border netral; Design System/Agent Rules border sky; Adaptive Document border amber). Garis bezier, 2-3 dapat animasi dash-flow.
5. Tag `FEAT-001`, `FEAT-002` menempel di sebagian garis (satu-satunya tempat FEAT-tag dipakai di seluruh halaman)
6. Blueprint Panel tab-switcher di bawah diagram (`prd.md` / `architecture.md` / `design-system.md`), isi potongan output asli

**Framer Motion:** garis diagram pakai `pathLength` animate (9.6 di docs/03-DESIGN-SYSTEM.md), stagger per garis 150ms, trigger sekali saat section masuk viewport. Tab switch pakai crossfade 150ms (AnimatePresence), bukan langsung ganti.

**Responsive:** diagram jadi vertikal (hub di atas, 6 node stack ke bawah) di mobile — bukan di-scale kecil, tapi benar-benar diubah orientasinya supaya tetap terbaca.

---

## 4. Isi Paket — Daftar File

**Background:** `--bg-surface`.

**Layout:** Bukan grid kartu — file listing gaya file-explorer/terminal `ls`, satu kolom, max-width 640px, center.

**Elemen:**
1. H2: "Semua file yang bakal muncul di proyek kamu."
2. List 14 baris, font mono, tiap baris: ikon file + nama file + dot warna tier (netral/sky/amber) + label tier kecil di ujung kanan
   ```
   📄 prd.md                              ● Base
   📄 architecture.md                     ● Base
   📄 plan-task.md                        ● Base
   📄 design-system.md                    ● Core
   📄 agent-rules.md                      ● Core
   📄 adaptive-document.md                ● Prime
   ... (8 file opsional, dikelompokkan terpisah dengan sedikit jarak lebih besar,
        bukan divider bergaris — cukup spacing)
   ```
3. Caption kecil di bawah list: "Base dapat 3 file inti. Core dapat 5. Prime dapat semuanya, termasuk 8 modul opsional."

**Framer Motion:** tiap baris muncul stagger 30ms (cepat, karena banyak item — kalau terlalu lambat terasa lelet), slide dari kiri 4px saja (halus, bukan 16px seperti section lain — variasi jarak animasi juga bagian dari "tidak semua section identik").

**Responsive:** label tier pindah ke bawah nama file (bukan sejajar kanan) di mobile supaya tidak wrap aneh.

---

## 5. Cara Kerja

**Background:** `--bg-base`.

**Layout:** 4 card horizontal terhubung garis putus-putus (satu-satunya penggunaan pola "card row" selain Harga — dipakai di sini karena memang representasi proses berurutan, bukan default template).

**Elemen tiap card:**
- Angka ghost besar di background card (satu-satunya section yang pakai teknik "angka ghost" di seluruh halaman — lihat `docs/03-DESIGN-SYSTEM.md` 7)
- Icon Lucide, judul, deskripsi singkat
- Step: Describe → Configure → Generate → Export

**Copy:**
- 01 Describe — "Ceritakan ide produk kamu. Bisa 1 paragraf, bisa lebih."
- 02 Configure — "Pilih framework, gaya desain, dan AI coding tool target kamu."
- 03 Generate — "Pilih dokumen yang mau dibuat. Progress kelihatan real-time per file."
- 04 Export — "Download .zip. Langsung paste ke root proyek, siap dipakai."

Di bawah grid: baris logo asli (Simple Icons) Cursor/Claude Code/Windsurf dengan teks "Output siap paste, tanpa modifikasi manual."

**Framer Motion:** garis penghubung "menggambar" dari kiri ke kanan (stroke-dashoffset) saat section masuk viewport, 800ms, stagger per segmen 200ms. Card sendiri fade+rise standar (9.1).

**Responsive:** card stack vertikal, garis penghubung jadi vertikal pendek antar card (bukan dihilangkan).

---

## 6. Ekosistem

**Background:** `--bg-surface`.

**Layout:** Tab switcher — satu panel besar, 3 tombol tab di atas (Belajar/Build/Integrate), konten berganti di panel yang sama. **Sengaja bukan 3 kartu sejajar** — ini section yang paling mirip strukturnya dengan "3 pilar" versi lama, jadi treatment-nya paling perlu beda supaya tidak berasa reskin.

**Elemen:**
1. H2: "Satu akun, tiga cara pakai."
2. 3 tombol tab, warna aktif sesuai identitas (Learn=violet, Build=amber, Integrate=sky)
3. Panel konten: judul, deskripsi 2-3 baris, mini-preview visual sederhana (bukan icon generik — misal untuk Build, preview mini terminal; untuk Learn, preview mini path card; untuk Integrate, baris logo tools)
4. CTA kecil di dalam panel: "Lihat learning path →" / "Mulai generate →" / "Lihat integrasi →"

**Framer Motion:** ganti tab = crossfade + slight scale (0.98→1) pada konten panel, 200ms. Tombol tab aktif dapat underline yang "meluncur" (layoutId shared animation Framer Motion) dari posisi tab sebelumnya ke tab baru — bukan langsung pindah.

**Responsive:** tab jadi horizontal scroll kecil di mobile kalau perlu, panel tetap satu kolom penuh.

---

## 7. Mini Tools

**Background:** `--bg-base`.

**Layout:** Horizontal scroll-snap strip, bukan grid — card lebih kecil dan padat, di-scroll/swipe.

**Elemen:**
- H2: "Tools kecil buat kerjaan harian."
- Strip card kompak (180-200px lebar tiap card): nama tool, 1 baris deskripsi, badge "Baru" (amber solid) atau "Segera" (outline tertiary)
- Panah kecil kiri-kanan untuk scroll di desktop (opsional, scroll native tetap jalan tanpa panah)

**Framer Motion:** tidak ada animasi masuk yang rumit — scroll native (`docs/03-DESIGN-SYSTEM.md` 9.7). Card individual dapat hover scale 1.02 halus.

**Responsive:** ini section yang justru "menang" di mobile — scroll-snap horizontal itu pola native mobile, jadi tidak perlu collapse jadi kolom.

---

## 8. Harga

**Background:** `--bg-base` + zona glow amber tipis di belakang card Core.

**Layout:** 3 card (pola kedua dan terakhir yang pakai grid card di seluruh halaman — dipakai di sini karena perbandingan paket memang paling jelas dalam bentuk kartu sejajar).

**Elemen:**
1. H2: "Gratis buat nyoba. Bayar pas siap compile beneran."
2. Subtext: "Daftar gratis, susun plan tanpa potong kredit. Bayar via Midtrans pas generate dokumen."
3. Card **Base** — border netral, tanpa badge
4. Card **Core** — border sky, badge amber solid "Paling direkomendasikan", card scale 1.03
5. Card **Prime** — border amber, badge outline amber "Terlengkap"
6. Harga: angka Unbounded 900, "/bulan" mono kecil
7. Checklist fitur — ikon check warna sesuai identitas card
8. CTA button warna solid sesuai identitas tier

**Copy tombol:** "Mulai Base" / "Upgrade ke Core" / "Upgrade ke Prime"

**Framer Motion:** card Core dapat hover paling hidup — glow membesar sedikit saat di-hover (bukan cuma card-nya). Card lain hover standar (9.3).

**Responsive:** 3 card stack vertikal, Core tetap ditaruh paling atas (bukan di tengah urutan asli) supaya jadi yang pertama dilihat di mobile.

---

## 9. FAQ

**Background:** `--bg-surface`. Section paling tenang — jeda visual sebelum CTA final.

**Elemen:** accordion standar, border-left 2px amber muncul saat item terbuka, chevron rotate 180°.

**Framer Motion:** height animate pakai `AnimatePresence` + `motion.div` auto-height (bukan CSS transition height biasa, supaya konten panjang tidak "kepotong" saat animasi).

**Responsive:** tidak ada perubahan struktural, cuma padding menyempit.

---

## 10. CTA Final + Footer

**Background:** `--bg-base` + zona glow amber halus.

**Elemen:**
1. Blueprint Panel besar center, sudut kiri-atas terpotong, border amber
2. H2: "Project kamu nunggu buat di-compile."
3. Dua tombol: primary "Ke dashboard →", secondary "Generate dokumen →"
4. Footer 4 kolom, logo sosial dan metode pembayaran pakai Simple Icons asli (bukan placeholder teks/ikon generik)
5. Node Cluster mark diulang samar (opacity 4%) di pojok kanan-bawah sebagai watermark penutup — satu-satunya pengulangan logo di luar nav, sengaja dibuat sangat halus

**Framer Motion:** panel CTA fade+rise standar. Tidak ada animasi tambahan di footer — footer sengaja "diam", jadi titik istirahat visual di akhir halaman.

---

## Catatan Implementasi

1. **Endpoint baru dibutuhkan:** `GET /api/stats/public` untuk Live Stats Badge — agregat `COUNT` dari tabel `generated_files` dan `users`. Belum ada di backend saat ini, perlu ditambahkan sebelum badge ini bisa jalan dengan data real.
2. **Rename tier di seluruh sistem:** `Starter→Base`, `Pro→Core`, `Pro Max→Prime` — ini bukan cuma perubahan label UI, tapi juga perlu disinkronkan ke `tiers.ts`, enum Prisma (`SubscriptionTier`), dan semua dokumen bisnis (`arrobuild_pricing_monetisasi_v2.md`, dst) supaya tidak ada tempat yang masih menyebut nama lama.
3. Section statistik/testimoni lama **tidak dipakai lagi** — digantikan Live Stats Badge di Hero. Kalau nanti mau menambah testimoni asli, sarannya jadi elemen terpisah kecil (misal 1 kutipan di dekat CTA final), bukan section penuh dengan star-rating card seperti sebelumnya.
