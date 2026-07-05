# ArroBuild — Generate Flow Redesign Plan
**Status:** Active  
**Last Updated:** June 2026  
**Scope:** Halaman `/generate` — seluruh 5-step form hingga proses generate

---

## Diagnosis Masalah (dari Screenshot)

### Step 1 — Tipe Produk
- Tidak ada rekomendasi atau guidance untuk user yang bingung
- "Lainnya" terlalu terbuka, tidak ada sub-opsi
- Tidak ada shortcut "paling populer" atau "mulai dari sini"

### Step 2 — Deskripsi & Konteks
- Tiga textarea kosong sekaligus = overwhelming
- Tidak ada contoh jawaban / placeholder yang informatif
- Tidak ada feedback visual saat user mulai mengisi
- "Tambah detail bebas" tersembunyi — padahal ini jalur berguna

### Step 3 — Stack & Design
- Framework hanya 5 pilihan, tidak ada "Belum tahu / Biarkan AI"
- Design style tidak ada visual preview, hanya teks deskripsi
- AI Tool Target tidak ada keterangan singkat "apa bedanya"

### Step 4 — Pilih Dokumen
- User tidak tahu kapan butuh Production Hardening vs Growth & Quality
- Tidak ada konteks "dokumen ini cocok untuk fase apa"
- Shortcut "Pilih semua" dan "PRD saja" bagus, tapi kurang
- Dokumen locked (abu-abu) tidak ada penjelasan kenapa terkunci

### Global Issues
- Step indicator hanya teks — tidak ada progress yang terasa
- Tidak ada estimasi waktu generate
- Transisi antar step terasa abrupt, tidak ada continuity
- Tidak ada "smart suggestion" berdasarkan pilihan sebelumnya

---

## Prinsip Redesign

**1. Progressive Disclosure** — tampilkan hanya yang relevan, munculkan detail saat dibutuhkan  
**2. Smart Defaults** — setiap step punya pilihan pre-selected yang masuk akal  
**3. Contextual Guidance** — hint dan contoh muncul tepat di mana user butuhnya  
**4. Adaptive Flow** — pertanyaan di step berikutnya berubah berdasarkan jawaban sebelumnya  
**5. Momentum** — user harus merasa cepat maju, bukan tersendat di satu step

---

## Struktur Flow Baru (5 Steps → 4 Steps + Confirm)

```
Step 1: Tipe & Skala
  → Tipe produk + satu pertanyaan skala/stage
  
Step 2: Cerita Produk
  → Guided questions berbasis tipe yang dipilih di Step 1
  → Pertanyaan berubah per tipe produk
  
Step 3: Stack & Preferences
  → Framework + design + AI tool target
  → Tambah opsi "Belum tahu, biarkan AI rekomendasikan"

Step 4: Dokumen & Model
  → Gabungkan pilihan dokumen + pilihan model dalam satu step
  → Smart preset bundle berdasarkan konteks sebelumnya

[Confirm & Generate]
  → Review summary sebelum generate
  → Real-time progress per file
```

> **Kenapa digabung jadi 4?**  
> Step 4 (Dokumen) dan Step 5 (Model) sebelumnya terpisah padahal keduanya adalah keputusan terakhir sebelum generate — lebih natural digabung dengan layout dua kolom.

---

## Step 1 — Tipe & Skala (Redesign)

### Perubahan dari sekarang
- Tambah **"Mulai dari sini →"** rekomendasi untuk first-time user
- Tambah **sub-kategori** yang muncul saat klik tipe tertentu
- Tambah **Stage/Skala** pertanyaan inline setelah pilih tipe
- Kartu tipe produk lebih informatif dengan "cocok untuk kamu jika..."

