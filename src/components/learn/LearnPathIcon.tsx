import type { PathIconId } from "@/lib/learn-content";

interface Props {
  id: PathIconId;
  size?: number;
  color?: string;
  className?: string;
}

export default function LearnPathIcon({
  id,
  size = 20,
  color = "currentColor",
  className,
}: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (id) {
    case "foundation":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 19h16" />
          <path d="M6 17V9l6-4 6 4v8" />
          <path d="M9 17v-5h6v5" />
        </svg>
      );
    case "document":
      return (
        <svg {...common} aria-hidden>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M8 13h8M8 17h5" />
        </svg>
      );
    case "workflow":
      return (
        <svg {...common} aria-hidden>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <path d="M8.2 7.2 10 14M15.8 7.2 14 14M8.5 6h7" />
        </svg>
      );
    case "toolkit":
      return (
        <svg {...common} aria-hidden>
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 2.4-8.4z" />
          <path d="M15.5 5.5l3 3" />
        </svg>
      );
    default:
      return null;
  }
}
