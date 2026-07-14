"use client";

import { motion } from "framer-motion";

const LOG_ITEMS = [
  { icon: "⚠", color: "#FFB020", text: "scope creep — fitur nambah terus tanpa batas jelas" },
  { icon: "✗", color: "#EF4444", text: "nggak ada source of truth — sesi baru, jelasin ulang dari nol" },
  { icon: "⚠", color: "#FFB020", text: "AI ganti gaya kode tiap sesi, nggak konsisten" },
  { icon: "✗", color: "#EF4444", text: "database & arsitektur nggak dipikir dari awal" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function ProblemSection() {
  return (
    <section
      style={{
        background: "var(--lp-bg-surface)",
        padding: "96px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        {/* H2 */}
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeVariants}
          style={{
            fontFamily: "var(--font-unbounded)",
            fontWeight: 800,
            fontSize: "clamp(26px, 3.5vw, 36px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--lp-text-primary)",
            margin: "0 0 48px",
          }}
        >
          Kamu udah kenal pola ini.
        </motion.h2>

        {/* Two-column asymmetric layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 48,
            alignItems: "start",
          }}
          className="problem-grid"
        >
          {/* Left — Error log */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={containerVariants}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {LOG_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "16px 0",
                  borderBottom: i < LOG_ITEMS.length - 1
                    ? "0.5px solid var(--lp-border-default)"
                    : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 14,
                    fontWeight: 700,
                    color: item.color,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "var(--lp-text-secondary)",
                    lineHeight: 1.6,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {item.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Right — Statement */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeVariants}
          >
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.85,
                color: "var(--lp-text-secondary)",
                maxWidth: 400,
                letterSpacing: "-0.005em",
                margin: 0,
              }}
            >
              Proyek jadi susah dikembangkan bahkan sebelum user pertama datang. Bukan karena kamu nggak bisa coding — karena nggak ada yang dibaca AI agent kamu selain memori jangka pendeknya sendiri.
            </p>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .problem-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
