"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { LearningPath, Lesson } from "@/lib/learn-content";
import LearnSidebar from "@/components/learn/LearnSidebar";
import { MenuIcon, CloseIcon } from "@/components/marketing/icons";

interface Props {
  path: LearningPath;
  lesson: Lesson;
  index: number;
  children: ReactNode;
  footer: ReactNode;
}

export default function LearnLessonDashboard({
  path,
  lesson,
  index,
  children,
  footer,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="learn-dashboard flex flex-1 min-h-0 flex-col lg:flex-row w-full">
      <LearnSidebar
        path={path}
        activeLessonSlug={lesson.slug}
        currentIndex={index}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 min-w-0 min-h-0 flex-col">
        <header
          className="shrink-0 border-b"
          style={{
            borderColor: "var(--learn-border)",
            background: "var(--learn-nav-bg)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="h-12 px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="learn-hover-btn lg:hidden flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{
                  border: "0.5px solid var(--learn-border)",
                  color: "var(--learn-text-secondary)",
                  background: "var(--learn-bg-elevated)",
                }}
                aria-label="Buka daftar lesson"
              >
                <MenuIcon />
              </button>

              <nav
                className="learn-nav-text text-xs min-w-0 truncate"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                <Link
                  href="/learn"
                  className="learn-hover-link"
                >
                  Learn
                </Link>
                <span className="mx-1.5">/</span>
                <span style={{ color: "var(--color-text-secondary)" }}>
                  {lesson.title}
                </span>
              </nav>
            </div>

            <span
              className="learn-nav-text text-xs shrink-0 tabular-nums"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {index + 1} / {path.lessons.length}
            </span>
          </div>

          <div
            className="h-0.5"
            style={{ background: "var(--learn-border)" }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${((index + 1) / path.lessons.length) * 100}%`,
                background: "var(--color-orange)",
              }}
            />
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <article className="learn-lesson-article max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
            <div className="mb-8">
              <div
                className="learn-nav-text flex items-center gap-3 text-xs mb-3"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                <span>Lesson {index + 1}</span>
                <span>·</span>
                <span>{path.title}</span>
                <span>·</span>
                <span>{lesson.estimasi}</span>
              </div>
              <h1
                className="learn-hero-title text-2xl sm:text-3xl lg:text-4xl"
                style={{ color: "var(--color-text-primary)" }}
              >
                {lesson.title}
              </h1>
              {lesson.outcome && (
                <p
                  className="learn-body-sm mt-4 max-w-2xl"
                  style={{ color: "var(--learn-text-tertiary)" }}
                >
                  {lesson.outcome}
                </p>
              )}
            </div>

            {children}
            {footer}
          </article>
        </div>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="lg:hidden fixed top-[calc(var(--learn-nav-height,104px)+12px)] right-4 z-[71] w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            background: "var(--learn-bg-surface)",
            border: "0.5px solid var(--learn-border)",
            color: "var(--learn-text-secondary)",
          }}
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup daftar lesson"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
