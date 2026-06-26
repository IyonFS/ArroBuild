/**
 * design-system.ts — Tier-aware design-system.md prompt builder (v3)
 *
 * PRO:     Design system document dengan color palette, typography, spacing, dan component patterns dasar.
 * PRO_MAX: Sangat lengkap dengan dark/light mode tokens, accessibility requirements, dan tailwind config extension.
 */

import {
  buildBaseContext,
  type GenerationInput,
  type DesignPreset,
} from "./shared";
import type { V3Tier } from "../tier-enforcer";

const DESIGN_PRESET_TRAITS: Record<DesignPreset, string> = {
  "neo-brutalist":
    "Bold borders, high contrast black/white, geometric sans-serif (e.g. Space Grotesk), offset box shadows, visible structure, raw and confident aesthetic",
  minimal:
    "Generous whitespace, single accent color, system font stack, no decorative elements, content-first layout, extreme clarity",
  corporate:
    "Professional blues/navys, Inter font, trust-building layout, conservative spacing, table-heavy data presentation, enterprise polish",
  bold:
    "Vibrant color palette, expressive typography, playful micro-animations, gradient accents, high visual energy, consumer-friendly",
  glassmorphism:
    "Frosted glass panels (backdrop-filter blur), translucent backgrounds, subtle borders, depth layers, dark or gradient backgrounds",
  dashboard:
    "Dense information hierarchy, compact spacing, data table emphasis, chart-ready layout, sidebar navigation, monospace for numbers",
  apple:
    "SF Pro / system-ui font, generous whitespace, subtle shadows, rounded-xl corners, neutral warm palette (grays), minimal decoration, clarity over density",
  linear:
    "Inter font, dark mode first, purple accent (#5E5CE6), monospace code blocks, tight spacing, muted backgrounds, borderless tables, velocity-focused feel",
  stripe:
    "Inter font, clean white/light base, indigo/violet accent (#635BFF), heavy use of tables, enterprise feel, strong type hierarchy, subtle border shadows",
  notion:
    "Inter font, minimal styling, serif headings (or system serif), lots of whitespace, neutral light grays, inline code, simplicity-first",
  vercel:
    "Geist font, dark mode first, white accent on dark, monospace heavy, sharp corners, high contrast, builder/engineering aesthetic",
  "ai-recommend":
    "AI will choose the best design style based on product context. Let the output be creative and appropriate for the product type.",
};

const DEPTH_INSTRUCTIONS: Record<V3Tier, string> = {
  FREE: ``, // Tidak tersedia untuk FREE
  PRO: `
Buat design system document dengan:
- Color palette (primary, secondary, neutral, semantic)
  Sertakan hex values yang konsisten dengan gaya desain.
- Typography: font family, size scale, weight guide
- Spacing system (base unit)
- Component patterns: Button, Card, Input, Badge, Navigation
  Format sebagai CSS custom properties yang siap dipakai
- Responsive breakpoints`,

  PRO_MAX: `
Buat design system document yang sangat lengkap:
- Color system dengan dark/light mode tokens
  Semua sebagai CSS custom properties (--color-primary, dll)
- Typography scale lengkap dengan line-height dan letter-spacing
- Spacing & layout system (grid, container, breakpoints)
- Component library dengan spesifikasi lengkap:
  Button (semua variants + states), Card (semua variants),
  Input/Form (dengan validation states), Badge/Tag, Navigation,
  Modal/Dialog, Toast/Alert, Loading states
- Animation & transition tokens
- Icon system recommendation
- Accessibility requirements (contrast ratio, focus states)
- Implementation-ready: semua token dalam format CSS variables yang langsung bisa dipakai.
- Tailwind config extension (jika menggunakan Tailwind CSS)

Dokumen ini harus bisa digunakan AI agent sebagai referensi langsung saat membuat komponen baru.`,
};

export function buildDesignSystemPrompt(
  input: GenerationInput,
  tier: V3Tier = "PRO",
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const designTraits = DESIGN_PRESET_TRAITS[input.presets.design];
  const contextBlock = accumulatedContext
    ? `\n<accumulated_context>\n${accumulatedContext}\n</accumulated_context>\n`
    : "";

  const instruction = tier === "PRO_MAX" ? DEPTH_INSTRUCTIONS.PRO_MAX : DEPTH_INSTRUCTIONS.PRO;

  return `You are a senior UI/UX designer creating a comprehensive design system for a new product.

Generate a **design-system.md** file based on the "${input.presets.design}" design preset.

${base}

Design Inspiration Traits: ${designTraits}
${contextBlock}
---

${instruction}

=== OUTPUT RULES ===
- Output ONLY raw markdown. No code block wrapping.
- Start directly with: # Design System — [product name]
- All colors must be hex values, not generic color names.
- CSS custom properties must follow --color-[name] convention.`;
}
