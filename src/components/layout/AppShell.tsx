"use client";

import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

interface AppShellProps {
  children: React.ReactNode;
  padded?: boolean;
  tone?: "app" | "marketing";
  showFooter?: boolean;
}

export default function AppShell({
  children,
  padded = true,
  tone = "marketing",
  showFooter = tone === "marketing",
}: AppShellProps) {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* Subtle grid background — marketing pages only */}
      {tone === "marketing" && (
        <div
          className="fixed inset-0 grid-bg pointer-events-none"
          style={{ opacity: 1 }}
        />
      )}
      <Navbar variant="minimal" />
      <main
        className={`flex-1 relative z-10 ${
          padded ? "pt-20 pb-12 md:pt-24 md:pb-16" : "pt-[60px]"
        }`}
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
