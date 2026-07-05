const STEPS = [
  {
    num: "01",
    title: "Pilih topik",
    desc: "Gunakan strip navigasi atas atau section di bawah untuk masuk ke learning path.",
  },
  {
    num: "02",
    title: "Ikuti urutan lesson",
    desc: "Setiap path punya daftar lesson di sidebar. Kerjakan dari atas ke bawah.",
  },
  {
    num: "03",
    title: "Terapkan langsung",
    desc: "Setiap lesson fokus pada konsep praktis yang bisa kamu coba di editor favoritmu.",
  },
];

export default function LearnHowTo() {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-6 py-14 sm:py-16">
        <h2 className="learn-section-title mb-9">Cara pakai Learn Hub</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.num}>
              <span
                className="learn-nav-text text-sm font-semibold tabular-nums block mb-3"
                style={{ color: "var(--color-orange)" }}
              >
                {step.num}
              </span>
              <h3
                className="learn-nav-text font-semibold text-base mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                {step.title}
              </h3>
              <p className="learn-body-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
