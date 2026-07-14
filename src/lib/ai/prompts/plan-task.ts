import { buildBaseContext, type GenerationInput } from "./shared";
import { buildFeatIdContextBlock } from "./yaml-metadata";
import type { PromptDepthTier } from "@/lib/config/documents";

const DEPTH: Record<PromptDepthTier, string> = {
  STARTER: `
Buat **plan-task.md** — hanya §1 Pembagian Fase:
- Fase, fokus, FEAT-ID terkait, estimasi waktu
- Format task: \`- [ ] Task (est: Xh)\`
- JANGAN duplikasi keputusan teknis dari Architecture`,

  PRO: `
Buat **plan-task.md** dengan:
§1 Pembagian Fase
§2 Urutan Pengerjaan & Ketergantungan
§3 Estimasi Biaya Operasional per fase (ringkas)
- Jangan duplikasi detail teknis dari architecture.md`,

  PRO_MAX: `
Buat **plan-task.md** lengkap:
§1–§3 seperti Pro
§4 Breakdown Sprint/Minggu dengan Definition of Done
- Task granular 2-4 jam per item`,
};

export function buildPlanTaskPrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "STARTER",
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const featBlock = buildFeatIdContextBlock(input);
  const contextBlock = [featBlock, accumulatedContext].filter(Boolean).join("\n\n");

  return `You are a senior engineering manager.

Generate **plan-task.md** (Plan / Task Roadmap).

${base}
${contextBlock ? `<context>\n${contextBlock}\n</context>\n` : ""}
---

${DEPTH[tier]}

RULES:
- Output ONLY raw markdown starting with # Plan / Task Roadmap
- Link tasks to FEAT-IDs from PRD`;
}
