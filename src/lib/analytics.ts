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

// ─── Event catalog ────────────────────────────────────────────────────────────

export type AnalyticsEvent =
  | "idea_submitted"
  | "generation_started"
  | "generation_completed"
  | "generation_failed"
  | "email_captured"
  | "zip_downloaded"
  | "download_fallback"
  | "tab_switched"
  | "copy_to_clipboard"
  | "raw_toggle";

export type EventProperties = Record<string, string | number | boolean>;

// ─── Track helper ─────────────────────────────────────────────────────────────

export function trackEvent(
  event: AnalyticsEvent,
  properties?: EventProperties
): void {
  try {
    track(event, properties);
  } catch {
    // Silently fail in environments where analytics isn't available
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${event}`, properties ?? {});
    }
  }
}
