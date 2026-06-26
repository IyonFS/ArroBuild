"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getNavLabel } from "@/lib/display-name";
import { SparklesIcon, MenuIcon, CloseIcon } from "./icons";

const NAV_LINKS = [
  { href: "/learn", label: "Belajar" },
  { href: "/tools/portfolio", label: "Mini Tools" },
  { href: "/generate", label: "Buat Web" },
  { href: "/#pricing", label: "Harga" },
  { href: "/docs", label: "Dokumentasi" },
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

  const hideGenerateCta =
    pathname === "/dashboard" || pathname.startsWith("/generate");
  const navUserLabel = user ? getNavLabel(user.name, user.email) : "Dashboard";

  return (
    <>
      {/* ── Top Nav ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 202,
          height: 60,
          display: "flex",
          alignItems: "center",
          borderBottom: scrolled
            ? "0.5px solid var(--color-border-default)"
            : "0.5px solid transparent",
          background: scrolled
            ? "rgba(10,10,10,0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "background 200ms ease, border-color 200ms ease",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
                lineHeight: 1,
              }}
            >
              Arro
            </span>
            <span
              style={{
                fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "var(--color-lime)",
                lineHeight: 1,
              }}
            >
              Build
            </span>
          </a>

          {/* Desktop nav links */}
          <div
            className="hidden lg:flex"
            style={{ alignItems: "center", gap: 28 }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link"
                style={{
                  fontSize: 15,
                  color:
                    pathname === link.href ||
                    (link.href === "/learn" && pathname.startsWith("/learn"))
                      ? "var(--color-text-primary)"
                      : undefined,
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {user ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex btn btn-secondary btn-sm"
                style={{ maxWidth: 160, gap: 8 }}
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
                      background: "rgba(204,255,0,0.15)",
                      color: "var(--color-lime)",
                    }}
                  >
                    {(user.name ?? user.email)[0]?.toUpperCase()}
                  </span>
                )}
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {navUserLabel}
                </span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex btn btn-ghost btn-sm"
                >
                  Masuk
                </Link>
              </>
            )}

            {!hideGenerateCta && (
              <Link
                href="/generate"
                className="hidden sm:inline-flex btn btn-primary btn-sm"
                style={{ gap: 6 }}
              >
                <SparklesIcon />
                Buat Web
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex items-center justify-center"
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
        </div>
      </nav>

      {/* ── Mobile overlay backdrop ── */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 199,
            background: "rgba(10,10,10,0.8)",
          }}
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 201,
          height: "100%",
          width: "min(100%, 300px)",
          background: "var(--color-bg-surface)",
          borderLeft: "0.5px solid var(--color-border-default)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease",
          display: "flex",
          flexDirection: "column",
          paddingTop: 76,
          paddingBottom: 32,
          paddingLeft: 24,
          paddingRight: 24,
        }}
        className="lg:hidden"
      >
        {/* Mobile nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "12px",
                borderRadius: 8,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-text-primary)",
                textDecoration: "none",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.background =
                  "var(--color-bg-elevated)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.background = "transparent")
              }
            >
              {link.label}
            </a>
          ))}
          {user && (
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "12px",
                borderRadius: 8,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-lime)",
                textDecoration: "none",
              }}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Mobile bottom actions */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            borderTop: "0.5px solid var(--color-border-default)",
          }}
        >
          {!user && (
            <>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Daftar
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Masuk
              </Link>
            </>
          )}
          {!hideGenerateCta && (
            <Link
              href="/generate"
              onClick={() => setMenuOpen(false)}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", gap: 8 }}
            >
              <SparklesIcon />
              Mulai Buat
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
