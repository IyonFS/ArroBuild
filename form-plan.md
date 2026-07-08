# ArroBuild — Analisis Form Plan (`/generate`)

**Dibuat:** 6 Juli 2026  
**Tujuan dokumen:** Konteks untuk brainstorming, briefing AI, dan pengembangan lanjutan fitur form generate ArroBuild.  
**Scope:** Seluruh alur form input sebelum AI generation — dari Step 1 hingga Confirm screen (tidak termasuk hasil preview/download).

---

## Ringkasan Eksekutif

Form plan ArroBuild adalah **wizard 4 langkah + 1 layar konfirmasi** di route `/generate`. User mendeskripsikan produk yang ingin dibangun, memilih stack & preferensi, lalu memilih dokumen + model AI sebelum generate.

**Status implementasi:** Mayoritas redesign dari `docs/arrobuild-generate-flow-plan.md` **sudah diimplementasi** di komponen `src/components/generate/*`. Form sudah fungsional untuk happy path (SaaS + Next.js + Neo-Brutalist + Cursor + Gemini Flash), tetapi ada **ketidakselarasan API validation**, **bug pengiriman `selectedDocs`**, dan beberapa gap UX yang tercatat di bawah.

---

## Arsitektur & File Terkait

```
src/app/generate/page.tsx          ← Orchestrator state & routing antar step
src/components/generate/
  ├── ProductTypeStep.tsx          ← Step 1: Tipe & Fase
  ├── ContextStep.tsx              ← Step 2: Cerita Produk (adaptif per tipe)
  ├── StackStep.tsx              ← Step 3: Framework, Design, AI Tool
  ├── DocumentPickerStep.tsx     ← Step 4: Dokumen + Model AI
  ├── ConfirmScreen.tsx          ← Review sebelum generate
  ├── GenerationProgress.tsx     ← SSE streaming (post-form)
  ├── DocPreview.tsx             ← Hasil generate (post-form)
  ├── types.ts                   ← Shared types, model options, file metadata
  ├── IdeaInput.tsx              ← LEGACY — tidak dipakai lagi
  ├── ClarificationStep.tsx      ← LEGACY — tidak dipakai lagi
  └── PresetSelector.tsx         ← LEGACY — tidak dipakai lagi
src/app/api/generate/route.ts    ← API endpoint + Zod validation
src/lib/ai/orchestrator.ts       ← Engine generation
docs/arrobuild-generate-flow-plan.md ← Spec redesign (referensi desain)
```

### State yang Dikelola di `page.tsx`

| State | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `step` | Step enum | `"product-type"` | 7 step total termasuk generating & preview |
| `productType` | `ProductType \| null` | `null` | 9 tipe produk |
| `stage` | `ProjectStage \| null` | `null` | idea / prototype / production |
| `contextData` | `ContextData` | `{}` | Field adaptif per tipe produk |
| `presets` | `Presets` | nextjs, neo-brutalist, cursor | + database & deployment opsional |
| `selectedDocs` | `FileKey[]` | 5 dokumen inti | Auto-update saat stage berubah |
| `selectedModelId` | string | `gemini-2.5-flash` | Disesuaikan tier user |
| `tier` | `UserTier` | `"free"` | Dari `/api/user/me` |

### Alur Step

```
product-type → context → stack → docs → confirm → generating → preview
     1            2        3       4        5
```

---

## Design System & Tampilan Visual

### Tema Keseluruhan

- **Mode:** Dark theme dengan aksen **lime/neon green** (`--color-lime: #CCFF00`)
- **Font heading:** `Unbounded` (bold, letter-spacing ketat)
- **Font body/UI:** `JetBrains Mono` / `font-mono` — aesthetic developer tool
- **Background:** `--color-bg-base` (hitam gelap), elevated cards `--color-bg-elevated`
- **Border:** Tipis 0.5px, subtle (`--color-border-default`)
- **Accent aktif:** `rgba(204,255,0,0.07–0.12)` background + border lime
- **CTA primary:** Full-width atau flex-1 button lime dengan teks hitam `#0A0A0A`
- **CTA disabled:** Abu-abu, border default, cursor not-allowed

