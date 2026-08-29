"use client";

import Link from "next/link";
import { LEARN_HUB_PATH, OPEN_LEARN_IN_NEW_TAB } from "@/lib/learn-links";

const FOOTER_LINKS = {
  product: [
    { href: "/generate", label: "Buat Web / Dokumen" },
    { href: LEARN_HUB_PATH, label: "Pusat Belajar", learn: true },
    { href: "/#pricing", label: "Harga" },
    { href: "/tools", label: "Alat Mini" },
    { href: "/dashboard", label: "Dasbor" },
  ],
  resources: [
    { href: "/#how-it-works", label: "Cara Kerja" },
    { href: "/integrations", label: "Integrasi" },
    { href: "/#faq", label: "Tanya Jawab" },
  ],
  account: [
    { href: "/login", label: "Masuk" },
    { href: "/signup", label: "Daftar" },
    { href: "/terms", label: "Syarat & Ketentuan" },
    { href: "/privacy", label: "Kebijakan Privasi" },
  ],
  socials: [{ href: "mailto:hello@hygione.com", label: "Hubungi Kami" }],
};

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string; learn?: boolean }>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--lp-text-primary, #F0F3FA)",
          margin: "0 0 24px",
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
            display: "inline-flex",
            alignItems: "center",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 14,
            color: "var(--lp-text-secondary, rgba(240,243,250,0.62))",
            textDecoration: "none",
            marginBottom: 16,
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--lp-amber, #FFB020)";
            e.currentTarget.style.transform = "translateX(6px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--lp-text-secondary, rgba(240,243,250,0.62))";
            e.currentTarget.style.transform = "translateX(0px)";
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
        padding: "96px 24px 64px",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Main Grid: Huge Statement + Links */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-24">
          {/* Left / Top: Editorial Statement */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <Link href="/" style={{ textDecoration: "none" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.04em",
                    color: "var(--lp-text-primary, #F0F3FA)",
                    margin: 0,
                  }}
                >
                  ArroBuild
                  <span style={{ color: "var(--lp-amber, #FFB020)" }}>.</span>
                </h2>
              </Link>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 14,
                  color: "var(--lp-text-secondary, rgba(240,243,250,0.62))",
                  lineHeight: 1.8,
                  marginTop: 24,
                  maxWidth: 380,
                }}
              >
                Dari ide ke dokumen fondasi. Sebelum AI agent sempat ngasal. Arsitektur yang kokoh
                dimulai dari desain sistem yang tepat.
              </p>
            </div>
          </div>

          {/* Right / Bottom: Clean Link Columns */}
          <div className="flex-[1.8] grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 pt-4">
            <FooterColumn title="Produk" links={FOOTER_LINKS.product} />
            <FooterColumn title="Sumber Daya" links={FOOTER_LINKS.resources} />
            <FooterColumn title="Akun" links={FOOTER_LINKS.account} />
            <FooterColumn title="Kontak" links={FOOTER_LINKS.socials} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "0.5px solid var(--lp-border-default, rgba(240,243,250,0.08))",
            paddingTop: 32,
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
          className="flex-col md:flex-row md:items-center"
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              color: "var(--lp-text-tertiary, rgba(240,243,250,0.35))",
            }}
          >
            © {new Date().getFullYear()} ArroBuild. Semua hak dilindungi.
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              color: "var(--lp-text-tertiary, rgba(240,243,250,0.35))",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Buatan Hygione
          </span>
        </div>
      </div>
    </footer>
  );
}
