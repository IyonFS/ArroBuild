"use client";

import { useLearnTheme } from "@/components/learn/LearnThemeProvider";

export default function LearnThemeToggle({ fullWidth = false }: { fullWidth?: boolean }) {
  const { theme, toggleTheme } = useLearnTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`learn-hover-btn learn-nav-text items-center gap-2 text-sm px-3 py-2 rounded-lg ${
        fullWidth ? "flex w-full justify-center" : "hidden sm:inline-flex"
      }`}
      style={{
        color: "var(--learn-text-secondary)",
        border: "0.5px solid var(--learn-border)",
        background: "var(--learn-bg-elevated)",
      }}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title="Uji coba tema (hanya Learn Hub)"
    >
      {isDark ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
