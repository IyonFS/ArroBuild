"use client";

import { AnimatedNumberDisplay } from "@/components/ui/AnimatedCounter";

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
  hint?: string;
}

export default function StatCard({ label, value, accent, hint }: StatCardProps) {
  return (
    <div
      className="dashboard-stat-card"
      style={{
        background: "var(--app-bg-elevated)",
        border: "0.5px solid var(--app-border-default)",
        borderRadius: 12,
        padding: "20px 24px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 120ms ease, transform 120ms ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--app-border-strong)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--app-border-default)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--app-text-tertiary)",
          marginBottom: 12,
        }}
      >
        {label}
      </p>
      <AnimatedNumberDisplay value={value} accent={accent} />
      {hint && (
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            marginTop: 10,
            color: "var(--app-text-secondary)",
            opacity: 0.7,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
