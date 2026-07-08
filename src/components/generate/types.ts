// Shared types for all generate step components

// ─── Legacy (kept for backwards compat with API) ──────────────────────────────
export type Platform = "web" | "mobile" | "desktop" | "api";
export type Monetization = "free" | "paid" | "freemium" | "open-source";
export type Scope = "mvp" | "full-product" | "experiment";

export interface Clarifications {
  platform?: Platform;
  monetization?: Monetization;
  scope?: Scope;
}

// ─── New v2 Types ─────────────────────────────────────────────────────────────

export type ProductType =
  | "saas"
  | "marketplace"
  | "mobile"
  | "api"
  | "portfolio"
  | "internal"
  | "ecommerce"
  | "ai-app"
  | "other";

export type ProjectStage = "idea" | "prototype" | "production";

export interface ContextData {
  // Generic fields (all product types)
  targetUser?: string;
  mainProblem?: string;
  coreFeatures?: string;
  freeText?: string;
  // SaaS extras
  pricingModel?: string;
  // Marketplace extras
  marketplaceSides?: string;
  buyerDesc?: string;
  sellerDesc?: string;
  transactionType?: string;
  category?: string;
  // Mobile extras
  platforms?: string;
  offlineFirst?: boolean;
  nativeFeatures?: string;
  // API extras
  targetDev?: string;
  authMethod?: string;
  inputOutput?: string;
  deploymentTarget?: string;
  // Portfolio extras
  stackHighlight?: string;
  audienceType?: string;
  caseStudy?: string;
  // Internal tool extras
  teamSize?: string;
  replacesTool?: string;
  integrations?: string;
  // E-commerce extras
  productType?: string;
  salesChannel?: string;
  // AI App extras
  aiUseCase?: string;
  aiModel?: string;
  aiPrivacy?: string;
  // Optional extras (accordion)
  productName?: string;
  referenceProducts?: string;
  antiFeatures?: string;
  launchTimeline?: string;
  // v2: Structured features (replaces free-text coreFeatures)
  features?: Feature[];
}

// ─── Feature Builder ─────────────────────────────────────────────────────────

export type FeaturePriority = "must-have" | "nice-to-have";

export interface Feature {
  id: string;        // Auto-generated: FEAT-001, FEAT-002, ...
  title: string;
  description?: string;
  priority: FeaturePriority;
}

/** Generate the next FEAT-ID based on existing features array */
export function nextFeatureId(features: Feature[]): string {
  const num = features.length + 1;
  return `FEAT-${String(num).padStart(3, "0")}`;
}

/** Convert structured features back to a readable string (backward compat) */
export function featuresToString(features: Feature[]): string {
  if (features.length === 0) return "";
  return features
    .map((f) => {
      const tag = f.priority === "must-have" ? "[Wajib]" : "[Nice-to-have]";
      const desc = f.description ? ` — ${f.description}` : "";
      return `${f.id}: ${f.title}${desc} ${tag}`;
    })
    .join("\n");
}

// ─── Programming Languages ───────────────────────────────────────────────────

export type ProgrammingLanguage =
  | "javascript-typescript"
  | "python"
  | "php"
  | "ruby"
  | "go"
  | "dart"
  | "swift"
  | "kotlin";

export const PROGRAMMING_LANGUAGES: {
  id: ProgrammingLanguage;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { id: "javascript-typescript", label: "JavaScript / TypeScript", icon: "🟨", desc: "Web, semua tipe" },
  { id: "python", label: "Python", icon: "🐍", desc: "API, AI-App, Internal Tool" },
  { id: "php", label: "PHP", icon: "🐘", desc: "Internal Tool, tim familiar PHP" },
  { id: "ruby", label: "Ruby", icon: "💎", desc: "SaaS klasik" },
  { id: "go", label: "Go", icon: "🐹", desc: "API performa tinggi" },
  { id: "dart", label: "Dart", icon: "🐦", desc: "Mobile cross-platform" },
  { id: "swift", label: "Swift", icon: "🍎", desc: "Native iOS" },
  { id: "kotlin", label: "Kotlin", icon: "🤖", desc: "Native Android" },
];

