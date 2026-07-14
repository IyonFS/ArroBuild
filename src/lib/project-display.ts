import type { ProductType, ProjectStage } from "@/components/generate/types";

const PRODUCT_LABELS: Record<string, string> = {
  saas: "SaaS",
  marketplace: "Marketplace",
  mobile: "Mobile App",
  api: "API / Dev Tool",
  "ai-app": "AI-Powered App",
  ecommerce: "E-Commerce",
  portfolio: "Portfolio",
  internal: "Internal Tool",
  other: "Lainnya",
};

const PRODUCT_ICONS: Record<string, string> = {
  saas: "▲",
  marketplace: "⊞",
  mobile: "◈",
  api: "⚡",
  "ai-app": "✦",
  ecommerce: "◎",
  internal: "⊟",
  portfolio: "◇",
  other: "○",
};

const STAGE_LABELS: Record<string, string> = {
  idea: "Ide baru",
  prototype: "Prototype / MVP",
  production: "Production",
};

const FRAMEWORK_LABELS: Record<string, string> = {
  nextjs: "Next.js",
  nuxt: "Nuxt.js",
  remix: "Remix",
  sveltekit: "SvelteKit",
  astro: "Astro",
  "react-spa": "React SPA",
  "vue-spa": "Vue SPA",
  laravel: "Laravel",
  express: "Express.js",
  nestjs: "NestJS",
  fastapi: "FastAPI",
  django: "Django",
  rails: "Rails",
  flutter: "Flutter",
  expo: "Expo",
};

export interface ParsedProjectDisplay {
  title: string;
  subtitle: string;
  productType: string;
  productTypeLabel: string;
  productIcon: string;
  stageLabel?: string;
  frameworkLabel?: string;
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function firstSentence(text: string, max = 120): string {
  const sentence = text.split(/[.!?\n]/)[0]?.trim() ?? text;
  return truncate(sentence, max);
}

interface KnowledgeModel {
  productType?: ProductType | string;
  projectStage?: ProjectStage | string;
  context?: Record<string, string>;
  features?: Array<{ title?: string; description?: string }>;
  stack?: { framework?: string; design?: string };
  type?: string;
  data?: { description?: string };
}

function parseKnowledgeModel(parsed: KnowledgeModel): ParsedProjectDisplay {
  const productType = String(parsed.productType ?? parsed.type ?? "other");
  const ctx = parsed.context ?? {};
  const features = parsed.features ?? [];
  const stack = parsed.stack ?? {};

  let title = "";
  if (features[0]?.title?.trim()) {
    title = truncate(features[0].title.trim(), 72);
  } else if (ctx.mainProblem?.trim()) {
    title = firstSentence(ctx.mainProblem, 80);
  } else if (ctx.targetUser?.trim()) {
    title = `Untuk ${truncate(ctx.targetUser.trim(), 56)}`;
  } else if (ctx.freeText?.trim()) {
    title = firstSentence(ctx.freeText, 80);
  } else if (ctx.coreFeatures?.trim()) {
    title = firstSentence(ctx.coreFeatures, 80);
  } else if (parsed.data?.description?.trim()) {
    title = firstSentence(parsed.data.description, 80);
  } else {
    title = PRODUCT_LABELS[productType] ?? "Project baru";
  }

  const subtitleParts: string[] = [];
  if (ctx.targetUser?.trim() && !title.includes(ctx.targetUser.trim().slice(0, 24))) {
    subtitleParts.push(truncate(ctx.targetUser.trim(), 48));
  }
  if (ctx.mainProblem?.trim() && !title.includes(ctx.mainProblem.trim().slice(0, 24))) {
    subtitleParts.push(truncate(ctx.mainProblem.trim(), 64));
  }
  if (stack.framework) {
    subtitleParts.push(FRAMEWORK_LABELS[stack.framework] ?? stack.framework);
  }

  const stageLabel = parsed.projectStage
    ? STAGE_LABELS[parsed.projectStage] ?? parsed.projectStage
    : undefined;

  return {
    title,
    subtitle: subtitleParts.join(" · "),
    productType,
    productTypeLabel: PRODUCT_LABELS[productType] ?? productType,
    productIcon: PRODUCT_ICONS[productType] ?? "○",
    stageLabel,
    frameworkLabel: stack.framework
      ? FRAMEWORK_LABELS[stack.framework] ?? stack.framework
      : undefined,
  };
}

/** Turn stored `project.idea` (plain text or Knowledge Model JSON) into UI labels. */
export function parseProjectIdea(
  idea: string,
  customTitle?: string | null
): ParsedProjectDisplay {
  if (customTitle?.trim()) {
    const parsed = parseProjectIdeaRaw(idea);
    return { ...parsed, title: truncate(customTitle.trim(), 72) };
  }
  return parseProjectIdeaRaw(idea);
}

function parseProjectIdeaRaw(idea: string): ParsedProjectDisplay {
  const trimmed = idea.trim();
  if (!trimmed) {
    return {
      title: "Project tanpa judul",
      subtitle: "",
      productType: "other",
      productTypeLabel: "Lainnya",
      productIcon: "○",
    };
  }

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as KnowledgeModel;
      return parseKnowledgeModel(parsed);
    } catch {
      // fall through
    }
  }

  return {
    title: firstSentence(trimmed, 100),
    subtitle: "",
    productType: "other",
    productTypeLabel: "Project",
    productIcon: "○",
  };
}
