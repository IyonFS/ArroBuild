# ArroBuild — Design System

**Version:** 1.0  
**Theme:** Dark mode first  
**Inspiration:** Linear, Vercel, referensi dashboard dark dengan green accent

---

## 1. Brand Identity

### Logo
- **Mark:** Panah ke kanan yang tegas — melambangkan "Arro" (arrow) dan "Build" (forward momentum)
- **Shape:** Rounded square 40×40px, background `#22c55e`, stroke hitam `stroke-width: 2.5`
- **Wordmark:** "ArroBuild" — weight 500, letter-spacing -0.3px
- **Usage:** Mark + wordmark untuk header. Mark saja untuk favicon dan app icon.

### Brand Voice
- **Tone:** Profesional tapi langsung. Tidak bertele-tele.
- **Language:** Bahasa developer — gunakan terminologi yang familiar (scaffold, boilerplate, agent, prompt)
- **Avoid:** Kata-kata marketing yang hiperbolis. Biarkan produk yang bicara.

---

## 2. Color System

### Foundation Colors

| Token | Hex | Penggunaan |
|---|---|---|
| `bg-base` | `#0f1117` | Background utama halaman |
| `bg-surface` | `#151a27` | Surface card, sidebar, modal |
| `bg-card` | `#1a2035` | Card dalam card, nested elements |
| `bg-border` | `#1e2a40` | Border, divider, subtle separator |
| `bg-hover` | `#1e2a40` | Hover state background |

### Green (Primary / Brand)

| Token | Hex | Penggunaan |
|---|---|---|
| `green-500` | `#22c55e` | Primary button, active state, CTA, highlight |
| `green-600` | `#16a34a` | Button hover state, icon accent |
| `green-900` | `#14532d` | Badge background, subtle green fills |
| `green-text` | `#4ade80` | Text on green-900 background, success text |
| `green-muted` | `#166534` | Badge border, subtle borders |

### Text Colors

| Token | Hex | Penggunaan |
|---|---|---|
| `text-primary` | `#f1f5f9` | Heading, important text |
| `text-secondary` | `#94a3b8` | Body text, descriptions |
| `text-tertiary` | `#475569` | Labels, captions, placeholders |
| `text-disabled` | `#334155` | Disabled state text |

### Semantic Colors

| Token | Usage | Background | Text | Border |
|---|---|---|---|---|
| Success | Generated, complete | `#14271c` | `#4ade80` | `#166534` |
| Info | Processing, loading | `#0c1a2e` | `#60a5fa` | `#1e3a5f` |
| Warning | Draft, pending | `#2a1a04` | `#fbbf24` | `#854d0e` |
| Danger | Error, failed | `#2a0a0a` | `#f87171` | `#7f1d1d` |

### Usage Rules
- Jangan gunakan warna hijau untuk lebih dari 1 elemen per viewport yang tidak terkait
- White/light text hanya pada background gelap — tidak pernah sebaliknya
- Border selalu lebih gelap 1 step dari background yang dibungkusnya
- Semantic colors hanya untuk status — jangan gunakan sebagai dekorasi

---

## 3. Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

| Role | Size | Weight | Color | Line Height |
|---|---|---|---|---|
| Display | 36px / 2.25rem | 500 | `#ffffff` | 1.15 |
| Heading 1 | 28px / 1.75rem | 500 | `#ffffff` | 1.2 |
| Heading 2 | 20px / 1.25rem | 500 | `#ffffff` | 1.3 |
| Heading 3 | 16px / 1rem | 500 | `#e2e8f0` | 1.4 |
| Body Large | 15px | 400 | `#94a3b8` | 1.6 |
| Body | 14px | 400 | `#94a3b8` | 1.6 |
| Small | 13px | 400 | `#64748b` | 1.5 |
| Caption | 12px | 400 | `#475569` | 1.4 |
| Label | 11px | 500 | `#475569` | 1.4 |
| Mono | 13px | 400 | `#94a3b8` | 1.6 |

