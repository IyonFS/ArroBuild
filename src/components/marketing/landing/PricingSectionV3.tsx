"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// ── Tier Data ─────────────────────────────────────────────────

const TIERS = [
  {
    id: "starter",
    name: "Base",
    price: "Rp 65.000",
    priceSub: "/bulan",
    tagline: "Cukup untuk mulai, sempurna untuk coba.",
    border: "rgba(240,243,250,0.18)",
    accentColor: "rgba(240,243,250,0.5)",
    glowColor: null,
    badge: null,
    scale: 1,
    features: [
      "3.000 kredit / bulan",
      "3 dokumen core (PRD, Architecture, Plan/Task)",
      "AI model: Hemat saja",
      "10 proyek per bulan",
      "1 mini tools (trial 3×)",
    ],
    ctaLabel: "Mulai Base",
    ctaHref: "/signup?plan=starter",
    ctaBg: "rgba(240,243,250,0.08)",
    ctaColor: "var(--lp-text-primary)",
    ctaBorder: "0.5px solid var(--lp-border-strong)",
  },
  {
    id: "pro",
    name: "Core",
    price: "Rp 145.000",
    priceSub: "/bulan",
    tagline: "Untuk yang serius build.",
    border: "#38BDF8",
    accentColor: "#38BDF8",
    glowColor: "rgba(56,189,248,0.08)",
    badge: { text: "Paling direkomendasikan", bg: "var(--lp-amber)", color: "#0D1321" },
    scale: 1.03,
    features: [
      "7.000 kredit / bulan",
      "5 dokumen core (+Design System, +Agent Rules)",
      "AI model: Hemat, Menengah, Flagship",
      "30 proyek per bulan",
      "Fork project & Custom presets",
      "1x revisi gratis / bulan",
      "3 mini tools",
    ],
    ctaLabel: "Upgrade ke Core",
    ctaHref: "/signup?plan=pro",
    ctaBg: "#38BDF8",
    ctaColor: "#0D1321",
    ctaBorder: "none",
  },
  {
    id: "pro_max",
    name: "Prime",
    price: "Rp 199.000",
    priceSub: "/bulan",
    tagline: "Foundation engineering grade — siap production.",
    border: "#FFB020",
    accentColor: "#FFB020",
    glowColor: null,
    badge: { text: "Terlengkap", bg: "transparent", color: "#FFB020", borderColor: "rgba(255,176,32,0.5)" },
    scale: 1,
    features: [
      "14.000 kredit / bulan",
      "6 dokumen core + 8 dokumen opsional",
      "Semua AI model (termasuk Ultra)",
      "60 proyek per bulan",
      "Fork project & Custom presets",
      "Revisi unlimited",
      "Semua mini tools & Priority support",
    ],
    ctaLabel: "Upgrade ke Prime",
    ctaHref: "/signup?plan=pro_max",
    ctaBg: "var(--lp-amber)",
    ctaColor: "#0D1321",
    ctaBorder: "none",
  },
];

// ── Checkmark icon ────────────────────────────────────────────

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="7" cy="7" r="7" fill={color} fillOpacity="0.15" />
      <path d="M4 7.5L6 9.5L10 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Card ──────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.07 },
  }),
};

// ── Section ───────────────────────────────────────────────────