### Layout Shell

- **AppShell** (`tone="app"`, `padded={false}`, `showFooter={false}`)
- **Navbar minimal** sticky di atas (60px)
- **Sub-header step bar** sticky di `top: 60px`, tinggi 56px + progress bar 2px di bawah
- **Content area:** `max-w-2xl` (step 1–3, confirm) atau `max-w-3xl` (step 4)
- **Padding:** `px-4 py-10` per step

### Komponen UI Berulang

| Elemen | Pola Visual |
|--------|-------------|
| Step badge | Pill kecil uppercase: `Step N of 4 — [Nama]` dengan border lime transparan |
| Heading | `font-unbounded text-xl sm:text-2xl` |
| Subheading | `font-mono text-sm` warna secondary |
| Kartu pilihan | `rounded-xl`, border 0.5px, hover/active dengan highlight lime |
| Input field | `rounded-xl`, mono font, focus ring lime subtle |
| Chip/pill selector | `rounded-lg`, toggle on/off dengan border lime |
| Tombol navigasi | Kembali (outline) + Lanjut (lime solid) dalam flex row |
| Progress bar header | Garis lime tipis, lebar = `(stepIndex+1)/4 * 100%` |

### Step Indicator (Header)

- 4 dot/label: **Tipe → Cerita → Stack → Dokumen**
- Step selesai: ikon check hijau, label lime, summary 1 kata (truncated `max-w-[60px]`)
- Step aktif: dot lebih besar (22px vs 18px), border kuat
- Step belum: abu-abu, disabled
- **Non-linear nav:** Klik step yang sudah selesai untuk kembali edit
- **Mobile:** Label step disembunyikan (`hidden sm:flex`), hanya dot + persen di kanan

---

## Step 1 — Tipe & Fase (`ProductTypeStep`)

### Apa yang Ada

**Header:**
- Badge: `Step 1 of 4 — Tipe Produk`
- H1: *"Kamu lagi build apa?"*
- Sub: *"Pilih yang paling dekat. Ini menentukan pertanyaan di step berikutnya."*

**Tip banner first-time user:**
- 💡 *"Baru pertama kali? Mulai dengan SaaS →"* — shortcut auto-select SaaS

**Grid 9 kartu tipe produk (2 kolom di desktop, 1 di mobile):**

| ID | Label | Deskripsi | Cocok jika... | Badge |
|----|-------|-----------|---------------|-------|
| `saas` | SaaS | Web app berbasis subscription | Ada fitur yang dibayar per bulan | **Populer** |
| `marketplace` | Marketplace | Platform dua sisi | Dua tipe user saling transaksi | |
| `mobile` | Mobile App | iOS, Android, atau keduanya | Output utama smartphone | |
| `api` | API / Dev Tool | Headless service, SDK, CLI | User utama developer lain | |
| `ai-app` | AI-Powered App | AI sebagai core feature | AI bukan fitur tambahan | |
| `ecommerce` | E-Commerce | Toko online | Jual langsung ke konsumen | |
| `internal` | Internal Tool | Dashboard, admin, ops | Dipakai internal tim | |
| `portfolio` | Portfolio / Personal Site | Showcase project & skills | Tampil profesional online | |
| `other` | Lainnya | Di luar kategori | — (kosong) | |

Setiap kartu menampilkan: icon, label, deskripsi singkat, section **"Cocok:"** dengan guidance.

**Stage picker (muncul setelah pilih tipe):**

| ID | Label | Deskripsi |
|----|-------|-----------|
| `idea` | Ide baru | Belum mulai coding |
| `prototype` | Ada prototype / MVP | Sudah mulai, belum production |
| `production` | Sudah production | Butuh docs lebih lengkap |

- Radio button style dengan highlight lime saat aktif
- Auto-scroll ke stage picker setelah pilih tipe
- **Side effect:** `handleStageChange` di parent mengubah `selectedDocs` sesuai `STAGE_PRESETS`

