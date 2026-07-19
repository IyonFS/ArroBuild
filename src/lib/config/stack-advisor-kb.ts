/**
 * Stack Advisor — curated knowledge base (manual MVP).
 * AI may ONLY recommend packages listed here — never invent stacks.
 *
 * Update cadence: every 2–4 weeks (costs, hosting tiers, provider defaults).
 * Last reviewed: 2026-07-17
 */

import type {
  Database,
  Deployment,
  Framework,
  ProgrammingLanguage,
  StackBundleId,
} from "@/lib/config/options";

export type StackPriority = "speed" | "cost" | "scale";
export type StackProductType =
  | "saas"
  | "marketplace"
  | "mobile"
  | "api"
  | "portfolio"
  | "internal"
  | "ecommerce"
  | "ai-app"
  | "other";

export type AiProviderId =
  | "openai"
  | "anthropic"
  | "google-gemini"
  | "openrouter"
  | "deepseek"
  | "none";

export interface MonthlyCostBand {
  /** IDR estimate — rough, free-tier aware */
  minIdr: number;
  maxIdr: number;
  note: string;
}

export interface StackPackage {
  id: string;
  name: string;
  tagline: string;
  /** Product types this package fits well */
  productTypes: StackProductType[];
  /** Priority axes this package optimizes for */
  priorities: StackPriority[];
  stages: Array<"idea" | "prototype" | "production">;
  framework: Framework;
  backendFramework?: Framework;
  programmingLanguage: ProgrammingLanguage;
  database: Database;
  deployment: Deployment;
  /** Maps to Generate Flow stackBundle when possible */
  stackBundle?: StackBundleId;
  aiProvider: AiProviderId;
  aiProviderLabel: string;
  hostingLabel: string;
  monthlyCost: MonthlyCostBand;
  why: string[];
  tradeoffs: string[];
  /** Sensible design default for Generate handoff */
  designDefault: "minimal" | "neo-brutalist" | "corporate" | "dashboard" | "bold";
}

export const STACK_KB_VERSION = "2026-07-17";

/**
 * Curated packages — costs are free-tier / early-MVP estimates in IDR/month
 * for a solo builder (not enterprise). Update when providers change pricing.
 */
