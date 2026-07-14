import type { ModelClassId } from "@/lib/config/tiers";
import type { AIProvider } from "@/lib/ai/prompts/shared";
import type { RoutedModel } from "./types";
import type { ModelClass } from "@/lib/config/documents";

export function isProviderConfigured(provider: AIProvider): boolean {
  switch (provider) {
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY?.trim());
    case "deepseek":
      return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY?.trim());
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    default:
      return false;
  }
}

const MODEL_ROUTES: Record<ModelClassId, RoutedModel[]> = {
  HEMAT: [
    { provider: "gemini", modelName: "gemini-3.1-flash-lite", modelClass: "HEMAT" },
    { provider: "deepseek", modelName: "deepseek-v4-flash", modelClass: "HEMAT" },
  ],
  MENENGAH: [
    { provider: "gemini", modelName: "gemini-3.5-flash", modelClass: "MENENGAH" },
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

export function getFallbackChain(modelClass: ModelClassId): RoutedModel[] {
  const chain = MODEL_ROUTES[modelClass] ?? MODEL_ROUTES.HEMAT;
  const configured = chain.filter((r) => isProviderConfigured(r.provider));
  return configured.length > 0 ? configured : chain;
}

export function resolveModelForClass(modelClass: ModelClassId): RoutedModel {
  return getFallbackChain(modelClass)[0];
}

export function modelClassSlugToId(slug: ModelClass | string): ModelClassId {
  const map: Record<string, ModelClassId> = {
    hemat: "HEMAT",
    menengah: "MENENGAH",
    flagship: "FLAGSHIP",
    ultra: "ULTRA",
    HEMAT: "HEMAT",
    MENENGAH: "MENENGAH",
    FLAGSHIP: "FLAGSHIP",
    ULTRA: "ULTRA",
  };
  return map[slug] ?? "HEMAT";
}

export function resolveModelsForClass(modelClass: ModelClassId): string[] {
  return getFallbackChain(modelClass).map((r) => r.modelName);
}

export function routedModelToProvider(model: RoutedModel): AIProvider {
  return model.provider;
}

export function legacyModelIdToClass(modelId: string): ModelClassId {
  if (modelId.includes("opus") || modelId.includes("gpt-5.5")) return "ULTRA";
  if (modelId.includes("sonnet") || modelId.includes("gpt-5")) return "FLAGSHIP";
  if (modelId.includes("3.5-flash") || modelId.includes("2.5-pro") || modelId.includes("3.1-pro"))
    return "MENENGAH";
  return "HEMAT";
}

export function legacyModelIdToProvider(modelId: string): AIProvider {
  if (modelId.startsWith("gemini")) return "gemini";
  if (modelId.startsWith("gpt")) return "openai";
  if (modelId.startsWith("claude")) return "anthropic";
  if (modelId.startsWith("deepseek")) return "deepseek";
  return "gemini";
}

export function isModelConfigured(modelName: string): boolean {
  return isProviderConfigured(legacyModelIdToProvider(modelName));
}
