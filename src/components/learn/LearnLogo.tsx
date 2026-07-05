import Link from "next/link";

interface LearnLogoProps {
  showBadge?: boolean;
}

export default function LearnLogo({ showBadge = true }: LearnLogoProps) {
  return (
    <Link
      href="/learn"
      className="learn-logo-link inline-flex items-center gap-2 shrink-0"
      style={{ textDecoration: "none" }}
    >
      <span className="inline-flex items-center gap-0">
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
            color: "var(--color-orange)",
            lineHeight: 1,
          }}
        >
          Build
        </span>
      </span>
      {showBadge && (
        <span className="learn-brand-badge px-2.5 py-1 rounded">Learn</span>
      )}
    </Link>
  );
}
