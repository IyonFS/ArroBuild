"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEARNING_PATHS } from "@/lib/learn-content";
import { getActivePathSlug, getFirstLessonHref } from "@/lib/learn-nav";
import LearnPathIcon from "@/components/learn/LearnPathIcon";
import { LEARN_PRIMARY_NAV_HEIGHT } from "@/lib/learn-links";

export default function LearnTopicStrip() {
  const pathname = usePathname();
  const activeSlug = getActivePathSlug(pathname);

  return (
    <div
      className="sticky z-40 border-b"
      style={{
        top: LEARN_PRIMARY_NAV_HEIGHT,
        background: "var(--learn-strip-bg)",
        borderColor: "var(--learn-border)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 h-12 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        <Link
          href="/learn"
          className="learn-nav-text learn-hover-pill inline-flex items-center shrink-0 text-sm font-semibold px-3.5 py-2 rounded-lg"
          style={{
            color:
              pathname === "/learn"
                ? "var(--color-orange)"
                : "var(--learn-text-tertiary)",
            background:
              pathname === "/learn"
                ? "rgba(255,92,26,0.14)"
                : "transparent",
            border:
              pathname === "/learn"
                ? "0.5px solid rgba(255,92,26,0.38)"
                : "0.5px solid transparent",
          }}
        >
          Beranda
        </Link>

        <span
          className="w-px h-5 shrink-0 mx-0.5"
          style={{ background: "var(--color-border-default)" }}
          aria-hidden
        />

        {LEARNING_PATHS.map((path) => {
          const isActive = activeSlug === path.slug;
          return (
            <Link
              key={path.slug}
              href={getFirstLessonHref(path)}
              className="learn-nav-text learn-hover-pill inline-flex items-center gap-2 shrink-0 text-sm font-medium px-3.5 py-2 rounded-lg whitespace-nowrap"
              style={{
                color: isActive
                  ? "var(--color-orange)"
                  : "var(--learn-text-secondary)",
                background: isActive
                  ? "rgba(255,92,26,0.14)"
                  : "transparent",
                border: isActive
                  ? "0.5px solid rgba(255,92,26,0.38)"
                  : "0.5px solid transparent",
              }}
            >
              <LearnPathIcon
                id={path.icon}
                size={16}
                color={
                  isActive ? "var(--color-orange)" : "var(--learn-text-tertiary)"
                }
              />
              <span>{path.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
