"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRICING_TIERS } from "@/lib/pricing";
import type { PricingTierId } from "@/lib/pricing";
import type { UserPlanStatus } from "@/components/generate/types";
import { TIER_LABELS, isSubscribed } from "@/components/generate/types";
import type { BillingMonths } from "@/lib/config/tiers";
import { SUBSCRIPTION_PACKS, TIER, CREDIT_TOPUP_PACKS } from "@/lib/config/tiers";
import {
  getTierCardState,
  getUpgradeButtonLabel,
  getNextUpgradeTarget,
  getPurchasableTiers,
} from "@/lib/upgrade-plans";
import {
  fetchTierCapacities,
  openSnapCheckout,
  loadSnapScript,
  confirmPayment,
  type CapacityInfo,
} from "@/components/dashboard/upgrade-payment";

interface UpgradePlanPickerProps {
  currentTier: UserPlanStatus;
  creditBalance?: number;
  creditPool?: number;
  highlightPlan?: string | null;
  onPaymentSuccess: () => void;
  variant?: "page" | "compact";
}

export default function UpgradePlanPicker({
  currentTier,
  creditBalance,
  creditPool,
  highlightPlan,
  onPaymentSuccess,
  variant = "page",
}: UpgradePlanPickerProps) {
  const [loadingTier, setLoadingTier] = useState<PricingTierId | null>(null);
  const [loadingTopup, setLoadingTopup] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [configHint, setConfigHint] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [capacities, setCapacities] = useState<Record<string, CapacityInfo>>({});
  const [waitlistMsg, setWaitlistMsg] = useState("");
  const [billingByTier, setBillingByTier] = useState<Record<string, BillingMonths>>({});

  const purchasable = getPurchasableTiers(currentTier);
  const nextTarget = getNextUpgradeTarget(currentTier);

  function getBillingMonths(tierId: PricingTierId): BillingMonths {
    return billingByTier[tierId] ?? 1;
  }

  function formatPackPrice(tierId: PricingTierId, basePrice: number): string {
    const months = getBillingMonths(tierId);
    if (months === 1) return `Rp ${(basePrice / 1000).toFixed(0)}K`;
    const tierEnum =
      tierId === "pro_max" ? TIER.PRO_MAX : tierId === "pro" ? TIER.PRO : null;
    const pack = tierEnum
      ? SUBSCRIPTION_PACKS.find((p) => p.tierId === tierEnum && p.months === months)
      : undefined;
    if (!pack) return `Rp ${(basePrice / 1000).toFixed(0)}K`;
    return `Rp ${Math.round(pack.priceIdr / 1000)}K`;
  }

  useEffect(() => {
    fetch("/api/payment/config")
      .then((r) => r.json())
      .then((d: { hint?: string }) => {
        if (d.hint) setConfigHint(d.hint);
      })
      .catch(() => {});

    fetchTierCapacities().then(setCapacities).catch(() => {});
  }, []);

  async function joinWaitlist(tierId: PricingTierId) {
    setLoadingTier(tierId);
    setError("");
    setWaitlistMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal masuk waitlist");
      } else {
        setWaitlistMsg(data.message ?? "Berhasil masuk waitlist.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error waitlist");
    } finally {
      setLoadingTier(null);
    }
  }

  async function handleUpgrade(tierId: PricingTierId) {
    const state = getTierCardState(tierId, currentTier);
    if (state === "current" || state === "locked") return;

    const cap = capacities[tierId];
    if (cap?.isFull) {
      await joinWaitlist(tierId);
      return;
    }

    setLoadingTier(tierId);
    setError("");
    setSuccessMsg("");
    setWaitlistMsg("");

    try {
      await openSnapCheckout(tierId, getBillingMonths(tierId), {
        onSuccess: () => {
          setLoadingTier(null);
          setSuccessMsg(
            currentTier === "none"
              ? "Pembayaran berhasil. Paket sudah aktif."
              : `Upgrade ke ${TIER_LABELS[tierId]} berhasil. Fitur baru sudah aktif.`
          );
          onPaymentSuccess();
        },
        onError: (msg) => {
          setLoadingTier(null);
          if (msg.includes("TIER_FULL") || msg.includes("penuh")) {
            void joinWaitlist(tierId);
          } else {
            setError(msg);
          }
        },
        onPending: () => {
          setLoadingTier(null);
          setError("Menunggu pembayaran — selesaikan di app bank atau e-wallet.");
        },
        onClose: () => setLoadingTier(null),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoadingTier(null);
    }
  }

  async function handleTopup(packId: string) {
    setLoadingTopup(packId);
    setError("");
    try {
      const res = await fetch("/api/payment/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memulai top-up");
        setLoadingTopup(null);
        return;
      }

      if (data.redirectUrl && data.orderId) {
        sessionStorage.setItem("arrobuild_pending_order", data.orderId);
        window.location.href = data.redirectUrl;
        return;
      }

      if (!data.snapToken || !data.clientKey || !data.orderId) {
        setError("Respons top-up tidak lengkap");
        setLoadingTopup(null);
        return;
      }

      await loadSnapScript(data.clientKey, data.isProduction === true);
      window.snap?.pay(data.snapToken, {
        onSuccess: async (result) => {
          const orderId = result?.order_id ?? data.orderId;
          const confirmed = await confirmPayment(orderId);
          setLoadingTopup(null);
          if (confirmed) {
            setSuccessMsg(`Top-up berhasil. +${data.credits?.toLocaleString("id-ID") ?? ""} kredit ditambahkan.`);
            onPaymentSuccess();
          } else {
            setError("Pembayaran diterima, konfirmasi masih diproses. Refresh dalam 1 menit.");
          }
        },
        onPending: () => {
          setLoadingTopup(null);
          setError("Menunggu pembayaran top-up.");
        },
        onError: () => {
          setLoadingTopup(null);
          setError("Top-up gagal. Coba lagi.");
        },
        onClose: () => setLoadingTopup(null),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal top-up");
      setLoadingTopup(null);
    }
  }

  if (variant === "compact") {
    if (!isSubscribed(currentTier)) {
      return (
        <section className="border-t border-[var(--bg-border)] pt-8">
          <div className="app-panel px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[14px] font-medium text-white">Belum ada paket aktif</p>
              <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Pilih Base, Core, atau Prime untuk mulai generate dokumen.
              </p>
            </div>
            <Link href="/dashboard/upgrade" className="btn btn-primary btn-sm shrink-0">
              Pilih paket
            </Link>
          </div>
        </section>
      );
    }

    const target = nextTarget;
    const targetTier = target ? PRICING_TIERS.find((t) => t.id === target) : null;

    return (
      <section className="border-t border-[var(--bg-border)] pt-8">
        <div className="app-panel px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-medium text-white">
              Paket {TIER_LABELS[currentTier]} aktif
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {targetTier
                ? `Upgrade ke ${targetTier.name} untuk ${targetTier.features[0].toLowerCase()}.`
                : "Kamu sudah di paket tertinggi. Top-up kredit tersedia di halaman upgrade."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {target && (
              <Link href="/dashboard/upgrade" className="btn btn-primary btn-sm">
                Upgrade paket
              </Link>
            )}
            {!target && (
              <Link href="/dashboard/upgrade" className="btn btn-secondary btn-sm">
                Kelola paket
              </Link>
            )}
            <Link href="/generate" className="btn btn-secondary btn-sm">
              Buat project
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {variant === "page" && (
        <header className="space-y-2">
          <p
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--app-amber)" }}
          >
            Langganan
          </p>
          <h2 className="font-unbounded text-xl sm:text-2xl font-bold text-white">
            {isSubscribed(currentTier) ? "Upgrade paket" : "Pilih paket"}
          </h2>
          <p className="text-sm max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
            {isSubscribed(currentTier)
              ? `Kamu memakai paket ${TIER_LABELS[currentTier]}. Bayar selisih paket lebih tinggi — periode baru dimulai setelah pembayaran sukses.`
              : "QRIS, GoPay, OVO, Dana, transfer bank — semua via Midtrans sandbox/production."}
          </p>
        </header>
      )}

      {isSubscribed(currentTier) && (
        <div
          className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            background: "rgba(255,176,32,0.06)",
            border: "0.5px solid rgba(255,176,32,0.22)",
          }}
        >
          <div>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--app-amber)" }}>
              Paket aktif
            </p>
            <p className="text-lg font-semibold text-white mt-1">{TIER_LABELS[currentTier]}</p>
            {creditPool != null && creditPool > 0 && (
              <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                Kredit: {(creditBalance ?? 0).toLocaleString("id-ID")} / {creditPool.toLocaleString("id-ID")}
              </p>
            )}
          </div>
          {nextTarget && (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Rekomendasi:{" "}
              <span className="text-white font-medium">
                {PRICING_TIERS.find((t) => t.id === nextTarget)?.name}
              </span>
            </p>
          )}
        </div>
      )}

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
        <div className="px-3 py-2 rounded-lg text-[13px] border badge-success">{successMsg}</div>
      )}

      {waitlistMsg && (
        <div
          className="px-3 py-2 rounded-lg text-[13px] border"
          style={{
            color: "var(--app-amber)",
            background: "rgba(255,176,32,0.06)",
            borderColor: "rgba(255,176,32,0.25)",
          }}
        >
          {waitlistMsg}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PRICING_TIERS.map((tier) => {
          const state = getTierCardState(tier.id, currentTier);
          const highlighted =
            tier.highlighted || highlightPlan === tier.id || tier.id === nextTarget;
          const cap = capacities[tier.id];
          const full = Boolean(cap?.isFull);
          const isCurrent = state === "current";
          const isLocked = state === "locked";
          const canBuy = purchasable.includes(tier.id);

          return (
            <div
              key={tier.id}
              className={`dashboard-project-card rounded-2xl p-5 flex flex-col transition-all ${
                isCurrent ? "ring-1 ring-[rgba(255,176,32,0.45)]" : ""
              } ${highlighted && canBuy ? "ring-1 ring-[rgba(255,176,32,0.35)]" : ""} ${
                isLocked ? "opacity-55" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-base font-semibold text-white">{tier.name}</p>
                  {isCurrent && (
                    <span
                      className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(255,176,32,0.12)",
                        color: "var(--app-amber)",
                      }}
                    >
                      Paket kamu
                    </span>
                  )}
                </div>
                {full && canBuy ? (
                  <span className="text-[11px]" style={{ color: "#FB923C" }}>
                    Slot penuh
                  </span>
                ) : tier.badge && canBuy ? (
                  <span className="text-[11px]" style={{ color: "var(--app-amber)" }}>
                    {tier.badge}
                  </span>
                ) : null}
              </div>

              <p className="text-2xl font-semibold text-white tracking-tight">
                {formatPackPrice(tier.id, tier.priceAmount)}
                <span className="text-xs font-normal ml-1" style={{ color: "var(--text-tertiary)" }}>
                  {getBillingMonths(tier.id) === 1 ? tier.period : `/ ${getBillingMonths(tier.id)} bln`}
                </span>
              </p>

              <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {tier.description}
              </p>

              {(tier.id === "pro" || tier.id === "pro_max") && canBuy && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {([1, 3, 4] as BillingMonths[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBillingByTier((prev) => ({ ...prev, [tier.id]: m }))}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        getBillingMonths(tier.id) === m
                          ? "border-[var(--app-amber)] text-[var(--app-amber)]"
                          : "border-[var(--bg-border)] text-[var(--text-tertiary)]"
                      }`}
                    >
                      {m === 1 ? "Bulanan" : `${m} bln`}
                    </button>
                  ))}
                </div>
              )}

              {cap && canBuy && (
                <p
                  className="text-[11px] mt-2 font-mono"
                  style={{ color: full ? "#FB923C" : "var(--text-tertiary)" }}
                >
                  Slot {cap.activeSeats}/{cap.maxActiveSeats}
                  {!full ? ` · sisa ${cap.remaining}` : ""}
                </p>
              )}

              <ul className="my-4 space-y-2 flex-1">
                {tier.features.map((f) => (
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
                disabled={loadingTier !== null || isCurrent || isLocked || (!canBuy && !full)}
                className={`btn btn-sm w-full ${
                  isCurrent
                    ? "btn-secondary opacity-80"
                    : isLocked
                      ? "btn-secondary opacity-50 cursor-not-allowed"
                      : full
                        ? "btn-secondary"
                        : highlighted && canBuy
                          ? "btn-primary"
                          : "btn-secondary"
                }`}
              >
                {loadingTier === tier.id
                  ? "Memproses..."
                  : full && canBuy
                    ? "Masuk waitlist"
                    : getUpgradeButtonLabel(tier.id, currentTier)}
              </button>
            </div>
          );
        })}
      </div>

      {isSubscribed(currentTier) && currentTier === "pro_max" && (
        <p className="text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
          Kamu sudah di paket tertinggi. Tambah kredit di bawah jika pool bulanan habis.
        </p>
      )}

      {isSubscribed(currentTier) && (
        <section className="border-t pt-8" style={{ borderColor: "var(--color-border-default)" }}>
          <h3 className="text-base font-semibold text-white mb-1">Top-up kredit</h3>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Beli kredit tambahan tanpa mengubah paket. Kredit langsung masuk setelah pembayaran.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CREDIT_TOPUP_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => handleTopup(pack.id)}
                disabled={loadingTopup !== null}
                className="app-panel p-4 text-left hover:border-[rgba(255,176,32,0.25)] transition-colors"
              >
                <p className="text-sm font-medium text-white">{pack.label}</p>
                <p className="text-lg font-semibold text-white mt-1">
                  Rp {Math.round(pack.priceIdr / 1000)}K
                </p>
                <p className="text-[11px] mt-2 font-mono" style={{ color: "var(--text-tertiary)" }}>
                  {loadingTopup === pack.id ? "Memproses..." : "Beli sekarang"}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