// ─── Stack & Presets ──────────────────────────────────────────────────────────

export type Framework =
  | "nextjs"
  | "nuxt"
  | "remix"
  | "sveltekit"
  | "astro"
  | "react-spa"
  | "vue-spa"
  | "vanilla-js"
  | "laravel"
  | "express"
  | "nestjs"
  | "fastapi"
  | "django"
  | "rails"
  | "go-fiber"
  | "hono"
  | "react-native"
  | "flutter"
  | "expo"
  | "native-ios"
  | "native-android"
  | "ai-recommend";

export type Design =
  | "neo-brutalist"
  | "minimal"
  | "corporate"
  | "bold"
  | "glassmorphism"
  | "dashboard"
  | "apple"
  | "linear"
  | "stripe"
  | "notion"
  | "vercel"
  | "ai-recommend";

export type AgentTool =
  | "cursor"
  | "claude-code"
  | "windsurf"
  | "cline"
  | "opencode"
  | "custom";

export type Database =
  | "postgresql"
  | "mysql"
  | "mongodb"
  | "sqlite"
  | "redis"
  | "supabase"
  | "firebase"
  | "planetscale"
  | "turso"
  | "pgvector"
  | "pinecone"
  | "weaviate"
  | "qdrant"
  | "none";

export type Deployment =
  | "vercel"
  | "netlify"
  | "railway"
  | "fly-io"
  | "vps"
  | "docker"
  | "aws"
  | "none";

// ─── Animation Library ───────────────────────────────────────────────────────

export type AnimationLibrary =
  | "framer-motion"
  | "gsap"
  | "lottie"
  | "rive"
  | "css-only"
  | "ai-recommend";

export const ANIMATION_OPTIONS: {
  id: AnimationLibrary;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { id: "framer-motion", label: "Framer Motion", icon: "✦", desc: "Ekosistem React/Next.js, animasi UI standar" },
  { id: "gsap", label: "GSAP", icon: "🎬", desc: "Animasi kompleks, timeline, cocok semua framework" },
  { id: "lottie", label: "Lottie", icon: "🎞️", desc: "Mobile, onboarding flow, animasi After Effects" },
  { id: "rive", label: "Rive", icon: "◎", desc: "Animasi vektor interaktif, trending untuk mobile & web" },
  { id: "css-only", label: "CSS-only / Minimal", icon: "⚡", desc: "Kecepatan load diutamakan" },
  { id: "ai-recommend", label: "Biarkan AI pilih", icon: "🤖", desc: "Default untuk yang belum yakin" },
];

// Product types that show animation section
export const ANIMATION_VISIBLE_PRODUCTS: ProductType[] = [
  "saas", "mobile", "ecommerce", "portfolio", "ai-app",
];

// ─── Tools & Ecosystem ──────────────────────────────────────────────────────

export type VersionControl = "github" | "gitlab" | "bitbucket" | "undecided";
export type DesignHandoffTool = "figma" | "sketch" | "adobe-xd" | "none";
export type ProjectManagementTool = "notion" | "linear" | "trello" | "none";

export const VERSION_CONTROL_OPTIONS: { id: VersionControl; label: string; icon: string }[] = [
  { id: "github", label: "GitHub", icon: "🐙" },
  { id: "gitlab", label: "GitLab", icon: "🦊" },
  { id: "bitbucket", label: "Bitbucket", icon: "🪣" },
  { id: "undecided", label: "Belum tahu", icon: "🤔" },
];

export const DESIGN_HANDOFF_OPTIONS: { id: DesignHandoffTool; label: string; icon: string }[] = [
  { id: "figma", label: "Figma", icon: "🎨" },
  { id: "none", label: "Tidak pakai", icon: "—" },
];

export const PROJECT_MANAGEMENT_OPTIONS: { id: ProjectManagementTool; label: string; icon: string }[] = [
  { id: "notion", label: "Notion", icon: "📝" },
  { id: "linear", label: "Linear", icon: "◎" },
  { id: "trello", label: "Trello", icon: "📋" },
  { id: "none", label: "Tidak pakai", icon: "—" },
];

