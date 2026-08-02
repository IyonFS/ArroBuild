"use client";

import { motion } from "framer-motion";
import { AnimatedNumberDisplay } from "@/components/ui/AnimatedCounter";

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
  hint?: string;
}

export default function StatCard({ label, value, accent, hint }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="dashboard-stat-card group relative overflow-hidden rounded-2xl"
      style={{
        background: "var(--app-bg-elevated)",
        border: accent ? "1px solid rgba(255,176,32,0.3)" : "1px solid var(--app-border-default)",
        boxShadow: accent ? "0 4px 20px rgba(255,176,32,0.05)" : "0 4px 20px rgba(0,0,0,0.1)",
        padding: "24px",
      }}
    >
      {/* Subtle ambient mesh background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-40"
        style={{
          background: accent
            ? "radial-gradient(circle at top right, rgba(255,176,32,0.15), transparent 70%)"
            : "radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent 70%)",
        }}
      />
      
      {/* Top Border Glow on Hover */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: accent
            ? "linear-gradient(90deg, transparent, rgba(255,176,32,0.8), transparent)"
            : "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
      />

      <div className="relative z-10">
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: accent ? "var(--app-amber)" : "var(--app-text-tertiary)",
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
              lineHeight: 1.5,
            }}
          >
            {hint}
          </p>
        )}
      </div>
    </motion.div>
  );
}
