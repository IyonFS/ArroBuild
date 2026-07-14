"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getDisplayName, getNavLabel } from "@/lib/display-name";
import { OPEN_LEARN_IN_NEW_TAB, LEARN_HUB_PATH } from "@/lib/learn-links";
import { APP_NAV_HEIGHT_PX } from "@/lib/nav-routes";
import { MenuIcon, CloseIcon } from "@/components/marketing/icons";
import { useHydrated } from "@/hooks/use-hydrated";

const APP_LINKS = [
  { href: LEARN_HUB_PATH, label: "Belajar", external: true },
  { href: "/tools", label: "Mini Tools" },
  { href: "/integrations", label: "Integrasi" },
] as const;

interface AuthUser {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

function NodeMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden>
      <line x1="14" y1="6" x2="22" y2="20" stroke="rgba(240,243,250,0.28)" strokeWidth="1.5" />
      <line x1="14" y1="6" x2="6" y2="20" stroke="rgba(240,243,250,0.28)" strokeWidth="1.5" />
      <line x1="22" y1="20" x2="6" y2="20" stroke="rgba(240,243,250,0.28)" strokeWidth="1.5" />
      <circle cx="14" cy="6" r="4" fill="#FFB020" />
      <circle cx="22" cy="20" r="3" fill="#38BDF8" />
      <circle cx="6" cy="20" r="2.5" fill="#9D4EDD" />
    </svg>
  );
}

export default function AppNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const mounted = useHydrated();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    try {
      const supabase = createClient();

      supabase.auth
        .getUser()
        .then(({ data }) => {
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
        })
        .catch(() => {});

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
    } catch {
      return undefined;
    }
  }, []);

  const displayName = user ? getDisplayName(user.name, user.email) : "";
  const initial = displayName[0]?.toUpperCase() ?? "A";

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 202,
          height: APP_NAV_HEIGHT_PX,
          display: "flex",
          alignItems: "center",
          borderBottom: "0.5px solid rgba(240,243,250,0.1)",
          background: "rgba(13,19,33,0.94)",
          backdropFilter: "blur(14px)",
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
            gap: 20,
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <NodeMark />
            <span
              style={{
                fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#F0F3FA",
                lineHeight: 1,
              }}
            >
              Arro
              <span style={{ color: "#FFB020" }}>Build</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center" style={{ gap: 8 }}>
            {APP_LINKS.map((link) => {
              const active =
                pathname === link.href ||
                (link.href === "/tools" && pathname.startsWith("/tools"));
              const props =
                "external" in link && link.external ? OPEN_LEARN_IN_NEW_TAB : {};

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  {...props}
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    color: active ? "#F0F3FA" : "rgba(240,243,250,0.55)",
                    textDecoration: "none",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: active ? "rgba(255,176,32,0.08)" : "transparent",
                    border: active
                      ? "0.5px solid rgba(255,176,32,0.28)"
                      : "0.5px solid transparent",
                    transition: "color 0.15s, background 0.15s, border-color 0.15s",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {mounted && user ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex"
                style={{
                  alignItems: "center",
                  gap: 8,
                  maxWidth: 180,
                  padding: "8px 14px",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: "rgba(31,42,68,0.75)",
                  border: "1px solid rgba(240,243,250,0.14)",
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      background: "rgba(255,176,32,0.15)",
                      color: "#FFB020",
                    }}
                  >
                    {initial}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#F0F3FA",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Dashboard
                </span>
              </Link>
            ) : mounted ? (
              <Link
                href="/login"
                className="hidden sm:inline-flex"
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0D1321",
                  background: "#FFB020",
                  padding: "10px 16px",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                Masuk
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center"
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                border: "0.5px solid rgba(240,243,250,0.16)",
                background: "rgba(31,42,68,0.55)",
                color: "#F0F3FA",
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

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 199,
            background: "rgba(13,19,33,0.82)",
          }}
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      <div
        className="md:hidden"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 201,
          height: "100%",
          width: "min(100%, 300px)",
          background: "#161D2E",
          borderLeft: "0.5px solid rgba(240,243,250,0.1)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease",
          display: "flex",
          flexDirection: "column",
          paddingTop: APP_NAV_HEIGHT_PX + 20,
          paddingBottom: 24,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {APP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              {...("external" in link && link.external ? OPEN_LEARN_IN_NEW_TAB : {})}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "14px 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                color: "#F0F3FA",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={user ? "/dashboard" : "/login"}
            onClick={() => setMenuOpen(false)}
            style={{
              padding: "14px 12px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              color: "#FFB020",
              textDecoration: "none",
            }}
          >
            {user ? `Dashboard · ${getNavLabel(user.name, user.email)}` : "Masuk"}
          </Link>
        </nav>
      </div>
    </>
  );
}
