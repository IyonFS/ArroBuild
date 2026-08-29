"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const TIERS = [
  {
    id: "base",
    name: "Base",
    price: "65.000",
    tagline: "Cocok untuk mulai eksplorasi.",
    features: [
      "3.000 kredit / bulan",
      "3 dokumen core",
      "AI model: Hemat",
      "10 proyek per bulan",
    ],
    ctaLabel: "Mulai Base",
    ctaHref: "/signup?plan=base",
    theme: "base",
  },
  {
    id: "core",
    name: "Core",
    price: "145.000",
    tagline: "Untuk yang serius build.",
    features: [
      "7.000 kredit / bulan",
      "5 dokumen core (+Design System, +Agent Rules)",
      "AI model: Hemat, Menengah, Flagship",
      "30 proyek per bulan",
    ],
    ctaLabel: "Mulai Core",
    ctaHref: "/signup?plan=core",
    theme: "core",
    popular: true,
  },
  {
    id: "prime",
    name: "Prime",
    price: "199.000",
    tagline: "Foundation engineering grade — siap production.",
    features: [
      "14.000 kredit / bulan",
      "6 dokumen core + 8 dokumen opsional",
      "Semua AI model (termasuk Ultra)",
      "60 proyek per bulan + Revisi unlimited",
    ],
    ctaLabel: "Mulai Prime",
    ctaHref: "/signup?plan=prime",
    theme: "prime",
  },
];

export default function PricingSectionV3() {
  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case "base":
        return {
          wrapperBg: "var(--lp-bg-surface)",
          border: "1px solid var(--lp-border-default)",
          shadow: "none",
          glow: "none",
          btnBg: "transparent",
          btnText: "var(--lp-text-primary)",
          btnBorder: "1px solid var(--lp-border-strong)",
          btnHoverBg: "var(--lp-border-default)",
          iconColor: "var(--lp-text-tertiary)",
        };
      case "core":
        return {
          wrapperBg: "var(--lp-bg-elevated)",
          border: "1px solid var(--lp-amber)",
          shadow: "0 20px 40px -12px rgba(255, 176, 32, 0.15)",
          glow: "inset 0 0 0 1px rgba(255, 176, 32, 0.2)",
          btnBg: "var(--lp-amber)",
          btnText: "#0D1321",
          btnBorder: "1px solid var(--lp-amber)",
          btnHoverBg: "var(--lp-amber-dim)",
          iconColor: "var(--lp-amber)",
        };
      case "prime":
        return {
          wrapperBg: "linear-gradient(180deg, var(--lp-bg-surface) 0%, var(--lp-bg-base) 100%)",
          border: "1px solid var(--lp-border-strong)",
          shadow: "0 20px 40px -12px rgba(240, 243, 250, 0.05)",
          glow: "none",
          btnBg: "var(--lp-text-primary)",
          btnText: "var(--lp-bg-base)",
          btnBorder: "1px solid var(--lp-text-primary)",
          btnHoverBg: "#D0D3DA", // slightly dimmer white
          iconColor: "var(--lp-text-primary)",
        };
      default:
        return {
          wrapperBg: "var(--lp-bg-surface)",
          border: "1px solid var(--lp-border-default)",
          shadow: "none",
          glow: "none",
          btnBg: "transparent",
          btnText: "var(--lp-text-primary)",
          btnBorder: "1px solid var(--lp-border-strong)",
          btnHoverBg: "var(--lp-border-default)",
          iconColor: "var(--lp-text-tertiary)",
        };
    }
  };

  return (
    <section
      id="pricing"
      style={{
        background: "var(--lp-bg-base)",
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient light */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse at top, rgba(255,176,32,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <h2
            style={{
              fontFamily: "var(--font-unbounded)",
              fontWeight: 800,
              fontSize: "clamp(36px, 5vw, 64px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--lp-text-primary)",
              margin: "0 0 16px",
            }}
          >
            Harga.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "clamp(14px, 2vw, 16px)",
              color: "var(--lp-text-secondary)",
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            Pilih paket yang sesuai dengan kebutuhan pengembangan AI Anda. Mulai dari eksperimen hingga siap production.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            alignItems: "stretch",
          }}
          className="pricing-grid-premium"
        >
          {TIERS.map((tier, i) => {
            const styles = getThemeStyles(tier.theme);
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: styles.wrapperBg,
                  border: styles.border,
                  boxShadow: styles.shadow,
                  position: "relative",
                  borderRadius: 24,
                  padding: "48px 32px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                className="pricing-card"
              >
                {/* Inner Glow for Core */}
                {styles.glow !== "none" && (
                  <div style={{ position: "absolute", inset: 0, boxShadow: styles.glow, borderRadius: 24, pointerEvents: "none" }} />
                )}

                {/* Popular Badge */}
                {tier.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--lp-amber)",
                      color: "#0D1321",
                      padding: "4px 16px",
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: 32 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-unbounded)",
                      fontWeight: 800,
                      fontSize: 28,
                      margin: "0 0 12px",
                      letterSpacing: "-0.02em",
                      color: "var(--lp-text-primary)",
                    }}
                  >
                    {tier.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 14,
                      color: "var(--lp-text-secondary)",
                      margin: 0,
                      lineHeight: 1.6,
                      minHeight: 44, // Align heights across cards
                    }}
                  >
                    {tier.tagline}
                  </p>
                </div>
                
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 40 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 18, fontWeight: 700, color: "var(--lp-text-secondary)", marginTop: 6 }}>
                    Rp
                  </span>
                  <span style={{ fontFamily: "var(--font-unbounded)", fontWeight: 900, fontSize: "clamp(36px, 3.5vw, 48px)", letterSpacing: "-0.03em", color: "var(--lp-text-primary)", lineHeight: 1 }}>
                    {tier.price}
                  </span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 14, color: "var(--lp-text-tertiary)", alignSelf: "flex-end", marginBottom: 4 }}>
                    /bln
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48, flexGrow: 1 }}>
                  {tier.features.map((feat) => (
                    <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ marginTop: 2, color: styles.iconColor }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 14, color: "var(--lp-text-primary)", lineHeight: 1.5, opacity: 0.85 }}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={tier.ctaHref}
                  style={{
                    display: "block",
                    textAlign: "center",
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 15,
                    fontWeight: 700,
                    background: styles.btnBg,
                    color: styles.btnText,
                    border: styles.btnBorder,
                    padding: "16px 24px",
                    borderRadius: 12,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  className="pricing-btn"
                  onMouseEnter={(e) => { 
                    (e.currentTarget as HTMLAnchorElement).style.background = styles.btnHoverBg;
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => { 
                    (e.currentTarget as HTMLAnchorElement).style.background = styles.btnBg;
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  }}
                >
                  {tier.ctaLabel}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        .pricing-card:hover {
          transform: translateY(-4px) !important;
        }
        @media (max-width: 1024px) {
          .pricing-grid-premium {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .pricing-grid-premium {
            grid-template-columns: 1fr !important;
          }
          .pricing-card {
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
