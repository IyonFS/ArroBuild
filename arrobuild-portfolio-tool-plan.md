# ArroBuild — Portfolio Prompt Generator (Redesign Plan)
**Halaman:** `/tools/portfolio`  
**Status:** Rebuild dari konsep awal  
**Last Updated:** June 2026

---

## Konsep Baru

### Sebelum (yang ada sekarang)
- Form 4 field: Nama, Bio, Skills, Deskripsi Proyek
- Output: file `README.md` untuk GitHub profile
- Generate langsung via AI streaming

### Sesudah (yang dibangun)
- Form multi-step guided: Identitas → Proyek → Desain → Generate
- Output: **prompt siap copy-paste** yang menghasilkan satu file `index.html` lengkap
- User copy prompt → paste ke Claude.ai / AI manapun → dapat website portfolio HTML/CSS/JS
- Setelah dapat kode: panduan deploy ke Netlify Drop step-by-step

### Kenapa pakai prompt, bukan generate langsung?

1. **Gratis tanpa batas** — tidak menghabiskan kuota API ArroBuild
2. **User belajar vibe coding** — mereka berinteraksi langsung dengan AI, bukan blackbox
3. **Bisa diiterate** — setelah dapat kode, user bisa minta revisi ke AI yang sama
4. **Sesuai misi Learn** — ini adalah pintu masuk pertama seseorang mencoba vibe coding

---

## Flow Lengkap

```
[/tools/portfolio]
        │
        ▼
┌──────────────────────────────────────────────┐
│  STEP 1 — Identitas                          │
│  Nama, profesi, tagline, bio, kontak         │
│  + Demo data per profesi (auto-fill)         │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│  STEP 2 — Konten Portofolio                  │
│  Skills/tools, proyek (2–4 proyek),          │
│  layanan yang ditawarkan (opsional)          │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│  STEP 3 — Desain & Visual                    │
│  Tema warna, font, layout, vibe/suasana      │
│  Pilihan preset atau custom HEX              │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│  RESULT — Prompt Siap                        │
│  Prompt lengkap siap copy-paste              │
│  + Tombol buka Claude.ai langsung            │
│  + Panduan 5 langkah deploy ke Netlify Drop  │
└──────────────────────────────────────────────┘
```

---

## Step 1 — Identitas

### Fields

| Field | Type | Required | Placeholder |
|---|---|---|---|
| Nama / Brand | text | ✓ | "Misal: Andi Pratama" |
| Profesi | select + custom | ✓ | — lihat daftar di bawah |
| Tagline | text | ✓ | "Kalimat singkat nilai utamamu, maks 10 kata" |
| Bio singkat | textarea | ✓ | "2–3 kalimat tentang dirimu dan apa yang kamu kerjakan" |
| Kota / Lokasi | text | ✗ | "Jakarta, Indonesia" |
| Email | text | ✗ | "untuk ditampilkan di portfolio" |
| Link sosial | text × 4 | ✗ | GitHub, LinkedIn, Instagram, WhatsApp/Telegram |

### Profesi (dropdown dengan kategori)

**Teknologi:**
Frontend Developer, Backend Developer, Fullstack Developer, Mobile Developer, UI/UX Designer, AI Engineer, Data Scientist, DevOps / Cloud Engineer

**Desain & Kreatif:**
Graphic Designer, Ilustrator, Motion Designer, Fotografer, Video Editor, 3D Artist

**Konten & Marketing:**
Content Writer, Social Media Specialist, Digital Marketer, Copywriter

**Bisnis:**
Product Manager, Project Manager, Business Analyst, Founder / Indie Hacker

**Lainnya:** *(field teks bebas muncul)*

### Demo Data (Auto-fill per Profesi)
Tombol **"Coba data demo →"** dengan dropdown profesi. Saat dipilih, semua field terisi otomatis dengan data contoh yang realistis.

Contoh data demo untuk **Frontend Developer:**
```
Nama: Andi Pratama
Tagline: Frontend dev yang obsesi sama detail UI dan performa web
Bio: Saya seorang frontend developer dengan 2 tahun pengalaman membangun
     web app modern. Fokus di React, Next.js, dan Tailwind CSS.
Kota: Bandung, Indonesia
Skills: React, Next.js, TypeScript, Tailwind CSS, Figma, Git
Proyek 1: Landing page SaaS — Next.js + Framer Motion
```

