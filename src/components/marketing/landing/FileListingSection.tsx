"use client";

import { motion } from "framer-motion";

const FILES = [
  // Core files
  { icon: "📄", name: "prd.md", tier: "Base", tierColor: "rgba(240,243,250,0.4)" },
  { icon: "📄", name: "architecture.md", tier: "Base", tierColor: "rgba(240,243,250,0.4)" },
  { icon: "📄", name: "plan-task.md", tier: "Base", tierColor: "rgba(240,243,250,0.4)" },
  { icon: "📄", name: "design-system.md", tier: "Core", tierColor: "#38BDF8" },
  { icon: "📄", name: "agent-rules.md", tier: "Core", tierColor: "#38BDF8" },
  { icon: "📄", name: "adaptive-document.md", tier: "Prime", tierColor: "#FFB020" },
  // Optional modules (with gap)
  { icon: "📄", name: "api-contract.md", tier: "Prime", tierColor: "#FFB020", optional: true },
  { icon: "📄", name: "database-schema.md", tier: "Prime", tierColor: "#FFB020", optional: true },
  { icon: "📄", name: "testing-plan.md", tier: "Prime", tierColor: "#FFB020", optional: true },
  { icon: "📄", name: "deployment-guide.md", tier: "Prime", tierColor: "#FFB020", optional: true },
  { icon: "📄", name: "onboarding.md", tier: "Prime", tierColor: "#FFB020", optional: true },
  { icon: "📄", name: "changelog.md", tier: "Prime", tierColor: "#FFB020", optional: true },
  { icon: "📄", name: "security-notes.md", tier: "Prime", tierColor: "#FFB020", optional: true },
  { icon: "📄", name: "analytics-plan.md", tier: "Prime", tierColor: "#FFB020", optional: true },
];

const coreFiles = FILES.filter((f) => !f.optional);
const optionalFiles = FILES.filter((f) => f.optional);

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -4 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function FileRow({ file }: { file: (typeof FILES)[0] }) {
  return (
    <motion.div
      variants={rowVariants}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "0.5px solid var(--lp-border-default)",
        gap: 12,
      }}
      className="file-row"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>{file.icon}</span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 13,
            fontWeight: 400,
            color: "var(--lp-text-primary)",
            letterSpacing: "-0.005em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.name}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
        className="tier-badge"
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: file.tierColor,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: file.tierColor,
          }}
        >
          {file.tier}
        </span>
      </div>
    </motion.div>
  );
}

export default function FileListingSection() {
  return (
    <section
      style={{
        background: "var(--lp-bg-surface)",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-unbounded)",
            fontWeight: 800,
            fontSize: "clamp(22px, 3vw, 32px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--lp-text-primary)",
            margin: "0 0 40px",
          }}
        >
          Semua file yang bakal muncul di proyek kamu.
        </motion.h2>

        {/* Core files */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
        >
          {coreFiles.map((file) => (
            <FileRow key={file.name} file={file} />
          ))}
        </motion.div>

        {/* Optional modules — extra spacing separates them */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          style={{ marginTop: 32 }}
        >
          {optionalFiles.map((file) => (
            <FileRow key={file.name} file={file} />
          ))}
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 12,
            color: "var(--lp-text-tertiary)",
            marginTop: 24,
            lineHeight: 1.6,
          }}
        >
          Base dapat 3 file inti. Core dapat 5. Prime dapat semuanya, termasuk 8 modul opsional.
        </motion.p>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .file-row .tier-badge {
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
          }
        }
      `}</style>
    </section>
  );
}
