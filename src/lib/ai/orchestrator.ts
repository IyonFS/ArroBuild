/**
 * orchestrator.ts (v3 — slim version)
 * Hanya bertanggung jawab mengkoordinasikan urutan generate dokumen.
 * Semua concern lain didelegasikan ke modul spesialis.
 *
 * Backward-compatible: tetap mengekspos GenerationEvent, FileKey, ALL_FILES, dll.
 */

import { streamWithFinishReason, type GenerationConfig } from "./generator";
import { buildPromptForTier } from "./prompts/shared";
import { ContextManager } from "./context-manager";
import {
  FALLBACK_CHAIN,
  getBackoffMs,
  isFreeTierQuotaError,
  shouldFallback,
} from "./retry-handler";
import {
  queueFileWrite,
  queueProjectStatusUpdate,
} from "./db-writer";
import { StreamWriter } from "./stream-writer";
import {
  toV3Tier,
  enforceTier,
  V3_TIER_CONFIG,
  modelToProvider,
  type V3Tier,
  type ModelId,
} from "./tier-enforcer";
import { validateGeneratedContent, buildContinuationPrompt } from "./validation";
import { formatGenerationError } from "./errors";
import type { FileKey, GenerationInput } from "./prompts/shared";

// ─── Public Re-exports (backward compat) ───────────────────────────────────

export type { FileKey } from "./prompts/shared";
export type GenerationStatus = "pending" | "generating" | "done" | "error";

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

// Urutan dokumen yang canonical (context harus selalu paling awal)
const DOC_ORDER: FileKey[] = [
  "context",
  "prd",
  "plan",
  "design-system",
  "agents",
  "production-hardening",
  "scale-performance",
  "growth-quality",
];

// ─── Legacy GenerationEvent (untuk backward-compat dengan route.ts & client) ──

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
  success?: boolean;
  failedFiles?: Partial<Record<FileKey, string>>;
}

export function getFilesForTier(tier: string): FileDefinition[] {
  const v3 = toV3Tier(tier);
  const allowed = V3_TIER_CONFIG[v3].allowedDocuments;
  return allowed.map((key) => ALL_FILES[key]);
}

// ─── Internal: stream-complete single file ─────────────────────────────────

const MAX_CONTINUATIONS = 2;

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
    // Strip markdown wrapper if model wrapped output
    const trimmed = content.trim();
    if (trimmed.startsWith("```markdown") || trimmed.startsWith("```md")) {
      content = trimmed
        .replace(/^```(?:markdown|md)\s*\n?/, "")
        .replace(/\n?```\s*$/, "")
        .trim();
    }

    const validation = validateGeneratedContent(content, fileKey, finishReason);
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

// ─── Main Orchestrator ─────────────────────────────────────────────────────

export interface OrchestrateOptions {
  input: GenerationInput;
  projectId: string;
  /** If provided, use StreamWriter for structured events. Otherwise use legacy generator. */
  streamWriter?: StreamWriter;
}

/**
 * v3 Slim Orchestrator.
 * Yields GenerationEvent objects (legacy format) for SSE via route.ts.
 * Internally delegates all concerns to specialist modules.
 */
