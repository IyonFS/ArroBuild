import { GithubIcon, TwitterIcon } from "./icons";

const FOOTER_LINKS = {
  product: [
    { href: "/generate", label: "Generate" },
    { href: "/learn", label: "Learn Hub" },
    { href: "/#pricing", label: "Harga" },
    { href: "/docs", label: "Docs" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  resources: [
    { href: "/#how-it-works", label: "Cara kerja" },
    { href: "/integrations", label: "Integrations" },
    { href: "/tools/portfolio", label: "Portfolio Generator" },
    { href: "/#faq", label: "FAQ" },
    { href: "/login", label: "Masuk" },
    { href: "/signup", label: "Daftar" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "0.5px solid var(--color-border-default)",
        paddingTop: 56,
        paddingBottom: 32,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: "span 1" }}>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily:
                    "var(--font-unbounded), 'Unbounded', sans-serif",
                  fontSize: 15,
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
                  fontFamily:
                    "var(--font-unbounded), 'Unbounded', sans-serif",
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "var(--color-lime)",
                  lineHeight: 1,
                }}
              >
                Build
              </span>
            </a>

            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                fontWeight: 300,
                lineHeight: 1.7,
                color: "var(--color-text-tertiary)",
                maxWidth: 240,
                marginBottom: 20,
              }}
            >
              Satu tempat untuk belajar, planning, dan build dengan AI agent.
              Dibuat untuk developer Indonesia.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              {[
                { href: "https://twitter.com", icon: <TwitterIcon />, label: "X (Twitter)" },
                { href: "https://github.com", icon: <GithubIcon />, label: "GitHub" },
              ].map(({ href, icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "0.5px solid var(--color-border-default)",
                    color: "var(--color-text-tertiary)",
                    textDecoration: "none",
                    transition: "border-color 150ms ease, color 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "var(--color-border-strong)";
                    el.style.color = "var(--color-text-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "var(--color-border-default)";
                    el.style.color = "var(--color-text-tertiary)";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
                marginBottom: 16,
              }}
            >
              Produk
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 13,
                      fontWeight: 400,
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      transition: "color 150ms ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color =
                        "var(--color-text-primary)")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color =
                        "var(--color-text-secondary)")
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
                marginBottom: 16,
              }}
            >
              Resources
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {FOOTER_LINKS.resources.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <a
                    href={link.href}
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 13,
                      fontWeight: 400,
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      transition: "color 150ms ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color =
                        "var(--color-text-primary)")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color =
                        "var(--color-text-secondary)")
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment column */}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
                marginBottom: 16,
              }}
            >
              Pembayaran
            </h3>
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                fontWeight: 300,
                lineHeight: 1.7,
                color: "var(--color-text-tertiary)",
                marginBottom: 12,
              }}
            >
              QRIS, GoPay, OVO, Dana, dan transfer bank via Midtrans.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["QRIS", "GoPay", "Bank"].map((method) => (
                <span
                  key={method}
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: "0.5px solid var(--color-border-default)",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: 24,
            borderTop: "0.5px solid var(--color-border-default)",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              fontWeight: 400,
              color: "var(--color-text-tertiary)",
            }}
          >
            © {new Date().getFullYear()} ArroBuild. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              fontWeight: 400,
              color: "var(--color-text-tertiary)",
            }}
          >
            Made for indie builders · Indonesia{" "}
            <span style={{ color: "var(--color-lime)" }}>✦</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
