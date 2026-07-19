import {
  filterCandidatePackages,
  getStackPackage,
  listStackPackageSummariesForPrompt,
  STACK_KB_VERSION,
  STACK_PACKAGES,
  type StackPackage,
  type StackPriority,
  type StackProductType,
} from "@/lib/config/stack-advisor-kb";

export type StackAdvisorMode = "cepat" | "diskusi";

export const STACK_ADVISOR_CREDITS = {
  cepat: 8,
  diskusi: 8,
} as const;

export const STACK_ADVISOR_DISCUSSION_MAX_TURNS = 8;

export interface StackAdvisorRunInput {
  mode: StackAdvisorMode | string;
  productType?: string;
  stage?: string;
  priority?: string;
  budgetNote?: string;
  notes?: string;
  discussionBrief?: string;
}

export function estimateStackAdvisorCredits(mode: string): number {
  if (mode === "diskusi") return STACK_ADVISOR_CREDITS.diskusi;
  return STACK_ADVISOR_CREDITS.cepat;
}

export function recordToStackAdvisorInput(
  input: Record<string, string>
): StackAdvisorRunInput {
  return {
    mode: input.mode ?? "cepat",
    productType: input.productType,
    stage: input.stage,
    priority: input.priority,
    budgetNote: input.budgetNote,
    notes: input.notes,
    discussionBrief: input.discussionBrief,
  };
}

/**
 * AI is a sorter only — must pick package IDs from the curated KB.
 */
export function buildStackAdvisorPrompt(input: Record<string, string>): string {
  const data = recordToStackAdvisorInput(input);
  const candidates = filterCandidatePackages({
    productType: data.productType,
    priority: data.priority,
    stage: data.stage,
  });
  const candidateIds = new Set(candidates.map((c) => c.id));
  const catalog =
    candidates.length >= 2
      ? candidates
          .map((p) => formatPackageBlock(p))
          .join("\n\n---\n\n")
      : listStackPackageSummariesForPrompt();

  const vague =
    !data.productType?.trim() &&
    !data.priority?.trim() &&
    !(data.notes?.trim() || data.discussionBrief?.trim());

  return `Kamu adalah Stack Advisor ArroBuild. Bahasa: sama dengan input user (Indonesia/English).

## Prinsip WAJIB
- Kamu HANYA menyortir dari knowledge base curated di bawah.
- JANGAN mengarang framework, hosting, DB, atau AI provider di luar daftar.
- Tiap rekomendasi WAJIB memakai packageId yang ada di katalog.
- Knowledge base version: ${STACK_KB_VERSION}
- Valid package IDs (subset kandidat): ${[...candidateIds].join(", ") || STACK_PACKAGES.map((p) => p.id).join(", ")}

## Katalog (pilih HANYA dari sini)
${catalog}

## Brief user
- Mode: ${data.mode}
- Tipe produk: ${data.productType || "(belum jelas)"}
- Stage: ${data.stage || "(belum jelas)"}
- Prioritas: ${data.priority || "(belum jelas)"} — speed=cepat ship, cost=hemat biaya, scale=siap tumbuh
- Budget note: ${data.budgetNote || "—"}
- Catatan / diskusi: ${data.notes || data.discussionBrief || "—"}

${
  vague
    ? `## Status: TERLALU VAGUE
Jangan kasih rekomendasi generik. Minta klarifikasi singkat.
Balas HANYA JSON:
{"status":"need_more_info","questions":["...","..."],"packages":[]}`
    : `## Tugas
Pilih 2 atau 3 package terbaik dari katalog. Urutkan terbaik di index 0.
Sertakan alasan singkat yang merujuk ke field curated (why/tradeoffs/cost), bukan opini bebas.

Balas HANYA JSON valid (tanpa markdown fence):
{
  "status": "ok",
  "packages": [
    {
      "packageId": "pkg-...",
      "fitScore": 1,
      "whyPicked": ["Dipilih karena: ...", "..."],
      "watchOuts": ["..."]
    }
  ],
  "summary": "satu kalimat ringkas untuk user"
}`
}`;
}