### Layout
```
┌─────────────────────────────────────────────────┐
│  Eyebrow: STEP 1 OF 4 — TIPE PRODUK            │
│                                                 │
│  H1: "Kamu lagi build apa?"                    │
│  Sub: Pilih yang paling dekat. Ini menentukan  │
│       pertanyaan di step berikutnya.            │
│                                                 │
│  [💡 Baru pertama kali? Mulai dengan SaaS →]   │  ← banner tip untuk new user
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ ▲ SaaS       │  │ 🛒 Marketplace│            │
│  │              │  │              │            │
│  │ Web app      │  │ Platform dua │            │
│  │ berbasis     │  │ sisi (buyer  │            │
│  │ subscription │  │ & seller)    │            │
│  │              │  │              │            │
│  │ Cocok jika:  │  │ Cocok jika:  │            │
│  │ punya fitur  │  │ ada dua tipe │            │
│  │ berulang/    │  │ user berbeda │            │
│  │ berlangganan │  │              │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ... (kartu lainnya)                           │
│                                                 │
│  ── Setelah pilih, muncul inline: ──           │
│                                                 │
│  "Di fase mana proyekmu sekarang?"             │
│  ○ Ide baru — belum mulai coding               │
│  ○ Sudah ada prototype/MVP                     │
│  ○ Sudah production, butuh docs lebih lengkap  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Tipe Produk (lengkap)
| Tipe | Deskripsi | Cocok jika... |
|---|---|---|
| SaaS | Web app berbasis subscription | Ada fitur yang dibayar per bulan |
| Marketplace | Platform dua sisi (buyer & seller) | Ada dua tipe user yang saling transaksi |
| Mobile App | iOS, Android, atau keduanya | Output utama adalah app di smartphone |
| API Tool / Developer Tool | Headless service, SDK, CLI | User utama adalah developer lain |
| Portfolio / Personal Site | Showcase project & skills | Ingin tampil profesional online |
| Internal Tool | Dashboard, admin, ops tool | Dipakai internal tim/perusahaan |
| E-Commerce | Toko online, produk fisik/digital | Jual produk langsung ke konsumen |
| AI-Powered App | App dengan AI sebagai core feature | AI bukan fitur tambahan, tapi inti |
| Lainnya | Tipe di luar kategori di atas | — |

> **"Lainnya"** memunculkan field teks: *"Deskripsikan singkat tipe produkmu (contoh: browser extension, IoT dashboard, game)"*

---

## Step 2 — Cerita Produk (Redesign)

### Perubahan dari sekarang
- **Tidak lagi tiga textarea kosong sekaligus**
- Pertanyaan **berubah per tipe produk** yang dipilih di Step 1
- Setiap field punya **contoh jawaban** yang bisa diklik untuk auto-fill
- Field muncul **satu per satu** dengan animasi (progressive reveal) — bukan sekaligus
- Ada **quality indicator** (Poor / Good / Great) yang berubah realtime saat user mengisi

### Layout
```
┌─────────────────────────────────────────────────┐
│  STEP 2 OF 4 — CERITA PRODUK                   │
│  Tipe: SaaS  [ubah]                             │  ← breadcrumb pilihan sebelumnya
│                                                 │
│  H1: "Ceritakan proyekmu"                      │
│  Sub: Makin spesifik, output AI makin relevan. │
│                                                 │
│  ① Siapa target user utama kamu?               │
│  ┌─────────────────────────────────────────┐   │
│  │ [input]                                 │   │
│  └─────────────────────────────────────────┘   │
│  💡 Contoh: "Developer Indonesia yang baru     │
│     mulai belajar vibe coding"  [pakai ini]    │  ← contoh bisa diklik
│                                                 │
│  ② Masalah utama yang ingin dipecahkan?        │  ← muncul setelah ① diisi
│  ┌─────────────────────────────────────────┐   │
│  │ [textarea]                              │   │
│  └─────────────────────────────────────────┘   │
│  💡 Contoh: "Developer kesulitan membuat        │
│     dokumentasi proyek sebelum coding"  [pakai]│
│                                                 │
│  ③ Fitur inti yang HARUS ada di v1?            │  ← muncul setelah ② diisi
│  ┌─────────────────────────────────────────┐   │
│  │ [textarea]                              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [▼ Tambah konteks opsional]                   │  ← accordion, tidak default terbuka
│                                                 │
│  Kelengkapan konteks: ████████░░ Good          │  ← quality bar
│                                                 │
└─────────────────────────────────────────────────┘
```

### Pertanyaan Adaptif per Tipe Produk

**SaaS:**
1. Siapa target user utama? *(single line)*
2. Masalah utama yang dipecahkan? *(textarea)*
3. Fitur inti yang harus ada di v1? *(textarea)*
4. *(Opsional)* Model bisnis: Freemium / Paid only / Trial / One-time

**Marketplace:**
1. Siapa buyer-nya? Siapa seller-nya? *(dua field terpisah)*
2. Apa yang ditransaksikan? (produk fisik / digital / jasa / informasi)
3. Masalah utama yang dipecahkan untuk tiap sisi?
4. *(Opsional)* Bagaimana platform mengambil revenue?

**Mobile App:**
1. Platform target: iOS / Android / Keduanya *(pilihan chip)*
2. Siapa pengguna utamanya?
3. Apa yang bisa dilakukan user di app ini yang tidak bisa dilakukan di web?
4. *(Opsional)* Ada fitur native device? (kamera, GPS, notifikasi, sensor)

**API Tool / Developer Tool:**
1. Siapa developer yang akan pakai ini?
2. Apa yang bisa dilakukan dengan API/tool ini?
3. Input apa yang diterima, output apa yang dihasilkan?
4. *(Opsional)* Deployment target: self-hosted / cloud / npm package / CLI

**Portfolio / Personal Site:**
1. Kamu seorang apa? (designer, developer, writer, dll) *(single line)*
2. Siapa yang akan melihat portfolio ini? (recruiter, klien, komunitas)
3. Project atau skill apa yang paling ingin ditonjolkan?
4. *(Opsional)* Ada case study spesifik yang ingin diceritakan?

**AI-Powered App:**
1. AI digunakan untuk apa di produk ini?
2. Siapa target user dan bagaimana mereka berinteraksi dengan AI?
3. Model AI apa yang direncanakan? (GPT-4, Claude, Gemini, custom)
4. *(Opsional)* Apakah ada data user yang diproses AI? Bagaimana privacynya?

**Internal Tool:**
1. Tim/departemen mana yang akan pakai ini?
2. Proses manual apa yang ingin diotomasi atau dipermudah?
3. Berapa banyak user internal yang akan pakai setiap hari?
4. *(Opsional)* Integrasi dengan sistem yang sudah ada?

**Lainnya:**
- Gunakan 3 pertanyaan generik (user, masalah, fitur) + field tipe bebas

### Konteks Opsional (Accordion)
Muncul saat user expand "Tambah konteks opsional":
- Nama produk (jika sudah ada)
- Referensi produk sejenis yang disukai
- Hal yang TIDAK ingin ada di produk ini
- Target peluncuran (minggu ini / bulan ini / tidak mendesak)

---

## Step 3 — Stack & Preferences (Redesign)

### Perubahan dari sekarang
- Tambah opsi **"Belum tahu — biarkan AI rekomendasikan"** di setiap kategori
- Framework diperluas + ada **sub-kategori** (frontend / backend / fullstack)
- Design style punya **mini visual swatch** bukan hanya teks
- AI Tool Target punya **tooltip** yang menjelaskan bedanya tiap tool
- Tambah **Database** dan **Deployment** sebagai opsi opsional

### Layout
```
┌─────────────────────────────────────────────────┐
│  STEP 3 OF 4 — STACK & PREFERENCES             │
│  SaaS · Ide baru  [ubah]                        │
│                                                 │
│  H1: "Tech stack & style"                      │
│  Sub: AI akan menyesuaikan output dengan ini.  │
│       Tidak tahu? Biarkan AI rekomendasikan.   │
│                                                 │
│  ── Framework / Language ──                    │
│                                                 │
│  Frontend / Fullstack:                         │
│  [Next.js] [Nuxt] [Remix] [SvelteKit]          │
│  [React SPA] [Vue SPA] [Vanilla JS]            │
│                                                 │
│  Backend / API:                                │
│  [Laravel] [Express] [FastAPI] [Django]        │
│  [NestJS] [Rails] [Go Fiber] [Hono]            │
│                                                 │
│  Mobile:                                       │  ← hanya muncul jika Mobile App
│  [React Native] [Flutter] [Swift] [Kotlin]     │
│                                                 │
│  [🤖 Belum tahu — biarkan AI rekomendasikan]   │
│                                                 │
│  ── Design Style ──                            │
│                                                 │
│  [■ Neo-Brutalist]  [○ Minimal]                │
│  [□ Corporate]      [◈ Bold & Colorful]        │
│  [∷ Glassmorphism]  [⊞ Dashboard/Data]         │
│  [🤖 Biarkan AI]                               │
│                                                 │
│  ── AI Tool Target ──                          │
│  Dokumentasi akan dioptimasi untuk tool ini.  │
│                                                 │
│  [Cursor ⓘ] [Claude Code ⓘ] [Windsurf ⓘ]     │
│  [Cline ⓘ]  [OpenCode ⓘ]   [Custom/Lainnya]   │
│                                                 │
│  ── Opsional ──                                │
│  [▼ Database & Deployment preferences]         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Framework Lengkap

