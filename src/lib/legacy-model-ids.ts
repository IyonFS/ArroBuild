/** Map deprecated model IDs from old drafts / UI to current routes (client-safe). */

const LEGACY_MODEL_ALIASES: Record<string, string> = {
  "gemini-2.5-flash": "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite": "gemini-3.1-flash-lite",
  "gemini-2.5-pro": "gemini-3.5-flash",
  "deepseek-chat": "deepseek-v4-flash",
  "deepseek-reasoner": "deepseek-v4-flash",
};

export function normalizeLegacyModelId(modelId?: string): string | undefined {
  if (!modelId) return undefined;
  return LEGACY_MODEL_ALIASES[modelId] ?? modelId;
}