---

## Step 2 — Konten Portofolio

### 2a — Skills & Tools

Input chip/tag — user ketik skill lalu tekan Enter atau koma untuk tambah.

Contoh: `React` `Next.js` `TypeScript` `Figma` `Git`

Ada tombol **"Tambah dari template"** yang menampilkan daftar skill umum per profesi untuk diklik langsung.

### 2b — Proyek (2–6 proyek)

Tiap proyek punya fields:

| Field | Type | Required |
|---|---|---|
| Nama proyek | text | ✓ |
| Deskripsi singkat | text (1 baris) | ✓ |
| Tech yang dipakai | text | ✗ |
| Link demo / URL | text | ✗ |
| Link GitHub | text | ✗ |
| Tipe | chip: Web App / Mobile / Design / Writing / Other | ✗ |

Tombol **"+ Tambah Proyek"** — default 2 proyek, bisa tambah sampai 6.

> **Catatan untuk user yang belum punya proyek nyata:**  
> Banner kecil: *"Belum punya proyek? Tulis proyek fiktif yang realistis — misalnya 'Landing page untuk kafe lokal' atau 'App manajemen tugas sederhana'. Ini tetap valid untuk belajar."*

### 2c — Layanan (Opsional, Accordion)

Untuk yang ingin terima freelance. Tiap layanan: nama + deskripsi singkat + harga mulai dari (opsional).

Default tersembunyi, expand jika user ingin.

---

## Step 3 — Desain & Visual

### 3a — Tema Warna

**Preset Themes (klik langsung):**

| Nama | Colors | Vibe |
|---|---|---|
| Midnight Pro | `#0A0A0A` + `#CCFF00` + `#FFFFFF` | Dark, hacker, techy |
| Ocean Depth | `#0D1B2A` + `#00D4FF` + `#FFFFFF` | Professional, calm |
| Warm Studio | `#1C1410` + `#FF6B35` + `#FFF8F0` | Creative, warm |
| Soft Minimal | `#FAFAF5` + `#1A1A1A` + `#6B6B6B` | Clean, minimal |
| Purple Haze | `#13001E` + `#9D4EDD` + `#FFFFFF` | Bold, Gen-Z |
| Forest Code | `#0D1F0D` + `#39FF14` + `#CCCCCC` | Matrix, terminal |
| Rose Gold | `#1A0A0A` + `#FF6B9D` + `#FFFFFF` | Feminine, elegant |
| Sand & Sun | `#FFF8E7` + `#D4A017` + `#2D2D2D` | Warm, earthy |

**Custom:** input HEX manual untuk background, primary color, dan text color. Tooltip: *"Primary color = warna aksen untuk button, link, dan highlight."*

### 3b — Font Pair (Google Fonts)

| Pilihan | Display Font | Body Font | Vibe |
|---|---|---|---|
| Techy Bold | Unbounded | JetBrains Mono | Developer, hacker |
| Editorial | Syne | DM Sans | Modern, editorial |
| Classic Pro | Playfair Display | Inter | Profesional, elegan |
| Clean Modern | Space Grotesk | Outfit | Startup, friendly |
| Creative | Bricolage Grotesque | Nunito | Kreatif, playful |
| Minimalist | Plus Jakarta Sans | DM Sans | Clean, Indonesian feel |
| Biarkan AI pilih | — | — | AI tentukan sesuai profesi |

### 3c — Suasana Visual

Pilih satu (atau biarkan AI pilih):

`Profesional & bersih` · `Kreatif & berani` · `Mewah & elegan` · `Hangat & personal` · `Modern & techy` · `Minimalis & rapi` · `Editorial & artistik` · `Playful & fun`

### 3d — Preferensi Layout & Efek

**Hero Layout:**
- Rata tengah (centered, tanpa foto)
- 2 kolom — teks kiri, visual kanan

**Background Effect:**
`Dot grid` · `Garis diagonal` · `Noise texture` · `Geometric pattern` · `Gradient mesh` · `Polos saja`

**Border Radius Style:**
`Rounded (modern)` · `Sedikit rounded` · `Sharp/kotak (brutalist)`

**Section yang ditampilkan:** (checklist)
- ☑ Hero / About
- ☑ Skills
- ☑ Proyek
- ☐ Layanan / Services
- ☑ Kontak
- ☐ Testimonial *(kalau ada)*

