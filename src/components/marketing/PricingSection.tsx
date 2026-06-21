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
    <section id="pricing" className="py-20 md:py-24 relative scroll-mt-24">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--bg-border), transparent)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
        <div ref={ref} className="text-center mb-12 md:mb-16">
          <span
            className={`text-label block mb-3 transition-all duration-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            HARGA
          </span>
          <h2
            className={`text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.5px] mb-4 transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: "#ffffff" }}
          >
            Mulai gratis.{" "}
            <span className="gradient-text">Upgrade saat siap.</span>
          </h2>
          <p
            className={`text-body-lg max-w-lg mx-auto transition-all duration-500 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Free tier tanpa login. Bayar via Midtrans saat butuh bundle lengkap
            dan model AI premium.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {PRICING_TIERS.map((tier, i) => (
            <div
              key={tier.id}
              className={`card relative flex flex-col transition-all duration-500 ${
                tier.highlighted ? "card-featured glow-green" : ""
              } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {tier.badge && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-success whitespace-nowrap"
                >
                  {tier.badge}
                </span>
              )}

              <div className="mb-5 pt-1">
                <h3 className="text-h3 mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span
                    className="text-[1.75rem] font-medium tracking-[-0.5px]"
                    style={{ color: "#ffffff" }}
                  >
                    {tier.price}
                  </span>
                  <span className="text-caption">{tier.period}</span>
                </div>
                <p className="text-body text-[13px] mt-2">{tier.description}</p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <CheckIcon className="shrink-0 mt-0.5 text-[var(--green-text)]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.ctaHref}
                className={`btn w-full ${
                  tier.highlighted ? "btn-primary" : "btn-secondary"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <p
          className="text-center text-caption mt-8 max-w-xl mx-auto"
          style={{ color: "var(--text-tertiary)" }}
        >
          * Paket Unlimited: akses fitur selama langganan aktif. Pembayaran
          Midtrans segera hadir — login untuk daftar early access.
        </p>
      </div>
    </section>
  );
}
