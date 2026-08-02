"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const FILES = [
  { name: "prd.md", desc: "Product requirements & scope", tier: "Base" },
  { name: "architecture.md", desc: "System design & stack", tier: "Base" },
  { name: "plan-task.md", desc: "Implementation checklist", tier: "Base" },
  { name: "design-system.md", desc: "Tokens & components", tier: "Core" },
  { name: "agent-rules.md", desc: "AI behavioral guidelines", tier: "Core" },
  { name: "adaptive-document.md", desc: "Self-updating context", tier: "Prime" },
  { name: "api-contract.md", desc: "Endpoint definitions", tier: "Prime" },
  { name: "database-schema.md", desc: "Tables & relations", tier: "Prime" },
  { name: "testing-plan.md", desc: "QA & coverage strategy", tier: "Prime" },
  { name: "deployment-guide.md", desc: "CI/CD & hosting", tier: "Prime" },
];

export default function FileListingSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      style={{
        background: "var(--lp-bg-base)",
        padding: "160px 24px",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{
            fontFamily: "var(--font-unbounded)",
            fontWeight: 800,
            fontSize: "clamp(24px, 4vw, 40px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--lp-text-primary)",
            margin: "0 0 64px",
          }}
        >
          Semua file yang bakal<br />
          <span style={{ color: "var(--lp-text-tertiary)" }}>muncul di proyek kamu.</span>
        </motion.h2>

        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {FILES.map((file, i) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                padding: "20px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                color: hoveredIndex === null || hoveredIndex === i ? "var(--lp-text-primary)" : "var(--lp-text-tertiary)",
                transition: "color 0.2s, padding-left 0.2s",
                paddingLeft: hoveredIndex === i ? 16 : 0,
                cursor: "default",
              }}
            >
              <div>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
                  {file.name}
                </span>
                <span style={{ 
                  fontSize: 14, 
                  color: "var(--lp-text-tertiary)", 
                  marginLeft: 16,
                  display: "inline-block" 
                }}>
                  // {file.desc}
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--lp-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {file.tier}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
