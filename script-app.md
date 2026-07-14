# ArroBuild — Script App v1

**Status:** Draft untuk approval
**Basis:** `docs/03-DESIGN-SYSTEM.md` v3.1 (§9 App UI, §12 layout shell)
**Cakupan:** Login/Signup, Dashboard, Generate Flow (5 step + hasil), Workspace/IDE, Mode Dipandu AI

**Prinsip shell per kelompok halaman:**
```
Auth          → centered card, tanpa sidebar/nav, minimal chrome
Dashboard     → sidebar kiri persisten (240px) + konten fluid max-width 1360px
Generate Flow → stepper horizontal atas, konten max-width 720px (1 kolom)
                atau 1100px (2 kolom form+preview), TIDAK sama semua step
Workspace/IDE → full-bleed 3 panel, tanpa max-width
```

---

## 1. Login / Signup

**Background:** `--bg-base`, grid blueprint sangat halus (2-3% opacity, lebih halus dari section Knowledge Model) sebagai satu-satunya tekstur — auth page harus terasa tenang, bukan ramai.

**Layout:** Card center, max-width 400px, vertical center di viewport.

**Elemen:**
1. Logo (Node Cluster + wordmark) di atas card, bukan di dalam card — beri jarak visual dari form
2. Card (Blueprint Panel, sudut kiri-atas terpotong, border default — bukan amber, auth bukan momen "keputusan")
3. H1 dalam card: "Masuk ke ArroBuild" / "Buat akun baru"
4. Toggle kecil di bawah H1: "Belum punya akun? Daftar" / "Sudah punya akun? Masuk" — link sky, bukan button
5. Form: email, password — input style standar (`docs/03-DESIGN-SYSTEM.md` lama, tetap valid), label di atas field (bukan placeholder-only, supaya field yang sudah keisi tetap jelas labelnya)
6. Tombol primary amber full-width "Masuk" / "Buat akun"
7. Divider "atau" + tombol outline dengan logo Google asli (Simple Icons) "Lanjut dengan Google"
8. Untuk signup: baris kecil di bawah tombol, mono 12px, tertiary: "Dengan daftar, kamu setuju Syarat & Ketentuan dan Kebijakan Privasi" — link amber di dalamnya

**Copy:**
> Masuk ke ArroBuild
> Lanjut generate atau lihat project yang udah kamu compile.

**Framer Motion:** card fade+rise 300ms saat load. Input focus: border amber + shadow ring (sudah ada di sistem lama, dipertahankan). Toggle login/signup: crossfade konten form 150ms, tanpa reload halaman.

**Kesalahan yang harus dihindari:** jangan taruh branding/copy marketing panjang di halaman ini — auth page cuma punya satu tugas, selesaikan itu cepat.

---

## 2. Dashboard — Overview

**Background:** `--bg-base` untuk sidebar, `--bg-surface` untuk area konten utama (kontras halus antara nav dan konten, bukan satu warna rata seperti sekarang).

**Layout:** Sidebar 240px fixed kiri, konten fluid max-width 1360px dengan padding 32px.

**Elemen Sidebar:**
1. Logo di atas
2. Menu: Overview, Generate baru, Mini Tools, Learn Hub, Dukungan, Upgrade paket — pakai pola Sidebar Nav Item (`docs/03-DESIGN-SYSTEM.md` 14.1)
3. **Hapus widget kuota mini di bawah sidebar** — ini duplikat dari panel "Kuota generate" yang sudah ada di konten utama, sumber kebingungan. Info kuota cukup ada di SATU tempat.
4. Profil user di paling bawah sidebar — pastikan cuma ada satu instance (screenshot menunjukkan ada elemen avatar kedua yang terlihat seperti sisa dev/testing, harus dibersihkan sebelum production)

**Elemen Konten:**
1. H1 "Overview" + subtext "Selamat datang, {nama}" — font naik ke H1 app spec (26-28px, dari yang terlihat lebih kecil di screenshot)
2. 3 Stat Card (pola 14.2): Project Selesai, Total Riwayat, Kredit Tersisa — angka besar 32-36px Unbounded, label kecil 12px di atas
3. Panel "Kuota generate" — progress bar kuota project bulan ini + kuota harian, **satu-satunya tempat kuota ditampilkan**
4. Banner WA founder — dipertahankan, tapi ganti ikon WA jadi Simple Icons WhatsApp asli (bukan lingkaran hijau generik)
5. Panel "Project kamu" — search bar + filter pill (Semua/Selesai/Gagal/Proses), lalu list project

