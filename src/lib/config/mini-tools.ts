import type { ModelClassId } from "@/lib/config/tiers";
import { TIER, type TierId } from "@/lib/config/tiers";
import {
  buildCopyStudioPrompt,
  COPY_STUDIO_CREDITS,
} from "@/lib/config/copy-studio-prompt";
import {
  buildReadmePrompt,
  recordToReadmeInput,
} from "@/lib/config/readme-prompt";

export type MiniToolId =
  | "prompt-doctor"
  | "mvp-scope-cutter"
  | "stitch-composer"
  | "readme-generator"
  | "copy-studio"
  | "schema-visualizer";

export interface MiniToolDefinition {
  id: MiniToolId;
  name: string;
  description: string;
  credits: number;
  modelClass: ModelClassId;
  maxOutputTokens: number;
  /** Tier yang boleh akses tool ini */
  minTier: TierId;
  fields: Array<{
    key: string;
    label: string;
    type: "textarea" | "text";
    placeholder?: string;
    required?: boolean;
  }>;
  buildPrompt: (input: Record<string, string>) => string;
}

const PROMPT_DOCTOR_SYSTEM = `You are an expert AI prompt engineer for Cursor, Claude Code, and similar coding agents.
The user will paste a rough instruction. Rewrite it into a clear, structured prompt with:
- Context (if inferable)
- Specific tasks as numbered steps
- Constraints and acceptance criteria
- Output format expectations
Respond in the same language as the user's input (Indonesian or English).
Output ONLY the improved prompt — no preamble.`;

const MVP_SCOPE_SYSTEM = `You are a pragmatic product coach for solo developers.
Given a feature list, force a ruthless MVP cut:
1. **Wajib v1** — max 5 items with one-line why
2. **Tunda v1.1** — grouped backlog
3. **Buang/drop** — with honest reason
4. **Saran urutan build** — 2-week sprint order
Be direct. Same language as input.`;

const STITCH_SYSTEM = `You compose a paste-ready prompt for Google Stitch (Google Labs UI design AI).
Use design tokens, typography, spacing, and product context provided.
Structure: product summary, screen goal, layout, components, color/type tokens, interaction notes, export hint (Tailwind/HTML).
Output ONLY the Stitch prompt.`;

const SCHEMA_SYSTEM = `You are a database architect. From the architecture/schema description, output:
1. Mermaid erDiagram block (valid syntax)
2. Short bullet list of key relationships and indexes to add
Output markdown only.`;