// ─── Stack Bundles ("Rakitan Siap Pakai") ────────────────────────────────────

export type StackBundleId =
  | "modern-fullstack"
  | "classic-reliable"
  | "ai-native"
  | "mobile-crossplatform"
  | "marketplace-ready"
  | "portfolio-cepat"
  | "custom";

export interface StackBundle {
  id: StackBundleId;
  label: string;
  icon: string;
  desc: string;
  techBadges: string[];
  bestFor: ProductType[];
  // Flat fields for easy spreading into Presets
  framework: Framework;
  database: Database;
  deployment: Deployment;
  animationLibrary?: AnimationLibrary;
  programmingLanguage: ProgrammingLanguage;
  config: {
    language: ProgrammingLanguage;
    framework: Framework;
    database: Database;
    deployment: Deployment;
    animationLibrary?: AnimationLibrary;
  };
}

export const STACK_BUNDLES: StackBundle[] = [
  {
    id: "modern-fullstack",
    label: "Modern Fullstack",
    icon: "⚡",
    desc: "Next.js + TypeScript + PostgreSQL + Supabase + Tailwind + Framer Motion + Vercel",
    techBadges: ["Next.js", "TypeScript", "Supabase", "Framer Motion", "Vercel"],
    bestFor: ["saas", "ai-app"],
    framework: "nextjs",
    database: "supabase",
    deployment: "vercel",
    animationLibrary: "framer-motion",
    programmingLanguage: "javascript-typescript",
    config: {
      language: "javascript-typescript",
      framework: "nextjs",
      database: "supabase",
      deployment: "vercel",
      animationLibrary: "framer-motion",
    },
  },
  {
    id: "classic-reliable",
    label: "Classic Reliable",
    icon: "🏛️",
    desc: "Laravel + PHP + MySQL + Tailwind + VPS tradisional",
    techBadges: ["Laravel", "PHP", "MySQL", "Tailwind", "VPS"],
    bestFor: ["internal"],
    framework: "laravel",
    database: "mysql",
    deployment: "vps",
    programmingLanguage: "php",
    config: {
      language: "php",
      framework: "laravel",
      database: "mysql",
      deployment: "vps",
    },
  },
  {
    id: "ai-native",
    label: "AI-Native Stack",
    icon: "🤖",
    desc: "Next.js (frontend) + FastAPI/Python (backend AI) + pgvector + Vercel/Railway",
    techBadges: ["Next.js", "FastAPI", "Python", "pgvector", "Railway"],
    bestFor: ["ai-app"],
    framework: "nextjs",
    database: "pgvector",
    deployment: "vercel",
    animationLibrary: "framer-motion",
    programmingLanguage: "javascript-typescript",
    config: {
      language: "javascript-typescript",
      framework: "nextjs",
      database: "pgvector",
      deployment: "vercel",
      animationLibrary: "framer-motion",
    },
  },
  {
    id: "mobile-crossplatform",
    label: "Mobile Cross-platform",
    icon: "📱",
    desc: "Expo + TypeScript + Firebase + Lottie",
    techBadges: ["Expo", "TypeScript", "Firebase", "Lottie"],
    bestFor: ["mobile"],
    framework: "expo",
    database: "firebase",
    deployment: "none",
    animationLibrary: "lottie",
    programmingLanguage: "javascript-typescript",
    config: {
      language: "dart",
      framework: "expo",
      database: "firebase",
      deployment: "none",
      animationLibrary: "lottie",
    },
  },
  {
    id: "marketplace-ready",
    label: "Marketplace Ready",
    icon: "🛍️",
    desc: "Next.js + PostgreSQL + Redis + Supabase Auth",
    techBadges: ["Next.js", "PostgreSQL", "Redis", "Supabase", "Vercel"],
    bestFor: ["marketplace", "ecommerce"],
    framework: "nextjs",
    database: "postgresql",
    deployment: "vercel",
    animationLibrary: "framer-motion",
    programmingLanguage: "javascript-typescript",
    config: {
      language: "javascript-typescript",
      framework: "nextjs",
      database: "postgresql",
      deployment: "vercel",
      animationLibrary: "framer-motion",
    },
  },
  {
    id: "portfolio-cepat",
    label: "Portfolio Cepat",
    icon: "🎨",
    desc: "Astro + Tailwind + Vercel, tanpa database",
    techBadges: ["Astro", "Tailwind", "Vercel"],
    bestFor: ["portfolio"],
    framework: "astro",
    database: "none",
    deployment: "vercel",
    animationLibrary: "css-only",
    programmingLanguage: "javascript-typescript",
    config: {
      language: "javascript-typescript",
      framework: "astro",
      database: "none",
      deployment: "vercel",
      animationLibrary: "css-only",
    },
  },
];

