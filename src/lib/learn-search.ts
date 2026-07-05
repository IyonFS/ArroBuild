import { LEARNING_PATHS } from "@/lib/learn-content";
import { getFirstLessonHref } from "@/lib/learn-nav";

export type LearnSearchResult = {
  type: "path" | "lesson";
  pathSlug: string;
  pathTitle: string;
  lessonSlug?: string;
  title: string;
  description: string;
  href: string;
};

let cachedIndex: LearnSearchResult[] | null = null;

export function buildLearnSearchIndex(): LearnSearchResult[] {
  if (cachedIndex) return cachedIndex;

  const results: LearnSearchResult[] = [];

  for (const path of LEARNING_PATHS) {
    results.push({
      type: "path",
      pathSlug: path.slug,
      pathTitle: path.title,
      title: path.title,
      description: path.description,
      href: getFirstLessonHref(path),
    });

    for (const lesson of path.lessons) {
      const textBits = lesson.blocks
        .filter((block) => block.type === "text" || block.type === "heading")
        .map((block) => block.content ?? "")
        .join(" ");

      results.push({
        type: "lesson",
        pathSlug: path.slug,
        pathTitle: path.title,
        lessonSlug: lesson.slug,
        title: lesson.title,
        description: textBits.slice(0, 160),
        href: `/learn/${path.slug}/${lesson.slug}`,
      });
    }
  }

  cachedIndex = results;
  return results;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function searchLearn(query: string, limit = 8): LearnSearchResult[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const index = buildLearnSearchIndex();

  return index
    .map((item) => {
      const haystack = [
        item.title,
        item.description,
        item.pathTitle,
        item.type,
      ]
        .join(" ")
        .toLowerCase();

      const titleIndex = item.title.toLowerCase().indexOf(normalized);
      const inTitle = titleIndex >= 0;
      const inBody = haystack.includes(normalized);

      if (!inTitle && !inBody) return null;

      const score =
        (inTitle ? 100 : 0) +
        (titleIndex === 0 ? 50 : 0) +
        (item.type === "lesson" ? 10 : 5) +
        (haystack.startsWith(normalized) ? 20 : 0);

      return { item, score };
    })
    .filter((entry): entry is { item: LearnSearchResult; score: number } =>
      Boolean(entry)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
