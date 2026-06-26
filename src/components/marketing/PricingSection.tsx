"use client";

import { useRef, useState, useEffect } from "react";
import { PRICING_TIERS } from "@/lib/pricing";
import { CheckIcon } from "./icons";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function PricingSection() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="pricing"
      style={{ padding: "0 0 96px", scrollMarginTop: 80 }}
    >
      {/* Divider */}
      <div
        style={{
          height: "0.5px",
          background:
            "linear-gradient(90deg, transparent, var(--color-border-default), transparent)",
          width: "60%",
          margin: "0 auto",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 0",
        }}
      >
        {/* Header */}
        <div ref={ref} style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-lime)",
              marginBottom: 14,
            }}
          >
            — Harga
          </p>
          <h2
            style={{
              fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif",
              fontSize: "clamp(1.5rem, 3vw, 1.75rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              marginBottom: 14,
              transition: "opacity 500ms ease, transform 500ms ease",
              transitionDelay: "100ms",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Mulai gratis.{" "}
            <span style={{ color: "var(--color-lime)" }}>
              Upgrade saat siap.
            </span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 14,
              fontWeight: 300,
              lineHeight: 1.75,
              color: "var(--color-text-secondary)",
              maxWidth: 480,
              margin: "0 auto",
              transition: "opacity 500ms ease, transform 500ms ease",
              transitionDelay: "180ms",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(12px)",
            }}
          >
            Free tier tanpa login. Bayar via Midtrans saat butuh bundle lengkap
            dan model AI premium.
          </p>
        </div>

        {/* Pricing grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {PRICING_TIERS.map((tier, i) => (
            <div
              key={tier.id}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                background: tier.highlighted
                  ? "var(--color-bg-elevated)"
                  : "var(--color-bg-surface)",
                border: tier.highlighted
                  ? "0.5px solid var(--color-lime)"
                  : "0.5px solid var(--color-border-default)",
                borderRadius: 14,
                padding: "24px 24px",
                transition: "opacity 500ms ease, transform 500ms ease",
                transitionDelay: `${i * 80}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {tier.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--color-lime)",
                    color: "#0A0A0A",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "3px 12px",
                    borderRadius: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tier.badge}
                </span>
              )}

              {/* Tier name + price */}
              <div style={{ marginBottom: 20, paddingTop: tier.badge ? 8 : 0 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: 8,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {tier.name}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                    flexWrap: "wrap",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif",
                      fontSize: 28,
                      fontWeight: 800,
                      color: tier.highlighted
                        ? "var(--color-lime)"
                        : "var(--color-text-primary)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {tier.price}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 11,
                      fontWeight: 400,
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {tier.period}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 12,
                    fontWeight: 300,
                    lineHeight: 1.65,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {tier.description}
                </p>
              </div>

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 24px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 12,
                      fontWeight: 400,
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-lime)",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <CheckIcon />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={tier.ctaHref}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  padding: "11px 20px",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "background 120ms ease, border-color 120ms ease",
                  ...(tier.highlighted
                    ? {
                        background: "var(--color-lime)",
                        color: "#0A0A0A",
                        border: "none",
                      }
                    : {
                        background: "transparent",
                        color: "var(--color-text-primary)",
                        border: "1.5px solid var(--color-border-strong)",
                      }),
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  if (tier.highlighted) {
                    el.style.background = "var(--color-lime-dim)";
                  } else {
                    el.style.borderColor = "var(--color-text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  if (tier.highlighted) {
                    el.style.background = "var(--color-lime)";
                  } else {
                    el.style.borderColor = "var(--color-border-strong)";
                  }
                }}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            fontWeight: 400,
            color: "var(--color-text-tertiary)",
            marginTop: 24,
            maxWidth: 560,
            margin: "24px auto 0",
          }}
        >
          * Paket Unlimited: akses fitur selama langganan aktif. Pembayaran
          Midtrans segera hadir — login untuk daftar early access.
        </p>
      </div>
    </section>
  );
}