---

## Result Screen — Prompt Siap

### Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ✦ Prompt portfolio-mu siap!                        │
│                                                     │
│  Copy prompt di bawah, lalu paste ke Claude         │
│  atau AI manapun untuk mendapatkan kode HTML-mu.    │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │  [Prompt lengkap — scrollable, read-only]  │    │
│  │                                            │    │
│  │  Buat sebuah website portfolio satu halaman│    │
│  │  menggunakan HTML, CSS, dan JavaScript     │    │
│  │  murni (tidak perlu framework apapun)...   │    │
│  │                                            │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  [⎘ Copy Prompt]    [✦ Buka Claude.ai →]           │
│                                                     │
│  [← Edit data]      [↻ Generate ulang]             │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ── Langkah selanjutnya ──                         │
│                                                     │
│  Setelah dapat kode dari Claude, ikuti panduan      │
│  di bawah untuk deploy ke internet gratis.          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Struktur Prompt yang Digenerate

Prompt output mengikuti template ini (diisi data user secara dinamis):

```
Buat sebuah website portfolio satu halaman menggunakan HTML, CSS, 
dan JavaScript murni (TANPA framework, TANPA npm, TANPA build tools).
Semua kode dalam SATU FILE index.html.

=== DATA PEMILIK ===
Nama: {nama}
Profesi: {profesi}
Tagline: {tagline}
Bio: {bio}
Lokasi: {kota}
Email: {email}
GitHub: {github}
LinkedIn: {linkedin}

=== SKILLS & TOOLS ===
{skills_list}

=== PROYEK ===
{proyek_1_nama}: {proyek_1_desc} | Tech: {proyek_1_tech} | Link: {proyek_1_url}
{proyek_2_nama}: {proyek_2_desc} | ...
...

=== DESAIN ===
Color palette:
- Background: {bg_color}
- Primary/Accent: {primary_color}  
- Text: {text_color}

Font: {display_font} untuk heading, {body_font} untuk body text
(Import via Google Fonts CDN)

Suasana visual: {vibe}
Hero layout: {hero_layout}
Background effect: {bg_effect}
Border radius style: {border_style}

=== REQUIREMENTS TEKNIS ===
- Satu file index.html yang bisa langsung dibuka di browser
- Semua CSS di dalam <style> tag
- Semua JS di dalam <script> tag
- Font diimport via Google Fonts CDN link
- Responsive untuk mobile dan desktop
- Smooth scroll antar section
- Animasi subtle saat elemen masuk viewport (Intersection Observer)
- Section: {sections_yang_dipilih}
- Tidak ada placeholder [YOUR NAME] — semua sudah terisi dengan data di atas

=== OUTPUT ===
Berikan HANYA kode HTML lengkap, tanpa penjelasan, tanpa markdown 
code block, langsung dimulai dari <!DOCTYPE html>.
```

---

## Panduan Deploy ke Netlify Drop

Tampil di bawah prompt result, dalam format step-by-step yang visual dan jelas. Ini adalah bagian edukasi vibe coding pertama yang user lakukan.

### Panduan Lengkap (5 Langkah)

---

**Step 1 — Minta kode ke AI**

Setelah copy prompt, buka Claude.ai (atau AI lain). Paste prompt, klik send. Tunggu AI selesai generate.

> *Tips: Kalau hasilnya terpotong, ketik "lanjutkan" dan AI akan melanjutkan dari titik terakhir.*

---

**Step 2 — Simpan sebagai file HTML**

Setelah dapat kode:
1. Copy semua kode yang diberikan AI (mulai dari `<!DOCTYPE html>` sampai `</html>`)
2. Buka **Notepad** (Windows) atau **TextEdit** (Mac, pastikan format Plain Text)
3. Paste kode
4. Simpan dengan nama **`index.html`** — pastikan ekstensinya `.html`, bukan `.txt`

> *Atau pakai VS Code jika sudah terinstal — lebih nyaman untuk edit nanti.*

---

**Step 3 — Buka di browser dulu**

Sebelum deploy, test dulu:
1. Double-click file `index.html`
2. Browser akan membuka website portfoliomu secara lokal
3. Pastikan tampilannya sudah sesuai harapan

