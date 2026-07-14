/**
 * prd.ts — PRD prompt with YAML Knowledge Model (Document-isi v2)
 */

import { buildBaseContext, type GenerationInput } from "./shared";
import { buildPrdYamlMetadata, buildFeatIdContextBlock } from "./yaml-metadata";
import type { PromptDepthTier } from "@/lib/config/documents";

const DEPTH: Record<PromptDepthTier, string> = {
  STARTER: `
1. Ringkasan Produk (2-3 kalimat)
2. Masalah yang Diselesaikan
3. Target Pengguna
4. Fitur Utama (tabel FEAT-XXX — samakan dengan YAML)
5. Cara Kerja Tiap Fitur (P0/P1 — 1 baris deskripsi, tanpa kriteria formal panjang)
6. Alur Pengguna Utama (1 alur)
7. Batasan
8. Section khusus product_type (wajib)`,

  PRO: `
1. Ringkasan Produk
2. Masalah yang Diselesaikan
3. Target Pengguna (multi-persona)
4. Fitur Utama (tabel FEAT-XXX)
5. Cara Kerja Tiap Fitur — user story + **Kriteria selesai** untuk P0/P1
6. Alur Pengguna Utama
7. Batasan
8. Section khusus product_type`,

  PRO_MAX: `
Semua section Pro, plus:
- Kondisi gagal/edge case per fitur P0
- Minimal 1 alur alternatif (mis. pembayaran gagal)
- Detail lebih dalam di section product_type`,
};

const PRODUCT_TYPE_SECTIONS: Record<string, string> = {
  saas: "Model Harga & Langganan",
  marketplace: "Peran Dua Sisi & Aturan Transaksi",
  mobile: "Platform & Fitur Native",
  api: "Pengguna API & Skenario Use Case",
  ecommerce: "Katalog, Pembayaran & Checkout",
  "ai-app": "Model AI, Privasi & Perilaku Gagal",
  internal: "Pengguna Internal & Integrasi Legacy",
  portfolio: "Proyek Unggulan & Audiens",
  other: "Konteks Produk (dari input user)",
};

export function buildPrdPrompt(
  input: GenerationInput,
  tier: PromptDepthTier = "STARTER",
  accumulatedContext = ""
): string {
  const yaml = buildPrdYamlMetadata(input);
  const featBlock = buildFeatIdContextBlock(input);
  const productType = input.productType ?? "saas";
  const section8 = PRODUCT_TYPE_SECTIONS[productType] ?? PRODUCT_TYPE_SECTIONS.other;

  return `You are a senior product manager.

Generate **prd.md**.

${buildBaseContext(input)}

MANDATORY: Start the document with this exact YAML metadata block (fill from form data):
${yaml}

${featBlock ? `<feat_registry>\n${featBlock}\n</feat_registry>\n` : ""}
${accumulatedContext ? `<context>\n${accumulatedContext}\n</context>\n` : ""}

Sections to write after YAML:
${DEPTH[tier]}

Section 8 title for this product: **${section8}**

RULES:
- Do NOT change/delete FEAT-IDs from YAML — only add detail around them
- After YAML, start markdown with: # Product Requirements Document
- Write each section ONCE — never repeat YAML, the main heading, or section numbers
- Ground every section in the user's specific idea — no generic SaaS boilerplate
- Each section needs concrete bullets or tables (min 3 bullets for narrative sections)
- Fitur Utama table must list every FEAT-ID from YAML with a one-line user benefit
- Cara Kerja must explain step-by-step flow per P0 feature
- Output ONLY raw markdown — no outer code fences`;
}
