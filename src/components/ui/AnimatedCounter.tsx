"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  className,
  style,
  duration = 1.2,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}

interface AnimatedNumberDisplayProps {
  value: string | number;
  accent?: boolean;
  className?: string;
}

export function AnimatedNumberDisplay({ value, accent, className }: AnimatedNumberDisplayProps) {
  const numeric =
    typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, ""), 10);
  const isNumeric = typeof value === "number" || /^\d[\d.,]*$/.test(String(value).trim());

  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-unbounded), sans-serif",
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: accent ? "var(--app-amber)" : "var(--app-text-primary)",
    lineHeight: 1,
    display: "block",
  };

  if (!isNumeric || Number.isNaN(numeric)) {
    return (
      <p className={className} style={baseStyle}>
        {value}
      </p>
    );
  }

  return <AnimatedCounter value={numeric} className={className} style={baseStyle} />;
}