export default function PricingSectionV3() {
  return (
    <section
      id="pricing"
      style={{
        background: "var(--lp-bg-base)",
        padding: "96px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow behind Core */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative" }}>

        {/* Header */}
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
            margin: "0 0 12px",
          }}
        >
          Pilih paket yang sesuai kebutuhan kamu.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, delay: 0.05 }}
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 14,
            color: "var(--lp-text-secondary)",
            margin: "0 0 52px",
            lineHeight: 1.7,
            maxWidth: 480,
            letterSpacing: "-0.005em",
          }}
        >
          Pembayaran diproses via Midtrans. Dukung transfer bank, GoPay, OVO, Dana, dan kartu kredit.
        </motion.p>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            alignItems: "stretch",
          }}
          className="pricing-grid"
        >
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={cardVariants}
              whileHover={
                tier.id === "pro"
                  ? { y: -4, boxShadow: "0 0 40px rgba(56,189,248,0.12)" }
                  : { y: -3 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className={`pricing-card${tier.id === "pro" ? " pricing-card--featured" : ""}`}
              style={{
                background: "var(--lp-bg-elevated)",
                border: `1px solid ${tier.border}`,
                borderRadius: 14,
                padding: "28px 24px 24px",
                position: "relative",
                boxShadow: tier.glowColor ? `0 0 28px ${tier.glowColor}` : "none",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
                minWidth: 0,
              }}
              data-tier-order={tier.id}
            >
              {/* Accent line top */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 24,
                right: 24,
                height: 2,
                borderRadius: "0 0 2px 2px",
                background: tier.accentColor,
                opacity: 0.6,
              }} />

              {/* Badge */}
              {tier.badge && (
                <div style={{ marginBottom: 14 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase" as const,
                      color: tier.badge.color,
                      background: tier.badge.bg,
                      border: (tier.badge as { borderColor?: string }).borderColor
                        ? `1px solid ${(tier.badge as { borderColor?: string }).borderColor}`
                        : "none",
                      borderRadius: 999,
                      padding: "4px 12px",
                    }}
                  >
                    {tier.badge.text}
                  </span>
                </div>
              )}

              {/* Name */}
              <h3
                style={{
                  fontFamily: "var(--font-unbounded)",
                  fontWeight: 800,
                  fontSize: 20,
                  color: "var(--lp-text-primary)",
                  margin: tier.badge ? "0 0 4px" : "14px 0 4px",
                  letterSpacing: "-0.02em",
                }}
              >
                {tier.name}
              </h3>

              {/* Tagline */}
              <p style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 12,
                color: "var(--lp-text-tertiary)",
                margin: "0 0 20px",
                lineHeight: 1.5,
                letterSpacing: "-0.005em",
              }}>
                {tier.tagline}
              </p>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 24 }}>
                <span
                  style={{
                    fontFamily: "var(--font-unbounded)",
                    fontWeight: 900,
                    fontSize: 26,
                    color: tier.accentColor,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {tier.price}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 12,
                    color: "var(--lp-text-tertiary)",
                  }}
                >
                  {tier.priceSub}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: "0.5px", background: "var(--lp-border-default)", marginBottom: 20 }} />

              {/* Features — only what's included */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, flexGrow: 1 }}>
                {tier.features.map((feat) => (
                  <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckIcon color={tier.accentColor} />
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 12,
                        color: "var(--lp-text-secondary)",
                        lineHeight: 1.55,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={tier.ctaHref}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  background: tier.ctaBg,
                  color: tier.ctaColor,
                  border: tier.ctaBorder,
                  padding: "13px 20px",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "opacity 0.15s, transform 0.15s",
                  boxSizing: "border-box" as const,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                {tier.ctaLabel}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            marginTop: 32,
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 12,
            color: "var(--lp-text-tertiary)",
            textAlign: "center",
            letterSpacing: "0.02em",
          }}
        >
          Semua paket termasuk akses ke dashboard, riwayat proyek, dan update fitur baru.
        </motion.p>
      </div>

      <style>{`
        .pricing-card--featured {
          transform: scale(1.03);
          z-index: 1;
        }

        @media (max-width: 900px) {
          #pricing {
            padding: 72px 16px !important;
          }

          .pricing-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            width: 100%;
          }

          .pricing-card {
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }

          .pricing-card--featured {
            transform: none !important;
          }

          /* Mobile order: Core → Base → Prime */
          .pricing-card[data-tier-order="pro"] { order: 1; }
          .pricing-card[data-tier-order="starter"] { order: 2; }
          .pricing-card[data-tier-order="pro_max"] { order: 3; }
        }
      `}</style>
    </section>
  );
}
