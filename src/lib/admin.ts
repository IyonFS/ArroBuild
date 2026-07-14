import { getSessionProfile } from "@/lib/auth";

export class AdminAuthError extends Error {
  constructor(message = "Akses ditolak") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export async function assertFounderAccess(): Promise<{ userId: string; email: string }> {
  const profile = await getSessionProfile();
  if (!profile) {
    throw new AdminAuthError("Login diperlukan");
  }

  const founderId = process.env.FOUNDER_USER_ID;
  const founderEmail = process.env.FOUNDER_EMAIL?.toLowerCase();

  const isFounder =
    (founderId && profile.id === founderId) ||
    (founderEmail && profile.email.toLowerCase() === founderEmail);

  if (!isFounder) {
    throw new AdminAuthError("Hanya founder yang dapat mengakses halaman ini");
  }

  return { userId: profile.id, email: profile.email };
}

/** Estimasi biaya AI per kredit (IDR) untuk margin kasar */
export const ESTIMATED_COST_PER_CREDIT_IDR = 4.5;
