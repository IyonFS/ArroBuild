import Link from "next/link";

export function NodeMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
      <line x1="14" y1="6" x2="22" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" className="transition-all duration-300 group-hover:stroke-[rgba(240,243,250,0.6)]" />
      <line x1="14" y1="6" x2="6" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" className="transition-all duration-300 group-hover:stroke-[rgba(240,243,250,0.6)]" />
      <line x1="22" y1="20" x2="6" y2="20" stroke="rgba(240,243,250,0.3)" strokeWidth="1.5" className="transition-all duration-300 group-hover:stroke-[rgba(240,243,250,0.6)]" />
      <circle cx="14" cy="6" r="4" fill="#FFB020" className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,176,32,0.8)]" />
      <circle cx="22" cy="20" r="3" fill="#38BDF8" className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
      <circle cx="6" cy="20" r="2.5" fill="#9D4EDD" className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(157,78,221,0.8)]" />
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
  const wordSize = size === "sm" ? 15 : 18;

  const inner = (
    <span className={`group inline-flex items-center gap-3 ${className}`}>
      <NodeMark size={markSize} />
      <span
        className="font-bold tracking-normal transition-colors duration-300 group-hover:text-white"
        style={{ fontSize: wordSize, color: "var(--app-text-primary)", letterSpacing: "0.01em", fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif" }}
      >
        Arro<span className="transition-colors duration-300 group-hover:drop-shadow-[0_0_6px_rgba(255,176,32,0.6)]" style={{ color: "var(--app-amber)" }}>Build</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {inner}
      </Link>
    );
  }

  return inner;
}
