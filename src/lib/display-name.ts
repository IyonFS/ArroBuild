const TIER_LIKE = /^(pro|starter|unlimited|free|gratis)$/i;

/** Nama tampilan di dashboard — hindari kata yang mirip nama paket. */
export function getDisplayName(name: string | null | undefined, email: string): string {
  const trimmed = name?.trim();
  if (!trimmed) {
    return email.split("@")[0] ?? "Builder";
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1 && TIER_LIKE.test(parts[0]!)) {
    return email.split("@")[0] ?? trimmed;
  }
  return trimmed;
}

/** Label singkat di navbar — netral, dari email. */
export function getNavLabel(_name: string | null | undefined, email: string): string {
  const local = email.split("@")[0];
  if (local && local.length <= 14) return local;
  return "Dashboard";
}