export const MINI_TOOLS: Record<MiniToolId, MiniToolDefinition> = {
  "prompt-doctor": {
    id: "prompt-doctor",
    name: "Prompt Doctor",
    description: "Rapikan prompt kasar untuk Cursor / Claude Code.",
    credits: 1,
    modelClass: "HEMAT",
    maxOutputTokens: 1200,
    minTier: TIER.STARTER,
    fields: [
      {
        key: "rawPrompt",
        label: "Prompt mentah",
        type: "textarea",
        placeholder: "Paste instruksi yang mau dikirim ke AI agent...",
        required: true,
      },
    ],
    buildPrompt: (input) =>
      `${PROMPT_DOCTOR_SYSTEM}\n\n---\nRough prompt:\n${input.rawPrompt ?? ""}`,
  },
  "mvp-scope-cutter": {
    id: "mvp-scope-cutter",
    name: "MVP Scope Cutter",
    description: "Potong daftar fitur jadi MVP yang realistis.",
    credits: 60,
    modelClass: "MENENGAH",
    maxOutputTokens: 2000,
    minTier: TIER.PRO,
    fields: [
      {
        key: "features",
        label: "Daftar fitur / ide",
        type: "textarea",
        placeholder: "Satu fitur per baris atau bullet list...",
        required: true,
      },
      {
        key: "context",
        label: "Konteks produk (opsional)",
        type: "textarea",
        placeholder: "Target user, deadline, stack...",
      },
    ],
    buildPrompt: (input) =>
      `${MVP_SCOPE_SYSTEM}\n\nProduct context:\n${input.context || "—"}\n\nFeatures:\n${input.features ?? ""}`,
  },
  "stitch-composer": {
    id: "stitch-composer",
    name: "Stitch Prompt Composer",
    description: "Susun prompt Google Stitch dari design system & PRD.",
    credits: 5,
    modelClass: "HEMAT",
    maxOutputTokens: 2000,
    minTier: TIER.PRO,
    fields: [
      {
        key: "designSystem",
        label: "Design system / token",
        type: "textarea",
        placeholder: "Warna, font, spacing dari design-system.md...",
        required: true,
      },
      {
        key: "prdExcerpt",
        label: "Konteks produk / layar",
        type: "textarea",
        placeholder: "Screen yang mau didesain, user flow...",
        required: true,
      },
    ],
    buildPrompt: (input) =>
      `${STITCH_SYSTEM}\n\nDesign tokens:\n${input.designSystem ?? ""}\n\nProduct/screen:\n${input.prdExcerpt ?? ""}`,
  },
  "readme-generator": {
    id: "readme-generator",
    name: "README Generator",
    description: "Generate README.md profesional dengan gaya pilihanmu.",
    credits: 2,
    modelClass: "HEMAT",
    maxOutputTokens: 2000,
    minTier: TIER.PRO,
    fields: [
      { key: "mode", label: "Mode", type: "text", required: true },
      { key: "category", label: "Kategori", type: "text", required: true },
      { key: "templateId", label: "Template", type: "text", required: true },
      { key: "projectName", label: "Nama proyek", type: "text", required: true },
    ],
    buildPrompt: (input) => buildReadmePrompt(recordToReadmeInput(input)),
  },
  "copy-studio": {
    id: "copy-studio",
    name: "Copy Studio",
    description:
      "Script copy landing page per section — dari template, diskusi, atau screenshot.",
    credits: COPY_STUDIO_CREDITS.template,
    modelClass: "MENENGAH",
    maxOutputTokens: 2500,
    minTier: TIER.PRO,
    fields: [
      { key: "mode", label: "Mode", type: "text", required: true },
      { key: "productName", label: "Nama produk", type: "text" },
      { key: "targetUser", label: "Target user", type: "text" },
      { key: "mainValue", label: "Value utama", type: "textarea" },
    ],
    buildPrompt: (input) => buildCopyStudioPrompt(input),
  },
  "schema-visualizer": {
    id: "schema-visualizer",
    name: "Database Schema Visualizer",
    description: "Diagram ER Mermaid dari skema arsitektur.",
    credits: 3,
    modelClass: "HEMAT",
    maxOutputTokens: 2000,
    minTier: TIER.PRO_MAX,
    fields: [
      {
        key: "schema",
        label: "Deskripsi skema / tabel",
        type: "textarea",
        placeholder: "Tabel, kolom, relasi dari architecture doc...",
        required: true,
      },
    ],
    buildPrompt: (input) =>
      `${SCHEMA_SYSTEM}\n\nSchema description:\n${input.schema ?? ""}`,
  },
};

export const MINI_TOOL_LIST = Object.values(MINI_TOOLS);

const TIER_RANK: Record<TierId, number> = {
  [TIER.STARTER]: 1,
  [TIER.PRO]: 2,
  [TIER.PRO_MAX]: 3,
};

export function isToolAllowedForTier(toolId: MiniToolId, tierId: TierId): boolean {
  const tool = MINI_TOOLS[toolId];
  return TIER_RANK[tierId] >= TIER_RANK[tool.minTier];
}

export function listToolsForTier(tierId: TierId | null): MiniToolDefinition[] {
  if (!tierId) return [];
  return MINI_TOOL_LIST.filter((t) => isToolAllowedForTier(t.id, tierId));
}
