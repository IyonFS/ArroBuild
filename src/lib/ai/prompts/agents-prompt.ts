/**
 * agents-prompt.ts — Tier-aware agents.md prompt builder (v3)
 *
 * PRO:     Role definition, rules dasar, tool-specific format (cursor/claude).
 * PRO_MAX: Architectural rules, quality standards, escalation rules, sangat spesifik.
 */

import {
  buildBaseContext,
  type GenerationInput,
  type AgentToolPreset,
} from "./shared";
import type { V3Tier } from "../tier-enforcer";

const AGENT_TOOL_FORMATS: Record<AgentToolPreset, { fileName: string; format: string }> = {
  cursor: {
    fileName: "cursor-rules.md",
    format: "Markdown with .cursor/rules/ instruction format",
  },
  "claude-code": {
    fileName: "CLAUDE.md",
    format: "Claude Code standard format with directives",
  },
  windsurf: {
    fileName: ".windsurfrules",
    format: "Windsurf rules format",
  },
  cline: {
    fileName: ".clinerules",
    format: "Cline rules format",
  },
  opencode: {
    fileName: "opencode-rules.md",
    format: "Generic markdown rules",
  },
  custom: {
    fileName: "agents.md",
    format: "Generic markdown rules for any AI agent",
  },
};

const DEPTH_INSTRUCTIONS: Record<V3Tier, string> = {
  FREE: ``, // Tidak tersedia untuk FREE
  PRO: `
Buat agents.md dengan:
- AI Agent Role Definition: persona dan tanggung jawab agent
- Project-specific coding rules (naming convention, file structure)
- Tech stack rules: hal yang HARUS dan TIDAK BOLEH dilakukan spesifik untuk framework terpilih
- Response format preferences`,

  PRO_MAX: `
Buat agents.md yang sangat detail dan production-grade:
- Agent Persona: role, expertise level, communication style
- Architectural Rules: pattern yang dipakai, anti-patterns yang dihindari
- Code Quality Standards: formatting, naming, documentation
- Framework-Specific Rules:
  - File structure conventions
  - State management approach
  - Error handling patterns
  - Performance optimization rules
  - Security rules (SQL injection, XSS, CSRF prevention)
- Git & Version Control conventions
- Testing requirements per layer
- Review checklist yang agent jalankan sebelum submit code
- Escalation rules: kapan agent harus bertanya sebelum lanjut

Dokumen ini harus bisa di-paste langsung sebagai system prompt dan membuat AI agent langsung memahami konteks penuh project.`,
};

export function buildAgentsPrompt(
  input: GenerationInput,
  tier: V3Tier = "PRO",
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const toolConfig = AGENT_TOOL_FORMATS[input.presets.agentTool] || AGENT_TOOL_FORMATS.custom;
  const contextBlock = accumulatedContext
    ? `\n<accumulated_context>\n${accumulatedContext}\n</accumulated_context>\n`
    : "";

  const aiToolInstructions: Record<string, string> = {
    cursor: `Format output agar optimal untuk file .cursorrules di Cursor IDE. Gunakan format rules yang Cursor kenali (system prompt style).`,
    "claude-code": `Format output agar optimal untuk file CLAUDE.md. Ikuti struktur yang Claude Code gunakan: project overview, then specific instructions.`,
    windsurf: `Format output agar optimal untuk .windsurfrules di Windsurf IDE.`,
    default: `Format sebagai universal system prompt yang bisa dipakai di tools apapun.`,
  };

  const toolInstruction =
    aiToolInstructions[input.presets.agentTool] || aiToolInstructions.default;

  const instruction = tier === "PRO_MAX" ? DEPTH_INSTRUCTIONS.PRO_MAX : DEPTH_INSTRUCTIONS.PRO;

  return `You are a principal engineer specializing in AI-assisted development.

Generate an **agents.md** file — this is the AI coding agent's "instruction manual" for this project.

${base}

Target Tool: ${input.presets.agentTool} (output format: ${toolConfig.format})
${contextBlock}
---

${instruction}
${toolInstruction}

=== OUTPUT RULES ===
- Output ONLY raw markdown. No code block wrapping.
- Start directly with: # AI Agent Instructions — [product name]
- Be extremely specific — avoid generic advice.
- Every rule must be actionable.`;
}
