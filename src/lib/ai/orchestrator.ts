import { streamWithFinishReason, GenerationConfig } from "./generator";
import { buildContextPrompt } from "./prompts/context";
import { buildPrdPrompt } from "./prompts/prd";
import { buildPlanPrompt } from "./prompts/plan";
import { buildDesignSystemPrompt } from "./prompts/design-system";
import { buildAgentsPrompt } from "./prompts/agents-prompt";
import { buildProductionHardeningPrompt } from "./prompts/production-hardening";
import { buildScalePerformancePrompt } from "./prompts/scale-performance";
import { buildGrowthQualityPrompt } from "./prompts/growth-quality";
import {
  GenerationInput,
  AccumulatedContext,
  FileKey,
  UserTier,
  TIER_CONFIGS,
  getModelOption,
} from "./prompts/shared";
import {
  validateGeneratedContent,
  buildContinuationPrompt,
} from "./validation";
import { formatGenerationError, isQuotaError } from "./errors";

// Legacy imports kept for backward-compatibility if needed
export type { FileKey } from "./prompts/shared";

export interface FileDefinition {
  key: FileKey;
  fileName: string;
  label: string;
}

export const ALL_FILES: Record<FileKey, FileDefinition> = {
  prd: { key: "prd", fileName: "prd.md", label: "Product Requirements" },
  context: { key: "context", fileName: "context.md", label: "Project Context" },
  plan: { key: "plan", fileName: "plan.md", label: "Development Plan" },
  "design-system": {
    key: "design-system",
    fileName: "design-system.md",
    label: "Design System",
  },
  agents: { key: "agents", fileName: "agents.md", label: "AI Agents & Rules" },
  "production-hardening": {
    key: "production-hardening",
    fileName: "production-hardening.md",
    label: "Production Hardening",
  },
  "scale-performance": {
    key: "scale-performance",
    fileName: "scale-performance.md",
    label: "Scale & Performance",
  },
  "growth-quality": {
    key: "growth-quality",
    fileName: "growth-quality.md",
    label: "Growth & Quality",
  },
};

/** Get the ordered list of files for a given tier */
export function getFilesForTier(tier: UserTier): FileDefinition[] {
  const config = TIER_CONFIGS[tier];
  return config.fileKeys.map((key) => ALL_FILES[key]);
}

export type GenerationStatus = "pending" | "generating" | "done" | "error";

export interface FileProgress {
  key: FileKey;
  fileName: string;
  label: string;
  status: GenerationStatus;
  content?: string;
  error?: string;
}

export interface GenerationEvent {
  type:
    | "progress"
    | "chunk"
    | "file_done"
    | "all_done"
    | "error"
    | "retry";
  fileKey?: FileKey;
  fileName?: string;
  label?: string;
  chunk?: string;
  content?: string;
  files?: Record<string, string>;
  error?: string;
  attempt?: number;
  /** false when one or more files failed */
  success?: boolean;
  failedFiles?: Partial<Record<FileKey, string>>;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildPrompt(
  fileKey: FileKey,
  input: GenerationInput,
  ctx: AccumulatedContext
): string {
  switch (fileKey) {
    case "prd":
      return buildPrdPrompt(input, ctx.contextMd);
    case "context":
      return buildContextPrompt(input);
    case "plan":
      return buildPlanPrompt(input, ctx.contextMd ?? "", ctx.prdMd ?? "");
    case "design-system":
      return buildDesignSystemPrompt(
        input,
        ctx.contextMd ?? "",
        ctx.prdMd ?? ""
      );
    case "agents":
      return buildAgentsPrompt(input, ctx.contextMd ?? "", ctx.prdMd ?? "");
    case "production-hardening":
      return buildProductionHardeningPrompt(
        input,
        ctx.contextMd ?? "",
        ctx.prdMd ?? "",
        ctx.planMd ?? ""
      );
    case "scale-performance":
      return buildScalePerformancePrompt(
        input,
        ctx.contextMd ?? "",
        ctx.prdMd ?? "",
        ctx.planMd ?? ""
      );
    case "growth-quality":
      return buildGrowthQualityPrompt(
        input,
        ctx.contextMd ?? "",
        ctx.prdMd ?? ""
      );
    default:
      throw new Error(`Unknown file key: ${fileKey}`);
  }
}

function updateContext(
  ctx: AccumulatedContext,
  fileKey: FileKey,
  content: string
): AccumulatedContext {
  switch (fileKey) {
    case "context":
      return { ...ctx, contextMd: content };
    case "prd":
      return { ...ctx, prdMd: content };
    case "plan":
      return { ...ctx, planMd: content };
    case "design-system":
      return { ...ctx, designSystemMd: content };
    case "agents":
      return { ...ctx, agentsMd: content };
    default:
      return ctx;
  }
}

/**
 * Strip markdown code block wrapping if the model wrapped the output.
 */
function stripMarkdownWrapper(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith("```markdown") || trimmed.startsWith("```md")) {
    const afterFence = trimmed.replace(/^```(?:markdown|md)\s*\n?/, "");
    return afterFence.replace(/\n?```\s*$/, "").trim();
  }
  return content;
}

const MAX_ATTEMPTS = 5;
const MAX_CONTINUATIONS = 2;

function getRetryDelayMs(err: unknown, attempt: number): number {
  const base = 1500 * Math.pow(2, attempt - 1);
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
    const secMatch =
      message.match(/retry in (\d+(?:\.\d+)?)s/i) ??
      message.match(/"retryDelay":\s*"(\d+)s"/);
    if (secMatch) {
      return Math.ceil(parseFloat(secMatch[1]) * 1000) + 2000;
    }
    return 35000;
  }
  return base;
}

