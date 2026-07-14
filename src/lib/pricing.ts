import {
  TIER,
  TIER_CONFIG,
  getTierConfig,
  pricingSlugFromTierId,
  type TierId,
} from "@/lib/config/tiers";

export type PricingTierId = "starter" | "pro" | "pro_max";

export interface PricingTier {
  id: PricingTierId;
  name: string;
  price: string;
  priceAmount: number;
  /** Harga referensi untuk tampilan dicoret di landing */
  compareAtPrice?: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

export const PAID_TIER_IDS: PricingTierId[] = ["starter", "pro", "pro_max"];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Base",
    price: "Rp 65K",
    priceAmount: TIER_CONFIG[TIER.STARTER].priceIdr,
    period: "/bulan",
    description: "3 dokumen inti — PRD, Architecture, Plan/Task untuk mulai bangun dengan AI.",
    features: [
      "3 dokumen inti/proyek",
      "Model AI kelas Hemat",
      "Hingga 10 proyek/bulan",
      "3.000 kredit/bulan",
      "Download Markdown",
    ],
    cta: "Mulai Base",
    ctaHref: "/signup?plan=starter",
  },
  {
    id: "pro",
    name: "Core",
    price: "Rp 145K",
    priceAmount: TIER_CONFIG[TIER.PRO].priceIdr,
    period: "/bulan",
    description: "Bundle fondasi lengkap + Design System & Agent Rules.",
    features: [
      "5 dokumen inti/proyek",
      "Model Hemat s/d Flagship",
      "Hingga 30 proyek/bulan",
      "7.000 kredit/bulan",
      "Chat WA founder 2x/bulan",
    ],
    cta: "Upgrade ke Core",
    ctaHref: "/signup?plan=pro",
    highlighted: true,
    badge: "Paling Direkomendasikan",
    compareAtPrice: "Rp 175K",
  },
  {
    id: "pro_max",
    name: "Prime",
    price: "Rp 199K",
    priceAmount: TIER_CONFIG[TIER.PRO_MAX].priceIdr,
    period: "/bulan",
    description: "Production-ready — 6 dokumen inti + modul opsional.",
    features: [
      "6 dokumen inti + modul opsional",
      "Semua kelas model termasuk Ultra",
      "Hingga 60 proyek/bulan",
      "14.000 kredit/bulan",
      "Revisi unlimited + semua mini tools",
    ],
    cta: "Upgrade ke Prime",
    ctaHref: "/signup?plan=pro_max",
    badge: "Terlengkap",
    compareAtPrice: "Rp 265K",
  },
];

export function getPaidTier(id: string) {
  return PRICING_TIERS.find((t) => t.id === id);
}

export function getTierConfigByPricingId(id: PricingTierId) {
  switch (id) {
    case "starter":
      return getTierConfig(TIER.STARTER);
    case "pro":
      return getTierConfig(TIER.PRO);
    case "pro_max":
      return getTierConfig(TIER.PRO_MAX);
  }
}

export function pricingIdToTierId(id: PricingTierId): TierId {
  switch (id) {
    case "starter":
      return TIER.STARTER;
    case "pro":
      return TIER.PRO;
    case "pro_max":
      return TIER.PRO_MAX;
  }
}

export { pricingSlugFromTierId };