**Project Row (rombak dari card padat sekarang):**
```
Baris 1: badge tipe produk (warna sesuai product type) + badge fase + status pill kanan
Baris 2: judul project — Unbounded 16px (naik dari mono kecil sekarang, judul project
         layak jadi elemen paling menonjol di baris ini)
Baris 3: metadata (target user, framework) — mono 13px, --text-secondary opacity 0.7
Baris 4: footer row — jumlah file · tanggal · framework kiri, tombol aksi kanan
Tombol aksi: "Buka" (amber solid) + "Download" (outline) + ikon edit/hapus (ghost,
  hover baru muncul warna merah untuk hapus — default tidak merah supaya tidak
  terasa mengancam)
```

**Framer Motion:** stat card count-up saat load (9.5 di docs/03-DESIGN-SYSTEM.md). Project row hover = background penuh baris (14.6). Filter pill switch = underline slide pakai layoutId (pola sama seperti tab Ekosistem di landing).

---

## 3. Generate Flow — Step 1: Tipe Produk

**Layout:** max-width 720px, center. Stepper horizontal di atas (14.3).

**Elemen:**
1. Stepper: Tipe → Cerita → Stack → Dokumen, dengan progress draft badge sky di kanan (bukan lagi warna amber seperti "Draft tersimpan 25%" sekarang — status info bukan CTA)
2. H1: "Kamu lagi build apa?"
3. Subtext: "Pilihan ini nentuin pertanyaan di step berikutnya."
4. Tip callout: dipertahankan, tapi restyle sebagai baris tipis dengan ikon `Lightbulb` amber kecil, bukan box penuh — kurangi berat visual di atas grid pilihan utama
5. Grid 3×3 tipe produk — **ganti semua ikon jadi Lucide sesuai pemetaan `docs/03-DESIGN-SYSTEM.md` 15**, bukan bentuk geometris abstrak. Card hover = border sky + icon scale 1.05 (bukan cuma warna berubah)
6. Card terpilih: border amber 1.5px + background tint amber 4%

**Framer Motion:** grid card stagger masuk 40ms/card. Card hover per 14.5 (pola chip, disesuaikan ukuran card).

**Responsive:** grid 3×3 → 2×5 (tablet) → 1 kolom (mobile), card jadi row horizontal (icon kiri, teks kanan) di mobile supaya tidak makan scroll panjang.

---

## 4. Generate Flow — Step 2: Cerita/Konteks

**Layout:** 2 kolom, total max-width 1100px (form 640px + preview 420px) — **lebih lebar dari kondisi sekarang**, form butuh napas karena isinya banyak field.

**Elemen kiri (form):**
1. H1: "Ceritakan proyekmu"
2. Subtext: dipertahankan konsepnya, "Klik chip untuk jawaban cepat" tetap relevan
3. Tiap pertanyaan: label (JetBrains Mono 700, 14px — naik dari yang terlihat kecil), chip pilihan cepat (14.5), lalu input/textarea, lalu tip contoh di bawahnya
4. **Tip contoh:** pisahkan "pakai ini" jadi tombol kecil terpisah (bukan link inline di tengah kalimat italic) — ini yang bikin tip terasa cluttered sekarang. Format baru: teks italic tenang + tombol ghost kecil "Pakai contoh ini" di baris terpisah

**Elemen kanan (live preview):**
1. Terminal panel (Blueprint Panel) "KNOWLEDGE_MODEL.JSON"
2. **Rombak isi:** jangan tampilkan JSON kosong/skeleton di awal — ganti jadi checklist progresif: "○ Target user — belum diisi / ● Masalah utama — terisi / ○ Fitur — belum diisi", berubah dari lingkaran kosong ke centang amber begitu field terisi. JSON mentah tetap bisa dilihat via toggle "Lihat JSON" kalau user power-user mau — tapi default-nya checklist yang lebih manusiawi

**Framer Motion:** checklist item transisi lingkaran→centang dengan scale-bounce kecil (spring) saat field terisi — feedback yang terasa hidup. Chip klik = scale 0.96 sesaat (tap feedback).

**Responsive:** 2 kolom jadi 1 kolom, preview panel pindah ke atas sebagai collapsible (default collapsed di mobile, supaya form utama yang diprioritaskan).

---

## 5. Generate Flow — Step 3: Stack

**Layout:** 2 kolom, max-width 1100px (preset grid 680px + summary panel 380px sticky).

