"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import DashboardSidebar, {
  resolveDashboardNavId,
  type DashboardNavId,
} from "./DashboardSidebar";
import type { UserPlanStatus } from "@/components/generate/types";

interface SidebarUser {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  user?: SidebarUser;
  displayName?: string;
  tierLabel?: string;
  tier?: UserPlanStatus;
  activeId?: DashboardNavId;
  onSignOut?: () => void | Promise<void>;
  headerAction?: React.ReactNode;
}

function DashboardShellLayout({
  children,
  title = "Overview",
  subtitle,
  user,
  displayName = "User",
  tierLabel = "",
  tier = "none",
  onSignOut = () => {},
  headerAction,
  navId,
}: DashboardShellProps & { navId: DashboardNavId }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const defaultHeaderAction = (
    <Link
      href="/generate"
      className="btn btn-sm relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-[1px] active:scale-[0.98]"
      style={{
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 13,
        fontWeight: 700,
        background: "linear-gradient(135deg, var(--app-amber), #F59E0B)",
        color: "#0D1321",
        padding: "8px 18px",
        borderRadius: 8,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        boxShadow: "0 4px 14px rgba(255,176,32,0.25), inset 0 1px 1px rgba(255,255,255,0.4)"
      }}
    >
      <span className="relative z-10">Generate baru</span>
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </Link>
  );

  return (
    <div className="dashboard-app min-h-screen flex" style={{ background: "var(--app-bg-base)" }}>
      {user && (
        <DashboardSidebar
          user={user}
          displayName={displayName}
          tierLabel={tierLabel}
          tier={tier}
          activeId={navId}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onSignOut={onSignOut}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 lg:pl-[240px]">
        <header
          className="dashboard-topbar sticky top-4 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 h-[60px] mx-4 sm:mx-8 rounded-2xl backdrop-blur-md"
          style={{ 
            background: "rgba(13,19,33,0.7)", 
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)" 
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden dashboard-icon-btn p-2 -ml-1 rounded-xl"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1
                className="font-unbounded font-bold truncate"
                style={{
                  fontSize: "clamp(20px, 2vw, 24px)",
                  color: "var(--app-text-primary)",
                  letterSpacing: "0.01em",
                  lineHeight: 1.15,
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="font-mono text-[12px] truncate hidden sm:block"
                  style={{ color: "var(--app-text-secondary)", opacity: 0.7 }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0">{headerAction ?? defaultHeaderAction}</div>
        </header>

        <main className="flex-1 overflow-y-auto dashboard-main-surface">
          <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1360px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

function DashboardShellWithParams(props: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const upgradeParam = searchParams.get("upgrade");
  const navId = props.activeId ?? resolveDashboardNavId(pathname, upgradeParam);

  return <DashboardShellLayout {...props} navId={navId} />;
}

function DashboardShellFallback(props: DashboardShellProps) {
  const pathname = usePathname();
  const navId = props.activeId ?? resolveDashboardNavId(pathname, null);

  return <DashboardShellLayout {...props} navId={navId} />;
}

export default function DashboardShell(props: DashboardShellProps) {
  return (
    <Suspense fallback={<DashboardShellFallback {...props} />}>
      <DashboardShellWithParams {...props} />
    </Suspense>
  );
}
