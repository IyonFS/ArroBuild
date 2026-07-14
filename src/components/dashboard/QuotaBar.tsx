"use client";

interface QuotaBarProps {
  label: string;
  used: number;
  limit: number;
  remaining?: number;
  warnAtFull?: boolean;
  hint?: string;
}

export default function QuotaBar({
  label,
  used,
  limit,
  remaining,
  warnAtFull = true,
  hint,
}: QuotaBarProps) {
  const safeLimit = Math.max(limit, 1);
  const percent = Math.min(100, (used / safeLimit) * 100);
  const isOver = used > limit;
  const sisa = Math.max(0, limit - used);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span style={{ color: "var(--app-text-secondary)" }}>{label}</span>
          {hint && (
            <p style={{ fontSize: 10, marginTop: 2, color: "var(--app-text-tertiary)" }}>
              {hint}
            </p>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ color: isOver ? "var(--color-error)" : "var(--app-text-primary)" }}>
            {used} / {limit}
          </span>
          <p style={{ fontSize: 10, marginTop: 2, color: "var(--app-text-tertiary)" }}>
            Sisa {remaining ?? sisa}
          </p>
        </div>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          overflow: "hidden",
          background: "var(--app-bg-hover)",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            transition: "width 0.7s ease-out",
            width: `${percent}%`,
            minWidth: used > 0 ? "6px" : "0",
            background:
              isOver || percent >= 100
                ? "var(--color-error)"
                : percent >= 80
                ? "var(--color-warning)"
                : "var(--app-amber)",
          }}
        />
      </div>
      {warnAtFull && (isOver || percent >= 100) && (
        <p
          style={{
            fontSize: 11,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            marginTop: 8,
            color: "var(--color-warning)",
          }}
        >
          Kuota habis — tunggu reset atau upgrade paket.
        </p>
      )}
    </div>
  );
}
