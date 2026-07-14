"use client";

import Link from "next/link";
import { LEARN_HUB_PATH, OPEN_LEARN_IN_NEW_TAB } from "@/lib/learn-links";

function NodeMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <line x1="14" y1="6" x2="22" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" />
      <line x1="14" y1="6" x2="6" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" />
      <line x1="22" y1="20" x2="6" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" />
      <circle cx="14" cy="6" r="4" fill="#FFB020" />
      <circle cx="22" cy="20" r="3" fill="#38BDF8" />
      <circle cx="6" cy="20" r="2.5" fill="#9D4EDD" />
    </svg>
  );
}

const FOOTER_LINKS = {
  product: [
    { href: "/generate", label: "Generate" },
    { href: LEARN_HUB_PATH, label: "Learn Hub", learn: true },
    { href: "/#pricing", label: "Harga" },
    { href: "/tools", label: "Mini Tools" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  resources: [
    { href: "/#how-it-works", label: "Cara kerja" },
    { href: "/integrations", label: "Integrations" },
    { href: "/#faq", label: "FAQ" },
  ],
  account: [
    { href: "/login", label: "Masuk" },
    { href: "/signup", label: "Daftar" },
    { href: "/terms", label: "Syarat & Ketentuan" },
    { href: "/privacy", label: "Privasi" },
  ],
};

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string; learn?: boolean }>;
}) {
  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--lp-text-tertiary, rgba(240,243,250,0.35))",
          margin: "0 0 16px",
        }}
      >
        {title}
      </p>
      {links.map((link) => (
        <Link
          key={`${link.href}-${link.label}`}
          href={link.href}
          {...(link.learn ? OPEN_LEARN_IN_NEW_TAB : {})}
          style={{
            display: "block",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 13,
            color: "var(--lp-text-secondary, rgba(240,243,250,0.62))",
            textDecoration: "none",
            marginBottom: 10,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--lp-text-primary, #F0F3FA)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              "var(--lp-text-secondary, rgba(240,243,250,0.62))";
          }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--lp-bg-base, #0D1321)",
        borderTop: "0.5px solid var(--lp-border-default, rgba(240,243,250,0.08))",
        padding: "56px 24px 32px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 48,
          }}
          className="lp-footer-grid"
        >
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              <NodeMark />
              <span
                style={{
                  fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                  color: "var(--lp-text-primary, #F0F3FA)",
                }}
              >
                Arro
                <span style={{ color: "var(--lp-amber, #FFB020)" }}>Build</span>
              </span>
            </Link>
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                color: "var(--lp-text-tertiary, rgba(240,243,250,0.35))",
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 240,
              }}
            >
              Dari ide ke dokumen fondasi. Sebelum AI agent sempat ngasal.
            </p>
          </div>

          <FooterColumn title="Produk" links={FOOTER_LINKS.product} />
          <FooterColumn title="Resources" links={FOOTER_LINKS.resources} />
          <FooterColumn title="Akun" links={FOOTER_LINKS.account} />
        </div>

        <div
          style={{
            borderTop: "0.5px solid var(--lp-border-default, rgba(240,243,250,0.08))",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              color: "var(--lp-text-tertiary, rgba(240,243,250,0.35))",
            }}
          >
            © {new Date().getFullYear()} ArroBuild. Semua hak dilindungi.
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              color: "var(--lp-text-tertiary, rgba(240,243,250,0.35))",
            }}
          >
            Made with ◈ in Indonesia
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .lp-footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .lp-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
