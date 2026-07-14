const STEPS = [
  {
    num: "01",
    title: "Pilih path",
    desc: "Katalog dikelompokkan level. Buka overview untuk melihat urutan lesson.",
  },
  {
    num: "02",
    title: "Baca berurutan",
    desc: "Kerjakan lesson 1 → 4. Sidebar menandai posisi dan progress path.",
  },
  {
    num: "03",
    title: "Terapkan di editor",
    desc: "Setiap lesson berakhir dengan langkah praktis untuk Cursor / Claude Code.",
  },
];

export default function LearnHowTo() {
  return (
    <section style={{ background: "var(--app-bg-surface)" }}>
      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-14">
        <h2 className="learn-section-title mb-2">Cara belajar</h2>
        <p className="learn-body-sm mb-8" style={{ maxWidth: 480 }}>
          Tiga langkah — tanpa kuis, tanpa paywall. Fokus baca dan praktik.
        </p>

        <ol className="flex flex-col gap-0 border-t" style={{ borderColor: "var(--learn-border)" }}>
          {STEPS.map((step, i) => (
            <li
              key={step.num}
              className="grid grid-cols-[auto_1fr] sm:grid-cols-[4rem_12rem_1fr] gap-x-4 sm:gap-x-6 items-baseline py-5 border-b"
              style={{ borderColor: "var(--learn-border)" }}
            >
              <span
                className="learn-nav-text text-sm font-semibold tabular-nums"
                style={{ color: i === 0 ? "var(--learn-accent)" : "var(--learn-info)" }}
              >
                {step.num}
              </span>
              <h3
                className="learn-nav-text font-semibold text-sm sm:text-[0.9375rem] col-start-2 sm:col-start-auto"
                style={{ color: "var(--color-text-primary)" }}
              >
                {step.title}
              </h3>
              <p className="learn-body-sm col-span-2 sm:col-span-1 mt-1 sm:mt-0">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