**Validasi & CTA:**
- Tombol disabled sampai tipe + fase terpilih
- Label dinamis: *"Pilih tipe produk dulu"* → *"Pilih fase proyekmu"* → *"Lanjut →"*

### Smart Preset Docs per Stage

| Stage | Dokumen otomatis terpilih |
|-------|--------------------------|
| `idea` | PRD + Context + Plan (3) |
| `prototype` | 5 dokumen inti |
| `production` | 5 inti + Production Hardening (6) |

---

## Step 2 — Cerita Produk (`ContextStep`)

### Apa yang Ada

**Header:**
- Badge: `Step 2 of 4 — Cerita Produk`
- Breadcrumb: `[Tipe produk] [ubah]` — kembali ke step 1
- H1: *"Ceritakan proyekmu"*
- Sub: *"Makin spesifik, output AI makin relevan. Isi minimal satu field."*

### Pertanyaan Adaptif per Tipe

Setiap tipe punya 3–5 pertanyaan berbeda. Field disimpan di `ContextData`.

**SaaS (4 pertanyaan):**
1. Target user (text) — ada contoh klik `[pakai ini]`
2. Masalah utama (textarea)
3. Fitur inti v1 (textarea)
4. Model bisnis (opsional, text)

**Marketplace (5):** buyer, seller, tipe transaksi (+ chips), masalah, monetisasi opsional

**Mobile (4):** platform (+ chips), target user, value prop mobile-only, fitur native opsional

**API / Dev Tool (4):** target developer, capability, input/output, deployment (+ chips)

**AI-Powered App (4):** use case AI, target user + interaksi, model AI (+ chips), privacy opsional

**E-Commerce (4):** target pembeli, produk dijual (+ chips), masalah, channel opsional

**Portfolio (4):** profesi/stack, audience (+ chips), skill ditonjolkan, case study opsional

**Internal Tool (4):** tim & ukuran, proses manual, fitur inti, integrasi opsional

**Lainnya (3):** target user, masalah, fitur inti (generik)

### Fitur UX Step 2

| Fitur | Implementasi |
|-------|-------------|
| Progressive reveal | Pertanyaan berikutnya muncul setelah yang sebelumnya diisi |
| Contoh klik | Tombol `💡 Contoh: "..." [pakai ini]` auto-fill field |
| Quick chips | Beberapa field punya chip pilihan cepat (toggle) |
| Konteks opsional | Accordion: nama produk, referensi, anti-features, timeline launch |
| Quality bar | Poor / Fair / Good / Great berdasarkan jumlah field terisi (>3 char) |
| Validasi | Minimal **1 field** dari pertanyaan utama harus terisi |

### Konteks Opsional (Accordion)

- Nama produk
- Referensi produk sejenis
- Hal yang TIDAK ingin ada
- Target peluncuran

---

## Step 3 — Stack & Preferences (`StackStep`)

### Apa yang Ada

**Header:**
- Badge: `Step 3 of 4 — Stack & Preferences`
- H1: *"Tech stack & style"*
- Sub: *"AI akan menyesuaikan output dengan ini. Tidak tahu? Pilih 'Biarkan AI'."*

### Framework / Language

**Untuk non-mobile** — dua section terpisah:
- **Frontend / Fullstack:** Next.js, Nuxt, Remix, SvelteKit, Astro, React SPA, Vue SPA, Vanilla JS
- **Backend / API:** Laravel, Express, NestJS, FastAPI, Django, Rails, Go Fiber, Hono
- **Opsi:** 🤖 *"Belum tahu — biarkan AI rekomendasikan"* (`ai-recommend`)

**Untuk Mobile App** — section khusus:
- React Native, Flutter, Expo + opsi AI recommend

> Catatan: Hanya **satu** framework yang bisa dipilih (bukan kombinasi frontend + backend terpisah).

### Design Style (7 opsi)