// ─── Language → Framework Mapping ────────────────────────────────────────────

export const LANGUAGE_FRAMEWORK_MAP: Record<ProgrammingLanguage, Framework[]> = {
  "javascript-typescript": [
    "nextjs", "nuxt", "remix", "sveltekit", "astro",
    "react-spa", "vue-spa", "vanilla-js", "express", "nestjs", "hono",
  ],
  python: ["django", "fastapi"],
  php: ["laravel"],
  ruby: ["rails"],
  go: ["go-fiber"],
  dart: ["flutter", "expo"],
  swift: ["native-ios"],
  kotlin: ["native-android"],
};

// ─── Database Categories & Recommendations ──────────────────────────────────

export interface DatabaseCategory {
  label: string;
  icon: string;
  options: { id: Database; label: string; desc?: string }[];
}

export const DATABASE_CATEGORIES: DatabaseCategory[] = [
  {
    label: "Relational",
    icon: "🗄️",
    options: [
      { id: "postgresql", label: "PostgreSQL", desc: "Paling versatile, open source" },
      { id: "mysql", label: "MySQL", desc: "Populer, banyak hosting support" },
      { id: "sqlite", label: "SQLite", desc: "Embedded, ringan, tanpa server" },
    ],
  },
  {
    label: "Document / NoSQL",
    icon: "📄",
    options: [
      { id: "mongodb", label: "MongoDB", desc: "Dokumen fleksibel, content-heavy" },
    ],
  },
  {
    label: "Cache / Realtime",
    icon: "⚡",
    options: [
      { id: "redis", label: "Redis", desc: "Session, cache, rate limiting" },
    ],
  },
  {
    label: "Backend-as-a-Service",
    icon: "☁️",
    options: [
      { id: "supabase", label: "Supabase", desc: "PostgreSQL + Auth + Realtime" },
      { id: "firebase", label: "Firebase", desc: "Google ecosystem, mobile-first" },
      { id: "planetscale", label: "PlanetScale", desc: "Serverless MySQL" },
      { id: "turso", label: "Turso", desc: "Edge SQLite, low latency" },
    ],
  },
  {
    label: "Vector DB",
    icon: "🧠",
    options: [
      { id: "pgvector", label: "pgvector", desc: "Vector search di PostgreSQL" },
      { id: "pinecone", label: "Pinecone", desc: "Managed vector DB" },
      { id: "weaviate", label: "Weaviate", desc: "Open source vector + hybrid" },
      { id: "qdrant", label: "Qdrant", desc: "High-performance vector search" },
    ],
  },
  {
    label: "Tidak perlu database",
    icon: "—",
    options: [
      { id: "none", label: "Tidak pakai", desc: "Portfolio statis, landing page" },
    ],
  },
];

// Database recommendations per product type
export const PRODUCT_DB_RECOMMENDATIONS: Record<ProductType, Database[]> = {
  saas: ["postgresql", "supabase"],
  marketplace: ["postgresql", "redis"],
  mobile: ["supabase", "firebase"],
  api: ["postgresql", "redis"],
  "ai-app": ["pgvector", "supabase"],
  ecommerce: ["postgresql", "redis"],
  portfolio: ["none"],
  internal: ["postgresql", "supabase"],
  other: ["postgresql"],
};