**Frontend / Fullstack:**
Next.js, Nuxt.js, Remix, SvelteKit, Astro, React SPA (Vite), Vue SPA, Angular, Vanilla JS

**Backend / API:**
Laravel, Express.js, NestJS, FastAPI, Django, Ruby on Rails, Go Fiber, Hono, Spring Boot, .NET

**Mobile:**
React Native, Flutter, Swift (iOS), Kotlin (Android), Expo

**"Biarkan AI rekomendasikan"** — menghasilkan section tambahan di output yang berisi rekomendasi stack beserta alasannya.

### AI Tool Target + Tooltip
| Tool | Tooltip |
|---|---|
| Cursor | IDE berbasis VS Code dengan AI inline. Output dioptimasi untuk `.cursorrules` |
| Claude Code | Terminal agent dari Anthropic. Output dioptimasi untuk `CLAUDE.md` |
| Windsurf | IDE dengan Cascade agent. Output dioptimasi untuk `.windsurfrules` |
| Cline | VS Code extension agent. Output dioptimasi untuk `.clinerules` |
| OpenCode | Terminal agent open source. Output format generik |
| Custom / Lainnya | Output generik, tidak ada optimasi khusus |

### Database & Deployment (Opsional Accordion)
**Database:** PostgreSQL, MySQL, MongoDB, SQLite, Redis, Supabase, PlanetScale, Turso  
**Deployment:** Vercel, Netlify, Railway, Fly.io, VPS/Dedicated, Docker, AWS/GCP/Azure