export async function* orchestrateGeneration(
  input: GenerationInput,
  projectId?: string
): AsyncGenerator<GenerationEvent> {
  const tier = input.tier ?? "free";
  const v3Tier: V3Tier = toV3Tier(tier);
  const tierConfig = V3_TIER_CONFIG[v3Tier];

  // Determine which docs to generate (tier-enforced)
  const requestedDocs: FileKey[] = input.selectedDocs ??
    DOC_ORDER.filter((k) => tierConfig.allowedDocuments.includes(k));

  const enforcement = enforceTier(requestedDocs, input.modelId, v3Tier);
  const primaryModel = enforcement.resolvedModel;
  const provider = modelToProvider(primaryModel);

  const genConfig: GenerationConfig = {
    maxOutputTokens: tierConfig.maxTokensPerDoc,
    temperature: 0.7,
    model: primaryModel,
    provider,
  };

  // Sort docs by canonical order
  const docsToGenerate = DOC_ORDER.filter((k) =>
    enforcement.sanitizedDocs.includes(k)
  );

  const contextManager = new ContextManager();
  const generatedFiles: Partial<Record<FileKey, string>> = {};
  const failedFiles: Partial<Record<FileKey, string>> = {};

  for (const fileKey of docsToGenerate) {
    const fileDef = ALL_FILES[fileKey];
    const { fileName, label } = fileDef;

    // Build prompt using accumulated context
    const contextString = contextManager.buildContextString(fileKey);
    const prompt = buildPromptForTier(fileKey, input, v3Tier, contextString);

    yield { type: "progress", fileKey, fileName, label };

    let fullContent = "";
    let usedModel = primaryModel;
    let totalAttempts = 0;
    let lastError: unknown;
    let successGeneration = false;

    const tierAllowed = V3_TIER_CONFIG[v3Tier].allowedModels;
    const chain = [
      primaryModel,
      ...(FALLBACK_CHAIN[primaryModel] ?? []),
    ].filter((m) => tierAllowed.includes(m));

    const maxRetriesPerModel = 2;

    for (let modelIdx = 0; modelIdx < chain.length; modelIdx++) {
      const model = chain[modelIdx];

      for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
        totalAttempts++;
        if (totalAttempts > 1) {
          yield { type: "retry", fileKey, attempt: totalAttempts };
        }

        try {
          const attemptConfig: GenerationConfig = {
            ...genConfig,
            model,
            provider: modelToProvider(model),
          };

          let fileContent = "";
          const fileStream = streamCompleteFile(prompt, fileKey, attemptConfig);

          while (true) {
            const result = await fileStream.next();
            if (result.done) {
              fileContent = result.value;
              break;
            }
            yield { type: "chunk", fileKey, chunk: result.value };
          }

          fullContent = fileContent;
          usedModel = model;
          successGeneration = true;
          break; // success, break retry loop
        } catch (err) {
          lastError = err;

          if (isFreeTierQuotaError(err)) break; // Cannot recover, will break model loop too later

          const canRetry = attempt < maxRetriesPerModel - 1;
          const canFallback = shouldFallback(err);

          if (!canRetry && !canFallback) break;

          if (canRetry) {
            const delay = getBackoffMs(err, attempt);
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }

      if (successGeneration) break;
      if (!shouldFallback(lastError)) break;
    }

    if (!successGeneration) {
      const errorMessage = formatGenerationError(lastError);
      failedFiles[fileKey] = errorMessage;
      yield { type: "error", fileKey, fileName, label, error: errorMessage };
      continue;
    }

    // Update accumulated context for next documents
    contextManager.addDocument(fileKey, fullContent);
    generatedFiles[fileKey] = fullContent;

      // Non-blocking DB write
      if (projectId) {
        queueFileWrite({
          projectId,
          fileKey,
          fileName,
          label,
          content: fullContent,
          modelUsed: usedModel,
        });
      }

      yield { type: "file_done", fileKey, fileName, label, content: fullContent };
  }

  const successCount = Object.keys(generatedFiles).length;
  const success =
    successCount > 0 && Object.keys(failedFiles).length === 0;

  // Non-blocking project status update
  if (projectId) {
    const status = success
      ? "DONE"
      : successCount > 0
      ? "DONE" // partial success still DONE — failed files recorded separately
      : "FAILED";
    queueProjectStatusUpdate(projectId, status);
  }

  const primaryError =
    Object.values(failedFiles)[0] ??
    (successCount === 0 ? "No files were generated." : undefined);

  yield {
    type: "all_done",
    success,
    files: successCount > 0 ? (generatedFiles as Record<string, string>) : undefined,
    failedFiles: Object.keys(failedFiles).length > 0 ? failedFiles : undefined,
    error: success ? undefined : primaryError,
  };
}
