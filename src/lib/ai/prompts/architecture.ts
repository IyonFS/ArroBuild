import { buildBaseContext, type GenerationInput } from "./shared";
import { buildFeatIdContextBlock } from "./yaml-metadata";
import type { PromptDepthTier } from "@/lib/config/documents";

const DEPTH: Record<PromptDepthTier, string> = {
  STARTER: `
Buat **architecture.md** ringkas:
1. Keputusan Teknis Utama (tabel dari stack form)
2. Skema Database (tabel + kolom penting, link FEAT-ID)
3. Struktur Folder Proyek
4. Batasan & Pertimbangan Teknis (singkat)`,

  PRO: `
Buat **architecture.md** lengkap:
1. Keputusan Teknis Utama + alasan singkat
2. Skema Database dengan relasi antar tabel + FEAT-ID
3. Struktur Folder Proyek
4. Kontrak API (tabel endpoint jika relevan)
5. Batasan & Pertimbangan Teknis`,

  PRO_MAX: `
Buat **architecture.md** engineering-grade:
Semua section PRO, plus:
- Diagram ER Mermaid untuk skema database
- Strategi migrasi skema
- Format error response API standar
- API versioning jika perlu`,
};

export function buildArchitecturePrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "STARTER",
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const featBlock = buildFeatIdContextBlock(input);
  const presets = input.presets;
  const contextBlock = [featBlock, accumulatedContext].filter(Boolean).join("\n\n");

  return `You are a senior software architect.

Generate **architecture.md** (Architecture & Technical Blueprint).

${base}

Stack from form:
- Language: ${presets.programmingLanguage ?? "javascript-typescript"}
- Framework: ${presets.framework}${presets.backendFramework ? `\n- Backend: ${presets.backendFramework}` : ""}
- Database: ${presets.database ?? "postgresql"}
- Deployment: ${presets.deployment ?? "vercel"}

${contextBlock ? `<context>\n${contextBlock}\n</context>\n` : ""}
---

${DEPTH[tier]}

RULES:
- Reference FEAT-IDs from PRD — do NOT invent new feature IDs
- Write each section ONCE — never repeat the main heading or restart numbering
- Be specific to this product's stack and features — avoid generic architecture filler
- Output ONLY raw markdown starting with # Architecture & Technical Blueprint
- Explain database choice rationale`;
}
