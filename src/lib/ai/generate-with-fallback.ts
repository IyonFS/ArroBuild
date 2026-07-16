import { generate } from "./generator";
import {
  resolveModelForClass,
  resolveModelsForClass,
  isProviderConfigured,
} from "@/lib/ai-gateway/model-router";
import { FALLBACK_CHAIN, shouldFallback, getBackoffMs } from "./retry-handler";
import { modelToProvider } from "./tier-enforcer";
import type { ModelClassId } from "@/lib/config/tiers";
import type { AIProvider } from "./prompts/shared";

export interface GenerateWithFallbackOptions {
  modelClass: ModelClassId;
  temperature?: number;
  maxOutputTokens?: number;
}

function providerForModel(modelName: string): AIProvider {
  return modelToProvider(modelName as Parameters<typeof modelToProvider>[0]);
}

export async function generateWithFallback(
  prompt: string,
  options: GenerateWithFallbackOptions
): Promise<string> {
  const primary = resolveModelForClass(options.modelClass);
  const chain = [
    primary.modelName,
    ...resolveModelsForClass(options.modelClass).filter((m) => m !== primary.modelName),
    ...(FALLBACK_CHAIN[primary.modelName as keyof typeof FALLBACK_CHAIN] ?? []),
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError: unknown;

  for (const modelName of chain) {
    const provider = providerForModel(modelName);
    if (!isProviderConfigured(provider)) continue;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await generate(prompt, {
          model: modelName,
          provider,
          temperature: options.temperature ?? 0.6,
          maxOutputTokens: options.maxOutputTokens,
        });
      } catch (err) {
        lastError = err;
        if (attempt < 1 && shouldFallback(err)) {
          await new Promise((r) => setTimeout(r, getBackoffMs(err, attempt)));
        }
      }
    }

    if (!shouldFallback(lastError)) break;
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
