import { validateGeneratedContent } from "@/lib/ai/validation";
import type { DocumentFileKey } from "@/lib/config/documents";
import { AI_PROMPT_VERSION } from "@/lib/ai/prompts/version";

export { AI_PROMPT_VERSION };
export const BENCHMARK_REQUIRED_DOCUMENTS = [
  "prd",
  "architecture",
  "plan-task",
] as const satisfies readonly DocumentFileKey[];

export type BenchmarkCategory =
  | "saas"
  | "marketplace"
  | "mobile"
  | "ai-app"
  | "internal"
  | "ecommerce"
  | "portfolio";

export type BenchmarkDetailLevel = "short" | "medium" | "detailed";

export interface BenchmarkInputCase {
  id: string;
  category: BenchmarkCategory;
  detailLevel: BenchmarkDetailLevel;
  input: {
    idea: string;
    productType: string;
    projectStage: string;
    clarifications: {
      platform: "web" | "mobile" | "desktop" | "api";
      monetization: "free" | "paid" | "freemium" | "open-source";
      scope: "mvp" | "full-product" | "experiment";
    };
    presets: {
      framework: string;
      database?: string;
      deployment?: string;
      programmingLanguage?: string;
    };
    features: Array<{
      id: string;
      title: string;
      priority: "must-have" | "nice-to-have";
    }>;
  };
}

export interface BenchmarkDocuments {
  prd?: string;
  architecture?: string;
  "plan-task"?: string;
}

export interface BenchmarkUsage {
  estimatedCredits?: number;
  actualCredits?: number;
  estimatedOutputTokens?: number;
  actualOutputTokens?: number;
}

export interface BenchmarkMetric {
  score: number;
  reasons: string[];
}

export interface BenchmarkCaseResult {
  caseId: string;
  score: number;
  passed: boolean;
  metrics: {
    completeness: BenchmarkMetric;
    featureConsistency: BenchmarkMetric;
    crossDocumentConsistency: BenchmarkMetric;
    stackConsistency: BenchmarkMetric;
    taskActionability: BenchmarkMetric;
    formatIntegrity: BenchmarkMetric;
    groundedness: BenchmarkMetric;
    usageAccuracy: BenchmarkMetric;
  };
}

const REQUIRED_CATEGORIES: readonly BenchmarkCategory[] = [
  "saas",
  "marketplace",
  "mobile",
  "ai-app",
  "internal",
  "ecommerce",
  "portfolio",
];

export function validateBenchmarkDataset(cases: BenchmarkInputCase[]): string[] {
  const errors: string[] = [];
  if (cases.length < 10 || cases.length > 20) {
    errors.push(`Dataset harus berisi 10–20 kasus, ditemukan ${cases.length}`);
  }

  const ids = new Set<string>();
  for (const benchmarkCase of cases) {
    if (!benchmarkCase.id || ids.has(benchmarkCase.id)) {
      errors.push(`ID kasus kosong atau duplikat: ${benchmarkCase.id || "(kosong)"}`);
    }
    ids.add(benchmarkCase.id);
    if (!benchmarkCase.input.idea.trim()) errors.push(`${benchmarkCase.id}: idea kosong`);
    if (benchmarkCase.input.features.length === 0) {
      errors.push(`${benchmarkCase.id}: minimal satu fitur diperlukan`);
    }
    const featureIds = benchmarkCase.input.features.map((feature) => feature.id);
    if (new Set(featureIds).size !== featureIds.length) {
      errors.push(`${benchmarkCase.id}: FEAT-ID duplikat`);
    }
    for (const featureId of featureIds) {
      if (!/^FEAT-\d{3}$/.test(featureId)) {
        errors.push(`${benchmarkCase.id}: FEAT-ID tidak valid (${featureId})`);
      }
    }
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(benchmarkCase.input.idea)) {
      errors.push(`${benchmarkCase.id}: input mengandung alamat email`);
    }
    if (/\b(?:\+62|62|0)8\d{8,12}\b/.test(benchmarkCase.input.idea)) {
      errors.push(`${benchmarkCase.id}: input mengandung nomor telepon`);
    }
  }

  for (const category of REQUIRED_CATEGORIES) {
    if (!cases.some((benchmarkCase) => benchmarkCase.category === category)) {
      errors.push(`Kategori belum tercakup: ${category}`);
    }
  }
  for (const detailLevel of ["short", "medium", "detailed"] as const) {
    if (!cases.some((benchmarkCase) => benchmarkCase.detailLevel === detailLevel)) {
      errors.push(`Detail level belum tercakup: ${detailLevel}`);
    }
  }

  return errors;
}

