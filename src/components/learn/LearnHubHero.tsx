import { getLearnStats } from "@/lib/learn-nav";

export default function LearnHubHero() {
  const { pathCount, lessonCount } = getLearnStats();

  return (
    <section className="relative overflow-hidden">
      <div
        className="learn-hero-glow absolute inset-0 pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <p className="learn-brand-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7">
          <span className="learn-stat-dot" />
          Gratis · Tanpa login
        </p>

        <h1
          className="learn-hero-title text-[2.35rem] sm:text-5xl lg:text-[3.5rem] mb-6 max-w-4xl"
          style={{ color: "var(--color-text-primary)" }}
        >
          Belajar agent engineering, langkah demi langkah.
        </h1>

        <p className="learn-body max-w-2xl mb-9">
          Learn Hub ArroBuild adalah ruang belajar terpisah untuk vibe coding,
          dokumentasi proyek, dan workflow AI agent. Pilih topik, ikuti lesson
          berurutan, dan bangun fondasi sebelum menulis kode.
        </p>

        <ul className="flex flex-wrap gap-x-10 gap-y-3">
          {[
            `${pathCount} learning path`,
            `${lessonCount} lesson terstruktur`,
            "Semua materi gratis",
          ].map((label) => (
            <li
              key={label}
              className="learn-body-sm flex items-center gap-2.5"
              style={{ color: "var(--learn-text-tertiary)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-orange)" }}
              />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