| ID | Label | Deskripsi |
|----|-------|-----------|
| `neo-brutalist` | Neo-Brutalist | Raw, bold, high contrast |
| `minimal` | Minimal | Clean, whitespace |
| `corporate` | Corporate | Professional, trust |
| `bold` | Bold & Colorful | Vibrant, expressive |
| `glassmorphism` | Glassmorphism | Frosted glass, blur |
| `dashboard` | Dashboard / Data | Dense, information-rich |
| `ai-recommend` | Biarkan AI | AI pilihkan sesuai konteks |

Swatch symbol (■ ○ □ ◈ ∷ ⊞ 🤖) + deskripsi di desktop (`hidden sm:inline`).

> **Gap:** `types.ts` juga punya `apple`, `linear`, `stripe`, `notion`, `vercel` tapi **tidak ditampilkan** di UI.

### AI Tool Target (6 opsi + tooltip)

| Tool | Output file | Tooltip |
|------|-------------|---------|
| Cursor | `.cursorrules` | IDE VS Code + AI inline |
| Claude Code | `CLAUDE.md` | Terminal agent Anthropic |
| Windsurf | `.windsurfrules` | IDE Cascade agent |
| Cline | `.clinerules` | VS Code extension |
| OpenCode | `agents.md` | Terminal open source |
| Custom / Lainnya | `agents.md` | Output generik |

Tooltip muncul on hover/focus pada ikon ⓘ.

### Database & Deployment (Accordion Opsional)

**Database:** PostgreSQL, MySQL, MongoDB, SQLite, Redis, Supabase, PlanetScale, Turso

**Deployment:** Vercel, Netlify, Railway, Fly.io, VPS, Docker, AWS/GCP/Azure

> **Gap:** Pilihan database/deployment **tidak dikirim** ke API `presets` dan **tidak masuk** `buildIdeaString()`.

### Validasi Step 3

- **Tidak ada validasi wajib** — default sudah terisi (Next.js, Neo-Brutalist, Cursor)
- Tombol Lanjut selalu aktif

---

## Step 4 — Dokumen & Model (`DocumentPickerStep`)

### Apa yang Ada

**Header:**
- Badge: `Step 4 of 4 — Dokumen & Model`
- H1: *"Pilih dokumen & model AI"*
- Layout **dua kolom** di desktop (`lg:grid-cols-2`), stack vertikal di mobile

### Kolom Kiri — Pilih Dokumen

**Smart Preset (4 bundle):**

| Preset | Dokumen | Cocok untuk |
|--------|---------|-------------|
| Starter Pack | PRD, Context, Plan | Ide baru, mulai cepat |
| Full Foundation | 5 dokumen inti | Sebelum coding serius |
| Production Ready | 5 inti + Hardening | Mau launch |
| Complete Suite | Semua 8 dokumen | Docs paling lengkap |

Badge **"Rekomendasi"** muncul jika preset cocok dengan stage yang dipilih di Step 1.

**Dokumen Inti (5):**

| Key | Label | Phase |
|-----|-------|-------|
| `prd` | Product Requirements | Semua fase — **wajib, tidak bisa di-uncheck** |
| `context` | Project Context | Semua fase |
| `plan` | Development Plan | Semua fase |
| `design-system` | Design System | Semua fase |
| `agents` | AI Agents & Rules | Semua fase |

**Dokumen Lanjutan (3):**

| Key | Label | Phase hint |
|-----|-------|------------|
| `production-hardening` | Production Hardening | Siap launch / sudah production |
| `scale-performance` | Scale & Performance | Sudah ada traffic nyata |
| `growth-quality` | Growth & Quality | Optimasi post-launch |

**Shortcut:** Tombol "Semua" dan "PRD saja" di footer list.

### Kolom Kanan — Model AI + Estimasi

**5 model tersedia:**

| Model | Tier | Kecepatan | Deskripsi |
|-------|------|-----------|-----------|
| Gemini Flash | Free | ~30 dtk/dok | Gratis, cepat |
| DeepSeek V3 | Free | ~45 dtk/dok | Gratis, detail |
| Gemini 2.5 Pro | Paid ★ | ~1 mnt/dok | Paling lengkap |
| GPT-4o | Paid ★ | ~1 mnt/dok | Konsisten |
| Claude Sonnet 4 | Paid ★ | ~1 mnt/dok | Terbaik docs |

