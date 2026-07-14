import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Sparkles,
  Scissors,
  Palette,
  FileCode2,
  PenLine,
  Database,
} from "lucide-react";
import type { MiniToolId } from "@/lib/config/mini-tools";
import { TIER, type TierId } from "@/lib/config/tiers";

export type ShowcaseFilter = "all" | "free" | "base" | "core" | "prime";

export type ShowcaseAccent = "amber" | "sky" | "violet";

export interface ShowcaseToolMeta {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: ShowcaseAccent;
  credits: number | "free";
  minTier: TierId | null;
  featured?: boolean;
  filterKeys: ShowcaseFilter[];
}

const ACCENT: Record<ShowcaseAccent, { color: string; glow: string; soft: string }> = {
  amber: {
    color: "#FFB020",
    glow: "rgba(255,176,32,0.25)",
    soft: "rgba(255,176,32,0.1)",
  },
  sky: {
    color: "#38BDF8",
    glow: "rgba(56,189,248,0.22)",
    soft: "rgba(56,189,248,0.1)",
  },
  violet: {
    color: "#9D4EDD",
    glow: "rgba(157,78,221,0.22)",
    soft: "rgba(157,78,221,0.1)",
  },
};

export function getAccent(a: ShowcaseAccent) {
  return ACCENT[a];
}

export function tierLabel(tier: TierId | null): string {
  if (!tier) return "Gratis";
  if (tier === TIER.STARTER) return "Base";
  if (tier === TIER.PRO) return "Core";
  return "Prime";
}

export function filterFromTier(tier: TierId | null): ShowcaseFilter {
  if (!tier) return "free";
  if (tier === TIER.STARTER) return "base";
  if (tier === TIER.PRO) return "core";
  return "prime";
}

export const PORTFOLIO_SHOWCASE: ShowcaseToolMeta = {
  id: "portfolio",
  name: "Portfolio Generator",
  tagline: "Prompt website portfolio siap vibe-coding",
  description:
    "Isi identitas, konten, dan desain — dapatkan prompt super lengkap untuk AI favoritmu. Gratis.",
  href: "/tools/portfolio",
  icon: Briefcase,
  accent: "amber",
  credits: "free",
  minTier: null,
  featured: true,
  filterKeys: ["all", "free"],
};

export const TOOL_SHOWCASE_META: Record<MiniToolId, Omit<ShowcaseToolMeta, "name" | "description" | "credits" | "minTier">> = {
  "prompt-doctor": {
    id: "prompt-doctor",
    tagline: "Rapikan prompt kasar jadi terstruktur",
    href: "/tools/prompt-doctor",
    icon: Sparkles,
    accent: "sky",
    filterKeys: ["all", "base", "core", "prime"],
  },
  "mvp-scope-cutter": {
    id: "mvp-scope-cutter",
    tagline: "Potong fitur jadi MVP realistis",
    href: "/tools/mvp-scope-cutter",
    icon: Scissors,
    accent: "amber",
    filterKeys: ["all", "core", "prime"],
  },
  "stitch-composer": {
    id: "stitch-composer",
    tagline: "Susun prompt Google Stitch",
    href: "/tools/stitch-composer",
    icon: Palette,
    accent: "violet",
    filterKeys: ["all", "core", "prime"],
  },
  "readme-generator": {
    id: "readme-generator",
    tagline: "README + script setup siap pakai",
    href: "/tools/readme-generator",
    icon: FileCode2,
    accent: "sky",
    filterKeys: ["all", "prime"],
  },
  "landing-copy": {
    id: "landing-copy",
    tagline: "Hero, value props, FAQ dari PRD",
    href: "/tools/landing-copy",
    icon: PenLine,
    accent: "amber",
    filterKeys: ["all", "prime"],
  },
  "schema-visualizer": {
    id: "schema-visualizer",
    tagline: "Diagram ER Mermaid dari skema",
    href: "/tools/schema-visualizer",
    icon: Database,
    accent: "violet",
    filterKeys: ["all", "prime"],
  },
};
