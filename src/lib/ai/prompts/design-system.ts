import {
  buildBaseContext,
  summarizeForContext,
  GenerationInput,
  DesignPreset,
} from "./shared";

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

export function buildDesignSystemPrompt(
  input: GenerationInput,
  contextMd: string,
  prdMd: string
): string {
  const base = buildBaseContext(input);
  const designTraits = DESIGN_PRESET_TRAITS[input.presets.design];
  const contextSummary = summarizeForContext(contextMd, 400);
  const prdSummary = summarizeForContext(prdMd, 300);

  return `You are a senior UI/UX designer creating a comprehensive design system for a new product.

Generate a **design-system.md** file based on the "${input.presets.design}" design preset.

${base}

Design Inspiration Traits: ${designTraits}

<previous_docs>
${contextSummary}
---
${prdSummary}
</previous_docs>

---

Generate with these sections:

1. **Brand Identity** — logo concept, brand voice, tone
2. **Color System**
   - Foundation Colors (background, surface, card, border) as table: Token | Hex | Usage
   - Primary/Brand Colors as table
   - Text Colors as table
   - Semantic Colors (success, info, warning, danger) as table
   - Usage Rules
3. **Typography**
   - Font family (CSS declaration)
   - Type Scale as table: Role | Size | Weight | Color | Line Height
   - Typography Rules
4. **Spacing System** — 4px grid, table: Token | Value | Usage
5. **Border Radius** — table: Token | Value | Usage
6. **Component Guidelines**
   - Button (primary, secondary, ghost, danger states + CSS values)
   - Input & Textarea
   - Card (default, elevated, interactive, featured)
   - Badge / Status Pill
   - Navigation
   - Progress Indicator
7. **Iconography** — icon library, sizing, color rules
8. **Animation & Transition** — duration table, easing, philosophy
9. **Layout & Grid** — page layout, sidebar, card grid, z-index scale
10. **Dark Mode / Theme Notes**
11. **Accessibility** — contrast, focus ring, keyboard nav, ARIA

Rules:
- Output only valid Markdown.
- Provide actual hex color codes, not generic descriptions.
- CSS values must be production-ready.
- Match the ${input.presets.design} style as closely as possible.`;
}
