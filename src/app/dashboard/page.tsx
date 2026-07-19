"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardShell from "@/components/dashboard/DashboardShell";
import UpgradeSection from "@/components/dashboard/UpgradeSection";
import ProjectList, { type DashboardProject } from "@/components/dashboard/ProjectList";
import StatCard from "@/components/dashboard/StatCard";
import QuotaBar from "@/components/dashboard/QuotaBar";
import WhatsAppSupportTeaser from "@/components/support/WhatsAppSupportTeaser";
import type { WhatsappQuotaDisplay } from "@/components/support/WhatsAppSupportCard";
import { deriveQuotaDisplay } from "@/lib/dashboard-quota";
import { getDisplayName } from "@/lib/display-name";
import type { UserPlanStatus } from "@/components/generate/types";
import { PLAN_STATUS_LABELS } from "@/components/generate/types";

interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    subscriptionTier: string;
    subscriptionStatus: string;
    creditBalance?: number;
  } | null;
  tier: UserPlanStatus;
  plan?: UserPlanStatus;
  projectCount: number;
  projectLimit: number;
  monthlyProjectCount?: number;
  monthlyProjectLimit?: number;
  monthlyProjectRemaining?: number;
  dailyProjectCount?: number;
  dailyProjectLimit?: number;
  dailyProjectRemaining?: number;
  creditPool?: number;
  canForkProject?: boolean;
  whatsappQuota?: WhatsappQuotaDisplay | null;
  projects: DashboardProject[];
}

const TIER_LABEL = PLAN_STATUS_LABELS;

function LoadingSkeleton() {
  return (
    <div className="dashboard-app min-h-screen p-6 md:p-8">
      <div className="space-y-5 max-w-5xl mx-auto">
        <div className="h-10 w-48 rounded-lg skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl skeleton dashboard-stat-card" />
          ))}
        </div>
        <div className="h-20 rounded-xl skeleton" />
        <div className="space-y-3">
          <div className="h-28 rounded-2xl skeleton dashboard-project-card" />
          <div className="h-28 rounded-2xl skeleton dashboard-project-card" />
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgrade = searchParams.get("upgrade");
  const mountedRef = useRef(true);
  const [data, setData] = useState<MeResponse | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function loadProfile(retryAfterRefresh = false) {
    if (!mountedRef.current) return false;
    setLoadError(null);
    const res = await fetch("/api/user/me", { credentials: "include", cache: "no-store" });
    const json = (await res.json()) as MeResponse & { error?: string };

    if (!mountedRef.current) return false;

    if (json.user) {
      setData(json);
      setProjects(json.projects);
      return true;
    }

    if (res.status === 401 || res.status === 403) {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!mountedRef.current) return false;

      if (authData.user && !retryAfterRefresh) {
        await supabase.auth.refreshSession();
        return loadProfile(true);
      }

      if (!authData.user) {
        router.replace("/login?next=/dashboard");
        return false;
      }
    }

    if (!res.ok) {
      if (mountedRef.current) {
        setLoadError(
          json.error ??
            (res.status === 429
              ? "Terlalu banyak permintaan. Tunggu sebentar lalu muat ulang."
              : "Gagal memuat profil. Coba muat ulang halaman.")
        );
      }
      return false;
    }

    router.replace("/login?next=/dashboard");
    return false;
  }

  useEffect(() => {
    if (upgrade) {
      router.replace("/dashboard/upgrade");
      return;
    }

    loadProfile()
      .catch(() => {
        if (mountedRef.current) {
          setLoadError("Gagal memuat profil. Periksa koneksi lalu coba lagi.");
        }
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgrade, router]);

  useEffect(() => {
    if (upgrade) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, upgrade]);

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <LoadingSkeleton />;

  if (loadError) {
    return (
      <DashboardShell title="Overview">
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

  const tierLabel = TIER_LABEL[data.tier];
  const displayName = getDisplayName(data.user.name, data.user.email);
  const quota = deriveQuotaDisplay(data);
  const doneCount = projects.filter((p) => p.status === "DONE").length;
  const canFork =
    data.canForkProject ?? (data.plan === "pro" || data.plan === "pro_max");

  return (
    <DashboardShell
      title="Overview"
      subtitle={`Selamat datang, ${displayName}`}
      user={data.user}
      displayName={displayName}
      tierLabel={tierLabel}
      tier={data.tier}
      onSignOut={handleSignOut}
      headerAction={
        <Link href="/generate" className="btn btn-primary btn-sm dashboard-header-cta">
          <span className="hidden sm:inline">Generate baru</span>
          <span className="sm:hidden">+ Baru</span>
        </Link>
      }
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <StatCard label="Project selesai" value={doneCount} hint="Siap dibuka di workspace" />
        <StatCard label="Total riwayat" value={projects.length} hint="20 terbaru ditampilkan" />
        {data.creditPool != null && data.creditPool > 0 && (
          <StatCard
            label="Kredit tersisa"
            value={(data.user.creditBalance ?? 0).toLocaleString("id-ID")}
            accent
            hint={
              (data.user.creditBalance ?? 0) > (data.creditPool ?? 0)
                ? `Pool ${data.creditPool.toLocaleString("id-ID")} + sisa paket sebelumnya`
                : `Pool bulanan ${data.creditPool.toLocaleString("id-ID")}`
            }
          />
        )}
      </section>

      {quota.monthlyLimit > 0 && (
        <section
          style={{
            background: "var(--app-bg-elevated)",
            border: "0.5px solid var(--app-border-default)",
            borderRadius: 12,
            padding: "20px",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--app-text-primary)",
              }}
            >
              Kuota generate
            </p>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "4px 12px",
                borderRadius: 999,
                background:
                  data.tier === "pro_max"
                    ? "rgba(255,176,32,0.12)"
                    : data.tier === "pro"
                    ? "rgba(56,189,248,0.12)"
                    : "rgba(240,243,250,0.07)",
                color:
                  data.tier === "pro_max"
                    ? "var(--app-amber)"
                    : data.tier === "pro"
                    ? "var(--app-sky)"
                    : "var(--app-text-tertiary)",
                border:
                  data.tier === "pro_max"
                    ? "1px solid rgba(255,176,32,0.3)"
                    : data.tier === "pro"
                    ? "1px solid rgba(56,189,248,0.3)"
                    : "1px solid var(--app-border-default)",
              }}
            >
              Paket {tierLabel}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <QuotaBar
              label="Kuota project bulan ini"
              used={quota.monthlyUsed}
              limit={quota.monthlyLimit}
              remaining={quota.monthlyRemaining}
              hint="Generate sukses & antrian dihitung · gagal tidak dihitung"
            />
            {quota.dailyLimit > 0 && (
              <QuotaBar
                label="Kuota harian"
                used={quota.dailyUsed}
                limit={quota.dailyLimit}
                remaining={quota.dailyRemaining}
                warnAtFull={false}
                hint="Reset setiap tengah malam (WIB)"
              />
            )}
          </div>
        </section>
      )}

      <WhatsAppSupportTeaser tier={data.tier} quota={data.whatsappQuota ?? null} />

      <ProjectList
        projects={projects}
        canFork={canFork}
        onProjectsChange={setProjects}
        onRefresh={() => loadProfile()}
      />

      <div id="upgrade" className="scroll-mt-6">
        <UpgradeSection
          currentTier={data.tier}
          highlightPlan={upgrade}
          onPaymentSuccess={() => loadProfile()}
        />
      </div>
    </DashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
