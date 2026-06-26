import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/learn-content";
import AppShell from "@/components/layout/AppShell";
import LessonContent from "@/components/learn/LessonContent";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ path: string; lesson: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path: pathSlug, lesson: lessonSlug } = await params;
  const result = getLesson(pathSlug, lessonSlug);
  if (!result) return { title: "Not Found" };
  return {
    title: `${result.lesson.title} — ${result.path.title} · ArroBuild`,
    description: `Pelajari ${result.lesson.title} dalam ${result.lesson.estimasi}.`,
  };
}

export default async function LearnLessonPage({ params }: Props) {
  const { path: pathSlug, lesson: lessonSlug } = await params;
  const result = getLesson(pathSlug, lessonSlug);
  if (!result) notFound();

  const { path, lesson, index } = result;
  const prevLesson = index > 0 ? path.lessons[index - 1] : null;
  const nextLesson =
    index < path.lessons.length - 1 ? path.lessons[index + 1] : null;

  return (
    <AppShell tone="app" showFooter={false} padded={false}>
      {/* ── Top Bar ── */}
      <header
        className="sticky top-[60px] z-40 border-b"
        style={{
          background: "var(--color-bg-base)",
          borderColor: "var(--color-border-default)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
          <nav
            className="flex items-center gap-2 font-mono text-xs min-w-0"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <Link
              href="/learn"
              className="hover:text-white transition-colors shrink-0"
            >
              Learn
            </Link>
            <span>/</span>
            <Link
              href={`/learn/${path.slug}`}
              className="hover:text-white transition-colors truncate hidden sm:block max-w-[120px]"
            >
              {path.title}
            </Link>
            <span className="hidden sm:block">/</span>
            <span
              className="truncate max-w-[140px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {lesson.title}
            </span>
          </nav>

          {/* Progress indicator */}
          <span
            className="font-mono text-xs shrink-0"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {index + 1} / {path.lessons.length}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-0.5"
          style={{ background: "var(--color-border-default)" }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${((index + 1) / path.lessons.length) * 100}%`,
              background: "var(--color-lime)",
            }}
          />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-8 py-8">
        {/* ── Sidebar ── */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-[112px]">
            <Link
              href={`/learn/${path.slug}`}
              className="flex items-center gap-2 font-mono text-xs mb-5 hover:text-white transition-colors"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              ← {path.title}
            </Link>

            <nav className="flex flex-col gap-0.5">
              {path.lessons.map((l, i) => {
                const isActive = l.slug === lesson.slug;
                const isDone = i < index;
                return (
                  <Link
                    key={l.slug}
                    href={`/learn/${path.slug}/${l.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-mono text-xs"
                    style={{
                      background: isActive
                        ? "rgba(204,255,0,0.08)"
                        : "transparent",
                      color: isActive
                        ? "var(--color-lime)"
                        : isDone
                        ? "var(--color-text-secondary)"
                        : "var(--color-text-tertiary)",
                      border: isActive
                        ? "0.5px solid rgba(204,255,0,0.25)"
                        : "0.5px solid transparent",
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                      style={{
                        background: isActive
                          ? "var(--color-lime)"
                          : isDone
                          ? "rgba(255,255,255,0.1)"
                          : "transparent",
                        color: isActive ? "#0A0A0A" : "inherit",
                        border: isActive
                          ? "none"
                          : "0.5px solid var(--color-border-default)",
                      }}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <span className="leading-tight">{l.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <div
              className="flex items-center gap-3 font-mono text-xs mb-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <span>Lesson {index + 1}</span>
              <span>·</span>
              <span>{lesson.estimasi}</span>
            </div>
            <h1
              className="font-unbounded font-black text-2xl sm:text-3xl leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              {lesson.title}
            </h1>
          </div>

          {/* Lesson content blocks */}
          <LessonContent blocks={lesson.blocks} />

          {/* ── Navigation ── */}
          <div
            className="flex items-center justify-between gap-4 mt-12 pt-8 border-t"
            style={{ borderColor: "var(--color-border-default)" }}
          >
            {prevLesson ? (
              <Link
                href={`/learn/${path.slug}/${prevLesson.slug}`}
                className="flex items-center gap-2 font-mono text-sm transition-all hover:text-white"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                <span>←</span>
                <span className="truncate max-w-[160px]">{prevLesson.title}</span>
              </Link>
            ) : (
              <Link
                href={`/learn/${path.slug}`}
                className="flex items-center gap-2 font-mono text-sm transition-all hover:text-white"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                ← Kembali ke path
              </Link>
            )}

            {nextLesson ? (
              <Link
                href={`/learn/${path.slug}/${nextLesson.slug}`}
                className="flex items-center gap-2 font-mono text-sm font-medium transition-all rounded-lg px-4 py-2"
                style={{
                  background: "var(--color-lime)",
                  color: "#0A0A0A",
                }}
              >
                <span className="truncate max-w-[160px]">{nextLesson.title}</span>
                <span>→</span>
              </Link>
            ) : (
              <Link
                href={`/learn/${path.slug}`}
                className="flex items-center gap-2 font-mono text-sm font-medium transition-all rounded-lg px-4 py-2"
                style={{
                  background: "var(--color-lime)",
                  color: "#0A0A0A",
                }}
              >
                Selesai ✓
              </Link>
            )}
          </div>
        </main>
      </div>
    </AppShell>
  );
}
