# ArroBuild Design System v2.0
**Status:** Active  
**Last Updated:** June 2026  
**Scope:** Web App — Landing Page, Learn Hub, Generate Flow, Docs, Dashboard, Tools

---

## Philosophy

ArroBuild bukan SaaS generik. Visual language-nya harus mencerminkan tiga hal:

- **Raw & Technical** — ini tools untuk developer, bukan marketing site
- **Gen-Z Energy** — bold, kontras tinggi, tidak takut whitespace besar
- **Trustworthy** — edukasi gratis butuh kredibilitas, bukan hype

Prinsip desain:
- Kontras tinggi selalu menang atas dekorasi
- Typography adalah UI — font sudah berbicara sebelum konten dibaca
- Mode gelap adalah default, light mode harus sama kuatnya
- Tidak ada gradients, tidak ada blur dekoratif, tidak ada shadow berlebihan

---

## Color System

### Brand Palette

| Token | Value | Penggunaan |
|---|---|---|
| `--color-lime` | `#CCFF00` | Primary CTA, active state, brand accent, progress |
| `--color-lime-dim` | `#AADA00` | Hover state dari lime, subtle lime fills |
| `--color-orange` | `#FF5C1A` | Secondary CTA, highlights, Learn path badges |
| `--color-orange-dim` | `#D94A12` | Hover state dari orange |

### Dark Mode Surfaces

| Token | Value | Penggunaan |
|---|---|---|
| `--color-bg-base` | `#0A0A0A` | Page background utama |
| `--color-bg-surface` | `#111111` | Card, panel, nav background |
| `--color-bg-elevated` | `#1A1A1A` | Elevated card, dropdown, modal |
| `--color-bg-hover` | `#252525` | Hover state pada surface |
| `--color-bg-overlay` | `rgba(0,0,0,0.6)` | Modal backdrop |

### Light Mode Surfaces

| Token | Value | Penggunaan |
|---|---|---|
| `--color-bg-base-light` | `#FAFAF5` | Page background utama |
| `--color-bg-surface-light` | `#FFFFFF` | Card, panel |
| `--color-bg-elevated-light` | `#F0F0E8` | Elevated section, code block |
| `--color-bg-hover-light` | `#E8E8E0` | Hover state |

### Text

| Token | Dark Mode | Light Mode | Penggunaan |
|---|---|---|---|
| `--color-text-primary` | `#F5F5EE` | `#0A0A0A` | Heading, body utama |
| `--color-text-secondary` | `rgba(255,255,255,0.5)` | `rgba(0,0,0,0.5)` | Subheading, deskripsi |
| `--color-text-tertiary` | `rgba(255,255,255,0.25)` | `rgba(0,0,0,0.25)` | Placeholder, metadata |
| `--color-text-lime` | `#CCFF00` | `#5C7A00` | Accent text, eyebrow label |
| `--color-text-orange` | `#FF5C1A` | `#C44010` | Secondary accent text |

> **Penting:** `#CCFF00` tidak terbaca di background putih/cream. Di light mode, gunakan `#5C7A00` untuk teks lime, dan `#C44010` untuk teks orange.

### Border

| Token | Dark Mode | Light Mode |
|---|---|---|
| `--color-border-default` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` |
| `--color-border-strong` | `rgba(255,255,255,0.15)` | `rgba(0,0,0,0.15)` |
| `--color-border-focus` | `#CCFF00` | `#5C7A00` |

### Semantic Colors

| Nama | Value | Penggunaan |
|---|---|---|
| Success | `#22C55E` | Konfirmasi, generated berhasil |
| Error | `#EF4444` | Validasi error, gagal |
| Warning | `#F59E0B` | Peringatan, coming soon |
| Info | `#3B82F6` | Informasi netral, tooltip |

### Aturan Penggunaan Warna

- **Lime** hanya untuk satu hal paling penting per halaman (primary CTA)
- **Orange** untuk secondary action dan Learn-related elements
- Jangan pakai keduanya berdampingan dalam satu komponen
- Background halaman selalu `--color-bg-base`, bukan warna lain
- Jangan taruh teks putih di atas lime — selalu teks hitam `#0A0A0A`

---

## Typography

### Font Stack

```css
--font-display: 'Unbounded', sans-serif;   /* Heading, Logo, CTA */
--font-body:    'JetBrains Mono', monospace; /* Body, Label, Eyebrow, Code */
```

> ArroBuild hanya menggunakan **dua font**. Tidak ada font ketiga. Konsistensi ini yang membuat identity kuat.

### Kenapa Unbounded?

Unbounded adalah variable font dengan karakter geometric yang sangat tegas — lebar, square, tidak ada stroke dekoratif. Di weight 900 ia terasa seperti headline majalah teknis. Di weight 300 ia tetap unik. Kombinasi ini menciptakan bold/thin contrast yang dicari.

