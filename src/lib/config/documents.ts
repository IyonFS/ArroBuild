/**
 * Single source of truth for v2 document keys, tier access, token budgets, and metadata.
 */

import { modelClassSlugToId } from "@/lib/ai-gateway/model-router";
import { TIER, TIER_CONFIG, validateModelClassForTier, type TierId } from "./tiers";

export type UserTier = "base" | "core" | "prime";
export type ModelClass = "hemat" | "menengah" | "flagship" | "ultra";

export const CORE_DOCUMENT_KEYS = [
  "prd",
  "architecture",
  "plan-task",
  "design-system",
  "agent-rules",
  "adaptive-document",
] as const;

export const OPTIONAL_DOCUMENT_KEYS = [
  "cost-infrastructure",
  "analytics-metrics",
  "testing-qa",
  "onboarding-email",
  "competitive-analysis",
  "security-launch",
  "database-deep-dive",
  "compliance-legal",
] as const;

export const DOCUMENT_FILE_KEYS = [...CORE_DOCUMENT_KEYS, ...OPTIONAL_DOCUMENT_KEYS] as const;

export type CoreDocumentKey = (typeof CORE_DOCUMENT_KEYS)[number];
export type OptionalDocumentKey = (typeof OPTIONAL_DOCUMENT_KEYS)[number];
export type DocumentFileKey = (typeof DOCUMENT_FILE_KEYS)[number];

/** @deprecated Use DocumentFileKey */
export type FileKey = DocumentFileKey;

export const LEGACY_FILE_KEY_ALIASES: Record<string, DocumentFileKey> = {
  context: "architecture",
  plan: "plan-task",
  agents: "agent-rules",
  "production-hardening": "security-launch",
  "scale-performance": "database-deep-dive",
  "growth-quality": "analytics-metrics",
};

export function normalizeDocumentKey(key: string): DocumentFileKey | null {
  if ((DOCUMENT_FILE_KEYS as readonly string[]).includes(key)) {
    return key as DocumentFileKey;
  }
  return LEGACY_FILE_KEY_ALIASES[key] ?? null;
}

export interface DocumentDefinition {
  key: DocumentFileKey;
  fileName: string;
  label: string;
  description: string;
  icon: string;
  phase: string;
  kind: "core" | "optional";
  minTier: UserTier;
  tokenBudget: Record<UserTier, number>;
  defaultModelClass: Record<UserTier, ModelClass>;
  sortOrder: number;
}

const TIER_RANK: Record<UserTier, number> = {
  base: 1,
  core: 2,
  prime: 3,
};

export function tierMeetsMin(userTier: UserTier, minTier: UserTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[minTier];
}

