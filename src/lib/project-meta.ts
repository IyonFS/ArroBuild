const DISPLAY_TITLE_KEY = "displayTitle";

export function getDisplayTitle(planData: unknown): string | null {
  if (!planData || typeof planData !== "object") return null;
  const title = (planData as Record<string, unknown>)[DISPLAY_TITLE_KEY];
  return typeof title === "string" && title.trim() ? title.trim() : null;
}

export function mergeDisplayTitle(
  planData: unknown,
  title: string | null
): Record<string, unknown> {
  const base =
    planData && typeof planData === "object"
      ? { ...(planData as Record<string, unknown>) }
      : {};

  if (title && title.trim()) {
    base[DISPLAY_TITLE_KEY] = title.trim();
  } else {
    delete base[DISPLAY_TITLE_KEY];
  }

  return base;
}
