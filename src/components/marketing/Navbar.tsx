"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getNavLabel } from "@/lib/display-name";
import { LogoIcon, SparklesIcon, MenuIcon, CloseIcon } from "./icons";

const NAV_LINKS = [
  { href: "/#features", label: "Fitur" },
  { href: "/#how-it-works", label: "Cara kerja" },
  { href: "/#pricing", label: "Harga" },
  { href: "/docs", label: "Docs" },
  { href: "/#faq", label: "FAQ" },
];

interface AuthUser {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

interface NavbarProps {
  variant?: "landing" | "minimal";
}

export default function Navbar({ variant = "landing" }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      });

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
      console.error("Navbar auth init failed:", err);
      return undefined;
    }
  }, []);

  const links =
    variant === "minimal"
      ? NAV_LINKS.filter((l) => l.href === "/docs" || l.href === "/#pricing")
      : NAV_LINKS;

  const hideGenerateCta = pathname === "/dashboard" || pathname.startsWith("/generate");
  const navUserLabel = user ? getNavLabel(user.name, user.email) : "Dashboard";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[202] transition-all duration-200 ${
          scrolled || menuOpen ? "glass py-3" : "bg-transparent py-4 md:py-5"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--green-500)" }}
            >
              <LogoIcon />
            </div>
            <span
              className="text-[17px] font-medium tracking-[-0.3px]"
              style={{ color: "var(--text-primary)" }}
            >
              ArroBuild
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-7">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[14px] transition-colors duration-150 hover:text-[var(--text-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 btn btn-secondary btn-sm max-w-[160px]"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
                    style={{ background: "var(--green-900)", color: "var(--green-text)" }}
                  >
                    {(user.name ?? user.email)[0]?.toUpperCase()}
                  </span>
                )}
                <span className="truncate">{navUserLabel}</span>
              </Link>
            ) : (
              <>
                <Link href="/signup" className="hidden md:inline-flex btn btn-ghost btn-sm">
                  Daftar
                </Link>
                <Link href="/login" className="hidden sm:inline-flex btn btn-secondary btn-sm">
                  Masuk
                </Link>
              </>
            )}
            {!hideGenerateCta && (
              <Link href="/generate" className="hidden sm:inline-flex btn btn-primary btn-sm">
                Generate
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center border transition-colors"
              style={{
                borderColor: "var(--bg-border)",
                color: "var(--text-secondary)",
              }}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[199] lg:hidden"
          style={{ backgroundColor: "rgba(15, 17, 23, 0.85)" }}
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={`fixed top-0 right-0 z-[201] h-full w-[min(100%,320px)] glass border-l transform transition-transform duration-300 lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ borderColor: "var(--bg-border)" }}
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-8">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 px-3 rounded-lg text-[15px] font-medium transition-colors hover:bg-[var(--bg-surface)]"
                style={{ color: "var(--text-primary)" }}
              >
                {link.label}
              </a>
            ))}
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-3 rounded-lg text-[15px] font-medium transition-colors hover:bg-[var(--bg-surface)]"
                style={{ color: "var(--green-text)" }}
              >
                Dashboard
              </Link>
            )}
          </nav>
          <div
            className="mt-auto pt-6 flex flex-col gap-3 border-t"
            style={{ borderColor: "var(--bg-border)" }}
          >
            {!user && (
              <>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-ghost w-full"
                >
                  Daftar
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-secondary w-full"
                >
                  Masuk
                </Link>
              </>
            )}
            {!hideGenerateCta && (
              <Link
                href="/generate"
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary w-full"
              >
                <SparklesIcon />
                Mulai generate
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
