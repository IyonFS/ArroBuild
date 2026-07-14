import Link from "next/link";

export function NodeMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <line x1="14" y1="6" x2="22" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" />
      <line x1="14" y1="6" x2="6" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" />
      <line x1="22" y1="20" x2="6" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" />
      <circle cx="14" cy="6" r="4" fill="#FFB020" />
      <circle cx="22" cy="20" r="3" fill="#38BDF8" />
      <circle cx="6" cy="20" r="2.5" fill="#9D4EDD" />
    </svg>
  );
}

interface ArroLogoProps {
  href?: string;
  size?: "sm" | "md";
  className?: string;
}

export default function ArroLogo({ href = "/", size = "md", className = "" }: ArroLogoProps) {
  const markSize = size === "sm" ? 24 : 28;
  const wordSize = size === "sm" ? 15 : 17;

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <NodeMark size={markSize} />
      <span
        className="font-unbounded font-extrabold tracking-tight"
        style={{ fontSize: wordSize, color: "var(--app-text-primary)" }}
      >
        ArroBuild
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-opacity hover:opacity-85">
        {inner}
      </Link>
    );
  }

  return inner;
}