Free tier: model premium di-lock (opacity 45%, disabled) + banner orange *"★ = Perlu akun Pro"*.

**Kartu Estimasi:**
- Jumlah dokumen × model → total waktu (`formatTime`)
- Contoh: 3 dok × Gemini Flash = ~1 mnt 30 dtk

**CTA:** `Review & Generate (N dok) →`

---

## Confirm Screen (`ConfirmScreen`)

### Apa yang Ada

**Header:** Badge `Review & Generate`, H1 *"Sudah semuanya?"*

**4 kartu ringkasan (klik untuk edit step terkait):**

1. **Tipe & Fase** — tipe produk + stage
2. **Cerita Produk** — summary 3 baris pertama (truncated)
3. **Stack & Style** — framework, design, AI tool, database (jika ada)
4. **Dokumen & Model** — chip tiap dokumen + model + estimasi waktu

**Info banner biru:** *"Pastikan deskripsi proyekmu sudah lengkap..."*

**Limit warning (jika project limit tercapai):** Banner merah + link upgrade ke `/dashboard?upgrade=true`

**Actions:**
- `← Ubah pilihan` (kembali ke step docs)
- `✦ Generate sekarang →` (lime, disabled jika limit)

> Step indicator header menampilkan *"Review pilihan"* (bukan progress 5/5).

---

## Post-Form (Singkat — untuk konteks lengkap)

| Step | Komponen | Fungsi |
|------|----------|--------|
| `generating` | `GenerationProgress` | SSE stream per file, tips edukatif, retry UI |
| `preview` | `DocPreview` | Markdown preview, copy, download ZIP, email capture |

### Transformasi Data ke API

`buildIdeaString()` menggabungkan semua `contextData` + `productType` + `stage` menjadi string multi-baris yang dikirim sebagai `idea` ke `/api/generate`.

```text
Product type: saas
Project stage: idea
Target user: Developer Indonesia...
Main problem: ...
```

---

## Hasil Testing Manual (6 Juli 2026)

**Environment:** `npm run dev` → `http://localhost:3000/generate`  
**Skenario:** SaaS → Ide baru → 1 field context (contoh) → default stack → Starter Pack (3 dok) → Confirm

### Yang Berfungsi ✅

- Navigasi 4 step + confirm lancar
- Step indicator update summary (saas, Developer Indonesia, nextjs)
- Progressive reveal pertanyaan di Step 2
- Contoh `[pakai ini]` mengisi field
- Stage picker memicu Smart Preset Starter Pack (3 dokumen)
- Badge "Rekomendasi" pada Starter Pack
- Model free tier aktif, premium terkunci
- Estimasi waktu dinamis (~1 mnt 30 dtk untuk 3 dok)
- Confirm screen menampilkan ringkasan lengkap
- Non-linear navigation (klik step selesai di header)
- Design konsisten dark + lime di seluruh flow

### Masalah Ditemukan ⚠️

