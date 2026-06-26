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
      "5 project / bulan",
      "3 file (Context, PRD, Plan)",
      "Model: Gemini Flash & DeepSeek",
      "2000 token / file",
      "Download .zip",
    ],
    cta: "Mulai gratis",
    ctaHref: "/generate",
  },
  {
    id: "pro",
    name: "Pro",
    price: "Rp 99K",
    priceAmount: 99000,
    period: "/bulan",
    description: "Bundle fondasi lengkap untuk vibe coder yang serius.",
    features: [
      "30 project / bulan",
      "5 file (termasuk Design & Agents)",
      "Model: Gemini Pro & GPT-4o",
      "4000 token / file",
      "Custom presets",
    ],
    cta: "Upgrade ke Pro",
    ctaHref: "/signup?plan=pro",
    highlighted: true,
    badge: "Paling populer",
  },
  {
    id: "unlimited",
    name: "Pro Max",
    price: "Rp 199K",
    priceAmount: 199000,
    period: "/bulan",
    description: "Production-ready dari hari pertama — 8 file lengkap.",
    features: [
      "Unlimited projects",
      "8 file lengkap (Production, Scale, Growth)",
      "Model: Claude Sonnet 4 & GPT-4o",
      "8000 token / file",
      "Context management pintar",
    ],
    cta: "Upgrade ke Pro Max",
    ctaHref: "/signup?plan=unlimited",
    badge: "Terlengkap",
  },
];

export function getPaidTier(id: string) {
  return PRICING_TIERS.find((t) => t.id === id && t.id !== "free");
}