// ─── Extended Presets ────────────────────────────────────────────────────────

export interface Presets {
  framework: Framework;
  design: Design;
  agentTool: AgentTool;
  database?: Database;
  deployment?: Deployment;
  // v2 fields
  programmingLanguage?: ProgrammingLanguage;
  animationLibrary?: AnimationLibrary;
  stackBundle?: StackBundleId;
  designReferenceNote?: string;
  versionControl?: VersionControl;
  designHandoffTool?: DesignHandoffTool;
  projectManagementTool?: ProjectManagementTool;
}

// ─── User & Model ─────────────────────────────────────────────────────────────

/** Active subscription plan (v2 — no FREE tier) */
export type UserTier = "starter" | "pro" | "pro_max";

/** Includes users without an active subscription */
export type UserPlanStatus = UserTier | "none";

export function isSubscribed(plan: UserPlanStatus): plan is UserTier {
  return plan !== "none";
}

/** Preview tier for credit estimates when user has no plan yet */
export function resolvePreviewTier(plan: UserPlanStatus): UserTier {
  return plan === "none" ? "starter" : plan;
}

export type AIProvider = "gemini" | "openai" | "anthropic" | "deepseek";

// ─── Model Class System (v2 — credit-based) ─────────────────────────────────

export type ModelClass = "hemat" | "menengah" | "flagship" | "ultra";

export interface ModelClassInfo {
  id: ModelClass;
  label: string;
  icon: string;
  creditsPer1kTokens: number; // Kredit per 1.000 token
  exampleModels: string;      // Human-readable model names
  desc: string;
}

export const MODEL_CLASSES: ModelClassInfo[] = [
  {
    id: "hemat",
    label: "Hemat",
    icon: "⚡",
    creditsPer1kTokens: 1,
    exampleModels: "DeepSeek V4 Flash, Gemini 2.5 Flash-Lite",
    desc: "Cepat & hemat kredit",
  },
  {
    id: "menengah",
    label: "Menengah",
    icon: "✦",
    creditsPer1kTokens: 24,
    exampleModels: "Gemini 2.5 Pro, Gemini 3.5 Flash",
    desc: "Keseimbangan kualitas & biaya",
  },
  {
    id: "flagship",
    label: "Flagship",
    icon: "◈",
    creditsPer1kTokens: 35,
    exampleModels: "GPT-5.4, Claude Sonnet, Gemini 3.1 Pro",
    desc: "Kualitas terbaik untuk dokumen kritis",
  },
  {
    id: "ultra",
    label: "Ultra",
    icon: "♛",
    creditsPer1kTokens: 65,
    exampleModels: "Claude Opus, GPT-5.5",
    desc: "Model terkuat, untuk hasil paling detail",
  },
];

/** Which model classes are available per tier */
export const TIER_MODEL_CLASSES: Record<UserTier, ModelClass[]> = {
  starter: ["hemat"],
  pro: ["hemat", "menengah", "flagship"],
  pro_max: ["hemat", "menengah", "flagship", "ultra"],
};

/** Token budget per document per tier (from arrobuild_pricing_monetisasi_v2.md §4.2) */
export const DOC_TOKEN_BUDGET: Record<FileKey, Record<UserTier, number>> = {
  prd:                    { starter: 2500, pro: 4000, pro_max: 7000 },
  context:                { starter: 2500, pro: 4000, pro_max: 7000 },
  plan:                   { starter: 2000, pro: 3000, pro_max: 5000 },
  "design-system":        { starter: 0,    pro: 3000, pro_max: 5000 },
  agents:                 { starter: 0,    pro: 2500, pro_max: 4000 },
  "production-hardening": { starter: 0,    pro: 0,    pro_max: 6500 },
  "scale-performance":    { starter: 0,    pro: 0,    pro_max: 5000 },
  "growth-quality":       { starter: 0,    pro: 0,    pro_max: 5000 },
};

