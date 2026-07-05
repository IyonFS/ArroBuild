import { LEARNING_PATHS, getPath, type LearningPath } from "@/lib/learn-content";

export function getLearnStats() {
  const lessonCount = LEARNING_PATHS.reduce(
    (total, path) => total + path.lessons.length,
    0
  );
  return {
    pathCount: LEARNING_PATHS.length,
    lessonCount,
  };
}

export function getPathPreview(pathSlug: string) {
  const path = getPath(pathSlug);
  if (!path) return null;

  const firstLesson = path.lessons[0];
  const codePreview = firstLesson?.blocks.find((block) => block.type === "code");

  return {
    path,
    firstLessons: path.lessons.slice(0, 3),
    codePreview,
  };
}

export const PATH_THEMES: Record<
  string,
  { accent: string; tint: string; border: string }
> = {
  "vibe-coding-101": {
    accent: "var(--color-orange)",
    tint: "rgba(255,92,26,0.07)",
    border: "rgba(255,92,26,0.28)",
  },
  "prd-dan-dokumentasi": {
    accent: "var(--color-orange)",
    tint: "rgba(255,92,26,0.06)",
    border: "rgba(255,92,26,0.24)",
  },
  "agent-engineering": {
    accent: "var(--color-orange)",
    tint: "rgba(255,92,26,0.05)",
    border: "rgba(255,92,26,0.22)",
  },
  "tools-dan-integrasi": {
    accent: "var(--color-orange)",
    tint: "rgba(255,92,26,0.04)",
    border: "rgba(255,92,26,0.2)",
  },
};

export function getPathTheme(slug: string) {
  return (
    PATH_THEMES[slug] ?? {
      accent: "var(--color-orange)",
      tint: "rgba(255,92,26,0.04)",
      border: "rgba(255,92,26,0.18)",
    }
  );
}

export function getFirstLessonHref(path: LearningPath): string {
  const first = path.lessons[0];
  if (!first) return `/learn/${path.slug}`;
  return `/learn/${path.slug}/${first.slug}`;
}

export function getActivePathSlug(pathname: string): string | null {
  const match = pathname.match(/^\/learn\/([^/]+)/);
  return match?.[1] ?? null;
}

export const LEARN_TUTORIAL_ITEMS = LEARNING_PATHS.map((path) => ({
  slug: path.slug,
  title: path.title,
  description: path.description,
  href: getFirstLessonHref(path),
  level: path.level,
  lessonCount: path.lessons.length,
}));

export const LEARN_REFERENCE_ITEMS = [
  {
    title: "Vibe Coding",
    href: "/learn/vibe-coding-101/apa-itu-vibe-coding",
    description: "Konsep dasar membangun dengan AI agent",
  },
  {
    title: "PRD (Product Requirements)",
    href: "/learn/prd-dan-dokumentasi/anatomi-prd",
    description: "Struktur dokumen kebutuhan produk",
  },
  {
    title: "context.md",
    href: "/learn/prd-dan-dokumentasi/context-md",
    description: "Master reference project untuk AI",
  },
  {
    title: "design-system.md",
    href: "/learn/prd-dan-dokumentasi/design-system-md",
    description: "Panduan konsistensi visual",
  },
  {
    title: "agents.md",
    href: "/learn/prd-dan-dokumentasi/agents-md",
    description: "Konfigurasi perilaku AI agent",
  },
  {
    title: ".cursorrules",
    href: "/learn/tools-dan-integrasi/cursorrules-explained",
    description: "Instruksi permanen untuk Cursor",
  },
  {
    title: "CLAUDE.md",
    href: "/learn/tools-dan-integrasi/claude-md-best-practices",
    description: "Konfigurasi untuk Claude Code",
  },
];
