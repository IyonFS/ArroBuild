import { LogoIcon, GithubIcon, TwitterIcon } from "./icons";

const FOOTER_LINKS = {
  product: [
    { href: "/generate", label: "Generate" },
    { href: "/#pricing", label: "Harga" },
    { href: "/docs", label: "Panduan" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/signup", label: "Daftar" },
    { href: "/login", label: "Masuk" },
  ],
  resources: [
    { href: "/#how-it-works", label: "Cara kerja" },
    { href: "/#features", label: "Fitur" },
    { href: "/#faq", label: "FAQ" },
    { href: "/docs", label: "Vibe coding guide" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="border-t pt-14 pb-8"
      style={{ borderColor: "var(--bg-border)" }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--green-500)" }}
              >
                <LogoIcon size={16} />
              </div>
              <span
                className="text-[15px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                ArroBuild
              </span>
            </a>
            <p
              className="text-[13px] leading-relaxed max-w-xs mb-5"
              style={{ color: "var(--text-tertiary)" }}
            >
              Generate fondasi proyek lengkap sebelum baris kode pertama.
              Dibuat untuk vibe coders di Indonesia.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors hover:border-[var(--text-tertiary)]"
                style={{
                  borderColor: "var(--bg-border)",
                  color: "var(--text-tertiary)",
                }}
                aria-label="X (Twitter)"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors hover:border-[var(--text-tertiary)]"
                style={{
                  borderColor: "var(--bg-border)",
                  color: "var(--text-tertiary)",
                }}
                aria-label="GitHub"
              >
                <GithubIcon />
              </a>
            </div>
          </div>

          <div>
            <h3
              className="text-label mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Produk
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[13px] transition-colors hover:text-[var(--text-primary)]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-label mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Resources
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <a
                    href={link.href}
                    className="text-[13px] transition-colors hover:text-[var(--text-primary)]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-label mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Pembayaran
            </h3>
            <p
              className="text-[13px] leading-relaxed mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              QRIS, GoPay, OVO, Dana, dan transfer bank via Midtrans.
            </p>
            <div className="flex flex-wrap gap-2">
              {["QRIS", "GoPay", "Bank"].map((method) => (
                <span
                  key={method}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                  style={{
                    color: "var(--text-tertiary)",
                    borderColor: "var(--bg-border)",
                  }}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
          style={{ borderColor: "var(--bg-border)" }}
        >
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            © {new Date().getFullYear()} ArroBuild. All rights reserved.
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            Made with{" "}
            <span style={{ color: "var(--green-text)" }}>♥</span> for indie
            builders · Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
