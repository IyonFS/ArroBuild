"use client";

import { motion } from "framer-motion";

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

  const barColor = isOver || percent >= 100
    ? "var(--color-error)"
    : percent >= 80
    ? "var(--color-warning)"
    : "var(--app-amber)";

  return (
    <div className="group">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 12,
          marginBottom: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span className="font-bold tracking-wide" style={{ color: "var(--app-text-primary)" }}>{label}</span>
          {hint && (
            <p style={{ fontSize: 11, marginTop: 4, color: "var(--app-text-tertiary)", lineHeight: 1.5 }}>
              {hint}
            </p>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span className="font-bold text-[14px]" style={{ color: isOver ? "var(--color-error)" : "var(--app-text-primary)" }}>
            {used} <span style={{ color: "var(--app-text-tertiary)", fontWeight: "normal", fontSize: 12 }}>/ {limit}</span>
          </span>
          <p style={{ fontSize: 11, marginTop: 4, color: "var(--app-text-secondary)" }}>
            Sisa <span style={{ fontWeight: "bold" }}>{remaining ?? sisa}</span>
          </p>
        </div>
      </div>
      
      <div
        className="relative"
        style={{
          height: 8,
          borderRadius: 999,
          background: "var(--app-bg-hover)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
          overflow: "hidden"
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 999,
            minWidth: used > 0 ? "8px" : "0",
            background: barColor,
            position: "relative"
          }}
        >
          {/* Glowing tip */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-4 rounded-full blur-[2px]"
            style={{
              background: "rgba(255,255,255,0.6)",
              boxShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}`
            }}
          />
        </motion.div>
      </div>
      
      {warnAtFull && (isOver || percent >= 100) && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 11,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            marginTop: 10,
            color: "var(--color-warning)",
            fontWeight: "bold"
          }}
        >
          ⚠ Kuota habis — tunggu reset atau upgrade paket.
        </motion.p>
      )}
    </div>
  );
}
