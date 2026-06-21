"use client";

import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

interface AppShellProps {
  children: React.ReactNode;
  /** Extra top padding below navbar */
  padded?: boolean;
  /** App pages: quieter background, no footer */
  tone?: "app" | "marketing";
  showFooter?: boolean;
}

export default function AppShell({
  children,
  padded = true,
  tone = "marketing",
  showFooter = tone === "marketing",
}: AppShellProps) {
  const isApp = tone === "app";

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: "var(--bg-base)" }}
    >
      {!isApp && (
        <>
          <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
          <div
            className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.07] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,0.5) 0%, transparent 70%)",
            }}
          />
        </>
      )}
      {isApp && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.35]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,197,94,0.06), transparent 60%)",
            }}
          />
        </div>
      )}
      <Navbar variant="minimal" />
      <main className={`flex-1 relative z-10 ${padded ? "pt-20 pb-12 md:pt-24 md:pb-16" : ""}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
