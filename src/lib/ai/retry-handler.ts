/**
 * retry-handler.ts
 * Fallback model strategy + exponential backoff retry.
 * Jika model utama gagal/rate-limit, otomatis coba model berikutnya
 * yang masih diizinkan oleh tier user.
 */

import { V3_TIER_CONFIG, type V3Tier, type ModelId } from "./tier-enforcer";

// ─── Fallback Chain ─────────────────────────────────────────────────────────

/**
 * Urutan fallback per model — jika model utama gagal,
 * coba model berikutnya dalam chain.
 */
export const FALLBACK_CHAIN: Record<ModelId, ModelId[]> = {
  "claude-sonnet-4-20250514": [
    "gpt-4o",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
  ],
  "gpt-4o": ["gemini-2.5-pro", "gemini-2.5-flash"],
  "gemini-2.5-pro": ["gpt-4o", "gemini-2.5-flash"],
  "gemini-2.5-flash": ["deepseek-chat"],
  "deepseek-chat": ["gemini-2.5-flash"],
};

// ─── Error Classifiers ──────────────────────────────────────────────────────

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("Too Many Requests") ||
    msg.includes("rate_limit")
  );
}

function isProviderUnavailableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("overloaded") ||
    msg.includes("unavailable") ||
    msg.includes("UNAVAILABLE")
  );
}

export function isFreeTierQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) &&
    (msg.includes("free_tier") ||
      msg.includes("FreeTier") ||
      msg.includes("limit: 20"))
  );
}

/**
 * Should we retry or fail fast for this error?
 */
export function shouldFallback(err: unknown): boolean {
  // Daily free-tier quota won't recover — fail fast
  if (isFreeTierQuotaError(err)) return false;
  return isRateLimitError(err) || isProviderUnavailableError(err);
}

export function getBackoffMs(err: unknown, attempt: number): number {
  // Extract retry-after from error message if present
  const msg = err instanceof Error ? err.message : String(err);
  const retryMatch =
    msg.match(/retry in (\d+(?:\.\d+)?)s/i) ??
    msg.match(/"retryDelay":\s*"(\d+)s"/);
  if (retryMatch) {
    return Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;
  }

  // Rate limit: exponential backoff starting at 2s
  if (isRateLimitError(err)) {
    return Math.min(2000 * Math.pow(2, attempt), 32000);
  }

  // Other errors: flat 500ms
  return 500 * (attempt + 1);
}