/** Default model class per document per tier (from arrobuild_pricing_monetisasi_v2.md §4.2) */
export const DOC_DEFAULT_MODEL_CLASS: Record<FileKey, Record<UserTier, ModelClass>> = {
  prd:                    { starter: "hemat", pro: "menengah",  pro_max: "flagship" },
  context:                { starter: "hemat", pro: "menengah",  pro_max: "flagship" },
  plan:                   { starter: "hemat", pro: "hemat",     pro_max: "menengah" },
  "design-system":        { starter: "hemat", pro: "menengah",  pro_max: "menengah" },
  agents:                 { starter: "hemat", pro: "hemat",     pro_max: "flagship" },
  "production-hardening": { starter: "hemat", pro: "hemat",     pro_max: "flagship" },
  "scale-performance":    { starter: "hemat", pro: "hemat",     pro_max: "flagship" },
  "growth-quality":       { starter: "hemat", pro: "hemat",     pro_max: "flagship" },
};

/** Per-document model class overrides */
export type PerDocumentModelClass = Partial<Record<FileKey, ModelClass>>;

/** Calculate credits for a single document given its token budget and model class */
export function calcDocCredits(fileKey: FileKey, tier: UserTier, modelClass: ModelClass): number {
  const tokens = DOC_TOKEN_BUDGET[fileKey][tier];
  if (tokens === 0) return 0;
  const classInfo = MODEL_CLASSES.find((c) => c.id === modelClass);
  if (!classInfo) return 0;
  return Math.ceil((tokens / 1000) * classInfo.creditsPer1kTokens);
}

/** Calculate total credits for selected docs with per-doc model class overrides */
export function calcTotalCredits(
  selectedDocs: FileKey[],
  tier: UserTier,
  overrides: PerDocumentModelClass
): number {
  return selectedDocs.reduce((total, doc) => {
    const modelClass = overrides[doc] ?? DOC_DEFAULT_MODEL_CLASS[doc][tier];
    return total + calcDocCredits(doc, tier, modelClass);
  }, 0);
}

/** Tier credit pool per month (from arrobuild_pricing_monetisasi_v2.md §4) */
export const TIER_CREDIT_POOL: Record<UserTier, number> = {
  starter: 3_000,
  pro: 7_000,
  pro_max: 14_000,
};

/** Tier labels for display */
export const TIER_LABELS: Record<UserTier, string> = {
  starter: "Starter",
  pro: "Pro",
  pro_max: "Pro Max",
};

export const PLAN_STATUS_LABELS: Record<UserPlanStatus, string> = {
  none: "Belum berlangganan",
  starter: "Starter",
  pro: "Pro",
  pro_max: "Pro Max",
};

// ─── Legacy Model Options (backward compat for API & GenerationProgress) ────

export interface ModelOption {
  id: string;
  provider: AIProvider;
  label: string;
  tier: "free" | "paid";
  icon: string;
  speed: string;
  description: string;
  estimatePerDoc: number; // seconds per document
  modelClass: ModelClass; // v2: maps to credit class
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "gemini-2.5-flash",
    provider: "gemini",
    label: "Gemini Flash",
    tier: "free",
    icon: "✦",
    speed: "~30 dtk/dok",
    description: "Gratis · Cepat, cukup detail",
    estimatePerDoc: 30,
    modelClass: "hemat",
  },
  {
    id: "deepseek-v4-flash",
    provider: "deepseek",
    label: "DeepSeek V3",
    tier: "free",
    icon: "🐋",
    speed: "~45 dtk/dok",
    description: "Gratis · Detail, open source",
    estimatePerDoc: 45,
    modelClass: "hemat",
  },
  {
    id: "gemini-2.5-pro",
    provider: "gemini",
    label: "Gemini 2.5 Pro",
    tier: "paid",
    icon: "✦",
    speed: "~1 mnt/dok",
    description: "Pro · Paling lengkap",
    estimatePerDoc: 60,
    modelClass: "menengah",
  },
  {
    id: "gpt-4o",
    provider: "openai",
    label: "GPT-4o",
    tier: "paid",
    icon: "◎",
    speed: "~1 mnt/dok",
    description: "Pro · Konsisten & akurat",
    estimatePerDoc: 60,
    modelClass: "flagship",
  },
  {
    id: "claude-sonnet-4-20250514",
    provider: "anthropic",
    label: "Claude Sonnet 4",
    tier: "paid",
    icon: "◈",
    speed: "~1 mnt/dok",
    description: "Pro · Terbaik untuk docs",
    estimatePerDoc: 60,
    modelClass: "flagship",
  },
];