| # | Severity | Masalah | Detail |
|---|----------|---------|--------|
| 1 | **Kritis** | `selectedDocs` tidak dikirim ke API | `GenerationProgress.tsx` line 98: body hanya `{ idea, clarifications, presets, tier, modelId }` — tanpa `selectedDocs`. UI menampilkan 3 dok tapi backend bisa generate lebih banyak sesuai tier default. |
| 2 | **Kritis** | API Zod schema tidak sinkron dengan form | `route.ts` hanya allow framework: nextjs/laravel/django/rails/fastapi. Form punya nuxt, remix, ai-recommend, dll → **422 Validation failed** jika user pilih opsi di luar schema. |
| 3 | **Kritis** | Design preset mismatch | API tidak include `glassmorphism`, `dashboard`, `ai-recommend` — padahal ada di form. Default `neo-brutalist` aman, tapi pilihan lain bisa gagal. |
| 4 | **Tinggi** | `agentTool: custom` tidak di API schema | Form allow Custom, API tidak → gagal generate. |
| 5 | **Tinggi** | Database & deployment tidak dipakai | User bisa pilih di Step 3 tapi tidak masuk `idea` atau `presets` API. |
| 6 | **Tinggi** | React hydration error di Navbar | Dev overlay: `Navbar.tsx (135:11)` — terlihat di browser saat testing. |
| 7 | **Sedang** | Default `selectedDocs` vs stage preset | State awal 5 dokumen, baru berubah ke 3 saat user pilih stage. Jika user tidak pilih stage dulu (tidak mungkin karena wajib), atau fork dari session — bisa inconsistent. |
| 8 | **Sedang** | Validasi context terlalu longgar | Cukup 1 field untuk lanjut; output AI bisa tipis. Quality bar "Poor" tetap bisa proceed. |
| 9 | **Sedang** | Tipe "Lainnya" tanpa sub-field | Spec redesign menyebutkan field teks bebas untuk deskripsi tipe — belum ada. |
| 10 | **Sedang** | Design preset hilang di UI | apple, linear, stripe, notion, vercel ada di types tapi tidak di StackStep. |
| 11 | **Rendah** | Accordion label membingungkan | Teks `▶ ▼ Tambah konteks opsional` — dua simbol sekaligus. |
| 12 | **Rendah** | Step summary truncated | `max-w-[60px] truncate` di header — "Developer" jadi tidak terbaca jelas. |
| 13 | **Rendah** | Komponen legacy tidak dihapus | IdeaInput, ClarificationStep, PresetSelector masih ada tapi tidak dipakai. |
| 14 | **Rendah** | `clarifications` selalu `{}` | Field legacy platform/monetization/scope tidak dikumpulkan lagi dari form baru. |

---

## Penilaian & Area yang Kurang

### Kekuatan 💪

1. **Struktur flow sudah matang** — 4 step + confirm mengikuti prinsip progressive disclosure dengan baik
2. **Adaptif per tipe produk** — pertanyaan Step 2 benar-benar berbeda per kategori, bukan generic textarea
3. **Guidance UX kuat** — contoh klik, chips, "Cocok jika", smart preset, estimasi waktu
4. **Visual identity konsisten** — dark dev-tool aesthetic dengan lime accent terasa premium dan on-brand
5. **Non-linear editing** — user bisa kembali edit step sebelumnya dari header atau confirm screen
6. **Smart defaults** — SaaS populer, Next.js pre-selected, stage-driven doc presets

### Kelemahan & Peluang Perbaikan 🔧

#### A. Integritas Data (Prioritas Tertinggi)

- Sinkronkan **Zod schema API** dengan semua opsi di `types.ts` / form
- Kirim **`selectedDocs`** dari `GenerationProgress` ke API
- Masukkan **database, deployment, stage, productType** ke payload generation (bukan hanya string `idea`)
- Validasi panjang `idea` min 50 char — dengan 1 field pendek bisa gagal diam-diam

#### B. UX & Conversion

- **Tipe "Lainnya"** butuh input bebas — saat ini guidance "Cocok: —" tidak membantu
- **Progressive reveal terlalu permisif** — pertimbangkan require minimal 2–3 field core sebelum lanjut, atau warning di confirm jika quality = Poor
- **Visual preview design style** — masih teks + simbol, belum ada color swatch atau mini mockup seperti di spec redesign
- **Sub-kategori framework** — user mungkin bingung memilih frontend vs backend (hanya satu yang tersimpan)
- **Konfirmasi sebelum generate** tidak menampilkan full context — hanya 3 baris summary

#### C. Polish & Trust

- Fix **hydration error** Navbar — mengurangi kepercayaan di dev dan bisa affect production
- **Mobile step indicator** terlalu minimal — pertimbangkan label singkat atau tooltip
- **Animasi transisi antar step** — saat ini instant swap, terasa abrupt
- **Persist draft** — tidak ada localStorage/autosave; refresh = hilang semua input
- **Accessibility** — tooltip pakai `role="button"` manual; perlu audit keyboard nav & aria labels

