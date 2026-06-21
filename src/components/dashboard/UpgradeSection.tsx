"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRICING_TIERS } from "@/lib/pricing";
import type { PricingTierId } from "@/lib/pricing";
import type { UserTier } from "@/components/generate/types";

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

function loadSnapScript(clientKey: string, isProduction: boolean) {
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

async function confirmPayment(orderId: string, retries = 5): Promise<boolean> {
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

interface UpgradeSectionProps {
  currentTier: UserTier;
  highlightPlan?: string | null;
  onPaymentSuccess: () => void;
}

export default function UpgradeSection({
  currentTier,
  highlightPlan,
  onPaymentSuccess,
}: UpgradeSectionProps) {
  const [loadingTier, setLoadingTier] = useState<PricingTierId | null>(null);
  const [error, setError] = useState("");
  const [configHint, setConfigHint] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [expanded, setExpanded] = useState(Boolean(highlightPlan));

  useEffect(() => {
    fetch("/api/payment/config")
      .then((r) => r.json())
      .then((d: { hint?: string }) => {
        if (d.hint) setConfigHint(d.hint);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (highlightPlan) setExpanded(true);
  }, [highlightPlan]);

  const paidTiers = PRICING_TIERS.filter((t) => t.id !== "free");

  async function handleUpgrade(tierId: PricingTierId) {
    if (tierId === "free") return;
    setLoadingTier(tierId);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal memulai pembayaran");
        setLoadingTier(null);
        return;
      }

      if (data.useRedirect && data.redirectUrl) {
        sessionStorage.setItem("arrobuild_pending_order", data.orderId);
        window.location.href = data.redirectUrl;
        return;
      }

      await loadSnapScript(data.clientKey, data.isProduction === true);

      window.snap?.pay(data.snapToken, {
        onSuccess: async (result) => {
          const orderId = result?.order_id ?? data.orderId;
          setLoadingTier(tierId);
          const confirmed = await confirmPayment(orderId);
          setLoadingTier(null);
          if (confirmed) {
            setSuccessMsg("Pembayaran berhasil. Paket sudah aktif.");
            onPaymentSuccess();
          } else {
            setError(
              "Pembayaran diterima, konfirmasi masih diproses. Refresh halaman dalam 1 menit."
            );
          }
        },
        onPending: () => {
          setLoadingTier(null);
          setError("Menunggu pembayaran — selesaikan di app bank atau e-wallet.");
        },
        onError: () => {
          setLoadingTier(null);
          setError("Pembayaran gagal. Coba lagi.");
        },
        onClose: () => {
          setLoadingTier(null);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoadingTier(null);
    }
  }

  if (currentTier !== "free") {
    return (
      <div className="app-panel px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium text-white">
            Paket {currentTier === "unlimited" ? "Unlimited" : "Starter / Pro"} aktif
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Semua model AI dan bundle file tersedia.
          </p>
        </div>
        <Link href="/generate" className="btn btn-primary btn-sm shrink-0">
          Buat project
        </Link>
      </div>
    );
  }

  return (
    <section className="border-t border-[var(--bg-border)] pt-8">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-4 text-left group"
      >
        <div>
          <h2 className="text-[15px] font-medium text-white group-hover:text-[var(--green-text)] transition-colors">
            Upgrade paket
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            QRIS, GoPay, OVO, Dana, transfer bank — via Midtrans
          </p>
        </div>
        <span
          className="text-[13px] shrink-0"
          style={{ color: "var(--text-tertiary)" }}
        >
          {expanded ? "Tutup" : "Lihat harga"}
        </span>
      </button>

      {expanded && (
        <div className="mt-5 space-y-4">
          {configHint && (
            <div
              className="px-3 py-2 rounded-lg text-[13px] border"
              style={{
                color: "var(--warning-text)",
                background: "var(--warning-bg)",
                borderColor: "var(--warning-border)",
              }}
            >
              {configHint}
            </div>
          )}

          {successMsg && (
            <div className="px-3 py-2 rounded-lg text-[13px] border badge-success">
              {successMsg}
            </div>
          )}

          {error && (
            <div
              className="px-3 py-2 rounded-lg text-[13px] border"
              style={{
                color: "var(--danger-text)",
                background: "var(--danger-bg)",
                borderColor: "var(--danger-border)",
              }}
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {paidTiers.map((tier) => {
              const highlighted = tier.highlighted || highlightPlan === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`app-panel p-4 flex flex-col ${
                    highlighted ? "ring-1 ring-[var(--green-muted)]" : ""
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-3">
                    <p className="text-[14px] font-medium text-white">{tier.name}</p>
                    {tier.badge && (
                      <span className="text-[11px]" style={{ color: "var(--green-text)" }}>
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[1.375rem] font-medium text-white tracking-tight">
                    {tier.price}
                    <span className="text-[12px] font-normal ml-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {tier.period}
                    </span>
                  </p>
                  <ul className="my-4 space-y-1.5 flex-1">
                    {tier.features.slice(0, 3).map((f) => (
                      <li
                        key={f}
                        className="text-[12px] leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1 before:h-1 before:rounded-full before:bg-[var(--text-tertiary)]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={loadingTier !== null}
                    className={`btn btn-sm w-full ${highlighted ? "btn-primary" : "btn-secondary"}`}
                  >
                    {loadingTier === tier.id ? "Memproses..." : tier.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
