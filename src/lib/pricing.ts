export type PricingTierId = "free" | "starter" | "pro" | "unlimited";

export interface PricingTier {
  id: PricingTierId;
  name: string;
  price: string;
  priceAmount: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

export const PAID_TIER_IDS: Exclude<PricingTierId, "free">[] = [
  "starter",
  "pro",
  "unlimited",
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "Rp 0",
    priceAmount: 0,
    period: "selamanya",
    description: "Coba ArroBuild tanpa login — cocok untuk eksplorasi pertama.",
    features: [
      "1 project",
      "1 file (PRD)",
      "2 model AI gratis",
      "Gemini Flash & DeepSeek V3",
      "Download .zip",
    ],
    cta: "Mulai gratis",
    ctaHref: "/generate",
  },
  {
    id: "starter",
    name: "Starter",
    price: "Rp 49K",
    priceAmount: 49000,
    period: "/bulan",
    description: "Bundle fondasi lengkap untuk vibe coder yang serius.",
    features: [
      "10 project / bulan",
      "5 file fondasi",
      "Semua 5 model AI",
      "GPT-4o & Claude Sonnet 4",
      "Preset framework & design",
    ],
    cta: "Upgrade ke Starter",
    ctaHref: "/signup?plan=starter",
    highlighted: true,
    badge: "Paling populer",
  },
  {
    id: "pro",
    name: "Pro",
    price: "Rp 99K",
    priceAmount: 99000,
    period: "/bulan",
    description: "Untuk builder yang generate project setiap minggu.",
    features: [
      "Unlimited projects",
      "5 file fondasi",
      "Semua 5 model AI",
      "Revisi via chat (segera)",
      "Custom presets",
    ],
    cta: "Upgrade ke Pro",
    ctaHref: "/signup?plan=pro",
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: "Rp 199K",
    priceAmount: 199000,
    period: "/bulan",
    description: "Production-ready dari hari pertama — 8 file lengkap.",
    features: [
      "Unlimited projects",
      "8 file (termasuk advanced)",
      "Production & scale guides",
      "Growth & quality playbook",
      "Akses selamanya*",
    ],
    cta: "Upgrade ke Unlimited",
    ctaHref: "/signup?plan=unlimited",
    badge: "Terlengkap",
  },
];

export function getPaidTier(id: string) {
  return PRICING_TIERS.find((t) => t.id === id && t.id !== "free");
}
