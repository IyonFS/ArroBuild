import Link from "next/link";
import type { LearningPath, LessonLevel } from "@/lib/learn-content";
import LearnPathIcon from "@/components/learn/LearnPathIcon";
import { getFirstLessonHref, getPathPreview } from "@/lib/learn-nav";

const LEVEL_LABELS: Record<LessonLevel, string> = {
  pemula: "Pemula",
  menengah: "Menengah",
  lanjut: "Lanjut",
};

interface Props {
  path: LearningPath;
  reverse?: boolean;
}

export default function LearnPathSection({ path, reverse = false }: Props) {
  const preview = getPathPreview(path.slug);
  const href = getFirstLessonHref(path);
  const codeBlock = preview?.codePreview;

  return (
    <section className="learn-path-section">
      <div className="max-w-6xl mx-auto px-6 py-14 sm:py-16">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="learn-path-icon-box w-11 h-11 rounded-lg flex items-center justify-center">
                <LearnPathIcon id={path.icon} size={22} color="var(--color-orange)" />
              </div>
              <span className="learn-path-level learn-nav-text text-xs px-2.5 py-1 rounded-full">
                {LEVEL_LABELS[path.level]}
              </span>
              {path.featured && (
                <span className="learn-brand-badge text-[10px] px-2 py-0.5 rounded">
                  Unggulan
                </span>
              )}
            </div>

            <h2 className="learn-section-title mb-4">{path.title}</h2>

            <p className="learn-body mb-6 max-w-lg">{path.description}</p>

            <p
              className="learn-body-sm mb-6"
              style={{ color: "var(--learn-text-tertiary)" }}
            >
              {path.lessons.length} lesson · {path.estimasi}
            </p>

            <Link
              href={href}
              className="learn-cta inline-flex items-center gap-2 learn-nav-text text-base font-semibold px-5 py-2.5 rounded-md"
            >
              Belajar {path.title.split(" ")[0]}
              <span aria-hidden className="learn-cta-arrow">→</span>
            </Link>

            <ul className="mt-8 flex flex-col gap-2.5">
              {preview?.firstLessons.map((lesson, index) => (
                <li key={lesson.slug}>
                  <Link
                    href={`/learn/${path.slug}/${lesson.slug}`}
                    className="learn-nav-text learn-hover-link text-sm flex items-center gap-3"
                    style={{ color: "var(--learn-text-tertiary)" }}
                  >
                    <span className="learn-path-lesson-num w-5 text-[10px] font-semibold tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{lesson.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="learn-path-panel rounded-xl overflow-hidden">
            {codeBlock ? (
              <>
                <div className="learn-path-panel-header px-4 py-2.5 border-b learn-nav-text text-xs flex items-center justify-between">
                  <span>Contoh dari lesson pertama</span>
                  {codeBlock.language && <span>{codeBlock.language}</span>}
                </div>
                <pre className="learn-code-pre p-5 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed m-0">
                  <code>{codeBlock.content}</code>
                </pre>
              </>
            ) : (
              <div className="p-6">
                <p className="learn-label mb-4">Isi path</p>
                <ul className="flex flex-col gap-3">
                  {path.lessons.slice(0, 5).map((lesson, index) => (
                    <li
                      key={lesson.slug}
                      className="learn-nav-text text-sm flex gap-3"
                      style={{ color: "var(--learn-text-secondary)" }}
                    >
                      <span className="learn-path-lesson-num">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {lesson.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