export function getModelsForTier(tier: UserTier): ModelOption[] {
  if (tier === "starter") {
    return MODEL_OPTIONS.filter((m) => m.tier === "free");
  }
  return MODEL_OPTIONS;
}

// ─── File Keys & Metadata ─────────────────────────────────────────────────────

export type FileKey =
  | "prd"
  | "context"
  | "plan"
  | "design-system"
  | "agents"
  | "production-hardening"
  | "scale-performance"
  | "growth-quality";

export interface GeneratedFiles {
  [key: string]: string;
}

export const FILE_META: Record<
  FileKey,
  { label: string; description: string; icon: string; phase: string }
> = {
  prd: {
    label: "Product Requirements",
    description: "Features, user stories, dan acceptance criteria",
    icon: "📝",
    phase: "Semua fase",
  },
  context: {
    label: "Project Context",
    description: "Vision, goals, dan product overview",
    icon: "📋",
    phase: "Semua fase",
  },
  plan: {
    label: "Development Plan",
    description: "Tech stack, tasks, roadmap, dan budget",
    icon: "🗺️",
    phase: "Semua fase",
  },
  "design-system": {
    label: "Design System",
    description: "Colors, typography, components, dan accessibility",
    icon: "🎨",
    phase: "Semua fase",
  },
  agents: {
    label: "AI Agents & Rules",
    description: "Agent roles, coding rules, dan workflow",
    icon: "🤖",
    phase: "Semua fase",
  },
  "production-hardening": {
    label: "Production Hardening",
    description: "Security, monitoring, CI/CD, dan incident response",
    icon: "🛡️",
    phase: "Siap launch / sudah production",
  },
  "scale-performance": {
    label: "Scale & Performance",
    description: "Scaling strategy, performance optimization, cost projection",
    icon: "⚡",
    phase: "Sudah ada traffic nyata",
  },
  "growth-quality": {
    label: "Growth & Quality",
    description: "Go-to-market, acquisition, testing, dan analytics",
    icon: "📈",
    phase: "Optimasi post-launch",
  },
};

/** All available file keys — everyone can pick any document */
export const ALL_FILE_KEYS: FileKey[] = [
  "prd",
  "context",
  "plan",
  "design-system",
  "agents",
  "production-hardening",
  "scale-performance",
  "growth-quality",
];

/** Smart presets based on project stage */
export const STAGE_PRESETS: Record<ProjectStage, FileKey[]> = {
  idea: ["prd", "context", "plan"],
  prototype: ["prd", "context", "plan", "design-system", "agents"],
  production: [
    "prd",
    "context",
    "plan",
    "design-system",
    "agents",
    "production-hardening",
  ],
};

/** Per-tier file access (all tiers can pick any document in form) */
export const TIER_FILE_KEYS: Record<UserTier, FileKey[]> = {
  starter: ALL_FILE_KEYS,
  pro: ALL_FILE_KEYS,
  pro_max: ALL_FILE_KEYS,
};

// ─── Framework Display Data ──────────────────────────────────────────────────

