import type { FileKey } from "./prompts/shared";
import {
  dedupeRepeatedDocument,
  hasDuplicateDocumentStructure,
  mergeContinuationContent,
  sanitizeGeneratedContent,
  stripOuterCodeFences,
} from "./content-merge";

export {
  dedupeRepeatedDocument,
  hasDuplicateDocumentStructure,
  mergeContinuationContent,
  sanitizeGeneratedContent,
  stripOuterCodeFences,
};

export interface FileRequirements {
  minChars: number;
  minHeadings: number;
  requiredPatterns: RegExp[];
}

export const FILE_REQUIREMENTS: Record<FileKey, FileRequirements> = {
  prd: {
    minChars: 1800,
    minHeadings: 5,
    requiredPatterns: [
      /masalah yang diselesaikan|problem statement/i,
      /ringkasan produk|solution overview/i,
      /target pengguna|target users/i,
      /fitur utama|feat-\d{3}/i,
      /cara kerja|alur pengguna/i,
      /batasan|mvp scope/i,
      /model harga|peran dua sisi|platform & fitur|pengguna api|katalog|model ai|pengguna internal|proyek unggulan|konteks produk/i,
    ],
  },
  architecture: {
    minChars: 1500,
    minHeadings: 4,
    requiredPatterns: [
      /vision|overview|keputusan teknis/i,
      /tech stack|architecture|arsitektur|struktur folder/i,
      /database|schema|skema/i,
    ],
  },
  "plan-task": {
    minChars: 1200,
    minHeadings: 3,
    requiredPatterns: [
      /roadmap|phase|fase|pembagian fase/i,
      /estimasi|task|tugas|\- \[ \]/i,
    ],
  },
  "design-system": {
    minChars: 1800,
    minHeadings: 5,
    requiredPatterns: [/color/i, /typography/i, /component/i],
  },
  "agent-rules": {
    minChars: 1500,
    minHeadings: 4,
    requiredPatterns: [/agent|role/i, /rules/i],
  },
  "adaptive-document": {
    minChars: 1500,
    minHeadings: 4,
    requiredPatterns: [/strategy|approach/i],
  },
  "cost-infrastructure": {
    minChars: 1200,
    minHeadings: 4,
    requiredPatterns: [/cost|budget/i, /infrastructure|hosting/i],
  },
  "analytics-metrics": {
    minChars: 1200,
    minHeadings: 4,
    requiredPatterns: [/metric|analytics/i, /event|tracking/i],
  },
  "testing-qa": {
    minChars: 1200,
    minHeadings: 4,
    requiredPatterns: [/test/i, /qa|quality/i],
  },
  "onboarding-email": {
    minChars: 1200,
    minHeadings: 4,
    requiredPatterns: [/onboarding/i, /email/i],
  },
  "competitive-analysis": {
    minChars: 1200,
    minHeadings: 4,
    requiredPatterns: [/competitor|competitive/i],
  },
  "security-launch": {
    minChars: 1500,
    minHeadings: 4,
    requiredPatterns: [/security/i, /launch|checklist/i],
  },
  "database-deep-dive": {
    minChars: 1500,
    minHeadings: 4,
    requiredPatterns: [/database|schema/i, /index|performance/i],
  },
  "compliance-legal": {
    minChars: 1200,
    minHeadings: 4,
    requiredPatterns: [/privacy|compliance/i, /legal|terms/i],
  },
};

export interface ValidationResult {
  valid: boolean;
  truncated: boolean;
  reasons: string[];
}

const TRUNCATED_FINISH_REASONS = new Set([
  "MAX_TOKENS",
  "max_tokens",
  "length",
  "model_length",
]);

