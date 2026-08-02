import type { PricingTierId } from "@/lib/pricing";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: { order_id?: string }) => void;
          onPending?: (result: { order_id?: string }) => void;
          onError?: () => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export function loadSnapScript(clientKey: string, isProduction: boolean) {
  return new Promise<void>((resolve, reject) => {
    if (window.snap) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-midtrans="snap"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.setAttribute("data-midtrans", "snap");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
    document.body.appendChild(script);
  });
}

export async function confirmPayment(orderId: string, retries = 5): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.ok && data.status === "paid") return true;
    if (res.status !== 202) break;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

export interface CapacityInfo {
  tier: string;
  activeSeats: number;
  maxActiveSeats: number;
  remaining: number;
  isFull: boolean;
}

export async function fetchTierCapacities(): Promise<Record<string, CapacityInfo>> {
  const res = await fetch("/api/waitlist");
  const data = (await res.json()) as { capacities?: CapacityInfo[] };
  if (!data.capacities) return {};

  const map: Record<string, CapacityInfo> = {};
  for (const c of data.capacities) {
    const key =
      c.tier === "PRIME" ? "prime" : c.tier === "CORE" ? "core" : "base";
    map[key] = c;
  }
  return map;
}

export async function startSubscriptionCheckout(
  tierId: PricingTierId,
  billingMonths: number
): Promise<{
  ok: boolean;
  error?: string;
  code?: string;
  capacity?: CapacityInfo;
  orderId?: string;
  snapToken?: string;
  clientKey?: string;
  isProduction?: boolean;
  useRedirect?: boolean;
  redirectUrl?: string;
}> {
  const res = await fetch("/api/payment/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tierId, billingMonths }),
  });
  const data = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? "Gagal memulai pembayaran",
      code: data.code,
      capacity: data.capacity,
    };
  }

  return {
    ok: true,
    orderId: data.orderId,
    snapToken: data.snapToken,
    clientKey: data.clientKey,
    isProduction: data.isProduction === true,
    useRedirect: data.useRedirect,
    redirectUrl: data.redirectUrl,
  };
}

export async function openSnapCheckout(
  tierId: PricingTierId,
  billingMonths: number,
  callbacks: {
    onSuccess: () => void;
    onError: (message: string) => void;
    onPending?: () => void;
    onClose?: () => void;
  }
): Promise<void> {
  const result = await startSubscriptionCheckout(tierId, billingMonths);
  if (!result.ok) {
    callbacks.onError(result.error ?? "Gagal memulai pembayaran");
    return;
  }

  if (result.useRedirect && result.redirectUrl && result.orderId) {
    sessionStorage.setItem("arrobuild_pending_order", result.orderId);
    window.location.href = result.redirectUrl;
    return;
  }

  if (!result.snapToken || !result.clientKey || !result.orderId) {
    callbacks.onError("Respons pembayaran tidak lengkap");
    return;
  }

  await loadSnapScript(result.clientKey, result.isProduction === true);

  window.snap?.pay(result.snapToken, {
    onSuccess: async (snapResult) => {
      const orderId = snapResult?.order_id ?? result.orderId!;
      const confirmed = await confirmPayment(orderId);
      if (confirmed) {
        callbacks.onSuccess();
      } else {
        callbacks.onError(
          "Pembayaran diterima, konfirmasi masih diproses. Refresh halaman dalam 1 menit."
        );
      }
    },
    onPending: () => callbacks.onPending?.(),
    onError: () => callbacks.onError("Pembayaran gagal. Coba lagi."),
    onClose: () => callbacks.onClose?.(),
  });
}
