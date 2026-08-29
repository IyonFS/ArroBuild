"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardShell from "@/components/dashboard/DashboardShell";
import UpgradePlanPicker from "@/components/dashboard/UpgradePlanPicker";
import { getDisplayName } from "@/lib/display-name";
import { useDashboardMe } from "@/hooks/use-dashboard-me";
import { PLAN_STATUS_LABELS } from "@/components/generate/types";

const TIER_LABEL = PLAN_STATUS_LABELS;

function UpgradeContent() {
  const searchParams = useSearchParams();
  const highlightPlan = searchParams.get("plan");
  const mountedRef = useRef(true);
  const { data, loading, loadError, loadProfile, setLoading } =
    useDashboardMe("/dashboard/upgrade");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const pendingOrder = sessionStorage.getItem("arrobuild_pending_order");
    if (payment === "finish" && pendingOrder) {
      fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: pendingOrder }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok && mountedRef.current) {
            sessionStorage.removeItem("arrobuild_pending_order");
            void loadProfile();
          }
        })
        .catch(() => {});
    }
  }, [searchParams, loadProfile]);

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign(new URL("/", window.location.origin));
  }

  if (loading) {
    return (
      <DashboardShell title="Upgrade paket" activeId="upgrade">
        <div className="space-y-4">
          <div className="h-24 rounded-2xl skeleton" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl skeleton dashboard-project-card" />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (loadError) {
    return (
      <DashboardShell title="Upgrade paket" activeId="upgrade">
        <div className="max-w-md mx-auto py-16 text-center">
          <p className="text-body mb-4" style={{ color: "var(--color-text-secondary)" }}>
            {loadError}
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setLoading(true);
              loadProfile().finally(() => setLoading(false));
            }}
          >
            Muat ulang
          </button>
        </div>
      </DashboardShell>
    );
  }

  if (!data?.user) return null;

  const displayName = getDisplayName(data.user.name, data.user.email);
  const tierLabel = TIER_LABEL[data.tier];

  return (
    <DashboardShell
      title="Upgrade paket"
      subtitle={`${displayName} · ${tierLabel}`}
      user={data.user}
      displayName={displayName}
      tierLabel={tierLabel}
      tier={data.tier}
      activeId="upgrade"
      onSignOut={handleSignOut}
      headerAction={
        <Link href="/dashboard" className="btn btn-secondary btn-sm">
          ← Overview
        </Link>
      }
    >
      <UpgradePlanPicker
        currentTier={data.tier}
        creditBalance={data.user.creditBalance}
        creditPool={data.creditPool}
        highlightPlan={highlightPlan}
        onPaymentSuccess={async () => {
          await loadProfile();
        }}
        variant="page"
      />
    </DashboardShell>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <DashboardShell title="Upgrade paket" activeId="upgrade">
          <div className="h-40 rounded-2xl skeleton" />
        </DashboardShell>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}