### Typography Rules
- Maksimal 2 weight: 400 (regular) dan 500 (medium). Tidak perlu 600 atau 700.
- Letter-spacing negatif hanya untuk heading (-0.2px hingga -0.5px)
- Jangan center-align body text panjang — hanya untuk heading dan taglines pendek
- Code dan path selalu `font-mono` dengan background `#1a2035`

---

## 4. Spacing System

Berbasis grid 4px.

| Token | Value | Penggunaan |
|---|---|---|
| `space-1` | 4px | Gap minimal, icon padding |
| `space-2` | 8px | Gap antar elemen kecil |
| `space-3` | 12px | Gap antar elemen form |
| `space-4` | 16px | Padding dalam card kecil |
| `space-5` | 20px | Gap antar section dalam card |
| `space-6` | 24px | Padding card standar |
| `space-8` | 32px | Gap antar card |
| `space-10` | 40px | Section padding |
| `space-12` | 48px | Page section gap |

---

## 5. Border Radius

| Token | Value | Penggunaan |
|---|---|---|
| `radius-sm` | 4px | Tag, chip kecil, subtle rounding |
| `radius-md` | 8px | Button, input, badge |
| `radius-lg` | 12px | Card standar, dropdown |
| `radius-xl` | 16px | Card besar, modal |
| `radius-2xl` | 24px | Outer container, featured card |
| `radius-full` | 9999px | Pill badge, avatar, toggle |

---

## 6. Component Guidelines

### Button

```
Primary   → bg #22c55e, text #052e16, hover bg #16a34a, radius-md, px-4 py-2
Secondary → bg transparent, border 1px #1e2a40, text #e2e8f0, hover bg #151a27
Ghost     → bg transparent, border 1px #166534, text #4ade80
Danger    → bg transparent, border 1px #7f1d1d, text #f87171
Disabled  → opacity 40%, cursor not-allowed, tidak ada hover effect
```

**Rules:**
- Primary button maksimal 1 per section/card
- Selalu ada hover state yang jelas
- Loading state: spinner kiri + text "Generating..."
- Ukuran: sm (py-1.5 px-3), md (py-2 px-4), lg (py-2.5 px-5)

### Input & Textarea

```
bg: #0f1117
border: 1px solid #1e2a40
border-focus: 1px solid #22c55e (dengan ring: 0 0 0 3px rgba(34,197,94,0.1))
text: #f1f5f9
placeholder: #475569
radius: radius-md (8px)
padding: py-2.5 px-3
```

### Card

```
bg: #151a27
border: 1px solid #1e2a40
radius: radius-xl (16px)
padding: 20px 24px (md), 16px 20px (sm)
```

**Card variants:**
- Default: `bg-surface` + border
- Elevated: `bg-card` (sedikit lebih terang) + border
- Interactive: default + hover `border-color: #22c55e` dengan transition 150ms
- Featured: border 2px `#22c55e`

### Badge / Status Pill

```
padding: 3px 10px
border-radius: radius-full
font-size: 11px
font-weight: 500

Generated  → bg #14271c, text #4ade80, border #166534
Processing → bg #0c1a2e, text #60a5fa, border #1e3a5f
Draft      → bg #2a1a04, text #fbbf24, border #854d0e
Error      → bg #2a0a0a, text #f87171, border #7f1d1d
```

### Navigation Sidebar

```
width: 240px
bg: #0f1117 (sama dengan page bg, tidak ada border kanan)
separator: border-right 1px solid #1e2433

Nav item:
  - padding: 7px 12px
  - radius: radius-md (8px)
  - text: #64748b
  - icon: 16px, warna sama dengan text
  - hover: bg #151a27, text #e2e8f0
  - active: bg #14271c, text #4ade80, icon #4ade80
```

### Progress Indicator (Generation Flow)