### Kenapa JetBrains Mono untuk Body?

Karena ArroBuild adalah developer tool — mono font sebagai body text justru memperkuat identity teknis. Di ukuran 13–14px dengan line-height 1.7, JetBrains Mono tetap sangat readable. Ini juga diferensiasi visual dari SaaS lain yang pakai Inter/Geist.

### Type Scale

| Role | Font | Size | Weight | Letter Spacing | Line Height |
|---|---|---|---|---|---|
| Display / Hero H1 | Unbounded | 48–64px | 900 | -0.03em | 1.0 |
| H1 | Unbounded | 36px | 800 | -0.02em | 1.05 |
| H2 | Unbounded | 26px | 700 | -0.02em | 1.1 |
| H3 | Unbounded | 18px | 600 | -0.01em | 1.2 |
| H4 | Unbounded | 14px | 700 | 0 | 1.3 |
| Body Large | JetBrains Mono | 14px | 400 | 0 | 1.75 |
| Body Default | JetBrains Mono | 13px | 400 | 0 | 1.7 |
| Body Small | JetBrains Mono | 12px | 400 | 0 | 1.65 |
| Label / Eyebrow | JetBrains Mono | 10–11px | 700 | 0.12–0.15em | 1.0 |
| Code Inline | JetBrains Mono | 12px | 500 | 0 | 1.5 |
| Caption | JetBrains Mono | 11px | 400 | 0.05em | 1.5 |

### Catatan Tipografi

- **Heading selalu sentence case** — bukan Title Case, bukan ALL CAPS (kecuali label/eyebrow)
- Eyebrow label: 10–11px, weight 700, letter-spacing 0.12em, uppercase, warna lime/orange
- Body text menggunakan weight 300 untuk teks panjang/paragraf, weight 400 untuk UI text
- Unbounded di size besar: kurangi letter-spacing sampai -0.03em agar tight dan powerful
- Jangan mix Unbounded weight 900 dan weight 300 dalam satu line — gunakan di element berbeda

---

## Spacing System

Base unit: `4px`

| Token | Value | Penggunaan |
|---|---|---|
| `--space-1` | 4px | Gap antar inline elements |
| `--space-2` | 8px | Padding kecil, gap icon-label |
| `--space-3` | 12px | Gap komponen dalam card |
| `--space-4` | 16px | Padding card internal |
| `--space-5` | 20px | Gap antar komponen |
| `--space-6` | 24px | Section padding kecil |
| `--space-8` | 32px | Gap antar section elements |
| `--space-10` | 40px | Section padding |
| `--space-12` | 48px | Gap antar major sections |
| `--space-16` | 64px | Section vertical padding |
| `--space-24` | 96px | Hero padding, large sections |

---

## Border Radius

| Token | Value | Penggunaan |
|---|---|---|
| `--radius-sm` | 4px | Badge, tag, label kecil |
| `--radius-md` | 8px | Button, input, small card |
| `--radius-lg` | 12px | Card standard |
| `--radius-xl` | 16px | Panel besar, modal |
| `--radius-2xl` | 24px | Feature card hero |
| `--radius-full` | 9999px | Pill, avatar |

> ArroBuild tidak pakai sharp corners (0px radius) kecuali untuk elemen dekoratif seperti divider atau border accent tipis.

---

## Components

### Button

**Primary (Lime)**
```css
background: #CCFF00;
color: #0A0A0A;
font-family: 'JetBrains Mono', monospace;
font-size: 13px;
font-weight: 700;
padding: 12px 24px;
border-radius: 8px;
border: none;
letter-spacing: 0.04em;
```
Hover: `background: #AADA00`  
Active: `transform: scale(0.98)`

**Secondary (Outline)**
```css
background: transparent;
color: var(--color-text-primary);
border: 1.5px solid var(--color-border-strong);
font-family: 'JetBrains Mono', monospace;
font-size: 13px;
font-weight: 600;
padding: 11px 24px;
border-radius: 8px;
```
Hover: `border-color: var(--color-text-primary)`

**Ghost**
```css
background: transparent;
color: var(--color-text-secondary);
font-family: 'JetBrains Mono', monospace;
font-size: 12px;
font-weight: 500;
padding: 8px 16px;
border-radius: 6px;
border: none;
```
Hover: `background: var(--color-bg-hover)`

**Aturan:**
- Satu halaman maksimal satu Primary button di area yang sama
- Jangan gunakan orange untuk button primary — orange hanya untuk Learn-related CTA
- Button teks menggunakan sentence case, kecuali jika sangat pendek (2 kata)

---

