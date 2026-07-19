/**
 * ArroDesign — Prompt Engine
 * Zona-Out-Zoom-In methodology + confidence tagging
 * Fase 2 MVP: 1 gambar ATAU 1 URL → design.md + prompt Stitch
 *
 * Model: Qwen3-VL-235B (vision) via OpenRouter | Flagship text model (URL path)
 * Estimasi kredit: ~150–250 per analisis
 */

export const ARRODESIGN_CREDITS = {
  image: 180,  // vision call langsung — sedikit lebih hemat
  url: 220,    // fetch + search + analyze — lebih banyak langkah
} as const;

export type ArroDesignInputType = "image" | "url";

export interface ArroDesignInput {
  inputType: ArroDesignInputType;
  /** URL referensi (wajib untuk mode url) */
  referenceUrl?: string;
  /** Base64 data URL gambar (wajib untuk mode image) */
  imageDataUrl?: string;
  /** Konteks proyek dari ArroBuild (opsional) */
  projectContext?: string;
  /** Mode: dari proyek yang ada atau ide baru */
  mode?: "project" | "fresh";
}

export function estimateArroDesignCredits(inputType: ArroDesignInputType): number {
  return ARRODESIGN_CREDITS[inputType];
}

// ─── Analysis Prompt (sama untuk image & url — beda context gathering) ────────

export function buildArroDesignAnalysisPrompt(params: {
  inputType: ArroDesignInputType;
  referenceContext: string; // hasil dari vision atau fetch
  projectContext?: string;
}): string {
  const { inputType, referenceContext, projectContext } = params;

  const contextBlock = projectContext?.trim()
    ? `## Konteks Proyek (dari ArroBuild)\n${projectContext.trim()}\n`
    : "";

  return `Kamu adalah seorang Senior UI/UX Designer dan Frontend Professional. Bahasa output: Indonesia (teknis boleh English).

Tugasmu: Analisis referensi visual di bawah dan hasilkan **design.md terstruktur** + **prompt siap tempel ke Google Stitch**.

## ATURAN CONFIDENCE TAGGING — WAJIB DIPATUHI
Tandai SETIAP klaim dengan salah satu tag berikut:
- \`[EXTRACTED]\` — data benar-benar diambil dari referensi (warna hex dari gambar, teks asli dari situs, dll)
- \`[INFERRED]\` — dugaan terarah berdasarkan style industri/konteks (nama font yang mirip, spacing yang diestimasikan, dll)

Jangan pernah menyajikan inferensi sebagai fakta tanpa tag.

## DISCLAIMER WAJIB
Di awal output selalu tulis:
> ⚠️ Hasil ini **"terinspirasi dari"** referensi, bukan identik. Tag \`[EXTRACTED]\` = data nyata dari referensi. Tag \`[INFERRED]\` = dugaan terarah — verifikasi sebelum dipakai final.

${contextBlock}
## Referensi Visual
Tipe input: ${inputType === "image" ? "Screenshot / Gambar" : "URL Situs"}

${referenceContext}

---

## Instruksi Analisis — 3 Layer (Zoom-Out → Zoom-In)

### Layer 1: Zoom-Out — Cerita & Konsep
- Apa "cerita" atau kesan pertama dari desain ini? (modern, trustworthy, playful, minimal, dll)
- Siapa target audiensnya berdasarkan visual?
- Tone komunikasi: formal / santai / teknikal?

### Layer 2: Bahasa Desain — Token & Sistem
Ekstrak dengan confidence tag:

**Warna:**
- Background utama: #... \`[EXTRACTED/INFERRED]\`
- Background sekunder: #... \`[EXTRACTED/INFERRED]\`
- Warna primer (CTA/brand): #... \`[EXTRACTED/INFERRED]\`
- Warna aksen: #... \`[EXTRACTED/INFERRED]\`
- Text primary: #... \`[EXTRACTED/INFERRED]\`
- Text secondary: #... \`[EXTRACTED/INFERRED]\`
- Border/divider: #... \`[EXTRACTED/INFERRED]\`

**Tipografi:**
- Heading font: nama, weight, size range \`[EXTRACTED/INFERRED]\`
- Body font: nama, weight, size \`[EXTRACTED/INFERRED]\`
- Mono/code font (jika ada): \`[EXTRACTED/INFERRED]\`
- Line height dominan: \`[INFERRED]\`

**Spacing & Radius:**
- Border radius dominan: \`[INFERRED]\`
- Spacing unit (8px / 4px grid?): \`[INFERRED]\`
- Container max-width: \`[INFERRED]\`

**Gaya Visual:**
- Apakah ada glassmorphism / neumorphism / flat / skeuomorphic?
- Ada gradient? (arah, warna)
- Ada shadow? (offset, blur, warna)

### Layer 3: Zoom-In — Breakdown per Section
Untuk setiap section yang teridentifikasi:

#### Section [N]: [Nama Section]
- Layout: (grid/flex, kolom, alignment)
- Komponen: (button, card, badge, input, dll — dengan spesifikasi visual)
- Copy/teks kunci: (teks asli jika ada \`[EXTRACTED]\`, atau deskripsi placeholder \`[INFERRED]\`)
- Responsive notes: (bagaimana kemungkinan adaptasinya di mobile)

### Responsive & Motion
- Breakpoint utama yang terlihat: \`[INFERRED]\`
- Ada animasi/transition yang terindikasi?: \`[INFERRED]\`

### Component Library Hints
- Framework CSS yang kemungkinan dipakai: \`[INFERRED]\`
- Component library hints (shadcn/radix/material/custom): \`[INFERRED]\`

---

## Output Format — WAJIB IKUTI

Hasilkan dalam format ini (markdown):

\`\`\`markdown
# design.md — [Nama/Deskripsi Referensi]

> ⚠️ Hasil ini **"terinspirasi dari"** referensi, bukan identik. [EXTRACTED] = data nyata. [INFERRED] = dugaan terarah.

## 1. Konsep & Tone
[Isi Layer 1]

## 2. Color Tokens
| Token | Value | Confidence |
|---|---|---|
| --bg-primary | #... | [EXTRACTED/INFERRED] |
[... dst]

## 3. Typography
| Peran | Font | Weight | Size | Confidence |
|---|---|---|---|---|
| heading | ... | ... | ... | [EXTRACTED/INFERRED] |
[... dst]

## 4. Spacing & Shape
[Token spacing, radius, shadow]

## 5. Section Breakdown
[Layer 3 content]

## 6. Responsive Notes
[Responsive & Motion]

## 7. Component Library Hints
[Hints]

## 8. Content Checklist
- [ ] Verifikasi warna hex dengan color picker langsung di referensi
- [ ] Konfirmasi nama font (gunakan WhatTheFont atau browser devtools)
- [ ] Cek spacing dengan pengukuran langsung
- [ ] [Tambahan checklist spesifik berdasarkan analisis]
\`\`\`

---

## Stitch Prompt (Zoom-Out-Zoom-In Method)

Setelah design.md, hasilkan prompt untuk Google Stitch menggunakan format ini:

\`\`\`
### STITCH PROMPT — [Nama Section/Screen yang paling representatif]

**[ZOOM OUT — Product Vision]**
[Describe the overall product, target user, and design intent in 2-3 sentences]

**[DESIGN SYSTEM]**
Colors: [primary, secondary, accent, bg, text — gunakan hex dari analisis]
Typography: [heading font/weight, body font/size]
Border radius: [value]
Spacing unit: [value]
Visual style: [flat/glass/minimal/bold — deskripsi singkat]

**[ZOOM IN — Screen Specification]**
Screen name: [nama]
Layout: [deskripsi layout utama]
Key components:
- [Component 1: spesifikasi]
- [Component 2: spesifikasi]
[... dst]

**[INTERACTION HINTS]**
[Hover states, transitions, animasi jika relevan]

**[EXPORT]**
Framework target: Tailwind CSS + React
Output: Component code siap pakai
\`\`\`

PENTING: Hasilkan SEMUA bagian ini dalam satu response. Jangan potong di tengah.`;
}