function getMaxAttempts(err: unknown): number {
  // Daily free-tier quota won't recover with retries — fail fast with clear message
  if (isQuotaError(err)) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("free_tier") || message.includes("FreeTier")) {
      return 1;
    }
  }
  return MAX_ATTEMPTS;
}

/**
 * Stream-generate a file with auto-continuation when output is truncated.
 * Yields text chunks; returns final validated content.
 */
async function* streamCompleteFile(
  prompt: string,
  fileKey: FileKey,
  genConfig: GenerationConfig
): AsyncGenerator<string, string, undefined> {
  let content = "";
  let currentPrompt = prompt;

  for (let pass = 0; pass <= MAX_CONTINUATIONS; pass++) {
    let passText = "";
    let finishReason: string | null = null;

    const stream = streamWithFinishReason(currentPrompt, genConfig);
    while (true) {
      const result = await stream.next();
      if (result.done) {
        finishReason = result.value ?? null;
        break;
      }
      passText += result.value;
      yield result.value;
    }

    content = pass === 0 ? passText : content + passText;
    content = stripMarkdownWrapper(content);

    const validation = validateGeneratedContent(
      content,
      fileKey,
      finishReason
    );

    if (validation.valid) return content;

    if (!validation.truncated || pass >= MAX_CONTINUATIONS) {
      throw new Error(
        `Generated content incomplete: ${validation.reasons.join("; ")}`
      );
    }

    currentPrompt = buildContinuationPrompt(prompt, content);
  }

  return content;
}

// ─── Main Orchestrator ───────────────────────────────────────────────────────

/**
 * Sequentially generates files based on the user's tier.
 * Yields GenerationEvent objects that can be serialized as SSE.
 */
export async function* orchestrateGeneration(
  input: GenerationInput
): AsyncGenerator<GenerationEvent> {
  const tier = input.tier ?? "free";
  const tierConfig = TIER_CONFIGS[tier];
  
  // Use selectedDocs if provided, otherwise fallback to all files for the tier (which is now all files)
  const filesToGenerate = input.selectedDocs 
    ? input.selectedDocs.map(k => ALL_FILES[k])
    : getFilesForTier(tier);
    
  const generatedFiles: Partial<Record<FileKey, string>> = {};
  let ctx: AccumulatedContext = {};

  const selectedModel = input.modelId
    ? getModelOption(input.modelId)
    : undefined;
  const modelId = selectedModel?.id ?? tierConfig.defaultModel;
  const provider = selectedModel?.provider ?? undefined;

  const genConfig: GenerationConfig = {
    maxOutputTokens: tierConfig.maxOutputTokens,
    temperature: 0.7,
    model: modelId,
    provider,
  };

  // For free tier: generate PRD first (standalone)
  // For paid tiers: generate Context first, then PRD (with context), then rest
  // Reorder files so context comes before prd if both present
  const orderedFiles = [...filesToGenerate];
  const contextIdx = orderedFiles.findIndex((f) => f.key === "context");
  const prdIdx = orderedFiles.findIndex((f) => f.key === "prd");
  if (contextIdx > prdIdx && contextIdx !== -1 && prdIdx !== -1) {
    [orderedFiles[contextIdx], orderedFiles[prdIdx]] = [
      orderedFiles[prdIdx],
      orderedFiles[contextIdx],
    ];
  }

  const failedFiles: Partial<Record<FileKey, string>> = {};
  let generationFailed = false;

  for (const file of orderedFiles) {
    if (generationFailed) break;

    const { key, fileName, label } = file;
    const prompt = buildPrompt(key, input, ctx);
    let fullContent = "";
    let attempts = 0;

    try {
      while (attempts < MAX_ATTEMPTS) {
        attempts++;
        fullContent = "";

        yield { type: "progress", fileKey: key, fileName, label };

        if (attempts > 1) {
          yield { type: "retry", fileKey: key, attempt: attempts };
        }

        try {
          const attemptConfig: GenerationConfig = {
            ...genConfig,
            maxOutputTokens:
              (genConfig.maxOutputTokens ?? 8192) + (attempts - 1) * 4096,
          };

          const fileStream = streamCompleteFile(prompt, key, attemptConfig);
          while (true) {
            const result = await fileStream.next();
            if (result.done) {
              fullContent = result.value;
              break;
            }
            yield { type: "chunk", fileKey: key, chunk: result.value };
          }

          break;
        } catch (streamErr) {
          const maxAttempts = getMaxAttempts(streamErr);
          if (attempts >= maxAttempts) {
            throw streamErr;
          }
          const delay = getRetryDelayMs(streamErr, attempts);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      generatedFiles[key] = fullContent;
      ctx = updateContext(ctx, key, fullContent);

      yield {
        type: "file_done",
        fileKey: key,
        fileName,
        label,
        content: fullContent,
      };
    } catch (err) {
      const errorMessage = formatGenerationError(err);
      failedFiles[key] = errorMessage;
      generationFailed = true;

      yield {
        type: "error",
        fileKey: key,
        fileName,
        label,
        error: errorMessage,
      };
    }
  }

  const expectedCount = orderedFiles.length;
  const successCount = Object.keys(generatedFiles).length;
  const success =
    !generationFailed &&
    successCount === expectedCount &&
    successCount > 0;

  const primaryError =
    Object.values(failedFiles)[0] ??
    (successCount === 0 ? "No files were generated." : undefined);

  yield {
    type: "all_done",
    success,
    files: success ? (generatedFiles as Record<string, string>) : undefined,
    failedFiles: success ? undefined : failedFiles,
    error: success ? undefined : primaryError,
  };
}