---

## Step 4 — Dokumen & Model (Redesign)

### Perubahan dari sekarang
- **Dokumen dan Model digabung** dalam satu step, layout dua kolom
- Tambah **Smart Preset** berdasarkan stage yang dipilih di Step 1
- Setiap dokumen punya **penjelasan "cocok untuk fase apa"**
- Model AI punya **perbandingan jelas**: kecepatan, kualitas, dan apakah gratis
- Tampilkan **estimasi waktu generate** yang berubah dinamis

### Layout
```
┌──────────────────────────┬──────────────────────┐
│  PILIH DOKUMEN           │  PILIH MODEL AI       │
│  ─────────────────────   │  ──────────────────── │
│                          │                       │
│  Smart Preset:           │  ○ Gemini Flash        │
│  [✦ Starter Pack]        │    Gratis · ~30 detik │
│  [✦ Full Foundation]     │    Cepat, cukup detail│
│  [✦ Sesuaikan sendiri]   │                       │
│                          │  ○ DeepSeek V3         │
│  ── Dokumen ──           │    Gratis · ~45 detik │
│                          │    Detail, open source│
│  ☑ Product Requirements  │                       │
│    Wajib · Semua fase    │  ○ Gemini 2.5 Pro ★   │
│                          │    Premium · ~1 menit │
│  ☑ Project Context       │    Paling lengkap     │
│    Wajib · Semua fase    │                       │
│                          │  ○ GPT-4o ★            │
│  ☑ Development Plan      │    Premium · ~1 menit │
│    Semua fase            │    Konsisten & akurat │
│                          │                       │
│  ☑ Design System         │  ○ Claude Sonnet 4 ★  │
│    Semua fase            │    Premium · ~1 menit │
│                          │    Terbaik untuk docs │
│  ☑ AI Agents & Rules     │                       │
│    Semua fase            │  ★ = Perlu akun Pro   │
│                          │                       │
│  ○ Production Hardening  │  ── Estimasi ──       │
│    💡 Untuk: siap launch │                       │
│    atau sudah production │  5 dokumen            │
│                          │  Gemini Flash         │
│  ○ Scale & Performance   │  ≈ 2–3 menit          │
│    💡 Untuk: sudah ada   │                       │
│    trafik nyata          │  [Generate sekarang →]│
│                          │                       │
│  ○ Growth & Quality      │                       │
│    💡 Untuk: optimasi    │                       │
│    post-launch           │                       │
│                          │                       │
│  5 dokumen dipilih       │                       │
└──────────────────────────┴──────────────────────┘
```

