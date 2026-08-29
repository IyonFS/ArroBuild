/**
 * ArroBuild Analytics
 *
 * Thin wrapper around Vercel Analytics `track()`.
 * Falls back gracefully if the SDK isn't loaded (dev / non-Vercel envs).
 *
 * Usage:
 *   import { trackEvent } from "@/lib/analytics";
 *   trackEvent("idea_submitted", { charCount: 200 });
 */

import { track } from "@vercel/analytics";
import {
  sanitizeAnalyticsProperties,
  type AnalyticsEvent,
  type AnalyticsEventProperties,
} from "@/lib/analytics-policy";

export type { AnalyticsEvent } from "@/lib/analytics-policy";

// ─── Event catalog ────────────────────────────────────────────────────────────

// ─── Track helper ─────────────────────────────────────────────────────────────

export function trackEvent<E extends AnalyticsEvent>(
  event: E,
  properties?: AnalyticsEventProperties<E>,
): void {
  const safeProperties = sanitizeAnalyticsProperties(event, properties);
  try {
    track(event, safeProperties);
  } catch {
    // Silently fail in environments where analytics isn't available
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${event}`, safeProperties ?? {});
    }
  }
}
