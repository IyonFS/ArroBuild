"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
      tierId === "prime" ? TIER.PRIME : tierId === "core" ? TIER.CORE : null;
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
        window.location.assign(data.redirectUrl);
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
        <header className="space-y-3 pb-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[11px] uppercase tracking-widest font-bold"
            style={{ color: "var(--app-amber)" }}
          >
            Langganan
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-unbounded text-2xl sm:text-3xl font-bold text-white tracking-tight"
            style={{
              background: "linear-gradient(135deg, #fff 0%, #a1a1aa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            {isSubscribed(currentTier) ? "Upgrade paket" : "Pilih paket"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[15px] max-w-2xl leading-relaxed" 
            style={{ color: "var(--color-text-secondary)" }}
          >
            {isSubscribed(currentTier)
              ? `Kamu memakai paket ${TIER_LABELS[currentTier]}. Bayar selisih paket lebih tinggi — periode baru dimulai setelah pembayaran sukses.`
              : "QRIS, GoPay, OVO, Dana, transfer bank — semua via Midtrans sandbox/production."}
          </motion.p>
        </header>
      )}

      {isSubscribed(currentTier) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,176,32,0.1), rgba(0,0,0,0.2))",
            border: "1px solid rgba(255,176,32,0.2)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)"
          }}
        >
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--app-amber)] rounded-full blur-[60px] opacity-20 pointer-events-none" />

          <div className="relative z-10">
            <p className="text-xs font-mono uppercase tracking-widest font-bold mb-1" style={{ color: "var(--app-amber)" }}>
              Paket aktif
            </p>
            <p className="text-xl font-bold text-white mt-1 tracking-tight">{TIER_LABELS[currentTier]}</p>
            {creditPool != null && creditPool > 0 && (
              <p className="text-sm mt-1.5 font-mono" style={{ color: "var(--color-text-secondary)" }}>
                Kredit: {(creditBalance ?? 0).toLocaleString("id-ID")} <span className="opacity-50">/ {creditPool.toLocaleString("id-ID")}</span>
              </p>
            )}
          </div>
          {nextTarget && (
            <div className="relative z-10 text-sm bg-[rgba(0,0,0,0.2)] px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.05)]">
              <span style={{ color: "var(--color-text-secondary)" }}>Rekomendasi: </span>
              <span className="text-[var(--app-amber)] font-bold tracking-wide">
                {PRICING_TIERS.find((t) => t.id === nextTarget)?.name}
              </span>
            </div>
          )}
        </motion.div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PRICING_TIERS.map((tier, idx) => {
          const state = getTierCardState(tier.id, currentTier);
          const highlighted =
            tier.highlighted || highlightPlan === tier.id || tier.id === nextTarget;
          const cap = capacities[tier.id];
          const full = Boolean(cap?.isFull);
          const isCurrent = state === "current";
          const isLocked = state === "locked";
          const canBuy = purchasable.includes(tier.id);

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
              key={tier.id}
              className={`dashboard-project-card relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                isCurrent ? "ring-2 ring-[rgba(255,176,32,0.5)]" : ""
              } ${highlighted && canBuy ? "hover:-translate-y-1 hover:shadow-2xl hover:shadow-[rgba(255,176,32,0.15)] ring-1 ring-[rgba(255,176,32,0.4)]" : "hover:-translate-y-1"} ${
                isLocked ? "opacity-55" : ""
              }`}
              style={{
                background: highlighted && canBuy ? "linear-gradient(180deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9))" : "var(--app-bg-elevated)",
                backdropFilter: "blur(12px)",
              }}
            >
              {highlighted && canBuy && (
                <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-transparent bg-clip-border" style={{
                  backgroundImage: "linear-gradient(135deg, rgba(255,176,32,0.4) 0%, transparent 100%)",
                  WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude"
                }} />
              )}
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

              {(tier.id === "core" || tier.id === "prime") && canBuy && (
                <div className="flex flex-wrap gap-2 mt-4 relative p-1 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] w-fit">
                  {([1, 3, 4] as BillingMonths[]).map((m) => {
                    const isSelected = getBillingMonths(tier.id) === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setBillingByTier((prev) => ({ ...prev, [tier.id]: m }))}
                        className={`relative z-10 text-[11px] font-mono px-3 py-1 rounded-md transition-colors ${
                          isSelected ? "text-[#0D1321] font-bold" : "text-[var(--text-tertiary)] hover:text-white"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId={`billing-pill-${tier.id}`}
                            className="absolute inset-0 rounded-md bg-[var(--app-amber)] z-[-1]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        {m === 1 ? "Bulanan" : `${m} bln`}
                      </button>
                    );
                  })}
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
                className={`btn mt-4 w-full relative overflow-hidden group transition-all duration-300 ${
                  isCurrent
                    ? "btn-secondary opacity-80"
                    : isLocked
                      ? "btn-secondary opacity-50 cursor-not-allowed"
                      : full
                        ? "btn-secondary"
                        : highlighted && canBuy
                          ? "btn-primary shadow-lg shadow-[rgba(255,176,32,0.25)] hover:shadow-[rgba(255,176,32,0.4)] hover:-translate-y-0.5"
                          : "btn-secondary hover:-translate-y-0.5"
                }`}
                style={{
                  background: highlighted && canBuy && !full && !isLocked && !isCurrent ? "linear-gradient(135deg, var(--app-amber), #F59E0B)" : undefined,
                  color: highlighted && canBuy && !full && !isLocked && !isCurrent ? "#0D1321" : undefined
                }}
              >
                <span className="relative z-10 font-bold">
                  {loadingTier === tier.id
                    ? "Memproses..."
                    : full && canBuy
                      ? "Masuk waitlist"
                      : getUpgradeButtonLabel(tier.id, currentTier)}
                </span>
                {highlighted && canBuy && !full && !isLocked && !isCurrent && (
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-0" />
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {isSubscribed(currentTier) && currentTier === "prime" && (
        <p className="text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
          Kamu sudah di paket tertinggi. Tambah kredit di bawah jika pool bulanan habis.
        </p>
      )}

      {isSubscribed(currentTier) && (
        <section className="border-t pt-10 mt-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-xl font-bold text-white mb-2">Top-up kredit</h3>
          <p className="text-[14px] mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Beli kredit tambahan tanpa mengubah paket. Kredit langsung masuk setelah pembayaran.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_TOPUP_PACKS.map((pack) => (
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={pack.id}
                type="button"
                onClick={() => handleTopup(pack.id)}
                disabled={loadingTopup !== null}
                className="relative text-left p-5 rounded-2xl border transition-all duration-300 group overflow-hidden"
                style={{
                  background: "var(--app-bg-elevated)",
                  borderColor: "rgba(255,255,255,0.08)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                }}
              >
                {/* Micro hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--app-sky)] rounded-full blur-[30px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />

                <p className="text-[13px] font-mono tracking-widest uppercase font-bold" style={{ color: "var(--app-text-tertiary)" }}>{pack.label}</p>
                <p className="text-2xl font-bold text-white mt-2 tracking-tight">
                  Rp {Math.round(pack.priceIdr / 1000)}<span className="text-lg opacity-70">K</span>
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[12px] font-medium" style={{ color: "var(--app-sky)" }}>
                    {loadingTopup === pack.id ? "Memproses..." : "+ Beli sekarang"}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--app-sky)] transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                    →
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