```
Track: bg #1e2a40, height 4px, radius-full
Fill: bg #22c55e, transition: width 300ms ease
File item states:
  - Pending: icon ○, text #475569
  - Generating: icon spinner (green), text #94a3b8
  - Done: icon ✓ (green), text #f1f5f9
```

### Code / Markdown Preview

```
bg: #0f1117
border: 1px solid #1e2433
radius: radius-lg (12px)
font: font-mono, 13px
text: #94a3b8

Syntax highlighting:
  - Heading: #f1f5f9
  - Code inline: bg #1a2035, text #4ade80
  - Bold: #e2e8f0
  - Link: #60a5fa
  - HR/border: #1e2433
```

---

## 7. Iconography

**Library:** Tabler Icons (outline only)

**Sizing:**
- 16px — inline dalam text, label, nav item
- 20px — button icon, card action
- 24px — feature icon, empty state
- 32px — hero section accent

**Color:**
- Default: `#64748b` (text-tertiary)
- Active/accent: `#4ade80` (green-text)
- Muted: `#334155`

**Icon mapping untuk ArroBuild:**

| Konsep | Icon |
|---|---|
| Project / Idea | `ti-bulb` |
| PRD | `ti-file-description` |
| Design System | `ti-palette` |
| User Flow | `ti-route` |
| Database | `ti-database` |
| Tech Stack | `ti-stack-2` |
| AI Agent | `ti-robot` |
| Coding Rules | `ti-code` |
| Tasks | `ti-checklist` |
| Roadmap | `ti-map` |
| Export | `ti-download` |
| Generate | `ti-rocket` |
| Context | `ti-file-text` |

---

## 8. Animation & Transition

**Philosophy:** Fungsional, bukan dekoratif. Animasi ada untuk memberi feedback, bukan untuk terlihat keren.

| Elemen | Duration | Easing |
|---|---|---|
| Hover state (bg, border) | 150ms | `ease` |
| Card expand/collapse | 200ms | `ease-out` |
| Modal open | 200ms | `ease-out` |
| Page transition | 250ms | `ease-in-out` |
| Progress bar fill | 300ms | `ease` |
| Toast appear | 250ms | `ease-out` |
| Skeleton loading | 1.5s | `ease-in-out` (pulse) |

**Rules:**
- Jangan animasi lebih dari 2 properti sekaligus pada element yang sama
- Selalu sediakan `prefers-reduced-motion` fallback
- Tidak ada parallax, tidak ada particle effects, tidak ada animasi yang tidak ada hubungannya dengan interaksi user

---

## 9. Layout & Grid

### Page Layout
```
max-width: 1280px
margin: 0 auto
padding: 0 24px (mobile), 0 48px (tablet+)
```

### Sidebar Layout (App)
```
sidebar: 240px fixed
main content: calc(100% - 240px)
mobile: sidebar collapse menjadi overlay
```

### Card Grid
```
2 kolom: grid-cols-2, gap-4 (default)
3 kolom: grid-cols-3, gap-4 (wide screens)
1 kolom: grid-cols-1 (mobile)
```

### Z-Index Scale
```
base: 0
card: 1
dropdown: 100
sticky header: 200
modal overlay: 300
modal content: 301
toast: 400
```

---

## 10. Dark Mode

ArroBuild adalah **dark mode only** — tidak ada light mode toggle.

**Alasan:** Target user (developer, vibe coder) secara umum menggunakan dark mode. Dark mode first juga konsisten dengan produk referensi (Linear, Vercel, Cursor).

Jika di masa depan light mode diperlukan, token warna di atas sudah terstruktur untuk memudahkan theming.

---

## 11. Aksesibilitas

- Contrast ratio minimal 4.5:1 untuk text biasa, 3:1 untuk large text
- Semua interactive element harus punya focus ring yang visible: `ring-2 ring-green-500/20`
- Jangan rely pada warna saja untuk menyampaikan informasi — selalu ada label atau ikon pendamping
- Keyboard navigable: semua flow bisa diselesaikan tanpa mouse
- ARIA labels untuk semua icon-only buttons
