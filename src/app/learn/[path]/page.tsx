import Link from "next/link";
import { notFound } from "next/navigation";
import { getPath, LEARNING_PATHS } from "@/lib/learn-content";
import {
  getFirstLessonHref,
  getLevelTheme,
  getPathTheme,
} from "@/lib/learn-nav";
import LearnPathIcon from "@/components/learn/LearnPathIcon";
import Footer from "@/components/marketing/Footer";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ path: string }>;
}

export async function generateStaticParams() {
  return LEARNING_PATHS.map((path) => ({ path: path.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path: pathSlug } = await params;
  const path = getPath(pathSlug);
  if (!path) return { title: "Not Found" };
  return {
    title: `${path.title} — Learn Hub · ArroBuild`,
    description: path.description,
  };
}

export default async function LearnPathPage({ params }: Props) {
  const { path: pathSlug } = await params;
  const path = getPath(pathSlug);
  if (!path) notFound();

  const theme = getPathTheme(path.slug);
  const level = getLevelTheme(path.level);
  const startHref = getFirstLessonHref(path);

  return (
    <div className="relative z-10 flex flex-col min-h-full">
      <div className="flex-1" style={{ background: "var(--app-bg-base)" }}>
        <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
          <nav
            className="learn-nav-text text-xs mb-8"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <Link href="/learn" className="learn-hover-link">
              Learn
            </Link>
            <span className="mx-1.5">/</span>
            <span style={{ color: "var(--color-text-secondary)" }}>{path.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center"
              style={{
                background: theme.tint,
                border: `0.5px solid ${theme.border}`,
              }}
            >
              <LearnPathIcon id={path.icon} size={22} color={theme.accent} />
            </div>
            <span
              className="learn-nav-text text-[10px] px-2.5 py-1 rounded"
              style={{
                color: level.accent,
                background: level.tint,
                border: `0.5px solid ${level.border}`,
              }}
            >
              {level.label}
            </span>
            {path.featured && (
              <span className="learn-brand-badge text-[10px] px-2 py-0.5 rounded">
                Unggulan
              </span>
            )}
          </div>

          <h1
            className="learn-hero-title text-2xl sm:text-3xl lg:text-4xl mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            {path.title}
          </h1>

          <p className="learn-body mb-3">{path.description}</p>

          <p
            className="learn-body-sm mb-8"
            style={{ color: "var(--learn-text-tertiary)" }}
          >
            {path.lessons.length} lesson · {path.estimasi}
          </p>

          <Link
            href={startHref}
            className="learn-cta learn-nav-text text-sm font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-md mb-12"
          >
            Mulai lesson 1
            <span className="learn-cta-arrow" aria-hidden>
              →
            </span>
          </Link>

          <section className="mb-10">
            <h2 className="learn-section-title mb-3" style={{ fontSize: "1.125rem" }}>
              Apa yang kamu pelajari
            </h2>
            <p className="learn-body-sm mb-4">{path.objective}</p>
            {path.outcome && (
              <p
                className="learn-body-sm rounded-lg p-4"
                style={{
                  background: "var(--learn-info-tint)",
                  border: "0.5px solid var(--learn-info-border)",
                  color: "var(--color-text-secondary)",
                  maxWidth: "none",
                }}
              >
                <span
                  className="learn-label block mb-1.5"
                  style={{ color: "var(--learn-info)" }}
                >
                  Hasil path
                </span>
                {path.outcome}
              </p>
            )}
          </section>

          <section>
            <h2 className="learn-section-title mb-5" style={{ fontSize: "1.125rem" }}>
              Daftar lesson
            </h2>
            <ol className="flex flex-col gap-2">
              {path.lessons.map((lesson, index) => (
                <li key={lesson.slug}>
                  <Link
                    href={`/learn/${path.slug}/${lesson.slug}`}
                    className="learn-hover-card flex items-start gap-4 p-4 rounded-lg"
                    style={{
                      border: "0.5px solid var(--learn-border)",
                      background: "var(--learn-bg-elevated)",
                    }}
                  >
                    <span
                      className="learn-nav-text text-xs font-semibold tabular-nums w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        color: theme.accent,
                        background: theme.tint,
                        border: `0.5px solid ${theme.border}`,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="learn-nav-text text-sm font-semibold mb-1"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {lesson.title}
                      </p>
                      <p
                        className="learn-body-sm"
                        style={{ color: "var(--learn-text-tertiary)", maxWidth: "none" }}
                      >
                        {lesson.outcome || lesson.estimasi}
                      </p>
                      <span
                        className="learn-nav-text text-[10px] mt-2 inline-block"
                        style={{ color: "var(--learn-info)" }}
                      >
                        Siap dibaca · {lesson.estimasi}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
