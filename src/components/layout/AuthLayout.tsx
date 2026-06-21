import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row lg:items-stretch max-w-5xl mx-auto px-4 sm:px-6 gap-10 lg:gap-16">
      <div className="hidden lg:flex flex-1 flex-col justify-center py-12 max-w-md">
        <Link href="/" className="text-[15px] font-medium text-white mb-10 inline-block">
          ArroBuild
        </Link>
        <h2 className="text-[1.75rem] font-medium text-white leading-snug tracking-[-0.02em] mb-4">
          Dokumentasi produk, siap sebelum kode pertama.
        </h2>
        <p className="text-[14px] leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
          PRD, context, plan, design system, dan agents — di-generate dari ide kamu
          dan langsung bisa dipakai di Cursor atau Claude Code.
        </p>
        <ul className="space-y-3">
          {[
            "Email + password atau Google",
            "1 file PRD gratis, tanpa login",
            "Pembayaran lokal via Midtrans",
          ].map((item) => (
            <li
              key={item}
              className="text-[13px] pl-4 relative before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-px before:bg-[var(--text-tertiary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center py-10 lg:py-12 lg:border-l lg:border-[var(--bg-border)] lg:pl-16">
        {children}
      </div>
    </div>
  );
}
