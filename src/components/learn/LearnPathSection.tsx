import Link from "next/link";
import type { LearningPath } from "@/lib/learn-content";
import LearnPathIcon from "@/components/learn/LearnPathIcon";
import {
  getFirstLessonHref,
  getLevelTheme,
  getPathOverviewHref,
  getPathTheme,
} from "@/lib/learn-nav";

interface Props {
  path: LearningPath;
}

export default function LearnPathSection({ path }: Props) {
  const theme = getPathTheme(path.slug);
  const level = getLevelTheme(path.level);
  const overviewHref = getPathOverviewHref(path);
  const startHref = getFirstLessonHref(path);

  return (
    <article
      className="learn-hover-card rounded-xl p-5 sm:p-6 flex flex-col gap-4"
      style={{
        border: "0.5px solid var(--learn-border)",
        background: "var(--learn-bg-elevated)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: theme.tint,
            border: `0.5px solid ${theme.border}`,
            color: theme.accent,
          }}
        >
          <LearnPathIcon id={path.icon} size={20} color={theme.accent} />
        </div>
        <span
          className="learn-nav-text text-[10px] px-2 py-1 rounded"
          style={{
            color: level.accent,
            background: level.tint,
            border: `0.5px solid ${level.border}`,
          }}
        >
          {level.label}
        </span>
      </div>

      <div>
        <h3 className="learn-section-title text-lg mb-2" style={{ fontSize: "1.125rem" }}>
          {path.title}
        </h3>
        <p className="learn-body-sm" style={{ maxWidth: "none" }}>
          {path.description}
        </p>
      </div>

      <p className="learn-body-sm" style={{ color: "var(--learn-text-tertiary)", maxWidth: "none" }}>
        {path.lessons.length} lesson · {path.estimasi}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        <Link
          href={overviewHref}
          className="learn-hover-btn learn-nav-text text-xs font-medium px-3.5 py-2 rounded-md"
          style={{
            color: "var(--color-text-primary)",
            border: "0.5px solid var(--learn-border)",
            background: "var(--app-bg-surface)",
          }}
        >
          Overview path
        </Link>
        <Link
          href={startHref}
          className="learn-cta learn-nav-text text-xs font-semibold px-3.5 py-2 rounded-md inline-flex items-center gap-1.5"
        >
          Mulai lesson 1
          <span className="learn-cta-arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
