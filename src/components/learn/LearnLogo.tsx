import Link from "next/link";
import { NodeMark } from "@/components/ui/ArroLogo";

interface LearnLogoProps {
  href?: string;
  showBadge?: boolean;
  size?: "sm" | "md";
}

export default function LearnLogo({
  href = "/learn",
  showBadge = true,
  size = "md",
}: LearnLogoProps) {
  const markSize = size === "sm" ? 24 : 28;
  const wordSize = size === "sm" ? 15 : 17;

  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <NodeMark size={markSize} />
      <span
        style={{
          fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontSize: wordSize,
          color: "var(--app-text-primary)",
        }}
      >
        Arro<span style={{ color: "var(--app-amber)" }}>Build</span>
      </span>
      {showBadge && (
        <span className="learn-brand-badge px-2 py-0.5 rounded">Learn</span>
      )}
    </span>
  );

  return (
    <Link href={href} className="learn-logo-link inline-flex shrink-0">
      {inner}
    </Link>
  );
}
