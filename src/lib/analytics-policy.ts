export const ANALYTICS_EVENT_PROPERTIES = {
  idea_submitted: ["charCount"],
  generation_started: ["tier", "mode", "documentCount", "modelClass"],
  generation_completed: ["tier", "mode", "documentCount", "durationBucket"],
  generation_failed: ["errorCode", "tier", "mode", "stage"],
  email_captured: ["optIn"],
  zip_downloaded: ["documentCount"],
  download_fallback: ["fileKey"],
  tab_switched: ["toTab"],
  copy_to_clipboard: ["fileKey"],
  raw_toggle: ["enabled"],
} as const;

export type AnalyticsEvent = keyof typeof ANALYTICS_EVENT_PROPERTIES;
export type AnalyticsScalar = string | number | boolean;
export type AnalyticsEventProperties<E extends AnalyticsEvent> = Partial<
  Record<(typeof ANALYTICS_EVENT_PROPERTIES)[E][number], AnalyticsScalar>
>;

export type GenerationFailureCode =
  | "authentication"
  | "entitlement"
  | "insufficient_credit"
  | "provider_quota"
  | "timeout"
  | "validation"
  | "network"
  | "unknown";

export function classifyGenerationFailure(message: string): GenerationFailureCode {
  const normalized = message.toLowerCase();

  if (/\b401\b|unauthorized|login|autentikasi|session/.test(normalized)) {
    return "authentication";
  }
  if (/\b402\b|insufficient credit|kredit (tidak cukup|habis)/.test(normalized)) {
    return "insufficient_credit";
  }
  if (/\b403\b|subscription|langganan|paket|paywall|entitlement/.test(normalized)) {
    return "entitlement";
  }
  if (/\b429\b|quota|rate limit|resource exhausted/.test(normalized)) {
    return "provider_quota";
  }
  if (/timeout|timed out|abort/.test(normalized)) {
    return "timeout";
  }
  if (/\b400\b|\b413\b|\b422\b|validation|invalid|tidak valid/.test(normalized)) {
    return "validation";
  }
  if (/network|fetch|connection|econn|enotfound/.test(normalized)) {
    return "network";
  }
  return "unknown";
}

export function sanitizeAnalyticsProperties<E extends AnalyticsEvent>(
  event: E,
  properties?: Record<string, unknown>,
): AnalyticsEventProperties<E> | undefined {
  if (!properties) return undefined;

  const allowed = new Set<string>(ANALYTICS_EVENT_PROPERTIES[event]);
  const safeEntries = Object.entries(properties).filter(
    ([key, value]) =>
      allowed.has(key) &&
      (typeof value === "string" || typeof value === "number" || typeof value === "boolean"),
  );

  return safeEntries.length > 0
    ? (Object.fromEntries(safeEntries) as AnalyticsEventProperties<E>)
    : undefined;
}
