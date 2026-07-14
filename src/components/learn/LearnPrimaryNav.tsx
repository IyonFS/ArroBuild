"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNavLabel } from "@/lib/display-name";
import {
  LEARN_REFERENCE_ITEMS,
  LEARN_TUTORIAL_ITEMS,
} from "@/lib/learn-nav";
import LearnNavDropdown from "@/components/learn/LearnNavDropdown";
import LearnSearch from "@/components/learn/LearnSearch";
import LearnLogo from "@/components/learn/LearnLogo";
import LearnThemeToggle from "@/components/learn/LearnThemeToggle";
import { MenuIcon, CloseIcon } from "@/components/marketing/icons";
import { LEARN_PRIMARY_NAV_HEIGHT } from "@/lib/learn-links";

interface AuthUser {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

const LEVEL_LABELS: Record<string, string> = {
  pemula: "Pemula",
  menengah: "Menengah",
  lanjut: "Lanjut",
};

export default function LearnPrimaryNav() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUser({
            name:
              (data.user.user_metadata?.full_name as string | undefined) ??
              (data.user.user_metadata?.name as string | undefined) ??
              null,
            email: data.user.email ?? "",
            avatarUrl: (data.user.user_metadata?.avatar_url as string) ?? null,
          });
        }
      }).catch(() => {});

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        const authUser = session?.user;
        if (authUser) {
          setUser({
            name:
              (authUser.user_metadata?.full_name as string | undefined) ??
              (authUser.user_metadata?.name as string | undefined) ??
              null,
            email: authUser.email ?? "",
            avatarUrl: (authUser.user_metadata?.avatar_url as string) ?? null,
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      console.error("LearnPrimaryNav auth init failed:", err);
      return undefined;
    }
  }, []);

  const navUserLabel = user ? getNavLabel(user.name, user.email) : "Dashboard";

  const tutorialItems = LEARN_TUTORIAL_ITEMS.map((item) => ({
    title: item.title,
    href: item.href,
    description: item.description,
    meta: `${item.lessonCount} lesson · ${LEVEL_LABELS[item.level] ?? item.level}`,
  }));

  const referenceItems = LEARN_REFERENCE_ITEMS.map((item) => ({
    title: item.title,
    href: item.href,
    description: item.description,
  }));

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          height: LEARN_PRIMARY_NAV_HEIGHT,
          background: "var(--learn-nav-bg)",
          borderColor: "var(--learn-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center gap-5">
          <LearnLogo />

          <nav className="hidden lg:flex items-center gap-7 shrink-0 learn-nav-text">
            <LearnNavDropdown label="Tutorial" items={tutorialItems} />
            <LearnNavDropdown label="Referensi" items={referenceItems} />
          </nav>

          <div className="flex-1 flex justify-center min-w-0">
            <LearnSearch />
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <LearnThemeToggle />
            <Link
              href="/"
              className="learn-hover-btn learn-nav-text text-sm px-3.5 py-2 rounded-lg"
              style={{
                color: "var(--learn-text-secondary)",
                border: "0.5px solid var(--learn-border)",
                background: "var(--learn-bg-elevated)",
              }}
            >
              ← ArroBuild
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="learn-hover-btn learn-nav-text text-sm px-3 py-2 rounded-lg inline-flex items-center gap-2"
                style={{
                  maxWidth: 160,
                  color: "var(--color-text-primary)",
                  border: "0.5px solid var(--learn-border)",
                  background: "var(--learn-bg-elevated)",
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      background: "var(--learn-accent-tint)",
                      color: "var(--learn-accent)",
                    }}
                  >
                    {(user.name ?? user.email)[0]?.toUpperCase()}
                  </span>
                )}
                <span className="truncate">{navUserLabel}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="learn-cta learn-nav-text text-sm font-semibold px-3.5 py-2 rounded-lg"
              >
                Masuk
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden learn-hover-btn flex items-center justify-center shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "0.5px solid var(--color-border-strong)",
              background: "transparent",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
            }}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="learn-mobile-overlay fixed inset-0 z-[60] lg:hidden"
          style={{ background: "rgba(13,19,33,0.85)" }}
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      <div
        className="fixed top-0 right-0 z-[61] h-full w-[min(100%,320px)] lg:hidden flex flex-col transition-transform duration-300"
        style={{
          background: "var(--learn-bg-surface)",
          borderLeft: "0.5px solid var(--learn-border)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          paddingTop: LEARN_PRIMARY_NAV_HEIGHT + 12,
          paddingBottom: 24,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <p
          className="learn-nav-text text-[10px] uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Tutorial
        </p>
        <nav className="flex flex-col gap-1 mb-6">
          {LEARN_TUTORIAL_ITEMS.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="learn-nav-text learn-hover-link text-sm px-3 py-2.5 rounded-lg"
              style={{ color: "var(--color-text-primary)" }}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <p
          className="learn-nav-text text-[10px] uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Referensi
        </p>
        <nav className="flex flex-col gap-1 mb-6 overflow-y-auto flex-1">
          {LEARN_REFERENCE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="learn-nav-text learn-hover-link text-xs px-3 py-2 rounded-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div
          className="pt-4 flex flex-col gap-2"
          style={{ borderTop: "0.5px solid var(--learn-border)" }}
        >
          <LearnThemeToggle fullWidth />
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="learn-hover-btn learn-nav-text text-sm px-4 py-2.5 rounded-lg text-center"
            style={{
              width: "100%",
              color: "var(--color-text-primary)",
              border: "0.5px solid var(--learn-border)",
              background: "var(--learn-bg-elevated)",
            }}
          >
            ← Kembali ke ArroBuild
          </Link>
          {!user && (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="learn-cta learn-nav-text text-sm font-semibold px-4 py-2.5 rounded-lg text-center"
              style={{ width: "100%" }}
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