export const ALL_FRAMEWORKS: { id: Framework; label: string; icon: string; category: "frontend" | "backend" | "mobile" }[] = [
  // Frontend / Fullstack
  { id: "nextjs", label: "Next.js", icon: "▲", category: "frontend" },
  { id: "nuxt", label: "Nuxt.js", icon: "💚", category: "frontend" },
  { id: "remix", label: "Remix", icon: "◎", category: "frontend" },
  { id: "sveltekit", label: "SvelteKit", icon: "🔥", category: "frontend" },
  { id: "astro", label: "Astro", icon: "🚀", category: "frontend" },
  { id: "react-spa", label: "React SPA", icon: "⚛", category: "frontend" },
  { id: "vue-spa", label: "Vue SPA", icon: "💚", category: "frontend" },
  { id: "vanilla-js", label: "Vanilla JS", icon: "✦", category: "frontend" },
  // Backend
  { id: "laravel", label: "Laravel", icon: "🎯", category: "backend" },
  { id: "express", label: "Express.js", icon: "🟩", category: "backend" },
  { id: "nestjs", label: "NestJS", icon: "🐱", category: "backend" },
  { id: "fastapi", label: "FastAPI", icon: "⚡", category: "backend" },
  { id: "django", label: "Django", icon: "🐍", category: "backend" },
  { id: "rails", label: "Rails", icon: "💎", category: "backend" },
  { id: "go-fiber", label: "Go Fiber", icon: "🐹", category: "backend" },
  { id: "hono", label: "Hono", icon: "🔥", category: "backend" },
  // Mobile
  { id: "react-native", label: "React Native", icon: "⚛", category: "mobile" },
  { id: "flutter", label: "Flutter", icon: "🐦", category: "mobile" },
  { id: "expo", label: "Expo", icon: "📱", category: "mobile" },
  { id: "native-ios", label: "Native iOS (Swift)", icon: "🍎", category: "mobile" },
  { id: "native-android", label: "Native Android (Kotlin)", icon: "🤖", category: "mobile" },
];

export const DESIGNS_DATA: { id: Design; label: string; desc: string; swatch: string; lineage: string }[] = [
  { id: "neo-brutalist", label: "Neo-Brutalist", desc: "Raw, bold, high contrast", swatch: "■", lineage: "Gaya tebal, kontras tinggi, populer di produk indie/community-driven" },
  { id: "minimal", label: "Minimal", desc: "Clean, lots of whitespace", swatch: "○", lineage: "Minimalis Skandinavia, fokus pada konten dan tipografi" },
  { id: "corporate", label: "Corporate", desc: "Professional, trust-focused", swatch: "□", lineage: "Desain enterprise, formal, warna netral + aksen biru" },
  { id: "bold", label: "Bold & Colorful", desc: "Vibrant, expressive, fun", swatch: "◈", lineage: "Gaya kreatif, palet berani, populer di produk Gen Z" },
  { id: "glassmorphism", label: "Glassmorphism", desc: "Frosted glass, blur layers", swatch: "∷", lineage: "Efek kaca buram, transparansi, populer sejak iOS/macOS Big Sur" },
  { id: "dashboard", label: "Dashboard / Data", desc: "Dense, information-rich", swatch: "⊞", lineage: "Data-driven, grid padat, sidebar navigasi, warna netral + highlights" },
  { id: "apple", label: "Apple Style", desc: "Clean, premium, rounded", swatch: "🍎", lineage: "Desain premium Apple, SF Pro, whitespace generoso, smooth" },
  { id: "linear", label: "Linear Style", desc: "Dark, sleek, developer-focused", swatch: "◎", lineage: "Dark mode elegan, gradient halus, populer di dev tools" },
  { id: "stripe", label: "Stripe Style", desc: "Gradient-rich, polished", swatch: "💳", lineage: "Gradient mewah, tipografi besar, fintech aesthetic" },
  { id: "notion", label: "Notion Style", desc: "Blocky, content-first", swatch: "📝", lineage: "Block-based, serif heading, minimalis tapi fungsional" },
  { id: "vercel", label: "Vercel Style", desc: "Monochrome, geometric", swatch: "▲", lineage: "Monokrom hitam-putih, geometris, developer-first" },
  { id: "ai-recommend", label: "Biarkan AI", desc: "AI pilihkan sesuai konteks", swatch: "🤖", lineage: "AI akan memilih berdasarkan tipe produk dan target user" },
];