export const STACK_PACKAGES: StackPackage[] = [
  {
    id: "pkg-next-supabase-vercel",
    name: "Next.js + Supabase + Vercel",
    tagline: "Fullstack modern paling cepat untuk MVP SaaS / landing + auth.",
    productTypes: ["saas", "portfolio", "ecommerce", "other", "internal"],
    priorities: ["speed", "scale"],
    stages: ["idea", "prototype", "production"],
    framework: "nextjs",
    programmingLanguage: "javascript-typescript",
    database: "supabase",
    deployment: "vercel",
    stackBundle: "modern-fullstack",
    aiProvider: "google-gemini",
    aiProviderLabel: "Gemini Flash (hemat) / GPT via OpenRouter saat butuh",
    hostingLabel: "Vercel Hobby → Pro",
    monthlyCost: {
      minIdr: 0,
      maxIdr: 350_000,
      note: "Gratis di Hobby + Supabase Free; naik saat Pro / DB lebih besar.",
    },
    why: [
      "Satu bahasa (TypeScript) end-to-end — cocok vibe-coding dengan Cursor",
      "Auth, storage, realtime sudah bundled di Supabase",
      "Deploy preview otomatis di Vercel",
    ],
    tradeoffs: [
      "Cold start / edge limits di tier gratis",
      "Vendor lock ringan ke ekosistem Vercel + Supabase",
    ],
    designDefault: "minimal",
  },
  {
    id: "pkg-next-planetscale-vercel",
    name: "Next.js + PlanetScale/Turso + Vercel",
    tagline: "Serverless SQL ringan untuk produk baca-banyak, biaya rendah.",
    productTypes: ["saas", "api", "portfolio", "other"],
    priorities: ["cost", "speed"],
    stages: ["idea", "prototype"],
    framework: "nextjs",
    programmingLanguage: "javascript-typescript",
    database: "turso",
    deployment: "vercel",
    stackBundle: "modern-fullstack",
    aiProvider: "deepseek",
    aiProviderLabel: "DeepSeek / Gemini Flash — biaya token rendah",
    hostingLabel: "Vercel Hobby + Turso Free",
    monthlyCost: {
      minIdr: 0,
      maxIdr: 200_000,
      note: "Sangat hemat di free tier; cocok eksperimen sebelum naik ke Postgres penuh.",
    },
    why: [
      "SQLite edge (Turso) murah dan cepat untuk prototipe",
      "Tidak perlu kelola Postgres dulu",
      "AI provider hemat untuk fitur copy / chat ringan",
    ],
    tradeoffs: [
      "Bukan ideal untuk transaksi kompleks / multi-region berat",
      "Migrasi ke Postgres nanti butuh kerja ekstra",
    ],
    designDefault: "minimal",
  },
  {
    id: "pkg-ai-next-fastapi",
    name: "AI-Native: Next.js + FastAPI + pgvector",
    tagline: "Frontend Next + backend Python AI — cocok chatbot / RAG / agent.",
    productTypes: ["ai-app", "saas", "api"],
    priorities: ["scale", "speed"],
    stages: ["prototype", "production"],
    framework: "nextjs",
    backendFramework: "fastapi",
    programmingLanguage: "javascript-typescript",
    database: "pgvector",
    deployment: "railway",
    stackBundle: "ai-native",
    aiProvider: "openrouter",
    aiProviderLabel: "OpenRouter (multi-model: Gemini / Qwen / GPT)",
    hostingLabel: "Vercel (FE) + Railway/Fly (API Python)",
    monthlyCost: {
      minIdr: 150_000,
      maxIdr: 1_200_000,
      note: "Hosting API + embedding/token AI — naik cepat kalau traffic tinggi.",
    },
    why: [
      "Python ekosistem AI (LangChain, transformers) lebih matang",
      "pgvector cukup untuk RAG skala kecil–menengah tanpa Pinecone dulu",
      "OpenRouter memudahkan ganti model tanpa rewrite besar",
    ],
    tradeoffs: [
      "Dua runtime (Node + Python) = kompleksitas ops lebih tinggi",
      "Biaya AI token harus di-monitor dari hari pertama",
    ],
    designDefault: "dashboard",
  },
  {
    id: "pkg-expo-firebase",
    name: "Expo + Firebase",
    tagline: "Mobile cross-platform cepat tanpa kelola server sendiri.",
    productTypes: ["mobile", "other"],
    priorities: ["speed", "cost"],
    stages: ["idea", "prototype", "production"],
    framework: "expo",
    programmingLanguage: "javascript-typescript",
    database: "firebase",
    deployment: "none",
    stackBundle: "mobile-crossplatform",
    aiProvider: "google-gemini",
    aiProviderLabel: "Gemini (native di ekosistem Google) atau OpenRouter",
    hostingLabel: "EAS Build + Firebase Spark/Blaze",
    monthlyCost: {
      minIdr: 0,
      maxIdr: 400_000,
      note: "Gratis di Spark; Blaze pay-as-you-go saat auth/storage naik.",
    },
    why: [
      "Satu codebase iOS + Android",
      "Auth, Firestore, push notification bundled",
      "Cocok solo / tim kecil yang fokus UI dulu",
    ],
    tradeoffs: [
      "Query kompleks & migrasi data Firebase bisa menyakitkan",
      "Vendor lock Firebase cukup kuat",
    ],
    designDefault: "bold",
  },
  {
    id: "pkg-marketplace-next-pg",
    name: "Marketplace: Next.js + Postgres + Redis",
    tagline: "Siap multi-role (buyer/seller), antrian, dan search dasar.",
    productTypes: ["marketplace", "ecommerce"],
    priorities: ["scale", "speed"],
    stages: ["prototype", "production"],
    framework: "nextjs",
    programmingLanguage: "javascript-typescript",
    database: "postgresql",
    deployment: "vercel",
    stackBundle: "marketplace-ready",
    aiProvider: "openai",
    aiProviderLabel: "OpenAI / Gemini untuk search & rekomendasi produk",
    hostingLabel: "Vercel + managed Postgres (Supabase/Neon) + Redis (Upstash)",
    monthlyCost: {
      minIdr: 200_000,
      maxIdr: 1_500_000,
      note: "Redis + DB managed biasanya jadi cost driver pertama.",
    },
    why: [
      "Postgres andal untuk order, inventory, payout",
      "Redis/Upstash untuk cache & rate limit",
      "Stack mirip yang dipakai banyak marketplace MVP",
    ],
    tradeoffs: [
      "Lebih banyak moving parts daripada SaaS sederhana",
      "Payment gateway & KYC di luar stack ini",
    ],
    designDefault: "corporate",
  },
  {
    id: "pkg-laravel-vps",
    name: "Laravel + MySQL + VPS",
    tagline: "Klasik, murah, dan familiar untuk internal tools / CRUD berat.",
    productTypes: ["internal", "ecommerce", "other", "saas"],
    priorities: ["cost", "scale"],
    stages: ["prototype", "production"],
    framework: "laravel",
    programmingLanguage: "php",
    database: "mysql",
    deployment: "vps",
    stackBundle: "classic-reliable",
    aiProvider: "none",
    aiProviderLabel: "Opsional — tambah API AI nanti via OpenRouter",
    hostingLabel: "VPS Indonesia / DigitalOcean droplet",
    monthlyCost: {
      minIdr: 50_000,
      maxIdr: 350_000,
      note: "VPS entry ~Rp50–150rb/bulan; prediktabel tanpa surprise serverless.",
    },
    why: [
      "Biaya bulanan prediktabel",
      "Ekosistem Laravel (Filament, queues) kuat untuk admin panel",
      "Cocok tim yang sudah nyaman PHP",
    ],
    tradeoffs: [
      "Setup server & security lebih manual",
      "Bukan pilihan tercepat untuk vibe-coding frontend modern",
    ],
    designDefault: "corporate",
  },
  {
    id: "pkg-astro-portfolio",
    name: "Astro / static portfolio",
    tagline: "Portfolio atau company profile: cepat, SEO-friendly, biaya ~0.",
    productTypes: ["portfolio", "other"],
    priorities: ["cost", "speed"],
    stages: ["idea", "prototype", "production"],
    framework: "astro",
    programmingLanguage: "javascript-typescript",
    database: "none",
    deployment: "netlify",
    stackBundle: "portfolio-cepat",
    aiProvider: "none",
    aiProviderLabel: "Tidak wajib — pakai AI hanya saat generate konten",
    hostingLabel: "Netlify / Cloudflare Pages / Vercel static",
    monthlyCost: {
      minIdr: 0,
      maxIdr: 50_000,
      note: "Hampir selalu gratis di tier static hosting.",
    },
    why: [
      "Performa & SEO bagus untuk konten",
      "Tidak perlu database",
      "Deploy drag-drop / git sederhana",
    ],
    tradeoffs: [
      "Bukan untuk app dengan auth/dashboard kompleks",
      "Interaktivitas terbatas tanpa hydration islands",
    ],
    designDefault: "minimal",
  },
  {
    id: "pkg-hono-api-fly",
    name: "Hono / Express API + Fly.io",
    tagline: "API-first ringan, edge-friendly, cocok microservice kecil.",
    productTypes: ["api", "saas", "ai-app"],
    priorities: ["cost", "scale"],
    stages: ["prototype", "production"],
    framework: "hono",
    programmingLanguage: "javascript-typescript",
    database: "postgresql",
    deployment: "fly-io",
    aiProvider: "openrouter",
    aiProviderLabel: "OpenRouter — fleksibel untuk endpoint AI",
    hostingLabel: "Fly.io / Railway small dyno",
    monthlyCost: {
      minIdr: 80_000,
      maxIdr: 600_000,
      note: "Kecil di idle; naik dengan region & traffic.",
    },
    why: [
      "Runtime tipis, cold start lebih baik dari monolit besar",
      "Cocok kalau FE sudah ada (mobile / SPA terpisah)",
      "Mudah di-scale horizontal di Fly",
    ],
    tradeoffs: [
      "Kamu harus kelola FE terpisah",
      "Observability & auth perlu dirancang sendiri",
    ],
    designDefault: "dashboard",
  },
  {
    id: "pkg-budget-vps-docker",
    name: "Docker all-in-one di VPS",
    tagline: "Kontrol penuh, biaya flat — untuk yang mau hemat jangka panjang.",
    productTypes: ["saas", "internal", "ecommerce", "api", "other"],
    priorities: ["cost"],
    stages: ["prototype", "production"],
    framework: "nextjs",
    programmingLanguage: "javascript-typescript",
    database: "postgresql",
    deployment: "docker",
    aiProvider: "deepseek",
    aiProviderLabel: "DeepSeek self-hosted API atau OpenRouter hemat",
    hostingLabel: "VPS 2–4 GB RAM + Docker Compose",
    monthlyCost: {
      minIdr: 100_000,
      maxIdr: 450_000,
      note: "Flat VPS; kamu bayar waktu ops & backup sendiri.",
    },
    why: [
      "Tidak kena bill surprise dari serverless",
      "Bisa jalanin DB + app + Redis satu mesin",
      "Cocok belajar DevOps dasar",
    ],
    tradeoffs: [
      "Kamu pegang security, backup, SSL",
      "Scaling vertikal terbatas sampai migrate",
    ],
    designDefault: "neo-brutalist",
  },
];

