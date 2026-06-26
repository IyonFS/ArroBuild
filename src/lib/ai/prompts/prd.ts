/**
 * prd.ts — Tier-aware prd.md prompt builder (v3)
 *
 * FREE:    PRD sederhana — Problem, Target Users, Core Features, Out of Scope.
 * PRO:     Komprehensif — User stories + Acceptance Criteria + MoSCoW + KPI.
 * PRO_MAX: Engineering-grade — FR-001 format, personas, edge cases, data requirements.
 */

import { buildBaseContext, type GenerationInput } from "./shared";
import type { V3Tier } from "../tier-enforcer";

const DEPTH_INSTRUCTIONS: Record<V3Tier, string> = {
  FREE: `
Buat PRD sederhana yang fokus pada MVP:

1. **Problem Statement** — 3-4 pain point spesifik yang dialami user
2. **Solution** — apa yang produk ini lakukan, alur utama dalam numbered steps
3. **Target Users** — primary dan secondary user sebagai tabel
4. **Core Features (MVP)** — 4-6 fitur utama sebagai user stories sederhana
   Format: "Sebagai [user], saya ingin [aksi], agar [manfaat]"
5. **Out of Scope** — apa yang TIDAK akan ada di MVP
6. **Success Metrics** — 3-4 metric yang measurable untuk mengukur keberhasilan

Fokus pada kejelasan dan actionability. Singkat tapi lengkap.`,

  PRO: `
Buat PRD komprehensif yang siap digunakan sebagai referensi AI agent:

1. **Executive Summary** — ringkasan 2-3 paragraf: masalah, solusi, target pasar
2. **Problem & Opportunity** — pain point dengan data/konteks pasar jika relevan
3. **Target Users** — 2 persona detail: nama, profil, goals, frustrations, skenario penggunaan
4. **User Stories** — dikelompokkan per Epic
   Format: "As a [user], I want [action] so that [benefit]"
   Sertakan Acceptance Criteria per story (Given/When/Then)
5. **Feature Prioritization (MoSCoW)**
   - Must Have: fitur yang HARUS ada di MVP
   - Should Have: penting tapi bisa menyusul
   - Could Have: nice-to-have
   - Won't Have: out of scope
6. **Non-Functional Requirements** — performance, security, scalability, accessibility
7. **Success Metrics (KPI)** — Launch / Growth / Revenue dengan target angka spesifik
8. **Constraints & Assumptions** — Technical, Business, User
9. **Open Questions** — 4-5 pertanyaan desain/bisnis yang belum terjawab
10. **Out of Scope** — eksplisit apa yang tidak dikerjakan

Format harus langsung bisa digunakan AI agent untuk eksekusi tanpa klarifikasi tambahan.`,

  PRO_MAX: `
Buat PRD engineering-grade yang sangat lengkap dan detail:

1. **Executive Summary** — business case, nilai bisnis, strategic fit
2. **Problem Statement** — dengan market context dan current solution analysis
3. **User Personas** — 2-3 persona dengan:
   - Demographic & psychographic profile
   - Goals, frustrations, behaviors
   - User journey map langkah demi langkah
   - Success criteria per persona
4. **Functional Requirements** — terformat sebagai FR-001, FR-002, dst.
   Tiap requirement: Description + Acceptance Criteria + Priority (P0/P1/P2) + Complexity (S/M/L)
5. **Non-Functional Requirements** — Performance, Security, Scalability, Accessibility
   Dengan target numerik yang konkret
6. **Edge Cases & Error Scenarios** — per fitur utama: skenario gagal, batas, kondisi ekstrem
7. **Data Requirements** — entitas data, validasi field, business rules, data retention
8. **Integration Requirements** — API eksternal, webhook, third-party services, format data
9. **Success Metrics** — dengan baseline saat ini dan target dalam 30/90/180 hari
10. **Risk Assessment** — tabel: Risk | Probability | Impact | Mitigation Strategy
11. **Out of Scope** — eksplisit dengan alasan
12. **Open Questions** — dengan owner dan deadline untuk setiap pertanyaan

PRD ini harus cukup lengkap untuk dieksekusi langsung oleh AI agent tanpa butuh klarifikasi tambahan.`,
};

export function buildPrdPrompt(
  input: GenerationInput,
  tier: V3Tier = "FREE",
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const contextBlock = accumulatedContext
    ? `\n<accumulated_context>\n${accumulatedContext}\n</accumulated_context>\n`
    : "";

  return `You are a senior product manager and software strategist.

Generate a **prd.md** (Product Requirements Document).

${base}
${contextBlock}
---

${DEPTH_INSTRUCTIONS[tier]}

=== OUTPUT RULES ===
- Output ONLY raw markdown. No code block wrapping.
- Start directly with: # Product Requirements Document — [product name]
- Be specific to THIS project — avoid generic template language.
- All user stories must be realistic for this specific product.
- Use specific numbers in metrics — never vague ranges like "many" or "some".`;
}