### Badge / Tag

```css
font-family: 'JetBrains Mono', monospace;
font-size: 10px;
font-weight: 700;
letter-spacing: 0.1em;
text-transform: uppercase;
padding: 3px 10px;
border-radius: 4px;
```

| Variant | Background | Text |
|---|---|---|
| Lime (Free, Active) | `#CCFF00` | `#0A0A0A` |
| Orange (New, Learn) | `#FF5C1A` | `#FFFFFF` |
| Ghost Dark | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.45)` |
| Ghost Light | `rgba(0,0,0,0.06)` | `rgba(0,0,0,0.45)` |
| Soft Lime | `rgba(204,255,0,0.12)` | `#CCFF00` |
| Dark Fill | `#1A1A1A` | `rgba(255,255,255,0.5)` |

---

### Card

**Standard Card**
```css
background: var(--color-bg-surface);     /* dark: #111111 */
border: 0.5px solid var(--color-border-default);
border-radius: 14px;
padding: 20px 24px;
```

**Accent Card** (card dengan top border warna)
```css
/* tambahkan ke Standard Card */
border-top: 2.5px solid #CCFF00;  /* atau #FF5C1A untuk Learn card */
border-radius: 0 0 14px 14px;      /* radius hanya di bawah */
```

**Feature Card** (hero section)
```css
background: var(--color-bg-elevated);
border: 0.5px solid var(--color-border-default);
border-radius: 20px;
padding: 28px 32px;
```

**Aturan:**
- Card tidak punya shadow — border adalah satu-satunya pemisah
- Card hover: `border-color: var(--color-border-strong)`, transisi 150ms
- Jangan nest card dalam card

---

### Input / Form

```css
background: var(--color-bg-elevated);
border: 0.5px solid var(--color-border-default);
border-radius: 8px;
padding: 12px 16px;
font-family: 'JetBrains Mono', monospace;
font-size: 13px;
font-weight: 400;
color: var(--color-text-primary);
width: 100%;
outline: none;
```
Focus: `border-color: #CCFF00` (lime), `box-shadow: 0 0 0 3px rgba(204,255,0,0.1)`  
Error: `border-color: #EF4444`  
Placeholder: `color: var(--color-text-tertiary)`

**Textarea (Generate input)**
```css
/* sama dengan Input, tambahkan: */
min-height: 120px;
resize: vertical;
line-height: 1.7;
```

---

### Code Block

```css
background: #0D0D0D;              /* lebih gelap dari surface */
border: 0.5px solid rgba(255,255,255,0.07);
border-radius: 10px;
padding: 16px 20px;
font-family: 'JetBrains Mono', monospace;
font-size: 12px;
font-weight: 400;
line-height: 1.75;
overflow-x: auto;
```

Syntax highlight colors:
- Keyword: `#CCFF00` (lime)
- String: `#FF5C1A` (orange)
- Comment: `rgba(255,255,255,0.25)`
- Variable: `#F5F5EE`
- Property: `#79B8FF`
- Number: `#B5CEA8`

---

### Navigation

```css
/* Nav container */
display: flex;
align-items: center;
justify-content: space-between;
padding: 0 24px;
height: 60px;
border-bottom: 0.5px solid var(--color-border-default);
background: var(--color-bg-base);
position: sticky;
top: 0;
z-index: 100;
```

**Logo:**
```css
font-family: 'Unbounded', sans-serif;
font-size: 16px;
font-weight: 900;
letter-spacing: -0.02em;
color: var(--color-text-primary);
```
Aksen pada "Build": warna lime di dark mode, tetap hitam di light mode.

**Nav links:**
```css
font-family: 'JetBrains Mono', monospace;
font-size: 12px;
font-weight: 500;
color: var(--color-text-secondary);
```
Active/hover: `color: var(--color-text-primary)`

---

### Progress / Step Indicator

Digunakan di Generate flow (step 1–5):
```css
/* Step dot */
width: 8px;
height: 8px;
border-radius: 50%;
background: var(--color-border-strong);   /* inactive */

/* Active */
background: #CCFF00;
width: 24px;
border-radius: 4px;   /* pill saat active */

/* Connector line */
height: 1px;
background: var(--color-border-default);
flex: 1;
```

---

### Eyebrow Label

Digunakan di atas heading section untuk memberi konteks:
```css
font-family: 'JetBrains Mono', monospace;
font-size: 10px;
font-weight: 700;
letter-spacing: 0.14em;
text-transform: uppercase;
color: #CCFF00;           /* atau #FF5C1A untuk Learn sections */
margin-bottom: 12px;
display: flex;
align-items: center;
gap: 8px;
```
Prefix karakter: `—` (em dash) sebelum teks, atau nomor section `01.`

