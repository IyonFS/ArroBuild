import type { ModelClassId } from "@/lib/config/tiers";
import type { AIProvider } from "@/lib/ai/prompts/shared";

export interface ProviderAdapter {
  id: AIProvider;
  streamCompletion(params: {
    model: string;
    prompt: string;
    maxTokens: number;
  }): AsyncIterable<string>;
}

export interface RoutedModel {
  provider: AIProvider;
  modelName: string;
  modelClass: ModelClassId;
}
