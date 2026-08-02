"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const LOG_ITEMS = [
  "scope creep — fitur nambah terus tanpa batas jelas",
  "nggak ada source of truth — sesi baru, jelasin ulang dari nol",
  "AI ganti gaya kode tiap sesi, nggak konsisten",
  "database & arsitektur nggak dipikir dari awal",
];

export default function ProblemSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

  return (
    <section
      ref={containerRef}
      style={{
        background: "var(--lp-bg-base)", // Using base background for stark minimalism
        padding: "160px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          opacity,
          y,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-unbounded)",
            fontWeight: 800,
            fontSize: "clamp(32px, 5vw, 64px)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--lp-text-primary)",
            margin: "0 0 64px",
            textAlign: "center",
          }}
        >
          Kamu udah kenal <br />
          <span style={{ color: "var(--lp-text-tertiary)" }}>pola ini.</span>
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            alignItems: "center",
          }}
        >
          {LOG_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "clamp(16px, 2vw, 24px)",
                fontWeight: 500,
                color: i === 0 ? "var(--lp-text-primary)" : "var(--lp-text-secondary)",
                textAlign: "center",
                letterSpacing: "-0.02em",
                textDecoration: i !== 0 ? "line-through" : "none",
                opacity: i === 0 ? 1 : 0.4,
              }}
            >
              {item}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "clamp(16px, 2vw, 20px)",
            fontWeight: 400,
            lineHeight: 1.6,
            color: "var(--lp-text-tertiary)",
            maxWidth: 600,
            margin: "80px auto 0",
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          Proyek jadi susah dikembangkan bahkan sebelum user pertama datang. Bukan karena kamu nggak bisa coding — karena nggak ada yang dibaca AI agent kamu selain memori jangka pendeknya sendiri.
        </motion.p>
      </motion.div>
    </section>
  );
}