**Elemen kiri:**
1. H1: "Tech stack & preferences"
2. Grid preset stack — **ganti ikon emoji jadi mini logo asli** (Simple Icons, 3-4 logo tech utama tiap preset, bertumpuk kecil di pojok card sesuai `docs/03-DESIGN-SYSTEM.md` 15)
3. Card terpilih: border amber + badge check amber di pojok (dipertahankan polanya, cuma ikonnya diganti)
4. "Rakit Sendiri" — expand jadi form manual per kategori (framework/database/animasi/dll), collapsible

**Elemen kanan (sticky):**
1. Panel "Stack Kamu" — key-value list tiap pilihan, **tambahkan logo kecil di depan tiap value** (mis. logo Next.js kecil di samping teks "Next.js") — bukan cuma teks polos
2. CTA "Lanjut ke Dokumen →" tetap di bawah, tapi jadi sticky mengikuti scroll (supaya tidak perlu scroll ke bawah untuk lanjut kalau grid preset panjang)

**Framer Motion:** ganti preset = seluruh panel kanan crossfade update (150ms), bukan langsung snap ganti teks.

**Responsive:** panel kanan pindah ke bawah (tidak sticky) di mobile, grid preset 2 kolom → 1 kolom.

---

## 6. Generate Flow — Step 4: Dokumen & Model

**Ini step paling butuh rombak arsitektur, bukan cuma visual.** Kepadatan saat ini (smart preset + checklist dokumen + picker kelas model per dokumen, semua kelihatan sekaligus) melebihi kapasitas scan wajar.

**Solusi — progressive disclosure dua mode:**

**Mode default ("Simple"):**
- Tampilkan cuma: 4 smart preset pill (Quick Start/Full Foundation/Production Ready/Complete Suite) + checklist dokumen inti/lanjutan dengan kelas model **tersembunyi** (pakai default otomatis sesuai tier, ditampilkan sebagai badge kecil read-only di samping tiap dokumen, bukan picker interaktif)
- Estimasi kredit total tetap tampil besar di kanan
- Toggle di pojok kanan atas: "⚙ Atur model per dokumen" — switch ke mode Advanced

**Mode "Advanced" (toggle aktif):**
- Baru muncul picker kelas model per dokumen seperti sekarang (Hemat/Menengah/Flagship/Ultra dengan kredit masing-masing)
- Ini yang dipakai power-user yang mau kontrol detail — tapi bukan lagi default yang dipaksa dilihat semua orang

**Elemen (kedua mode):**
1. H1: "Pilih dokumen & kelas model AI"
2. Ikon dokumen — ganti emoji jadi Lucide sesuai `docs/03-DESIGN-SYSTEM.md` 15
3. Ikon kelas model — ganti jadi Zap/Gauge/Rocket/Crown sesuai `docs/03-DESIGN-SYSTEM.md` 15
4. Estimasi kredit — font naik ke ukuran "Label data" (28-36px) untuk angka total, bukan sama kecilnya dengan kredit per-dokumen

**Framer Motion:** toggle Simple↔Advanced = height animate + fade konten baru (`AnimatePresence`, seperti FAQ di landing). Checkbox dokumen dicentang = kredit total di panel kanan animate count naik/turun (9.5).

**Responsive:** mode Advanced di mobile — picker kelas model jadi dropdown/select alih-alih 4 pill sejajar (tidak cukup lebar untuk 4 pill nyaman disentuh).

---

## 7. Generate Flow — Step 5: Review & Generate

**Layout:** max-width 720px, center. Stepper diganti breadcrumb minimal ("← ArroBuild ... Review pilihan ... Draft tersimpan").

**Elemen:**
1. H1: "Sudah semuanya?"
2. Card per kategori (Tipe & Fase / Mini Brief / Stack & Style / Dokumen & Model) — dipertahankan strukturnya, sudah cukup baik
3. **Perkuat hierarki "Biaya batch ini"** — ini momen commit finansial, harus jadi elemen paling menonjol di halaman: pindahkan ke card terpisah paling bawah dengan background tint amber halus, angka besar (36px), bukan baris teks biasa di antara list dokumen
4. Tombol "Generate" — full-width, amber, di bawah card biaya, dengan sub-teks kecil "Kredit langsung terpotong saat generate dimulai"

**Framer Motion:** klik card kategori manapun = scroll-to + highlight border sky sesaat (0.5s lalu fade) sebelum navigasi ke step terkait untuk edit — feedback "kamu memang diarahkan ke sini" (Sesuai copy "Klik bagian manapun untuk edit" yang sudah ada, tapi sekarang beri feedback visual yang menegaskannya).