Kalau ada yang tidak sesuai, kembali ke Claude dan minta revisi:
> *"Ubah warna button menjadi merah"*  
> *"Buat font heading lebih besar"*  
> *"Tambahkan animasi fade-in pada section proyek"*

---

**Step 4 — Deploy ke Netlify Drop**

Netlify Drop adalah cara tercepat deploy website — tidak perlu akun, tidak perlu konfigurasi apapun.

1. Buka **[netlify.com/drop](https://netlify.com/drop)** di browser
2. Buat folder baru di komputermu, beri nama **`portfolio`**
3. Pindahkan file `index.html` ke dalam folder tersebut
4. **Drag & drop** folder `portfolio` ke kotak besar di halaman Netlify Drop
5. Tunggu beberapa detik — Netlify akan memberikan URL publik seperti:  
   `https://amazing-babbage-1234ab.netlify.app`
6. Buka URL tersebut — website portfoliomu sudah live di internet! 🎉

> *URL-nya acak tapi bisa diganti jika daftar akun Netlify gratis.*

---

**Step 5 — Share & iterate**

Website portfoliomu sudah bisa dibagikan ke siapapun via link.

Ingin update konten atau desain?
1. Edit file `index.html` (minta bantuan Claude untuk perubahan yang diinginkan)
2. Drag & drop ulang ke Netlify Drop
3. Website otomatis terupdate

---

### Callout: Ini baru permulaan

```
┌─────────────────────────────────────────────────────┐
│  🚀 Selamat! Kamu baru saja vibe coding pertamamu.  │
│                                                     │
│  Langkah selanjutnya yang bisa kamu pelajari:       │
│                                                     │
│  → Cara iterasi dan improve website dengan AI       │
│  → Pindah dari Netlify Drop ke GitHub Pages         │
│  → Beli domain custom (Rp 100rb/tahun di Niaga)     │
│  → Belajar struktur file HTML/CSS yang lebih rapi   │
│                                                     │
│  Semua ada di Learn Hub ArroBuild — gratis.         │
│  [Mulai belajar →]                                  │
└─────────────────────────────────────────────────────┘
```

---

## Validasi & UX Rules

### Wajib sebelum generate prompt
- Nama tidak boleh kosong
- Profesi tidak boleh kosong  
- Tagline tidak boleh kosong
- Minimal 1 proyek harus diisi (nama + deskripsi)

### Warning (bukan error)
- Bio kosong → *"Bio membantu AI membuat narasi yang lebih personal"*
- Tidak ada skill → *"Skills membantu AI menampilkan tech stack yang tepat"*
- Tidak ada kontak → *"Tanpa kontak, visitor tidak bisa menghubungimu"*

### Progress Indicator
- Step 1 / 2 / 3 selalu visible di atas
- Setiap step menampilkan ringkasan data yang sudah diisi di bawah step indicator
- User bisa klik step sebelumnya untuk edit (non-linear navigation)

---

## Perbedaan dari Referensi (yusril-asrul)

| Aspek | Referensi | ArroBuild Portfolio Tool |
|---|---|---|
| Output | Prompt copy-paste ke AI | Sama — prompt copy-paste |
| Langkah identitas | Lengkap | Sama, dengan auto-fill demo |
| Desain | Sangat lengkap | Lebih streamlined, preset ArroBuild |
| Post-generate | Instruksi singkat | Panduan deploy Netlify Drop lengkap |
| Edukasi | Tidak ada | Link ke Learn Hub + callout |
| Branding | Netral | Branded ArroBuild, konsisten design system |
| Mobile | Responsive | Fully responsive + mobile-first |

---

## Urutan Eksekusi (untuk agent)

```
1. Hapus implementasi lama (README.md generator)
2. Buat struktur multi-step state management (Step 1/2/3/Result)
3. Step 1: Identitas — semua fields + dropdown profesi + auto-fill demo
4. Step 2: Konten — skills chip input + proyek dynamic form + layanan accordion
5. Step 3: Desain — preset color themes + font pair picker + layout options
6. Result screen: prompt generator function + copy button + buka Claude.ai button
7. Panduan deploy: 5 langkah dengan visual yang jelas
8. Callout link ke Learn Hub
9. Validasi dan warning messages
10. Mobile responsiveness pass
```

---

*Dokumen ini siap dieksekusi oleh AI agent. Rebuild dari nol, bukan modifikasi kode lama.*
