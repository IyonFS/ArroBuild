/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getDisplayName } from "@/lib/display-name";

const NAV_LINKS = [
  { href: "/learn", label: "Belajar" },
  { href: "/tools", label: "Mini Tools" },
  { href: "/generate", label: "Generate" },
  { href: "/#pricing", label: "Harga" },
];

interface AuthUser {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

function NavAccountButton({
  user,
  className,
  onClick,
}: {
  user: AuthUser;
  className?: string;
  onClick?: () => void;
}) {
  const displayName = getDisplayName(user.name, user.email);
  const initial = displayName[0]?.toUpperCase() ?? "A";

  return (
    <Link
      href="/dashboard"
      onClick={onClick}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 8,
        textDecoration: "none",
        background: "rgba(31,42,68,0.55)",
        border: "1px solid rgba(240,243,250,0.16)",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(56,189,248,0.4)";
        el.style.background = "rgba(56,189,248,0.08)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(240,243,250,0.16)";
        el.style.background = "rgba(31,42,68,0.55)";
      }}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt=""
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            fontWeight: 700,
            background: "rgba(255,176,32,0.15)",
            color: "var(--lp-amber)",
          }}
        >
          {initial}
        </span>
      )}
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--lp-text-primary)",
        }}
      >
        Dashboard
      </span>
    </Link>
  );
}

// Node Cluster mark (3 dots connected)
function NodeMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      {/* Lines */}
      <line x1="14" y1="6" x2="22" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" />
      <line x1="14" y1="6" x2="6" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" />
      <line x1="22" y1="20" x2="6" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" />
      {/* Nodes */}
      <circle cx="14" cy="6" r="4" fill="#FFB020" />
      <circle cx="22" cy="20" r="3" fill="#38BDF8" />
      <circle cx="6" cy="20" r="2.5" fill="#9D4EDD" />
    </svg>
  );
}

export default function NavbarV3({ solid = false }: { solid?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }) => {
        const authUser = data.session?.user;
        if (authUser) {
          setUser({
            name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
            email: authUser.email || "",
            avatarUrl: (authUser.user_metadata?.avatar_url as string) ?? null,
          });
        }
      });
    } catch {}
  }, []);

  const showSolid = solid || scrolled;
  const navBg = showSolid ? "rgba(13,19,33,0.92)" : "transparent";

  function isActive(href: string) {
    if (href === "/tools") return pathname === "/tools" || pathname.startsWith("/tools/");
    if (href === "/learn") return pathname === "/learn" || pathname.startsWith("/learn/");
    if (href === "/generate") return pathname === "/generate" || pathname.startsWith("/generate/");
    if (href.startsWith("/#")) return false;
    return pathname === href;
  }

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: navBg,
          backdropFilter: showSolid ? "blur(12px)" : "none",
          borderBottom: showSolid ? "0.5px solid rgba(240,243,250,0.08)" : "none",
          transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "0 24px",
            height: 76,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <NodeMark />
            <span
              style={{
                fontFamily: "var(--font-unbounded)",
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: "-0.02em",
                color: "var(--lp-text-primary)",
              }}
            >
              Arro<span style={{ color: "var(--lp-amber)" }}>Build</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
            }}
            className="nav-desktop"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    color: active ? "var(--lp-amber)" : "var(--lp-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--lp-text-primary)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = active ? "var(--lp-amber)" : "var(--lp-text-secondary)"; }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="nav-desktop">
            {user ? (
              <NavAccountButton user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--lp-text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--lp-text-primary)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--lp-text-secondary)"; }}
                >
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 13,
                    fontWeight: 700,
                    background: "var(--lp-amber)",
                    color: "#0D1321",
                    padding: "10px 20px",
                    borderRadius: 8,
                    textDecoration: "none",
                    transition: "background 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--lp-amber-dim)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--lp-amber)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
                >
                  Daftar gratis
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-mobile"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              color: "var(--lp-text-primary)",
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 199,
            background: "var(--lp-bg-base)",
            display: "flex",
            flexDirection: "column",
            padding: "96px 24px 32px",
            gap: 8,
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-unbounded)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--lp-text-primary)",
                textDecoration: "none",
                padding: "12px 0",
                borderBottom: "0.5px solid var(--lp-border-default)",
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {user ? (
              <NavAccountButton user={user} onClick={() => setMenuOpen(false)} />
            ) : (
              <>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--lp-text-secondary)",
                textDecoration: "none",
                textAlign: "center",
                padding: "12px",
                border: "0.5px solid var(--lp-border-strong)",
                borderRadius: 8,
              }}
            >
              Masuk
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 14,
                fontWeight: 700,
                background: "var(--lp-amber)",
                color: "#0D1321",
                textDecoration: "none",
                textAlign: "center",
                padding: "13px",
                borderRadius: 8,
              }}
            >
              Daftar gratis
            </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
