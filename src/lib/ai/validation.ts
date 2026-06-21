import type { FileKey } from "./prompts/shared";

export interface FileRequirements {
  minChars: number;
  minHeadings: number;
  requiredPatterns: RegExp[];
}

export const FILE_REQUIREMENTS: Record<FileKey, FileRequirements> = {
  prd: {
    minChars: 2500,
    minHeadings: 8,
    requiredPatterns: [
      /problem statement/i,
      /solution/i,
      /target users/i,
      /mvp scope/i,
      /user stories/i,
      /open questions/i,
    ],
  },
  context: {
    minChars: 1800,
    minHeadings: 6,
    requiredPatterns: [/vision/i, /goals/i, /tech stack/i],
  },
  plan: {
    minChars: 2000,
    minHeadings: 6,
    requiredPatterns: [/roadmap/i, /tech stack/i, /tasks/i],
  },
  "design-system": {
    minChars: 1800,
    minHeadings: 5,
    requiredPatterns: [/color/i, /typography/i, /component/i],
  },
  agents: {
    minChars: 1500,
    minHeadings: 4,
    requiredPatterns: [/agent/i, /rules/i],
  },
  "production-hardening": {
    minChars: 1500,
    minHeadings: 4,
    requiredPatterns: [/security/i, /monitoring/i],
  },
  "scale-performance": {
    minChars: 1500,
    minHeadings: 4,
    requiredPatterns: [/scal/i, /performance/i],
  },
  "growth-quality": {
    minChars: 1500,
    minHeadings: 4,
    requiredPatterns: [/growth|go-to-market/i, /quality|testing/i],
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

/** Detect if text ends mid-thought (common sign of token cutoff). */
export function endsAbruptly(content: string): boolean {
  const trimmed = content.trimEnd();
  if (!trimmed) return true;

  const lastChar = trimmed.at(-1) ?? "";
  if (".!?*`)]}>\"'".includes(lastChar)) return false;
  if (trimmed.endsWith("---")) return false;

  // Ends with list marker dash or open bracket/paren
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

  if (!content.trim()) {
    return { valid: false, truncated: true, reasons: ["empty content"] };
  }

  if (content.trimStart().startsWith("```markdown")) {
    reasons.push("wrapped in markdown code block");
  }

  if (!/^#{1,6}\s+.+/m.test(content)) {
    reasons.push("missing markdown headings");
  }

  if (content.length < req.minChars) {
    reasons.push(
      `too short (${content.length} chars, need ${req.minChars}+)`
    );
  }

  const headings = countHeadings(content);
  if (headings < req.minHeadings) {
    reasons.push(
      `insufficient sections (${headings} headings, need ${req.minHeadings}+)`
    );
  }

  for (const pattern of req.requiredPatterns) {
    if (!pattern.test(content)) {
      reasons.push(`missing section matching ${pattern.source}`);
    }
  }

  const truncatedByFinish = isTruncatedFinishReason(finishReason);
  const truncatedByEnding = endsAbruptly(content);
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

export function buildContinuationPrompt(
  originalPrompt: string,
  partialContent: string
): string {
  const tail = partialContent.slice(-1200);
  return `${originalPrompt}

IMPORTANT: Your previous response was cut off. Continue EXACTLY where you stopped.
Do NOT repeat any content already written. Complete ALL remaining sections.

<partial_output tail="true">
${tail}
</partial_output>

Continue from the exact cut-off point and finish the entire document.`;
}