### Smart Presets
| Preset | Dokumen yang Dipilih | Cocok untuk |
|---|---|---|
| **Starter Pack** | PRD + Context + Plan | Ide baru, mau mulai cepat |
| **Full Foundation** | 5 dokumen inti | Sebelum mulai coding serius |
| **Production Ready** | 5 dokumen inti + Hardening | Mau launch ke publik |
| **Complete Suite** | Semua 8 dokumen | Produk yang butuh dokumentasi lengkap |

> Smart Preset otomatis dipilih berdasarkan **Stage** yang dipilih di Step 1:
> - "Ide baru" → Starter Pack
> - "Sudah ada prototype" → Full Foundation
> - "Sudah production" → Production Ready

---

## Confirm & Generate Screen

### Tujuan
Sebelum generate, user melihat **ringkasan semua pilihan** — ini mengurangi "generate salah" dan memberi rasa kontrol.

### Layout
```
┌─────────────────────────────────────────────────┐
│  Review & Generate                              │
│                                                 │
│  ── Ringkasan Proyekmu ──                      │
│                                                 │
│  Tipe: SaaS · Stage: Ide baru                  │
│  Target user: Developer Indonesia vibe coding   │
│  Framework: Next.js · Style: Neo-Brutalist      │
│  AI Tool: Cursor                                │
│                                                 │
│  [Edit] ← link kembali ke step manapun         │
│                                                 │
│  ── Dokumen yang akan digenerate ──            │
│  ☑ Product Requirements                        │
│  ☑ Project Context                             │
│  ☑ Development Plan                            │
│  ☑ Design System                               │
│  ☑ AI Agents & Rules                           │
│                                                 │
│  Model: Gemini Flash (Gratis)                  │
│  Estimasi waktu: ≈ 2–3 menit                   │
│                                                 │
│  [← Ubah pilihan]   [✦ Generate sekarang →]   │
│                                                 │
│  ⓘ Pastikan deskripsi proyekmu sudah lengkap   │
│  untuk hasil yang lebih relevan.               │
└─────────────────────────────────────────────────┘
```

---

## Generate Progress Screen

### Perubahan dari sekarang
- Progress per file dengan **nama file dan status** (Queued / Generating / Done)
- **Streaming text preview** — user bisa lihat output mulai muncul per file
- Informasi edukatif sambil menunggu: *"Tau nggak? context.md adalah..."*
- Setelah selesai: **confetti subtle** + ringkasan yang bisa langsung di-copy/download

