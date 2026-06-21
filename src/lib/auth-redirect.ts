/** Cookie-based post-login redirect (avoids Supabase truncating query params). */
export const AUTH_NEXT_COOKIE = "arrobuild_auth_next";

const ALLOWED_PREFIXES = ["/dashboard", "/generate", "/auth/reset-password"];

export function getPostAuthRedirect(plan?: string | null): string {
  if (plan && plan !== "free") {
    return `/dashboard?upgrade=${plan}`;
  }
  return "/dashboard";
}

export function sanitizeAuthRedirect(path: string | null | undefined): string {
  if (!path) return "/dashboard";
  const decoded = decodeURIComponent(path);
  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return "/dashboard";
  }
  const allowed = ALLOWED_PREFIXES.some(
    (p) => decoded === p || decoded.startsWith(`${p}?`) || decoded.startsWith(`${p}/`)
  );
  return allowed ? decoded : "/dashboard";
}
