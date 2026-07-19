/**
 * Shared option arrays for Zod schemas and TypeScript types.
 * Keep in sync with src/components/generate/types.ts
 */

export const FRAMEWORKS = [
  "nextjs", "nuxt", "remix", "sveltekit", "astro",
  "react-spa", "vue-spa", "vanilla-js",
  "laravel", "express", "nestjs", "fastapi", "django", "rails",
  "go-fiber", "hono",
  "react-native", "flutter", "expo",
  "native-ios", "native-android",
  "ai-recommend",
] as const;

export const DESIGN_PRESETS = [
  "neo-brutalist", "minimal", "corporate", "bold",
  "glassmorphism", "dashboard",
  "apple", "linear", "stripe", "notion", "vercel",
  "ai-recommend",
] as const;

export const AGENT_TOOLS = [
  "cursor", "claude-code", "windsurf", "cline", "opencode", "custom",
] as const;

export const DATABASES = [
  "postgresql", "mysql", "mongodb", "sqlite", "redis",
  "supabase", "firebase", "planetscale", "turso",
  "pgvector", "pinecone", "weaviate", "qdrant", "none",
] as const;

export const DEPLOYMENTS = [
  "vercel", "netlify", "railway", "fly-io", "vps", "docker", "aws", "none",
] as const;

export const PROGRAMMING_LANGUAGES = [
  "javascript-typescript", "python", "php", "ruby", "go", "dart", "swift", "kotlin",
] as const;

export const ANIMATION_LIBRARIES = [
  "framer-motion", "gsap", "lottie", "rive", "css-only", "ai-recommend",
] as const;

export const STACK_BUNDLES = [
  "modern-fullstack", "classic-reliable", "ai-native",
  "mobile-crossplatform", "marketplace-ready", "portfolio-cepat", "custom",
] as const;

export const VERSION_CONTROLS = ["github", "gitlab", "bitbucket", "undecided"] as const;
export const DESIGN_HANDOFF_TOOLS = ["figma", "none"] as const;
export const PROJECT_MANAGEMENT_TOOLS = ["notion", "linear", "trello", "none"] as const;

export const DOCUMENT_FILE_KEYS = [
  "prd",
  "architecture",
  "plan-task",
  "design-system",
  "agent-rules",
  "adaptive-document",
  "cost-infrastructure",
  "analytics-metrics",
  "testing-qa",
  "onboarding-email",
  "competitive-analysis",
  "security-launch",
  "database-deep-dive",
  "compliance-legal",
] as const;

export const PRODUCT_TYPES = [
  "saas",
  "marketplace",
  "mobile",
  "api",
  "portfolio",
  "internal",
  "ecommerce",
  "ai-app",
  "other",
] as const;

export const PROJECT_STAGES = ["idea", "prototype", "production"] as const;

export const MODEL_CLASS_SLUGS = ["hemat", "menengah", "flagship", "ultra"] as const;

export const FEATURE_PRIORITIES = ["must-have", "nice-to-have"] as const;

export const FRONTEND_TIER_SLUGS = ["starter", "pro", "pro_max"] as const;

export type Framework = (typeof FRAMEWORKS)[number];
export type DesignPreset = (typeof DESIGN_PRESETS)[number];
export type AgentTool = (typeof AGENT_TOOLS)[number];
export type Database = (typeof DATABASES)[number];
export type Deployment = (typeof DEPLOYMENTS)[number];
export type ProgrammingLanguage = (typeof PROGRAMMING_LANGUAGES)[number];
export type StackBundleId = (typeof STACK_BUNDLES)[number];
export type DocumentFileKey = (typeof DOCUMENT_FILE_KEYS)[number];