### Layout
```
┌─────────────────────────────────────────────────┐
│  Generating your docs...                        │
│  ████████████████████░░░░  4 of 5              │
│                                                 │
│  ✓ prd.md              Done      [Preview]     │
│  ✓ context.md          Done      [Preview]     │
│  ✓ plan.md             Done      [Preview]     │
│  ✓ design-system.md    Done      [Preview]     │
│  ◌ agents.md           Generating...           │
│                                                 │
│  ── Preview (agents.md) ──                     │
│  # AI Agents & Rules                           │
│  ## Cursor Agent Configuration                 │
│  ```                                           │
│  You are an expert Next.js developer...        │  ← streaming live
│  ```                                           │
│                                                 │
│  💡 Tau nggak? agents.md berisi instruksi      │
│  spesifik untuk AI agent kamu. Paste           │
│  langsung ke .cursorrules setelah selesai.     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Post-Generate Screen
```
┌─────────────────────────────────────────────────┐
│  ✦ Docs siap!                                   │
│                                                 │
│  5 dokumen berhasil digenerate                 │
│  SaaS · Next.js · Neo-Brutalist · Cursor        │
│                                                 │
│  [⬇ Download ZIP]  [⬇ Download CLAUDE.md]      │
│  [⬇ .cursorrules]  [⬇ system-prompt.txt]       │
│                                                 │
│  ── Quick Start ──                             │
│  1. Extract ZIP ke root folder proyekmu        │
│  2. Buka Cursor, paste .cursorrules            │
│  3. Mulai coding — AI sudah punya konteks!     │
│                                                 │
│  [Generate lagi] [Simpan ke Dashboard] [Share] │
│                                                 │
│  ── Pelajari cara pakainya ──                 │
│  → Cara pakai context.md di Claude Code        │
│  → Setup .cursorrules yang benar               │  ← link ke Learn Hub
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Step Indicator (Redesign)

### Perubahan dari sekarang
Bukan hanya angka dan nama — tapi ada **progress bar** aktif dan **breadcrumb** pilihan terdahulu yang selalu visible.

```
┌─────────────────────────────────────────────────┐
│  [◉ Tipe]──[◉ Cerita]──[◉ Stack]──[○ Dokumen] │
│  SaaS          ✓           Next.js              │
│  ████████████████████████░░░░░  75%             │
└─────────────────────────────────────────────────┘
```

- Step yang sudah selesai: ikon check + summary satu kata dari jawaban user
- Step aktif: highlighted
- Step belum: abu-abu
- Klik step yang sudah selesai: bisa edit kembali (non-linear navigation)

---

## Error & Validation

### Prinsip
- Jangan blokir user dengan error — **warn, bukan prevent** untuk field opsional
- Error hanya untuk field yang benar-benar wajib (minimal 1 jawaban di Step 2)
- Pesan error menggunakan bahasa yang tidak menghakimi

### Pesan Error yang Baik
| Kondisi | Pesan Buruk | Pesan Baik |
|---|---|---|
| Step 2 semua kosong | "Semua field wajib diisi" | "Ceritakan sedikit saja — minimal target user atau masalahnya" |
| Tidak pilih framework | "Pilih framework dulu" | "Belum tahu frameworknya? Pilih 'Biarkan AI rekomendasikan'" |
| Tidak pilih dokumen | "Pilih minimal 1 dokumen" | "Pilih dokumen yang mau digenerate, atau pakai Starter Pack" |

---

## Mobile Considerations

- Step indicator di mobile: hanya tampilkan step aktif + garis progress
- Kartu tipe produk di mobile: single column, bukan grid
- Step 4 (dua kolom): stack vertikal di mobile — dokumen dulu, lalu model
- Keyboard di mobile: field berikutnya auto-focus setelah user selesai mengisi

---

## Urutan Eksekusi (untuk agent)

```
1. Redesign step indicator + progress bar
2. Step 1: tambah "Cocok jika..." di tiap kartu + inline Stage question
3. Step 2: buat question set per tipe produk + progressive reveal + contoh
4. Step 3: expand framework list + tooltip AI tool + opsi "Biarkan AI"
5. Step 4: gabung dengan model selector + smart presets + estimasi waktu
6. Confirm screen: summary sebelum generate
7. Generate screen: per-file progress + streaming preview
8. Post-generate screen: download options + quick start guide + link Learn Hub
9. Step indicator redesign + non-linear navigation
10. Error & validation messages
11. Mobile responsiveness pass
```

---

*Plan ini siap dieksekusi oleh AI agent. Setiap step berdiri sendiri dan bisa dikerjakan terpisah.*