---

## 8. Generate Flow — Hasil (Docs Siap)

**Layout:** max-width 900px (lebih lebar dari step form karena ada konten preview dokumen).

**Elemen:**
1. Card sukses — badge "Docs siap!" amber, H1 "N dokumen berhasil digenerate", 3 tombol (Buka di workspace/Download ZIP/Generate lagi)
2. Quick start numbered list — dipertahankan, tapi angka lingkaran pakai warna sky bukan lime lama
3. Tab switcher dokumen (14.4) + preview konten — dipertahankan strukturnya, sudah fungsional baik

**Framer Motion:** card sukses masuk dengan confetti-lite — bukan literal confetti (terlalu ramai untuk brand teknikal ini), tapi checkmark besar dengan scale-spring saat card muncul, cukup untuk terasa "perayaan kecil" tanpa berlebihan.

---

## 9. Workspace / IDE

**Layout:** full-bleed 3 panel: File list (240px) | Editor (fluid, min 480px) | Panel Revisi AI (360px).

**Elemen:**
1. Top bar: back button, badge tipe produk, judul project (Unbounded, bukan mono — judul project layak lebih tegas), WA Founder badge, tombol Unduh ZIP
2. Panel kiri (File list): pakai pola 14.6, file aktif dapat border-left amber
3. Panel tengah (Editor): **naikkan line-height dan lebar margin internal** — konten sekarang terlalu mepet ke tepi panel. Tambahkan max-width internal ~640px di dalam panel supaya baris teks tidak terlalu panjang meski panel-nya lebar (masalah keterbacaan mono font yang sama seperti di landing page, berlaku juga di sini)
4. Panel kanan (Revisi AI): section picker (14.6 juga), chip saran instruksi (14.5), estimasi kredit (14.8), tombol "Preview revisi"

**Framer Motion:** ganti file aktif = editor content crossfade 150ms. Chip saran instruksi hover/klik = pola 14.5. Estimasi kredit berubah saat instruksi diketik = subtle pulse pada angka (bukan animasi besar, cukup untuk menandai "ini update live").

**Responsive:** di layar <1280px, panel Revisi AI jadi overlay/drawer yang muncul dari kanan (bukan dipaksa 3 kolom sempit) — 3 panel penuh cuma masuk akal di layar lebar.

---

## 10. Mode Dipandu AI

**Masalah utama saat ini:** ruang kosong besar, terasa belum jadi. Perlu diisi dengan elemen yang punya fungsi, bukan dekorasi kosong.

**Elemen:**
1. Header: label "MODE DIPANDU AI · 0/8" jadi progress dot (●○○○○○○○), bukan cuma teks fraksi — representasi visual sisa giliran lebih jelas
2. Chat area: chat bubble style (14.7) — AI kiri, user kanan
3. **Isi ruang kosong:** di bawah pesan pertama AI, tampilkan 3-4 chip contoh jawaban singkat (mis. "SaaS buat freelancer", "Marketplace lokal", "Tools internal tim") sebagai starting point — mengurangi "blank page anxiety" yang sama seperti yang sudah diselesaikan di form Mode Cepat, harusnya konsisten di Mode Dipandu juga
4. Input row: field + tombol Kirim (amber), "Isi manual" tetap sebagai link keluar ke Mode Cepat

**Framer Motion:** pesan AI baru muncul dengan typing indicator dulu (14.7) selama ~600-900ms sebelum teks muncul — memberi kesan "AI benar-benar memproses", bukan instan yang terasa robotik. Progress dot terisi dengan scale-bounce tiap giliran selesai.

**Responsive:** chat area max-width 640px tetap di semua breakpoint (mono font butuh kolom terbatas di sini juga), cuma padding luar yang menyempit.

---

## Catatan Implementasi

1. **Emoji → Lucide/Simple Icons** adalah perubahan dengan dampak visual terbesar untuk usaha paling kecil — prioritaskan ini duluan sebelum yang lain kalau perlu urutan kerja.
2. **Step 4 (Dokumen & Model)** butuh keputusan produk, bukan cuma desain: apakah mode Simple/Advanced ini oke, atau ada pendekatan lain yang kamu lebih suka untuk mengurangi kepadatannya?
3. Elemen duplikat di Dashboard (widget kuota mini + avatar kedua di sidebar) kemungkinan sisa development — perlu dicek langsung di kode, bukan cuma di-skip di desain.
