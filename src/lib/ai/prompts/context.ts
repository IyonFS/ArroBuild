/**
 * context.ts — Tier-aware context.md prompt builder (v3)
 *
 * FREE:    General assistant, 3-4 sections, ringkas & jelas.
 * PRO:     Senior dev, comprehensive context siap untuk AI agent.
 * PRO_MAX: Principal engineer, production-grade, sangat detail.
 */

import { buildBaseContext, type GenerationInput } from "./shared";
import type { V3Tier } from "../tier-enforcer";

const PERSONA: Record<V3Tier, string> = {
  FREE: "a helpful software assistant",
  PRO: "a senior software engineer with 8 years of experience building SaaS products",
  PRO_MAX: "a principal engineer and technical architect who has shipped multiple production systems",
};

const DEPTH_INSTRUCTIONS: Record<V3Tier, string> = {
  FREE: `
Buat dokumen context.md yang ringkas dan jelas.
Sertakan 4 section utama:
1. **Project Overview** — deskripsi singkat produk dan tujuan
2. **Tech Stack** — tabel Layer | Technology berdasarkan framework yang dipilih
3. **Core Features** — 3-5 fitur utama dalam bullet list
4. **Conventions & Rules** — naming convention dan aturan dasar

Gunakan bahasa yang mudah dipahami. Dokumen ini harus bisa dibaca AI agent untuk memahami konteks dasar proyek.`,

  PRO: `
Buat dokumen context.md yang komprehensif dan production-ready.
Sertakan section berikut:

1. **Project Overview** — nama produk, tagline, kategori, status
2. **Problem & Solution** — pain point spesifik dan solusi yang ditawarkan
3. **Target User Persona** — 2 persona dengan goals, frustrations, behaviors
4. **Tech Stack** — tabel Layer | Technology | Justification
5. **Project Structure** — directory tree dari folder layout yang diexpect
6. **Core Features** — prioritas P0/P1/P2 dengan deskripsi singkat per fitur
7. **Non-functional Requirements** — performance, security, accessibility targets
8. **Conventions & Rules** — naming, code style, git workflow, import ordering
9. **Environment Variables** — semua required env vars sebagai KEY= format
10. **Known Constraints** — batasan teknis dan bisnis yang harus diingat AI

Format harus optimal sebagai file yang di-paste ke Cursor/Claude Code sebagai context.`,

  PRO_MAX: `
Buat dokumen context.md yang production-grade dan sangat detail.
Sertakan semua section PRO, ditambah:

- **Domain Model** — entitas utama, atribut kunci, dan relasi antar entitas
- **System Boundaries** — apa yang IN scope vs OUT of scope secara eksplisit
- **Technical Decisions Log** — minimal 3 keputusan arsitektur penting beserta alasannya
- **Integration Points** — API eksternal, third-party services, webhook, SDK yang digunakan
- **Security Considerations** — autentikasi, otorisasi, data sensitivity levels
- **Performance Targets** — response time target, throughput, uptime SLA
- **Error Handling Strategy** — bagaimana error ditangani di frontend dan backend
- **Testing Strategy** — pendekatan testing yang akan digunakan

Setiap section harus actionable untuk AI agent — tidak ada placeholder, semua konkret dan spesifik.
Format harus optimal sebagai CLAUDE.md atau .cursorrules — AI agent harus langsung bisa bekerja.`,
};

/**
 * v3 signature: menerima tier dan accumulated context
 * Tetap backward-compat: old signature (input) tetap bekerja
 */
export function buildContextPrompt(
  input: GenerationInput,
  tier: V3Tier = "FREE",
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const contextBlock = accumulatedContext
    ? `\n<accumulated_context>\n${accumulatedContext}\n</accumulated_context>\n`
    : "";

  return `You are ${PERSONA[tier]}.

Your task is to generate a **context.md** file — the master reference document that all AI coding agents will read at the start of every session.

${base}
${contextBlock}
---

${DEPTH_INSTRUCTIONS[tier]}

=== OUTPUT RULES ===
- Output ONLY raw markdown. No code block wrapping.
- Start directly with: # Project Context — [inferred product name]
- Be specific and concrete — avoid generic statements.
- Do NOT use placeholder text like "[your value here]" — make reasonable assumptions.
- The context.md must be self-contained for an AI agent to understand the full project.`;
}