export const DOCUMENT_DEFINITIONS: Record<DocumentFileKey, DocumentDefinition> = {
  prd: {
    key: "prd",
    fileName: "prd.md",
    label: "PRD",
    description: "Product requirements, FEAT-ID, user stories",
    icon: "📝",
    phase: "Core",
    kind: "core",
    minTier: "base",
    tokenBudget: { base: 4096, core: 5000, prime: 8000 },
    defaultModelClass: { base: "hemat", core: "menengah", prime: "flagship" },
    sortOrder: 10,
  },
  architecture: {
    key: "architecture",
    fileName: "architecture.md",
    label: "Architecture & Blueprint",
    description: "Skema DB, struktur folder, kontrak API",
    icon: "🏗️",
    phase: "Core",
    kind: "core",
    minTier: "base",
    tokenBudget: { base: 4096, core: 4000, prime: 7000 },
    defaultModelClass: { base: "hemat", core: "menengah", prime: "flagship" },
    sortOrder: 20,
  },
  "plan-task": {
    key: "plan-task",
    fileName: "plan-task.md",
    label: "Plan / Task",
    description: "Fase, urutan pengerjaan, estimasi",
    icon: "🗺️",
    phase: "Core",
    kind: "core",
    minTier: "base",
    tokenBudget: { base: 3072, core: 3000, prime: 5000 },
    defaultModelClass: { base: "hemat", core: "hemat", prime: "menengah" },
    sortOrder: 30,
  },
  "design-system": {
    key: "design-system",
    fileName: "design-system.md",
    label: "Design System",
    description: "Warna, tipografi, komponen dasar",
    icon: "🎨",
    phase: "Core",
    kind: "core",
    minTier: "core",
    tokenBudget: { base: 0, core: 3000, prime: 5000 },
    defaultModelClass: { base: "hemat", core: "menengah", prime: "menengah" },
    sortOrder: 40,
  },
  "agent-rules": {
    key: "agent-rules",
    fileName: "agent-rules.md",
    label: "Agent Rules",
    description: "Aturan coding per AI tool target",
    icon: "🤖",
    phase: "Core",
    kind: "core",
    minTier: "core",
    tokenBudget: { base: 0, core: 2500, prime: 4000 },
    defaultModelClass: { base: "hemat", core: "hemat", prime: "flagship" },
    sortOrder: 50,
  },
  "adaptive-document": {
    key: "adaptive-document",
    fileName: "adaptive-document.md",
    label: "Dokumen Adaptif",
    description: "Strategi khusus per tipe produk (Prime)",
    icon: "🧩",
    phase: "Core",
    kind: "core",
    minTier: "prime",
    tokenBudget: { base: 0, core: 0, prime: 6500 },
    defaultModelClass: { base: "hemat", core: "hemat", prime: "flagship" },
    sortOrder: 60,
  },
  "cost-infrastructure": {
    key: "cost-infrastructure",
    fileName: "cost-infrastructure.md",
    label: "Cost & Infrastructure",
    description: "Estimasi biaya hosting & komponen",
    icon: "💰",
    phase: "Opsional",
    kind: "optional",
    minTier: "core",
    tokenBudget: { base: 0, core: 2000, prime: 2000 },
    defaultModelClass: { base: "hemat", core: "hemat", prime: "hemat" },
    sortOrder: 70,
  },
  "analytics-metrics": {
    key: "analytics-metrics",
    fileName: "analytics-metrics.md",
    label: "Analytics & Metrics",
    description: "Event tracking, funnel, dashboard metrik",
    icon: "📊",
    phase: "Opsional",
    kind: "optional",
    minTier: "core",
    tokenBudget: { base: 0, core: 2000, prime: 3500 },
    defaultModelClass: { base: "hemat", core: "hemat", prime: "menengah" },
    sortOrder: 80,
  },
  "testing-qa": {
    key: "testing-qa",
    fileName: "testing-qa.md",
    label: "Testing & QA Plan",
    description: "Strategi test & skenario prioritas",
    icon: "🧪",
    phase: "Opsional",
    kind: "optional",
    minTier: "core",
    tokenBudget: { base: 0, core: 2500, prime: 4000 },
    defaultModelClass: { base: "hemat", core: "menengah", prime: "menengah" },
    sortOrder: 90,
  },
  "onboarding-email": {
    key: "onboarding-email",
    fileName: "onboarding-email.md",
    label: "Onboarding & Email",
    description: "Alur onboarding & email transaksional",
    icon: "✉️",
    phase: "Opsional",
    kind: "optional",
    minTier: "core",
    tokenBudget: { base: 0, core: 2500, prime: 4000 },
    defaultModelClass: { base: "hemat", core: "menengah", prime: "menengah" },
    sortOrder: 100,
  },
  "competitive-analysis": {
    key: "competitive-analysis",
    fileName: "competitive-analysis.md",
    label: "Competitive Analysis",
    description: "Kompetitor, diferensiasi, positioning",
    icon: "🎯",
    phase: "Opsional",
    kind: "optional",
    minTier: "core",
    tokenBudget: { base: 0, core: 3000, prime: 3000 },
    defaultModelClass: { base: "hemat", core: "flagship", prime: "flagship" },
    sortOrder: 110,
  },
  "security-launch": {
    key: "security-launch",
    fileName: "security-launch.md",
    label: "Security & Launch Checklist",
    description: "Checklist keamanan & pre-launch",
    icon: "🛡️",
    phase: "Opsional",
    kind: "optional",
    minTier: "prime",
    tokenBudget: { base: 0, core: 0, prime: 5000 },
    defaultModelClass: { base: "hemat", core: "hemat", prime: "flagship" },
    sortOrder: 120,
  },
  "database-deep-dive": {
    key: "database-deep-dive",
    fileName: "database-deep-dive.md",
    label: "Database Deep-Dive",
    description: "Indexing, integritas, pertumbuhan data",
    icon: "🗄️",
    phase: "Opsional",
    kind: "optional",
    minTier: "prime",
    tokenBudget: { base: 0, core: 0, prime: 4500 },
    defaultModelClass: { base: "hemat", core: "hemat", prime: "flagship" },
    sortOrder: 130,
  },
  "compliance-legal": {
    key: "compliance-legal",
    fileName: "compliance-legal.md",
    label: "Compliance & Legal",
    description: "Privasi, ToS outline, kepatuhan pembayaran",
    icon: "⚖️",
    phase: "Opsional",
    kind: "optional",
    minTier: "prime",
    tokenBudget: { base: 0, core: 0, prime: 3500 },
    defaultModelClass: { base: "hemat", core: "hemat", prime: "flagship" },
    sortOrder: 140,
  },
};

