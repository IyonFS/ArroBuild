/**
 * Route-based navigation mode for AppShell.
 *
 * - marketing: full homepage navbar (rendered only on `/`)
 * - app: compact AppNav for browsing pages
 * - none: focused flows with their own chrome (generate, workspace, auth, learn)
 */

export type NavMode = "app" | "none";

const NO_NAV_PREFIXES = [
  "/generate",
  "/project",
  "/dashboard",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth",
  "/learn",
] as const;

export function resolveNavMode(pathname: string): NavMode {
  if (pathname === "/") return "none";

  for (const prefix of NO_NAV_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return "none";
    }
  }

  return "app";
}

export const APP_NAV_HEIGHT_PX = 76;
