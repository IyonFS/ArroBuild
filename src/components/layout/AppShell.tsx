"use client";

import { usePathname } from "next/navigation";
import NavbarV3 from "@/components/marketing/landing/NavbarV3";
import Footer from "@/components/marketing/Footer";
import { APP_NAV_HEIGHT_PX, resolveNavMode, type NavMode } from "@/lib/nav-routes";

interface AppShellProps {
  children: React.ReactNode;
  padded?: boolean;
  tone?: "app" | "marketing";
  showFooter?: boolean;
  /** @deprecated Prefer navMode="none" or rely on auto route detection */
  showNav?: boolean;
  /** Auto-detect from pathname when omitted */
  navMode?: NavMode | "auto";
}

export default function AppShell({
  children,
  padded = true,
  tone = "marketing",
  showFooter = tone === "marketing",
  showNav,
  navMode = "auto",
}: AppShellProps) {
  const pathname = usePathname();

  const resolvedNav: NavMode =
    showNav === false
      ? "none"
      : navMode === "auto"
        ? resolveNavMode(pathname)
        : navMode;

  const hasNav = resolvedNav === "app";
  const navOffset = hasNav ? APP_NAV_HEIGHT_PX : 0;

  const mainClass = padded
    ? hasNav
      ? "pt-[88px] pb-12 md:pt-24 md:pb-16"
      : "py-8 md:py-12"
    : "";

  const mainStyle = !padded && hasNav ? { paddingTop: navOffset } : undefined;

  return (
    <div
      className="min-h-screen flex flex-col relative w-full"
      style={{
        background:
          tone === "app"
            ? "var(--app-bg-base)"
            : "var(--lp-bg-base, var(--color-bg-base))",
        color: tone === "marketing" ? "var(--lp-text-primary, #F0F3FA)" : undefined,
      }}
    >
      {hasNav && <NavbarV3 solid />}
      <main className={`flex-1 relative z-10 w-full ${mainClass}`} style={mainStyle}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