export const DOCUMENT_GENERATION_ORDER: DocumentFileKey[] = (
  Object.values(DOCUMENT_DEFINITIONS) as DocumentDefinition[]
)
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((d) => d.key);

export const DEFAULT_CORE_DOCS_BY_TIER: Record<UserTier, DocumentFileKey[]> = {
  base: [...TIER_CONFIG[TIER.BASE].coreDocuments] as DocumentFileKey[],
  core: [...TIER_CONFIG[TIER.CORE].coreDocuments] as DocumentFileKey[],
  prime: [...TIER_CONFIG[TIER.PRIME].coreDocuments] as DocumentFileKey[],
};

const TIER_CONFIG_BY_SLUG = {
  base: TIER_CONFIG[TIER.BASE],
  core: TIER_CONFIG[TIER.CORE],
  prime: TIER_CONFIG[TIER.PRIME],
} as const;

export function canAccessDocument(key: DocumentFileKey, tier: UserTier): boolean {
  const def = DOCUMENT_DEFINITIONS[key];
  if (!tierMeetsMin(tier, def.minTier)) return false;
  if (def.kind === "optional" && !TIER_CONFIG_BY_SLUG[tier].canAccessOptionalModules) {
    return false;
  }
  return def.tokenBudget[tier] > 0 || def.kind === "core";
}

export function filterDocumentsForTier(keys: DocumentFileKey[], tier: UserTier): DocumentFileKey[] {
  return keys.filter((k) => canAccessDocument(k, tier));
}

/** Keep only tier-accessible docs, always include PRD, respect max count. */
export function sanitizeSelectedDocs(keys: DocumentFileKey[], tier: UserTier): DocumentFileKey[] {
  const seen = new Set<DocumentFileKey>();
  const filtered: DocumentFileKey[] = [];

  for (const key of keys) {
    if (!canAccessDocument(key, tier) || seen.has(key)) continue;
    seen.add(key);
    filtered.push(key);
  }

  if (!seen.has("prd")) {
    filtered.unshift("prd");
  }

  const max = getMaxDocumentsForTier(tier);
  if (filtered.length <= max) return filtered;

  const prd = filtered.filter((k) => k === "prd");
  const rest = filtered.filter((k) => k !== "prd").slice(0, max - prd.length);
  return [...prd, ...rest];
}

export function getMaxDocumentsForTier(tier: UserTier): number {
  return filterDocumentsForTier([...DOCUMENT_FILE_KEYS], tier).length;
}

export function calcDocumentCredits(
  key: DocumentFileKey,
  tier: UserTier,
  modelClass: ModelClass,
): number {
  const def = DOCUMENT_DEFINITIONS[key];
  const tokens = def.tokenBudget[tier];
  if (tokens <= 0) return 0;
  const multipliers: Record<ModelClass, number> = {
    hemat: 1,
    menengah: 24,
    flagship: 35,
    ultra: 65,
  };
  return Math.ceil((tokens / 1000) * multipliers[modelClass]);
}

export function getDefaultModelClass(key: DocumentFileKey, tier: UserTier): ModelClass {
  return DOCUMENT_DEFINITIONS[key].defaultModelClass[tier];
}

export type PromptDepthTier = "BASE" | "CORE" | "PRIME";

export function userTierToPromptDepth(tier: UserTier): PromptDepthTier {
  if (tier === "prime") return "PRIME";
  if (tier === "core") return "CORE";
  return "BASE";
}

export function legacyTierSlugToUserTier(tier: string | undefined | null): UserTier {
  switch (tier) {
    case "prime":
    case "PRIME":
    case "unlimited":
    case "UNLIMITED":
      return "prime";
    case "core":
    case "CORE":
    case "paid":
      return "core";
    default:
      return "base";
  }
}

export function userTierToTierId(tier: UserTier): TierId {
  if (tier === "prime") return "PRIME";
  if (tier === "core") return "CORE";
  return "BASE";
}

/** Drop per-document model overrides that exceed the user's tier allowance. */
export function sanitizePerDocumentModelClass(
  overrides: Partial<Record<DocumentFileKey, ModelClass>> | undefined,
  tier: UserTier,
): Partial<Record<DocumentFileKey, ModelClass>> {
  if (!overrides) return {};
  const tierId = userTierToTierId(tier);
  const sanitized: Partial<Record<DocumentFileKey, ModelClass>> = {};
  for (const [key, slug] of Object.entries(overrides)) {
    if (!(DOCUMENT_FILE_KEYS as readonly string[]).includes(key)) continue;
    const classId = modelClassSlugToId(slug);
    if (validateModelClassForTier(tierId, classId)) {
      sanitized[key as DocumentFileKey] = slug;
    }
  }
  return sanitized;
}
