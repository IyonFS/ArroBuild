"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/layout/AppShell";
import UpgradeSection from "@/components/dashboard/UpgradeSection";
import { getDisplayName } from "@/lib/display-name";
import type { UserTier } from "@/components/generate/types";

interface ProjectSummary {
  id: string;
  idea: string;
  status: string;
  createdAt: string;
  _count: { files: number };
}

interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    subscriptionTier: string;
    subscriptionStatus: string;
  } | null;
  tier: UserTier;
  projectCount: number;
  projectLimit: number | null;
  projects: ProjectSummary[];
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  DONE: { label: "Selesai", className: "badge-success" },
  GENERATING: { label: "Proses", className: "badge-info" },
  PENDING: { label: "Antrian", className: "badge-warning" },
  FAILED: { label: "Gagal", className: "badge-danger" },
};

const TIER_LABEL: Record<UserTier, string> = {
  free: "Gratis",
  paid: "Starter / Pro",
  unlimited: "Unlimited",
};

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="h-16 app-panel skeleton" />
      <div className="h-48 app-panel skeleton" />
      <div className="h-32 app-panel skeleton" />
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgrade = searchParams.get("upgrade");
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  function loadProfile() {
    return fetch("/api/user/me")
      .then((res) => res.json())
      .then((json: MeResponse) => {
        if (!json.user) {
          router.replace("/login");
          return;
        }
        setData(json);
      });
  }

  useEffect(() => {
    loadProfile()
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

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
          if (d.ok) {
            sessionStorage.removeItem("arrobuild_pending_order");
            loadProfile();
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    if (upgrade) {
      const el = document.getElementById("upgrade");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [upgrade]);

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <LoadingSkeleton />;
  if (!data?.user) return null;

  const tierLabel = TIER_LABEL[data.tier];
  const displayName = getDisplayName(data.user.name, data.user.email);
  const usagePercent =
    data.projectLimit && data.projectLimit > 0
      ? Math.min(100, (data.projectCount / data.projectLimit) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Account bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 mb-8 border-b border-[var(--bg-border)]">
        <div className="flex items-center gap-4 min-w-0">
          {data.user.avatarUrl ? (
            <img
              src={data.user.avatarUrl}
              alt=""
              className="w-11 h-11 rounded-full shrink-0"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
              style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
            >
              {(data.user.name ?? data.user.email)[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h1 className="text-[1.125rem] font-medium text-white truncate">
                {displayName}
              </h1>
              <span className="badge badge-success text-[11px]">{tierLabel}</span>
            </div>
            <p className="text-[13px] truncate" style={{ color: "var(--text-tertiary)" }}>
              {data.user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {data.projects.length > 0 && (
            <Link href="/generate" className="btn btn-primary btn-sm">
              Generate baru
            </Link>
          )}
          <button type="button" onClick={handleSignOut} className="btn btn-ghost btn-sm">
            Keluar
          </button>
        </div>
      </header>

      {/* Usage — compact, only for limited tiers */}
      {data.projectLimit !== null && (
        <div className="app-panel px-4 py-3 mb-8">
          <div className="flex justify-between text-[13px] mb-2">
            <span style={{ color: "var(--text-secondary)" }}>Kuota project gratis</span>
            <span style={{ color: "var(--text-tertiary)" }}>
              {data.projectCount} dari {data.projectLimit}
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--bg-border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${usagePercent}%`,
                background: usagePercent >= 100 ? "var(--danger-text)" : "var(--green-500)",
              }}
            />
          </div>
          {usagePercent >= 100 && (
            <p className="text-[12px] mt-2" style={{ color: "var(--warning-text)" }}>
              Kuota habis — upgrade untuk project tanpa batas.
            </p>
          )}
        </div>
      )}

      {/* Projects — primary content */}
      <section className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-[15px] font-medium text-white">Project kamu</h2>
          <span className="text-label">{data.projects.length} total</span>
        </div>

        {data.projects.length === 0 ? (
          <div className="app-panel px-6 py-12 text-center">
            <p className="text-[15px] font-medium text-white mb-1">Belum ada project</p>
            <p className="text-body text-[13px] mb-6 max-w-xs mx-auto">
              Mulai dari satu ide — ArroBuild akan susun PRD dan file pendukungnya.
            </p>
            <Link href="/generate" className="btn btn-primary btn-sm">
              Mulai generate
            </Link>
          </div>
        ) : (
          <div className="app-panel overflow-hidden">
            {data.projects.map((project) => {
              const status = STATUS_STYLES[project.status] ?? {
                label: project.status,
                className: "badge-info",
              };
              return (
                <div key={project.id} className="app-row flex-col sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0 w-full">
                    <p className="text-[14px] text-white leading-snug line-clamp-2 mb-1.5">
                      {project.idea}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      <span className={`badge ${status.className} text-[10px]`}>
                        {status.label}
                      </span>
                      <span>{project._count.files} file</span>
                      <span>
                        {new Date(project.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  {project.status === "DONE" && project._count.files > 0 && (
                    <a
                      href={`/api/export?projectId=${project.id}`}
                      className="btn btn-secondary btn-sm shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      Download
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div id="upgrade">
        <UpgradeSection
          currentTier={data.tier}
          highlightPlan={upgrade}
          onPaymentSuccess={() => loadProfile()}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell tone="app" showFooter={false}>
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardContent />
      </Suspense>
    </AppShell>
  );
}
