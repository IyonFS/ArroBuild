"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardShell from "@/components/dashboard/DashboardShell";
import WhatsAppSupportCard, {
  type WhatsappQuotaDisplay,
} from "@/components/support/WhatsAppSupportCard";
import { getDisplayName } from "@/lib/display-name";
import { deriveQuotaDisplay } from "@/lib/dashboard-quota";
import { useDashboardMe } from "@/hooks/use-dashboard-me";
import type { UserPlanStatus } from "@/components/generate/types";
import { PLAN_STATUS_LABELS } from "@/components/generate/types";

const TIER_LABEL = PLAN_STATUS_LABELS;

function SupportContent() {
  const { data, loading, loadError, loadProfile, setLoading } = useDashboardMe(
    "/dashboard/support"
  );
  const [whatsappQuota, setWhatsappQuota] = useState<WhatsappQuotaDisplay | null>(null);
  const [prevData, setPrevData] = useState(data);

  if (data !== prevData) {
    setPrevData(data);
    const q = (data as { whatsappQuota?: WhatsappQuotaDisplay | null })?.whatsappQuota;
    if (q !== undefined) setWhatsappQuota(q);
  }

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <DashboardShell title="Dukungan" activeId="support">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="h-8 w-48 rounded skeleton" />
          <div className="h-64 rounded-2xl skeleton" />
        </div>
      </DashboardShell>
    );
  }

  if (loadError || !data?.user) {
    return (
      <DashboardShell title="Dukungan" activeId="support">
        <div className="max-w-md mx-auto py-16 text-center">
          <p className="text-body mb-4" style={{ color: "var(--color-text-secondary)" }}>
            {loadError ?? "Gagal memuat profil"}
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

  const tierLabel = TIER_LABEL[data.tier];
  const displayName = getDisplayName(data.user.name, data.user.email);
  const quota = deriveQuotaDisplay(data);
  const tier = data.plan ?? data.tier;
  const initialQuota =
    whatsappQuota ??
    (data as { whatsappQuota?: WhatsappQuotaDisplay | null }).whatsappQuota ??
    null;

  return (
    <DashboardShell
      title="Dukungan"
      subtitle="Chat langsung dengan founder"
      activeId="support"
      user={data.user}
      displayName={displayName}
      tierLabel={tierLabel}
      tier={data.tier}
      onSignOut={handleSignOut}
    >
      <div className="max-w-xl mx-auto">
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Untuk pertanyaan teknis, billing, atau bantuan project. Kuota chat tergantung paket
          langganan kamu.
        </p>

        <WhatsAppSupportCard
          tier={tier}
          quota={initialQuota}
          userEmail={data.user.email}
          onSuccess={(q) => setWhatsappQuota(q)}
        />

        <p className="text-center mt-6">
          <Link
            href="/dashboard"
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            ← Kembali ke overview
          </Link>
        </p>
      </div>
    </DashboardShell>
  );
}

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell title="Dukungan" activeId="support">
          <div className="h-64 rounded-2xl skeleton max-w-xl mx-auto" />
        </DashboardShell>
      }
    >
      <SupportContent />
    </Suspense>
  );
}
