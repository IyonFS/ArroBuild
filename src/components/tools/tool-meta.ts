import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Sparkles,
  Scissors,
  Palette,
  FileCode2,
  PenLine,
  Database,
  Layers,
  AlertTriangle,
  Tag,
  KeyRound,
  ScrollText,
  Calculator,
  Braces,
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

export interface ComingSoonToolMeta {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  accent: ShowcaseAccent;
  credits: number | string;
  tierLabel: string;
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
  "arrodesign": {
    id: "arrodesign",
    tagline: "Screenshot/URL → design.md + prompt Stitch",
    href: "/tools/arrodesign",
    icon: Palette,
    accent: "violet",
    filterKeys: ["all", "core", "prime"],
  },
  "readme-generator": {
    id: "readme-generator",
    tagline: "README profesional dengan gaya pilihanmu",
    href: "/tools/readme-generator",
    icon: FileCode2,
    accent: "sky",
    filterKeys: ["all", "core", "prime"],
  },
  "copy-studio": {
    id: "copy-studio",
    tagline: "Script copy landing page per section",
    href: "/tools/copy-studio",
    icon: PenLine,
    accent: "amber",
    filterKeys: ["all", "core", "prime"],
  },
  "stack-advisor": {
    id: "stack-advisor",
    tagline: "Rekomendasi stack curated + estimasi biaya",
    href: "/tools/stack-advisor",
    icon: Layers,
    accent: "sky",
    filterKeys: ["all", "core", "prime"],
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

/** Coming Soon tools — tampil di UI dengan badge "Segera", belum punya route */
export const COMING_SOON_TOOLS: ComingSoonToolMeta[] = [
  {
    id: "error-whisperer",
    name: "Error Whisperer",
    tagline: "Jelaskan error + generate prompt fix untuk AI agent",
    icon: AlertTriangle,
    accent: "amber",
    credits: "~6",
    tierLabel: "Base",
    filterKeys: ["all", "base", "core", "prime"],
  },
  {
    id: "konsultan-penamaan",
    name: "Konsultan Penamaan",
    tagline: "Saran nama variabel/fungsi/file sesuai konvensi Agent Rules",
    icon: Tag,
    accent: "sky",
    credits: 1,
    tierLabel: "Base",
    filterKeys: ["all", "base", "core", "prime"],
  },
  {
    id: "env-var-doctor",
    name: "Env Var Doctor",
    tagline: "Cross-check .env.example ke Architecture.md — tandai yang hilang",
    icon: KeyRound,
    accent: "violet",
    credits: 2,
    tierLabel: "Base",
    filterKeys: ["all", "base", "core", "prime"],
  },
  {
    id: "devlog-composer",
    name: "Devlog Composer",
    tagline: "Rapikan catatan kerja berantakan jadi devlog, otomatis tag FEAT-ID",
    icon: ScrollText,
    accent: "sky",
    credits: 2,
    tierLabel: "Base",
    filterKeys: ["all", "base", "core", "prime"],
  },
  {
    id: "cost-reality-check",
    name: "Cost Reality Check",
    tagline: "Proyeksi biaya interaktif — slider traffic, lihat angka real",
    icon: Calculator,
    accent: "amber",
    credits: "minimal",
    tierLabel: "Core",
    filterKeys: ["all", "core", "prime"],
  },
  {
    id: "mock-api-generator",
    name: "Mock API Generator",
    tagline: "Dari Architecture.md → koleksi mock API siap import Postman/Insomnia",
    icon: Braces,
    accent: "violet",
    credits: "~3",
    tierLabel: "Core",
    filterKeys: ["all", "core", "prime"],
  },
];