const FEATURE_ID_PATTERN = /\bFEAT-\d{3}\b/g;
const UNSOURCED_CLAIM_PATTERN =
  /(?:menurut (?:riset|penelitian)|berdasarkan (?:riset|data)|\b\d{2,3}%\b).{0,80}(?:pengguna|pasar|bisnis|pelanggan)/gi;

function clampScore(score: number): number {
  return Math.max(0, Math.min(1, Number(score.toFixed(4))));
}

function metric(score: number, reasons: string[] = []): BenchmarkMetric {
  return { score: clampScore(score), reasons };
}

function featureIds(content: string): Set<string> {
  return new Set(content.match(FEATURE_ID_PATTERN) ?? []);
}

function normalizedStackTerms(value: string | undefined): string[] {
  if (!value) return [];
  const normalized = value.toLowerCase();
  const aliases: Record<string, string[]> = {
    nextjs: ["next.js", "nextjs"],
    "react-native": ["react native", "react-native"],
    "react-spa": ["react", "react spa"],
    postgresql: ["postgresql", "postgres"],
    javascript: ["javascript", "typescript"],
    "javascript-typescript": ["javascript", "typescript"],
  };
  return aliases[normalized] ?? [normalized.replaceAll("-", " "), normalized];
}

function evaluateCompleteness(documents: BenchmarkDocuments): BenchmarkMetric {
  const reasons: string[] = [];
  let validCount = 0;

  for (const fileKey of BENCHMARK_REQUIRED_DOCUMENTS) {
    const content = documents[fileKey];
    if (!content) {
      reasons.push(`${fileKey} tidak tersedia`);
      continue;
    }
    const result = validateGeneratedContent(content, fileKey);
    if (result.valid) validCount += 1;
    else reasons.push(`${fileKey}: ${result.reasons.join(", ")}`);
  }

  return metric(validCount / BENCHMARK_REQUIRED_DOCUMENTS.length, reasons);
}

function evaluateFeatureConsistency(
  benchmarkCase: BenchmarkInputCase,
  documents: BenchmarkDocuments,
): BenchmarkMetric {
  const expected = new Set(benchmarkCase.input.features.map((feature) => feature.id));
  const prdIds = featureIds(documents.prd ?? "");
  const allIds = featureIds(Object.values(documents).join("\n"));
  const missing = [...expected].filter((id) => !prdIds.has(id));
  const invented = [...allIds].filter((id) => !expected.has(id));
  const expectedCoverage =
    expected.size === 0 ? 1 : (expected.size - missing.length) / expected.size;
  const score = expectedCoverage * 0.75 + (invented.length === 0 ? 0.25 : 0);
  const reasons = [
    ...(missing.length ? [`FEAT-ID hilang dari PRD: ${missing.join(", ")}`] : []),
    ...(invented.length ? [`FEAT-ID tidak berasal dari input: ${invented.join(", ")}`] : []),
  ];
  return metric(score, reasons);
}

function evaluateCrossDocumentConsistency(
  benchmarkCase: BenchmarkInputCase,
  documents: BenchmarkDocuments,
): BenchmarkMetric {
  const expected = new Set(benchmarkCase.input.features.map((feature) => feature.id));
  const reasons: string[] = [];
  let validDocuments = 0;

  for (const fileKey of ["architecture", "plan-task"] as const) {
    const ids = featureIds(documents[fileKey] ?? "");
    const hasExpected = [...ids].some((id) => expected.has(id));
    const invented = [...ids].filter((id) => !expected.has(id));
    if (hasExpected && invented.length === 0) validDocuments += 1;
    if (!hasExpected) reasons.push(`${fileKey} tidak mereferensikan FEAT-ID input`);
    if (invented.length) reasons.push(`${fileKey} membuat FEAT-ID baru: ${invented.join(", ")}`);
  }

  return metric(validDocuments / 2, reasons);
}

function evaluateStackConsistency(
  benchmarkCase: BenchmarkInputCase,
  documents: BenchmarkDocuments,
): BenchmarkMetric {
  const architecture = (documents.architecture ?? "").toLowerCase();
  const configured = [
    benchmarkCase.input.presets.framework,
    benchmarkCase.input.presets.database,
    benchmarkCase.input.presets.deployment,
    benchmarkCase.input.presets.programmingLanguage,
  ].filter((value): value is string => Boolean(value));
  const missing = configured.filter(
    (value) => !normalizedStackTerms(value).some((term) => architecture.includes(term)),
  );
  const score =
    configured.length === 0 ? 1 : (configured.length - missing.length) / configured.length;
  return metric(
    score,
    missing.length ? [`Stack form tidak ditemukan di architecture: ${missing.join(", ")}`] : [],
  );
}

