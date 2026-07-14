"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEARNING_PATHS } from "@/lib/learn-content";
import {
  getActivePathSlug,
  getPathOverviewHref,
  getPathTheme,
} from "@/lib/learn-nav";
import LearnPathIcon from "@/components/learn/LearnPathIcon";
import {
  LEARN_PRIMARY_NAV_HEIGHT,
  LEARN_TOPIC_STRIP_HEIGHT,
} from "@/lib/learn-links";

export default function LearnTopicStrip() {
  const pathname = usePathname();
  const activeSlug = getActivePathSlug(pathname);
  const hubActive = pathname === "/learn";

  return (
    <div
      className="sticky z-40 border-b"
      style={{
        top: LEARN_PRIMARY_NAV_HEIGHT,
        height: LEARN_TOPIC_STRIP_HEIGHT,
        background: "var(--learn-strip-bg)",
        borderColor: "var(--learn-border)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="flex items-center gap-1.5 overflow-x-auto px-4 sm:px-6 h-full scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        <Link
          href="/learn"
          className="learn-nav-text learn-hover-pill inline-flex items-center shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md"
          style={{
            color: hubActive ? "var(--learn-accent)" : "var(--learn-text-tertiary)",
            background: hubActive ? "var(--learn-accent-tint)" : "transparent",
            border: hubActive
              ? "0.5px solid var(--learn-accent-border)"
              : "0.5px solid transparent",
          }}
        >
          Beranda
        </Link>

        <span
          className="w-px h-4 shrink-0 mx-0.5"
          style={{ background: "var(--color-border-default)" }}
          aria-hidden
        />

        {LEARNING_PATHS.map((path) => {
          const isActive = activeSlug === path.slug;
          const theme = getPathTheme(path.slug);
          return (
            <Link
              key={path.slug}
              href={getPathOverviewHref(path)}
              className="learn-nav-text learn-hover-pill inline-flex items-center gap-1.5 shrink-0 text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap"
              style={{
                color: isActive ? theme.accent : "var(--learn-text-secondary)",
                background: isActive ? theme.tint : "transparent",
                border: isActive
                  ? `0.5px solid ${theme.border}`
                  : "0.5px solid transparent",
              }}
            >
              <LearnPathIcon
                id={path.icon}
                size={14}
                color={isActive ? theme.accent : "var(--learn-text-tertiary)"}
              />
              <span>{path.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