function formatPackageBlock(p: StackPackage): string {
  return [
    `ID: ${p.id}`,
    `Nama: ${p.name}`,
    `Tagline: ${p.tagline}`,
    `Tipe: ${p.productTypes.join(", ")}`,
    `Prioritas: ${p.priorities.join(", ")}`,
    `Stage: ${p.stages.join(", ")}`,
    `Stack: ${p.framework}${p.backendFramework ? ` + ${p.backendFramework}` : ""} / ${p.database} / ${p.deployment}`,
    `AI: ${p.aiProviderLabel}`,
    `Hosting: ${p.hostingLabel}`,
    `Biaya: Rp${p.monthlyCost.minIdr.toLocaleString("id-ID")}–${p.monthlyCost.maxIdr.toLocaleString("id-ID")}/bln (${p.monthlyCost.note})`,
    `Why: ${p.why.join("; ")}`,
    `Tradeoffs: ${p.tradeoffs.join("; ")}`,
  ].join("\n");
}

export interface AdvisorPackagePick {
  packageId: string;
  fitScore?: number;
  whyPicked: string[];
  watchOuts: string[];
}

export interface AdvisorResultOk {
  status: "ok";
  packages: AdvisorPackagePick[];
  summary: string;
}

export interface AdvisorResultNeedInfo {
  status: "need_more_info";
  questions: string[];
  packages: [];
}

export type AdvisorParsedResult = AdvisorResultOk | AdvisorResultNeedInfo;

export function parseAdvisorOutput(raw: string): AdvisorParsedResult | null {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence?.[1]?.trim() ?? trimmed;
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      parsed = JSON.parse(body.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const rec = parsed as Record<string, unknown>;

  if (rec.status === "need_more_info") {
    const questions = Array.isArray(rec.questions)
      ? rec.questions.filter((q): q is string => typeof q === "string").slice(0, 5)
      : [];
    return { status: "need_more_info", questions, packages: [] };
  }

  const packagesRaw = Array.isArray(rec.packages) ? rec.packages : [];
  const packages: AdvisorPackagePick[] = [];
  for (const item of packagesRaw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const packageId = typeof row.packageId === "string" ? row.packageId.trim() : "";
    if (!packageId || !getStackPackage(packageId)) continue;
    packages.push({
      packageId,
      fitScore: typeof row.fitScore === "number" ? row.fitScore : undefined,
      whyPicked: Array.isArray(row.whyPicked)
        ? row.whyPicked.filter((x): x is string => typeof x === "string").slice(0, 5)
        : [],
      watchOuts: Array.isArray(row.watchOuts)
        ? row.watchOuts.filter((x): x is string => typeof x === "string").slice(0, 4)
        : [],
    });
  }

  if (packages.length === 0) return null;

  return {
    status: "ok",
    packages: packages.slice(0, 3),
    summary: typeof rec.summary === "string" ? rec.summary : "Berikut paket yang cocok dari knowledge base kami.",
  };
}

/** Fallback sorter without AI — deterministic for vague-safe MVP. */
export function fallbackSortPackages(input: {
  productType?: string;
  priority?: string;
  stage?: string;
}): AdvisorResultOk {
  const list = filterCandidatePackages(input);
  const picks = list.slice(0, 3).map((p, i) => ({
    packageId: p.id,
    fitScore: 3 - i,
    whyPicked: p.why.slice(0, 2).map((w) => `Dipilih karena: ${w}`),
    watchOuts: p.tradeoffs.slice(0, 2),
  }));
  return {
    status: "ok",
    packages: picks,
    summary: "Paket diurutkan dari knowledge base curated ArroBuild (fallback lokal).",
  };
}

export function isStackPriority(v: string): v is StackPriority {
  return v === "speed" || v === "cost" || v === "scale";
}

export function isStackProductType(v: string): v is StackProductType {
  return [
    "saas",
    "marketplace",
    "mobile",
    "api",
    "portfolio",
    "internal",
    "ecommerce",
    "ai-app",
    "other",
  ].includes(v);
}
