import Link from "next/link";
import { getFirstLessonHref, getLearnStats } from "@/lib/learn-nav";
import { LEARNING_PATHS } from "@/lib/learn-content";

export default function LearnHubHero() {
  const { pathCount, lessonCount } = getLearnStats();
  const starterPath = LEARNING_PATHS.find((p) => p.level === "pemula") ?? LEARNING_PATHS[0];

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--app-bg-base)" }}>
      <div className="learn-hero-glow absolute inset-0 pointer-events-none" aria-hidden />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <p className="learn-brand-badge inline-flex items-center gap-2 px-3 py-1 rounded mb-6">
          <span className="learn-stat-dot" />
          Gratis · Tanpa login
        </p>

        <h1
          className="learn-hero-title text-[2.1rem] sm:text-4xl lg:text-[2.75rem] mb-5 max-w-3xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          Belajar agent engineering, langkah demi langkah.
        </h1>

        <p className="learn-body mb-8" style={{ maxWidth: 480 }}>
          Empat lesson fondasi untuk memahami peran, memilih tool, dan menjalankan iterasi pertamamu
          bersama AI agent.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-10">
          <a
            href="#path-katalog"
            className="learn-cta learn-nav-text text-sm font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-md"
          >
            Lihat path
            <span className="learn-cta-arrow" aria-hidden>
              →
            </span>
          </a>
          {starterPath && (
            <Link
              href={getFirstLessonHref(starterPath)}
              className="learn-hover-btn learn-nav-text text-sm inline-flex items-center gap-2 px-5 py-2.5 rounded-md"
              style={{
                color: "var(--color-text-primary)",
                border: "0.5px solid var(--learn-border)",
                background: "var(--learn-bg-elevated)",
              }}
            >
              Mulai path pemula
            </Link>
          )}
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-2">
          {[
            `${pathCount} learning path`,
            `${lessonCount} lesson terstruktur`,
            "Semua materi gratis",
          ].map((label) => (
            <li
              key={label}
              className="learn-body-sm flex items-center gap-2.5"
              style={{ color: "var(--learn-text-tertiary)", maxWidth: "none" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--learn-info)" }}
              />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
