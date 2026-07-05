import Link from "next/link";
import type { Lesson } from "@/lib/learn-content";

interface Props {
  pathSlug: string;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export default function LearnLessonNav({
  pathSlug,
  prevLesson,
  nextLesson,
}: Props) {
  return (
    <div
      className="flex items-center justify-between gap-4 mt-12 pt-8 border-t"
      style={{ borderColor: "var(--color-border-default)" }}
    >
      {prevLesson ? (
        <Link
          href={`/learn/${pathSlug}/${prevLesson.slug}`}
          className="learn-nav-text learn-hover-link flex items-center gap-2 text-sm min-w-0"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <span className="shrink-0">←</span>
          <span className="truncate">{prevLesson.title}</span>
        </Link>
      ) : (
        <Link
          href="/learn"
          className="learn-nav-text learn-hover-link flex items-center gap-2 text-sm"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          ← Kembali ke Learn Hub
        </Link>
      )}

      {nextLesson ? (
        <Link
          href={`/learn/${pathSlug}/${nextLesson.slug}`}
          className="learn-cta learn-nav-text flex items-center gap-2 text-sm font-semibold rounded-md px-4 py-2 shrink-0"
        >
          <span className="truncate max-w-[160px]">{nextLesson.title}</span>
          <span className="learn-cta-arrow">→</span>
        </Link>
      ) : (
        <Link
          href="/learn"
          className="learn-cta learn-nav-text flex items-center gap-2 text-sm font-semibold rounded-md px-4 py-2 shrink-0"
        >
          Selesai
        </Link>
      )}
    </div>
  );
}