---

## Iconography

Gunakan **Tabler Icons** (outline only, bukan filled).

```html
<i class="ti ti-[name]" aria-hidden="true"></i>
```

Ukuran standar:
- Inline dengan teks: `font-size: 16px`
- Card icon: `font-size: 20px`
- Feature icon: `font-size: 24px`

Icon selalu inherit warna dari parent. Jangan hardcode warna icon secara terpisah kecuali untuk emphasis khusus.

Icons yang sering dipakai di ArroBuild:
- Generate: `ti-sparkles`, `ti-wand`
- Learn: `ti-school`, `ti-book`, `ti-player-play`
- Integrate: `ti-plug`, `ti-api`, `ti-git-branch`
- File output: `ti-file-text`, `ti-download`, `ti-zip`
- Status: `ti-check`, `ti-x`, `ti-clock`, `ti-lock`
- Nav: `ti-menu-2`, `ti-arrow-right`, `ti-chevron-down`

---

## Motion & Animation

ArroBuild menggunakan animasi minimal dan fungsional — bukan dekoratif.

| Elemen | Durasi | Easing |
|---|---|---|
| Button hover/active | 120ms | ease-out |
| Card hover | 150ms | ease-out |
| Input focus ring | 150ms | ease-out |
| Modal open | 200ms | ease-out |
| Page transition | 250ms | ease-in-out |
| Progress bar fill | 400ms | ease-in-out |
| Generate progress (per file) | real-time streaming | — |

```css
/* Default transition untuk semua interactive elements */
transition: all 150ms ease-out;

/* Hanya property yang berubah — jangan pakai `all` untuk performance */
transition: border-color 150ms ease-out, background 150ms ease-out;
```

GSAP digunakan untuk:
- Hero section entrance animation (landing page)
- Learning path card stagger entrance
- Generate progress file-by-file reveal

---

## Dark / Light Mode

ArroBuild menggunakan **CSS custom properties** + class toggle di `<html>`:

```css
html { color-scheme: dark; }        /* default dark */
html.light { color-scheme: light; }
```

Toggle disimpan di `localStorage('arrobuild-theme')`.

**Aturan:**
- Dark mode adalah default dan primary experience
- Light mode harus sama lengkapnya — tidak ada elemen yang "hilang" di light
- Toggle button selalu ada di navbar (ikon sun/moon)
- Logo tetap menggunakan warna primary (bukan lime) di light mode untuk readability

---

## Layout Grid

```css
/* Container utama */
max-width: 1200px;
margin: 0 auto;
padding: 0 24px;

/* Section padding */
padding-top: 96px;
padding-bottom: 96px;

/* Content max-width untuk readability */
.content-narrow { max-width: 720px; }   /* docs, learn lesson */
.content-medium { max-width: 960px; }   /* feature sections */
.content-wide   { max-width: 1200px; }  /* landing, dashboard */
```

**Breakpoints:**

| Nama | Width | Keterangan |
|---|---|---|
| Mobile | < 640px | Single column, padding 16px |
| Tablet | 640–1024px | 2 column grid, padding 20px |
| Desktop | > 1024px | Full layout, padding 24px |
| Wide | > 1280px | Max-width container aktif |

---

## Page-Specific Notes

### Landing Page `/`
- Hero: Unbounded 900 display, min 48px, full viewport height
- Background `#0A0A0A` dengan subtle grid pattern (1px lines, opacity 0.03)
- Three-pillar section: 3 equal cards dengan accent border top berbeda warna
- Sample output: code block dark dengan syntax highlight ArroBuild

### Learn Hub `/learn`
- Path cards menggunakan orange accent (Learn = orange)
- Progress bar menggunakan lime
- Lesson content: narrow max-width 720px, generous line-height 1.8

### Generate Flow `/generate`
- Step indicator prominent di top
- Setiap step punya background panel elevated
- Real-time progress saat generate: per-file progress dengan nama file dan status

### Dashboard `/dashboard`
- Table/list layout, bukan card grid
- Status badge per project
- Quick action buttons di setiap row

---

## Do & Don't

| Do | Don't |
|---|---|
| Satu primary CTA per section | Dua lime button berdampingan |
| Teks hitam di atas lime | Teks putih di atas lime |
| Eyebrow label sebelum heading | Heading tanpa konteks |
| Mono font untuk semua body text | Mix sans-serif dan mono |
| Card dengan border tipis | Card dengan shadow |
| Unbounded hanya untuk heading | Unbounded untuk body text |
| Orange untuk Learn actions | Orange untuk Generate actions |
| Kontras tinggi selalu | Muted everything |

---

*Design system ini adalah living document. Update setiap ada komponen atau pattern baru yang distabilkan.*
