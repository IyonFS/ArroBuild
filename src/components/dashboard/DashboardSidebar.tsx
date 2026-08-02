/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  PlusCircle,
  Wrench,
  BookOpen,
  MessageCircle,
  Star,
  ChevronUp,
  LogOut,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OPEN_LEARN_IN_NEW_TAB } from "@/lib/learn-links";
import type { UserPlanStatus } from "@/components/generate/types";
import ArroLogo from "@/components/ui/ArroLogo";

export type DashboardNavId =
  | "overview"
  | "generate"
  | "tools"
  | "learn"
  | "support"
  | "upgrade";

interface SidebarUser {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

interface DashboardSidebarProps {
  user: SidebarUser;
  displayName: string;
  tierLabel: string;
  tier: UserPlanStatus;
  activeId?: DashboardNavId;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void | Promise<void>;
}

const TIER_COLORS: Record<UserPlanStatus, string> = {
  none: "var(--app-text-tertiary)",
  base: "var(--app-text-secondary)",
  core: "var(--app-sky)",
  prime: "var(--app-amber)",
};

const NAV_ITEMS: {
  id: DashboardNavId;
  label: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}[] = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: <LayoutGrid size={16} strokeWidth={1.75} /> },
  { id: "generate", label: "Generate baru", href: "/generate", icon: <PlusCircle size={16} strokeWidth={1.75} /> },
  { id: "tools", label: "Mini Tools", href: "/tools", icon: <Wrench size={16} strokeWidth={1.75} /> },
  { id: "learn", label: "Learn Hub", href: "/learn", external: true, icon: <BookOpen size={16} strokeWidth={1.75} /> },
  { id: "support", label: "Dukungan", href: "/dashboard/support", icon: <MessageCircle size={16} strokeWidth={1.75} /> },
  { id: "upgrade", label: "Upgrade paket", href: "/dashboard/upgrade", icon: <Star size={16} strokeWidth={1.75} /> },
];

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[number];
  isActive: boolean;
  onNavigate: () => void;
}) {
  const className = `dashboard-nav-link relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium z-10 overflow-hidden`;
  const style = {
    color: isActive ? "var(--app-amber)" : "var(--app-text-secondary)",
  };

  const content = (
    <>
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-lg pointer-events-none z-[-1]"
          style={{
            background: "linear-gradient(90deg, rgba(255,176,32,0.15) 0%, rgba(255,176,32,0.05) 100%)",
            border: "1px solid rgba(255,176,32,0.3)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 12px rgba(255,176,32,0.1)",
          }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className={`dashboard-nav-icon shrink-0 ${isActive ? "" : "opacity-80"}`}>{item.icon}</span>
      <span className="relative z-10">{item.label}</span>
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} {...OPEN_LEARN_IN_NEW_TAB} onClick={onNavigate} className={className} style={style}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={className} style={style}>
      {content}
    </Link>
  );
}

function UserProfileMenu({
  user,
  displayName,
  tierLabel,
  tier,
  onSignOut,
  onCloseMobile,
}: {
  user: SidebarUser;
  displayName: string;
  tierLabel: string;
  tier: UserPlanStatus;
  onSignOut: () => void | Promise<void>;
  onCloseMobile: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      onCloseMobile();
      await onSignOut();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            role="menu"
            className="absolute bottom-[calc(100%+8px)] left-0 right-0 rounded-xl overflow-hidden z-50 backdrop-blur-md"
            style={{
              background: "rgba(10,15,25,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <p
                className="font-mono text-[11px] truncate flex items-center gap-2"
                style={{ color: "var(--app-text-secondary)" }}
              >
                <Mail size={12} strokeWidth={2} className="shrink-0" style={{ color: "var(--app-amber)" }} />
                {user.email}
              </p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-4 py-3 font-mono text-[13px] font-semibold transition-colors hover:bg-[rgba(239,68,68,0.1)] disabled:opacity-60"
              style={{ color: "#F87171" }}
            >
              <LogOut size={15} strokeWidth={2} />
              {signingOut ? "Keluar..." : "Keluar akun"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu akun"
        className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left cursor-pointer hover:bg-[var(--app-bg-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: open ? "var(--app-bg-hover)" : "var(--app-bg-elevated)",
          border: "0.5px solid var(--app-border-default)",
          outlineColor: "var(--app-amber)",
        }}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full shrink-0 object-cover" />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-mono"
            style={{ background: "var(--app-bg-hover)", color: "var(--app-amber)" }}
          >
            {(user.name ?? user.email)[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate" style={{ color: "var(--app-text-primary)" }}>
            {displayName}
          </p>
          <p className="font-mono text-[12px] truncate" style={{ color: TIER_COLORS[tier] }}>
            {tierLabel}
          </p>
        </div>
        <ChevronUp
          size={16}
          strokeWidth={1.75}
          className="shrink-0 transition-transform duration-150"
          style={{
            color: "var(--app-text-tertiary)",
            transform: open ? "rotate(0deg)" : "rotate(180deg)",
          }}
        />
      </button>
    </div>
  );
}

function SidebarBody({
  user,
  displayName,
  tierLabel,
  tier,
  activeId,
  onCloseMobile,
  onSignOut,
}: Omit<DashboardSidebarProps, "mobileOpen">) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-5 py-4 border-b" style={{ borderColor: "var(--app-border-default)" }}>
        <Link href="/" onClick={onCloseMobile} className="inline-flex transition-opacity hover:opacity-85">
          <ArroLogo size="sm" href="" />
        </Link>
      </div>

      <nav className="flex-1 min-h-0 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onNavigate={onCloseMobile}
          />
        ))}
      </nav>

      <div
        className="shrink-0 p-3 border-t"
        style={{ borderColor: "var(--app-border-default)" }}
      >
        <UserProfileMenu
          user={user}
          displayName={displayName}
          tierLabel={tierLabel}
          tier={tier}
          onSignOut={onSignOut}
          onCloseMobile={onCloseMobile}
        />
      </div>
    </div>
  );
}

export default function DashboardSidebar(props: DashboardSidebarProps) {
  const { mobileOpen, onCloseMobile } = props;

  return (
    <>
      <aside
        className="dashboard-sidebar hidden lg:flex lg:flex-col lg:w-[240px] lg:shrink-0 lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:z-40 lg:border-r"
        style={{ background: "var(--app-bg-base)", borderColor: "var(--app-border-default)" }}
      >
        <SidebarBody {...props} onCloseMobile={() => {}} />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={onCloseMobile}
            aria-hidden
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-[min(100%,280px)] flex flex-col min-h-0 shadow-2xl"
            style={{
              background: "var(--app-bg-base)",
              borderRight: "0.5px solid var(--app-border-default)",
            }}
          >
            <SidebarBody {...props} onCloseMobile={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}

export function resolveDashboardNavId(
  pathname: string,
  upgradeParam: string | null
): DashboardNavId {
  if (pathname.startsWith("/dashboard/upgrade")) return "upgrade";
  if (pathname.startsWith("/dashboard/support")) return "support";
  if (pathname.startsWith("/generate")) return "generate";
  if (pathname.startsWith("/tools")) return "tools";
  if (pathname.startsWith("/learn")) return "learn";
  if (upgradeParam) return "upgrade";
  return "overview";
}