function evaluateTaskActionability(documents: BenchmarkDocuments): BenchmarkMetric {
  const plan = documents["plan-task"] ?? "";
  const checks = [
    /- \[ \] .+/m.test(plan),
    /(?:est:\s*\d+\s*h|estimasi|\d+\s*jam)/i.test(plan),
    FEATURE_ID_PATTERN.test(plan),
    /^#{1,3}\s+.+/m.test(plan),
  ];
  FEATURE_ID_PATTERN.lastIndex = 0;
  const labels = ["checklist task", "estimasi", "FEAT-ID", "heading"];
  return metric(
    checks.filter(Boolean).length / checks.length,
    checks.flatMap((passed, index) => (passed ? [] : [`Plan tidak memiliki ${labels[index]}`])),
  );
}

function evaluateFormatIntegrity(documents: BenchmarkDocuments): BenchmarkMetric {
  const available = Object.entries(documents).filter(([, content]) => Boolean(content));
  const reasons: string[] = [];
  let valid = 0;

  for (const [fileKey, contentValue] of available) {
    const content = contentValue ?? "";
    const hasHeading = /^#{1,6}\s+.+/m.test(content);
    const wrapped = content.trimStart().startsWith("```markdown");
    const prdHasMetadata = fileKey !== "prd" || /^---\s*[\s\S]+?\n---/m.test(content);
    if (hasHeading && !wrapped && prdHasMetadata) valid += 1;
    if (!hasHeading) reasons.push(`${fileKey} tidak memiliki heading Markdown`);
    if (wrapped) reasons.push(`${fileKey} dibungkus outer code fence`);
    if (!prdHasMetadata) reasons.push("PRD tidak memiliki YAML front matter tertutup");
  }

  return metric(available.length === 0 ? 0 : valid / available.length, reasons);
}

function evaluateGroundedness(documents: BenchmarkDocuments): BenchmarkMetric {
  const content = Object.values(documents).join("\n");
  const claims = content.match(UNSOURCED_CLAIM_PATTERN) ?? [];
  return metric(
    claims.length === 0 ? 1 : Math.max(0, 1 - claims.length * 0.25),
    claims.length ? [`${claims.length} klaim kuantitatif/riset perlu verifikasi sumber`] : [],
  );
}

function evaluateUsageAccuracy(usage: BenchmarkUsage | undefined): BenchmarkMetric {
  if (!usage) return metric(1, ["Data usage belum tersedia; metrik tidak menurunkan skor"]);
  const ratios: number[] = [];
  if (usage.estimatedCredits && usage.actualCredits !== undefined) {
    ratios.push(
      Math.min(usage.estimatedCredits, usage.actualCredits) /
        Math.max(usage.estimatedCredits, usage.actualCredits),
    );
  }
  if (usage.estimatedOutputTokens && usage.actualOutputTokens !== undefined) {
    ratios.push(
      Math.min(usage.estimatedOutputTokens, usage.actualOutputTokens) /
        Math.max(usage.estimatedOutputTokens, usage.actualOutputTokens),
    );
  }
  if (!ratios.length) return metric(1, ["Pasangan estimated/actual usage belum lengkap"]);
  return metric(ratios.reduce((total, ratio) => total + ratio, 0) / ratios.length);
}

export function evaluateBenchmarkCase(
  benchmarkCase: BenchmarkInputCase,
  documents: BenchmarkDocuments,
  usage?: BenchmarkUsage,
  minimumScore = 0.75,
): BenchmarkCaseResult {
  const metrics = {
    completeness: evaluateCompleteness(documents),
    featureConsistency: evaluateFeatureConsistency(benchmarkCase, documents),
    crossDocumentConsistency: evaluateCrossDocumentConsistency(benchmarkCase, documents),
    stackConsistency: evaluateStackConsistency(benchmarkCase, documents),
    taskActionability: evaluateTaskActionability(documents),
    formatIntegrity: evaluateFormatIntegrity(documents),
    groundedness: evaluateGroundedness(documents),
    usageAccuracy: evaluateUsageAccuracy(usage),
  };
  const weights = {
    completeness: 0.2,
    featureConsistency: 0.2,
    crossDocumentConsistency: 0.15,
    stackConsistency: 0.1,
    taskActionability: 0.15,
    formatIntegrity: 0.1,
    groundedness: 0.05,
    usageAccuracy: 0.05,
  } as const;
  const score = clampScore(
    Object.entries(metrics).reduce(
      (total, [key, value]) => total + value.score * weights[key as keyof typeof weights],
      0,
    ),
  );

  return {
    caseId: benchmarkCase.id,
    score,
    passed: score >= minimumScore,
    metrics,
  };
}
