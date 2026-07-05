"use client";

import Link from "next/link";
import type { LearningPath } from "@/lib/learn-content";

interface Props {
  path: LearningPath;
  activeLessonSlug: string;
  currentIndex: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function LearnSidebar({
  path,
  activeLessonSlug,
  currentIndex,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const nav = (
    <>
      <Link
        href="/learn"
        onClick={onCloseMobile}
        className="learn-nav-text learn-hover-link flex items-center gap-2 text-xs mb-5"
        style={{ color: "var(--learn-text-tertiary)" }}
      >
        ← Semua topik
      </Link>

      <p
        className="learn-nav-text text-[10px] uppercase tracking-widest mb-3 px-3"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {path.title}
      </p>

      <nav className="flex flex-col gap-0.5">
        {path.lessons.map((lesson, index) => {
          const isActive = lesson.slug === activeLessonSlug;
          const isDone = index < currentIndex;

          return (
            <Link
              key={lesson.slug}
              href={`/learn/${path.slug}/${lesson.slug}`}
              onClick={onCloseMobile}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg learn-nav-text learn-hover-link text-xs"
              style={{
                background: isActive
                  ? "rgba(255,92,26,0.12)"
                  : "transparent",
                color: isActive
                  ? "var(--color-orange)"
                  : isDone
                  ? "var(--learn-text-secondary)"
                  : "var(--learn-text-tertiary)",
                border: isActive
                  ? "0.5px solid rgba(255,92,26,0.35)"
                  : "0.5px solid transparent",
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 tabular-nums"
                style={{
                  background: isActive
                    ? "var(--color-orange)"
                    : isDone
                    ? "var(--learn-bg-elevated)"
                    : "transparent",
                  color: isActive ? "#FFFFFF" : "inherit",
                  border: isActive
                    ? "none"
                    : "0.5px solid var(--learn-border)",
                }}
              >
                {index + 1}
              </span>
              <span className="leading-tight">{lesson.title}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside
        className="learn-dashboard-sidebar hidden lg:flex lg:flex-col lg:w-[260px] lg:shrink-0 lg:border-r lg:overflow-y-auto"
        style={{
          borderColor: "var(--learn-border)",
          background: "var(--learn-bg-surface)",
        }}
      >
        <div className="p-4">{nav}</div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <div
            className="learn-mobile-overlay absolute inset-0"
            style={{ background: "rgba(10,10,10,0.85)" }}
            onClick={onCloseMobile}
            aria-hidden
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-[min(100%,300px)] overflow-y-auto"
            style={{
              background: "var(--learn-bg-surface)",
              borderRight: "0.5px solid var(--learn-border)",
              paddingTop: "var(--learn-nav-height, 104px)",
            }}
          >
            <div className="p-4">{nav}</div>
          </aside>
        </div>
      )}
    </>
  );
}
