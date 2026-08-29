import {
  TIER,
  TIER_CONFIG,
  getTierConfig,
  pricingSlugFromTierId,
  type ModelClassId,
  type TierId,
} from "@/lib/config/tiers";

export type PricingTierId = "base" | "core" | "prime";

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

export const PAID_TIER_IDS: PricingTierId[] = ["base", "core", "prime"];

const MODEL_CLASS_LABEL: Record<ModelClassId, string> = {
  HEMAT: "Hemat",
  MENENGAH: "Menengah",
  FLAGSHIP: "Flagship",
  ULTRA: "Ultra",
};

const PRICING_TIER_ID: Record<PricingTierId, TierId> = {
  base: TIER.BASE,
  core: TIER.CORE,
  prime: TIER.PRIME,
};

function formatCompactIdr(amount: number): string {
  return `Rp ${Math.round(amount / 1_000)}K`;
}

function formatCount(value: number): string {
  return value.toLocaleString("id-ID");
}

function formatModelClasses(classes: readonly ModelClassId[]): string {
  return classes.map((modelClass) => MODEL_CLASS_LABEL[modelClass]).join(", ");
}

const baseConfig = TIER_CONFIG[TIER.BASE];
const coreConfig = TIER_CONFIG[TIER.CORE];
const primeConfig = TIER_CONFIG[TIER.PRIME];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "base",
    name: "Base",
    price: formatCompactIdr(baseConfig.priceIdr),
    priceAmount: baseConfig.priceIdr,
    period: "/bulan",
    description: "3 dokumen inti — PRD, Architecture, Plan/Task untuk mulai bangun dengan AI.",
    features: [
      `${baseConfig.coreDocuments.length} dokumen inti/proyek`,
      `Model AI kelas ${formatModelClasses(baseConfig.allowedModelClasses)}`,
      `Hingga ${baseConfig.maxProjectsPerMonth} proyek/bulan`,
      `${formatCount(baseConfig.creditsPerMonth)} kredit/bulan`,
      "Download Markdown",
    ],
    cta: "Mulai Base",
    ctaHref: "/signup?plan=base",
  },
  {
    id: "core",
    name: "Core",
    price: formatCompactIdr(coreConfig.priceIdr),
    priceAmount: coreConfig.priceIdr,
    period: "/bulan",
    description: "Bundle fondasi lengkap + Design System & Agent Rules.",
    features: [
      `${coreConfig.coreDocuments.length} dokumen inti/proyek`,
      `Model AI: ${formatModelClasses(coreConfig.allowedModelClasses)}`,
      `Hingga ${coreConfig.maxProjectsPerMonth} proyek/bulan`,
      `${formatCount(coreConfig.creditsPerMonth)} kredit/bulan`,
      `Chat WA founder ${coreConfig.whatsappChatPerMonth}x/bulan`,
    ],
    cta: "Upgrade ke Core",
    ctaHref: "/signup?plan=core",
    highlighted: true,
    badge: "Paling Direkomendasikan",
    compareAtPrice: "Rp 175K",
  },
  {
    id: "prime",
    name: "Prime",
    price: formatCompactIdr(primeConfig.priceIdr),
    priceAmount: primeConfig.priceIdr,
    period: "/bulan",
    description: "Production-ready — 6 dokumen inti + modul opsional.",
    features: [
      `${primeConfig.coreDocuments.length} dokumen inti${primeConfig.canAccessOptionalModules ? " + modul opsional" : ""}`,
      `Model AI: ${formatModelClasses(primeConfig.allowedModelClasses)}`,
      `Hingga ${primeConfig.maxProjectsPerMonth} proyek/bulan`,
      `${formatCount(primeConfig.creditsPerMonth)} kredit/bulan`,
      `${primeConfig.canReviseUnlimited ? "Revisi unlimited" : "Revisi terbatas"} + semua mini tools`,
    ],
    cta: "Upgrade ke Prime",
    ctaHref: "/signup?plan=prime",
    badge: "Terlengkap",
    compareAtPrice: "Rp 265K",
  },
];

export function getPaidTier(id: string) {
  return PRICING_TIERS.find((t) => t.id === id);
}

export function getTierConfigByPricingId(id: PricingTierId) {
  return getTierConfig(PRICING_TIER_ID[id]);
}

export function pricingIdToTierId(id: PricingTierId): TierId {
  return PRICING_TIER_ID[id];
}

export { pricingSlugFromTierId };
