import { buildBaseContext, type GenerationInput } from "./shared";
import { buildFeatIdContextBlock } from "./yaml-metadata";
import type { PromptDepthTier } from "@/lib/config/documents";

type Section = { title: string; bullets: string };

function buildModulePrompt(
  fileTitle: string,
  input: GenerationInput,
  tier: PromptDepthTier,
  accumulatedContext: string,
  sections: Section[]
): string {
  const base = buildBaseContext(input);
  const featBlock = buildFeatIdContextBlock(input);
  const outline = sections.map((s) => `## ${s.title}\n${s.bullets}`).join("\n\n");

  return `Generate **${fileTitle}** for this project.

${base}
${featBlock ? `<feat_registry>\n${featBlock}\n</feat_registry>\n` : ""}
${accumulatedContext ? `<context>\n${accumulatedContext}\n</context>\n` : ""}

Required sections:
${outline}

Depth tier: ${tier}
RULES:
- Reference FEAT-IDs where relevant
- Output ONLY raw markdown starting with # ${fileTitle}`;
}

export function buildCostInfrastructurePrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "PRO",
  ctx = ""
) {
  return buildModulePrompt("Cost & Infrastructure Estimate", input, tier, ctx, [
    { title: "1. Ringkasan Biaya Bulanan", bullets: "Current vs 6-month projection" },
    { title: "2. Breakdown per Komponen", bullets: "Hosting, DB, CDN, AI API, payment, email" },
    { title: "3. Biaya per Skala Pengguna", bullets: "100 / 1,000 / 10,000 users" },
    { title: "4. Potensi Biaya Tersembunyi", bullets: "Egress, overage, per-seat tools" },
    { title: "5. Rekomendasi Optimasi", bullets: "Early-stage cost tips" },
  ]);
}

export function buildAnalyticsMetricsPrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "PRO",
  ctx = ""
) {
  return buildModulePrompt("Analytics & Metrics Spec", input, tier, ctx, [
    { title: "1. Daftar Event", bullets: "name, trigger, properties, FEAT-ID" },
    { title: "2. Funnel Utama", bullets: tier === "PRO_MAX" ? "Per-segment + North Star Metric" : "1 main funnel" },
    { title: "3. Dashboard Metrik Inti", bullets: "metric, calculation, target" },
  ]);
}

export function buildTestingQaPrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "PRO",
  ctx = ""
) {
  return buildModulePrompt("Testing & QA Plan", input, tier, ctx, [
    { title: "1. Strategi Testing", bullets: "unit/integration/E2E ratio + tools" },
    { title: "2. Skenario Test Prioritas", bullets: "TEST-XXX linked to FEAT-ID, P0 first" },
    { title: "3. Target Coverage", bullets: tier === "PRO_MAX" ? "+ regression checklist" : "Realistic targets" },
  ]);
}

export function buildOnboardingEmailPrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "PRO",
  ctx = ""
) {
  return buildModulePrompt("Onboarding & Email Flow", input, tier, ctx, [
    { title: "1. Peta Alur Onboarding", bullets: "signup → aha moment → next action" },
    { title: "2. Email Transaksional", bullets: "welcome, verification, feature-triggered" },
    { title: "3. Sequence Retensi", bullets: tier === "PRO_MAX" ? "Draft copy + exact intervals" : "Timing + purpose" },
  ]);
}

export function buildCompetitiveAnalysisPrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "PRO",
  ctx = ""
) {
  return buildModulePrompt("Competitive Analysis", input, tier, ctx, [
    { title: "1. Kompetitor Utama", bullets: "2-3 competitors" },
    { title: "2. Perbandingan Fitur", bullets: "vs competitors, FEAT-ID linked" },
    { title: "3. Celah Diferensiasi", bullets: "Gaps and opportunities" },
    { title: "4. Positioning", bullets: "One clear sentence + disclaimer: AI knowledge, verify manually" },
  ]);
}

export function buildSecurityLaunchPrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "PRO_MAX",
  ctx = ""
) {
  return buildModulePrompt("Security & Launch Checklist", input, tier, ctx, [
    { title: "1. Security Checklist", bullets: "P0/P1/P2 items linked to FEAT-IDs as - [ ]" },
    { title: "2. Pre-Launch Checklist", bullets: "SSL, backups, monitoring, env separation" },
    { title: "3. Scale Readiness", bullets: "Only if stage=production: indexes, caching" },
    { title: "4. Incident Response", bullets: "Contact, rollback plan" },
  ]);
}

export function buildDatabaseDeepDivePrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "PRO_MAX",
  ctx = ""
) {
  return buildModulePrompt("Database Deep-Dive", input, tier, ctx, [
    { title: "1. Entitas Tambahan", bullets: "Logs, M2M, state machines beyond Architecture" },
    { title: "2. Diagram Relasi Lengkap", bullets: "Mermaid ER all tables" },
    { title: "3. Strategi Indexing", bullets: "Linked to query patterns + FEAT-IDs" },
    { title: "4. Integritas Data", bullets: "FK, cascade, composite unique" },
    { title: "5. Pertumbuhan & Arsip", bullets: "High-volume table strategy" },
  ]);
}

export function buildComplianceLegalPrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "PRO_MAX",
  ctx = ""
) {
  return buildModulePrompt("Compliance & Legal Checklist", input, tier, ctx, [
    { title: "1. Kebutuhan Privasi Data", bullets: "Collected data, retention, 3rd-party sharing" },
    { title: "2. Outline ToS & Privacy Policy", bullets: "Structure only, not legal text" },
    { title: "3. Kepatuhan Pembayaran", bullets: "Licensed gateway, no raw card storage" },
    { title: "4. Checklist Khusus AI", bullets: "If ai-app: disclosure, AI data retention" },
  ]);
}