// ─── URL Fetch Prompt — untuk ekstraksi konten dari HTML yang sudah difetch ──

export function buildArroDesignUrlContextPrompt(params: {
  url: string;
  fetchedHtml: string;
  tavilySearchResult?: string;
}): string {
  const { url, fetchedHtml, tavilySearchResult } = params;

  const htmlSnippet = fetchedHtml.slice(0, 8000); // batas konteks
  const searchBlock = tavilySearchResult
    ? `\n## Hasil Pencarian Eksternal (Tavily)\n${tavilySearchResult.slice(0, 2000)}\n`
    : "";

  return `Kamu adalah ekstractor konten web. Tugas: rangkum informasi visual dan konten dari halaman web berikut untuk dianalisis lebih lanjut.

URL: ${url}

## HTML Snippet (dipotong untuk konteks)
\`\`\`html
${htmlSnippet}
\`\`\`
${searchBlock}

Ekstrak dan rangkum:
1. **Palet warna dominan** yang terlihat dari class name Tailwind/CSS atau inline style (hex jika ada)
2. **Font families** yang disebutkan di CSS atau tag link
3. **Struktur halaman**: hero, navbar, section utama, footer — nama dan isi singkat
4. **Teks kunci**: headline, subheadline, CTA text (teks asli dari HTML)
5. **Komponen UI**: jenis button, card, badge, form yang teridentifikasi dari class names
6. **Library hints**: apakah ada class Tailwind, Bootstrap, Material, shadcn, dll?
7. **Brand/studio**: nama produk/studio jika ada (untuk referensi, BUKAN untuk copy)

Format output: markdown terstruktur, singkat dan padat. Tandai setiap item: [DARI_HTML] atau [DITEMUKAN_VIA_SEARCH].`;
}

// ─── Parser Output ─────────────────────────────────────────────────────────

export interface ArroDesignResult {
  designMd: string;
  stitchPrompt: string;
  rawOutput: string;
  inputType: ArroDesignInputType;
  creditsUsed: number;
}

export function parseArroDesignOutput(raw: string): {
  designMd: string;
  stitchPrompt: string;
} {
  // Pisahkan design.md dan stitch prompt
  const stitchMarker = raw.indexOf("### STITCH PROMPT");
  const altMarker = raw.indexOf("## Stitch Prompt");

  let designMd = raw;
  let stitchPrompt = "";

  const markerPos = stitchMarker !== -1 ? stitchMarker : altMarker;

  if (markerPos !== -1) {
    designMd = raw.slice(0, markerPos).trim();
    stitchPrompt = raw.slice(markerPos).trim();
  }

  // Bersihkan code fence dari design.md kalau ada
  const mdFence = designMd.match(/```markdown\s*([\s\S]*?)```/i);
  if (mdFence?.[1]) {
    designMd = mdFence[1].trim();
  }

  // Bersihkan fence dari stitch prompt
  const stitchFence = stitchPrompt.match(/```\s*([\s\S]*?)```/i);
  if (stitchFence?.[1]) {
    stitchPrompt = stitchFence[1].trim();
  }

  return {
    designMd: designMd || raw,
    stitchPrompt,
  };
}