export function endsAbruptly(content: string): boolean {
  const trimmed = content.trimEnd();
  if (!trimmed) return true;

  const lastChar = trimmed.at(-1) ?? "";
  if (".!?*`)]}>\"'".includes(lastChar)) return false;
  if (trimmed.endsWith("---")) return false;

  if (/[\(\[,;:]$/.test(trimmed)) return true;

  const lastLine = (trimmed.split("\n").pop() ?? "").trim();
  if (lastLine.length > 30 && !/[.!?*`)\]"']$/.test(lastLine)) {
    return true;
  }

  return false;
}

export function countHeadings(content: string): number {
  return (content.match(/^#{1,3}\s+.+/gm) ?? []).length;
}

export function isTruncatedFinishReason(finishReason: string | null | undefined): boolean {
  if (!finishReason) return false;
  return TRUNCATED_FINISH_REASONS.has(finishReason);
}

export function validateGeneratedContent(
  content: string,
  fileKey: FileKey,
  finishReason?: string | null
): ValidationResult {
  const reasons: string[] = [];
  const req = FILE_REQUIREMENTS[fileKey];
  const cleaned = sanitizeGeneratedContent(content);

  if (!cleaned.trim()) {
    return { valid: false, truncated: true, reasons: ["empty content"] };
  }

  if (cleaned.trimStart().startsWith("```markdown")) {
    reasons.push("wrapped in markdown code block");
  }

  if (!/^#{1,6}\s+.+/m.test(cleaned)) {
    reasons.push("missing markdown headings");
  }

  if (cleaned.length < req.minChars) {
    reasons.push(`too short (${cleaned.length} chars, need ${req.minChars}+)`);
  }

  const headings = countHeadings(cleaned);
  if (headings < req.minHeadings) {
    reasons.push(`insufficient sections (${headings} headings, need ${req.minHeadings}+)`);
  }

  for (const pattern of req.requiredPatterns) {
    if (!pattern.test(cleaned)) {
      reasons.push(`missing section matching ${pattern.source}`);
    }
  }

  const truncatedByFinish = isTruncatedFinishReason(finishReason);
  const truncatedByEnding =
    endsAbruptly(cleaned) &&
    (cleaned.length < req.minChars || countHeadings(cleaned) < req.minHeadings);
  const truncated = truncatedByFinish || truncatedByEnding;

  if (truncatedByFinish) {
    reasons.push(`model stopped due to token limit (${finishReason})`);
  }
  if (truncatedByEnding) {
    reasons.push("content ends abruptly mid-sentence");
  }

  return {
    valid: reasons.length === 0,
    truncated,
    reasons,
  };
}

const DOC_MAIN_HEADINGS: Partial<Record<FileKey, string>> = {
  prd: "# Product Requirements Document",
  architecture: "# Architecture & Technical Blueprint",
  "plan-task": "# Plan / Task",
};

export function buildRepairPrompt(
  _originalPrompt: string,
  partialContent: string,
  reasons: string[],
  fileKey: FileKey = "prd"
): string {
  const issues = reasons.filter((r) => !r.includes("token limit"));
  const draft = sanitizeGeneratedContent(partialContent);
  const draftForPrompt = draft.length > 14000 ? draft.slice(0, 14000) + "\n...[truncated]..." : draft;
  const mainHeading = DOC_MAIN_HEADINGS[fileKey] ?? "# Document";

  return `Fix and complete this ${fileKey} document. Output ONE single complete markdown file.

ISSUES:
${issues.length ? issues.map((r) => `- ${r}`).join("\n") : "- incomplete or missing sections"}

RULES:
- Output the FULL corrected document as a single replacement (not an addendum)
- Keep ONE metadata block at the top if the document type requires it — never duplicate metadata
- Keep ONE main heading (${mainHeading}) — never duplicate it
- Preserve FEAT-XXX IDs and valid existing sections
- Use Indonesian section titles where applicable
- Be specific to the user's product idea — avoid generic filler
- Raw markdown only — no outer code fences

CURRENT DRAFT:
${draftForPrompt}`;
}

export function buildContinuationPrompt(
  partialContent: string,
  fileKey: FileKey
): string {
  const cleaned = sanitizeGeneratedContent(partialContent);
  const tail = cleaned.slice(-2800);

  return `Continue the ${fileKey} document from the exact cut-off below.

CRITICAL:
- Output ONLY new content to append — do NOT repeat anything already written
- Do NOT output YAML metadata again
- Do NOT output "# Product Requirements Document" again
- Do NOT restart section numbering from 1
- Complete all remaining required sections

END OF DOCUMENT SO FAR:
<partial_output>
${tail}
</partial_output>

Continue from the cut-off point.`;
}