export function getStackPackage(id: string): StackPackage | undefined {
  return STACK_PACKAGES.find((p) => p.id === id);
}

export function listStackPackageSummariesForPrompt(): string {
  return STACK_PACKAGES.map((p) => {
    const cost =
      p.monthlyCost.minIdr === 0 && p.monthlyCost.maxIdr === 0
        ? "≈ Rp0"
        : `≈ Rp${p.monthlyCost.minIdr.toLocaleString("id-ID")}–${p.monthlyCost.maxIdr.toLocaleString("id-ID")}/bln`;
    return [
      `ID: ${p.id}`,
      `Nama: ${p.name}`,
      `Cocok tipe: ${p.productTypes.join(", ")}`,
      `Prioritas: ${p.priorities.join(", ")}`,
      `Stage: ${p.stages.join(", ")}`,
      `Stack: ${p.framework}${p.backendFramework ? ` + ${p.backendFramework}` : ""} / ${p.database} / ${p.deployment}`,
      `AI: ${p.aiProviderLabel}`,
      `Hosting: ${p.hostingLabel}`,
      `Biaya: ${cost} — ${p.monthlyCost.note}`,
      `Alasan curated: ${p.why.join("; ")}`,
      `Tradeoff: ${p.tradeoffs.join("; ")}`,
    ].join("\n");
  }).join("\n\n---\n\n");
}

export function filterCandidatePackages(input: {
  productType?: string;
  priority?: string;
  stage?: string;
}): StackPackage[] {
  let list = [...STACK_PACKAGES];
  if (input.productType && input.productType !== "other") {
    const filtered = list.filter((p) =>
      p.productTypes.includes(input.productType as StackProductType)
    );
    if (filtered.length >= 2) list = filtered;
  }
  if (input.priority) {
    const filtered = list.filter((p) =>
      p.priorities.includes(input.priority as StackPriority)
    );
    if (filtered.length >= 2) list = filtered;
  }
  if (input.stage) {
    const filtered = list.filter((p) =>
      p.stages.includes(input.stage as "idea" | "prototype" | "production")
    );
    if (filtered.length >= 2) list = filtered;
  }
  return list;
}