#### D. Business Logic

- Free tier bisa pilih 8 dokumen di UI — apakah tier enforcer di backend benar-benar membatasi? (perlu verifikasi `tier-enforcer.ts` terpisah dari UI)
- Tidak ada **preview biaya** atau penjelasan tier di dalam form
- **Fork flow** dari dashboard (`sessionStorage`) ada tapi tidak terdokumentasi di UI

---

## Data Model Lengkap (Referensi Cepat)

### ProductType
`saas | marketplace | mobile | api | portfolio | internal | ecommerce | ai-app | other`

### ProjectStage
`idea | prototype | production`

### ContextData Keys
`targetUser, mainProblem, coreFeatures, freeText, pricingModel, marketplaceSides, buyerDesc, sellerDesc, transactionType, category, platforms, offlineFirst, nativeFeatures, targetDev, authMethod, inputOutput, deploymentTarget, stackHighlight, audienceType, caseStudy, teamSize, replacesTool, integrations, productType, salesChannel, aiUseCase, aiModel, aiPrivacy, productName, referenceProducts, antiFeatures, launchTimeline`

### FileKey (8 dokumen)
`prd, context, plan, design-system, agents, production-hardening, scale-performance, growth-quality`

---

## Prompt Brainstorming untuk AI

Gunakan blok di bawah saat briefing AI untuk pengembangan lanjutan:

```
Konteks: Saya punya form wizard /generate di ArroBuild (Next.js 15, dark theme, lime accent).
Baca form-plan.md untuk detail lengkap.

Fokus pengembangan: [isi fokus, contoh: "fix API schema sync" / "tambah draft autosave" / "design preview swatches"]

Constraint:
- Minimalkan scope, ikuti pola komponen existing di src/components/generate/
- Bahasa UI: Bahasa Indonesia
- Jangan ubah flow 4 step kecuali diminta

Tugas: [deskripsikan tugas spesifik]
```

---

## Checklist Perbaikan yang Disarankan

```
Prioritas 1 (Blocker):
[ ] Update GenerationInputSchema di route.ts = semua Framework, Design, AgentTool dari types.ts
[ ] Tambah selectedDocs ke fetch body di GenerationProgress.tsx
[ ] Masukkan database/deployment ke presets atau idea string

Prioritas 2 (UX):
[ ] Field teks untuk product type "other"
[ ] Tampilkan warning di Confirm jika context quality = Poor
[ ] Perbaiki hydration error Navbar.tsx

Prioritas 3 (Polish):
[ ] Hapus komponen legacy (IdeaInput, ClarificationStep, PresetSelector)
[ ] Tambah design presets yang hilang (apple, linear, dll) atau hapus dari types
[ ] Autosave draft ke localStorage
[ ] Animasi transisi antar step
[ ] Perbaiki label accordion (▶ vs ▼)
```

---

## Referensi Visual

Screenshot confirm screen dari testing: `form-plan-step1.png` (tersimpan di environment testing).

**Wireframe ASCII ringkas seluruh flow:**

```
┌─────────────────────────────────────────────────────────┐
│ [Navbar] ArroBuild          Harga | Docs | Masuk        │
├─────────────────────────────────────────────────────────┤
│ ← ArroBuild    [◉Tipe]─[◉Cerita]─[◉Stack]─[○Dokumen]  75%│
│ ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  STEP N OF 4 — [NAMA STEP]                              │
│  H1: Pertanyaan utama                                   │
│  Sub: Guidance singkat                                  │
│                                                         │
│  [ Konten step — kartu / input / chips ]                │
│                                                         │
│  [← Kembali]              [Lanjut → / Generate →]       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

*Dokumen ini dibuat dari analisis kode + testing UI langsung. Update dokumen ini setiap kali ada perubahan signifikan pada form `/generate`.*
