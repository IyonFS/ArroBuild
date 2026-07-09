import { getTierConfig, type TierId } from "@/lib/config/tiers";

export function buildStructuredContext(
  tierId: TierId,
  sections: Record<string, string>
): string {
  const config = getTierConfig(tierId);
  const maxTokens = config.maxContextInjectionTokens;

  const lines: string[] = [];
  let approxTokens = 0;

  for (const [key, value] of Object.entries(sections)) {
    const chunk = `## ${key}\n${value.trim()}\n`;
    const chunkTokens = Math.ceil(chunk.length / 4);
    if (approxTokens + chunkTokens > maxTokens) break;
    lines.push(chunk);
    approxTokens += chunkTokens;
  }

  return lines.join("\n").trim();
}

export function capFormInput(text: string, tierId: TierId): string {
  const maxChars = getTierConfig(tierId).maxFormInputTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n[...truncated to tier input cap]";
}
