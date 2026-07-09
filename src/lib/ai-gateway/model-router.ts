import type { ModelClassId } from "@/lib/config/tiers";
import type { AIProvider } from "@/lib/ai/prompts/shared";
import type { RoutedModel } from "./types";

const MODEL_ROUTES: Record<ModelClassId, RoutedModel[]> = {
  HEMAT: [
    { provider: "gemini", modelName: "gemini-2.5-flash", modelClass: "HEMAT" },
    { provider: "deepseek", modelName: "deepseek-v4-flash", modelClass: "HEMAT" },
  ],
  MENENGAH: [
    { provider: "gemini", modelName: "gemini-2.5-pro", modelClass: "MENENGAH" },
  ],
  FLAGSHIP: [
    { provider: "openai", modelName: "gpt-5.4", modelClass: "FLAGSHIP" },
    { provider: "anthropic", modelName: "claude-sonnet-4-20250514", modelClass: "FLAGSHIP" },
  ],
  ULTRA: [
    { provider: "anthropic", modelName: "claude-opus-4-20250514", modelClass: "ULTRA" },
    { provider: "openai", modelName: "gpt-5.5", modelClass: "ULTRA" },
  ],
};

export function resolveModelForClass(modelClass: ModelClassId): RoutedModel {
  const chain = MODEL_ROUTES[modelClass];
  return chain[0];
}

export function getFallbackChain(modelClass: ModelClassId): RoutedModel[] {
  return MODEL_ROUTES[modelClass] ?? MODEL_ROUTES.HEMAT;
}

export function legacyModelIdToClass(modelId: string): ModelClassId {
  if (modelId.includes("opus") || modelId.includes("gpt-5.5")) return "ULTRA";
  if (modelId.includes("sonnet") || modelId.includes("gpt-5")) return "FLAGSHIP";
  if (modelId.includes("pro") || modelId.includes("3.5")) return "MENENGAH";
  return "HEMAT";
}

export function legacyModelIdToProvider(modelId: string): AIProvider {
  if (modelId.startsWith("gemini")) return "gemini";
  if (modelId.startsWith("gpt")) return "openai";
  if (modelId.startsWith("claude")) return "anthropic";
  if (modelId.startsWith("deepseek")) return "deepseek";
  return "gemini";
}
