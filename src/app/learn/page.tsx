import Link from "next/link";
import { LEARNING_PATHS, type LessonLevel } from "@/lib/learn-content";
import AppShell from "@/components/layout/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Hub — ArroBuild",
  description:
    "Resource edukasi vibe coding dan agent engineering. Belajar dari nol sampai deploy project pertamamu dengan AI agent.",
};

const LEVEL_LABELS: Record<LessonLevel, string> = {
  pemula: "Pemula",
  menengah: "Menengah",
  lanjut: "Lanjut",
};

const LEVEL_COLORS: Record<LessonLevel, string> = {
  pemula: "var(--color-lime)",
  menengah: "var(--color-orange)",
  lanjut: "rgba(255,255,255,0.5)",
};

export default function LearnPage() {
  const featured = LEARNING_PATHS.filter((p) => p.featured);
  const all = LEARNING_PATHS;

  return (
    <AppShell tone="marketing" showFooter>
      {/* ── Hero ── */}
      <section
        className="border-b"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6"
            style={{
              background: "rgba(204,255,0,0.08)",
              border: "0.5px solid rgba(204,255,0,0.3)",
              color: "var(--color-lime)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Gratis · Semua Akses
          </div>

          <h1
            className="font-unbounded font-black text-4xl sm:text-5xl leading-[1.1] tracking-tight mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Learn Hub
          </h1>
          <p
            className="text-lg font-mono max-w-xl leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Resource edukasi vibe coding dan agent engineering. Dari setup AI
            agent pertama sampai multi-agent workflow yang kompleks.
          </p>

          <div className="flex items-center gap-6 mt-8 font-mono text-sm">
            {[
              { label: "4 Learning Paths", icon: "📚" },
              { label: "24 Lessons", icon: "📖" },
              { label: "Semua Gratis", icon: "✓" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                <span>{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Path ── */}
      {featured.map((path) => (
        <section
          key={path.slug}
          className="border-b"
          style={{ borderColor: "var(--color-border-default)" }}
        >
          <div className="max-w-5xl mx-auto px-6 py-12">
            <p
              className="font-mono text-xs mb-6 uppercase tracking-widest"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Featured Path
            </p>

            <Link href={`/learn/${path.slug}`} className="group block">
              <div
                className="rounded-xl p-8 transition-all duration-200"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "0.5px solid rgba(204,255,0,0.2)",
                }}
              >
                <div className="flex items-start gap-5">
                  <div
                    className="text-4xl flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(204,255,0,0.06)" }}
                  >
                    {path.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(204,255,0,0.1)",
                          color: "var(--color-lime)",
                          border: "0.5px solid rgba(204,255,0,0.3)",
                        }}
                      >
                        {LEVEL_LABELS[path.level]}
                      </span>
                      <span
                        className="font-mono text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {path.estimasi} · {path.lessons.length} lessons
                      </span>
                    </div>
                    <h2
                      className="font-unbounded font-bold text-xl mb-2 group-hover:text-[var(--color-lime)] transition-colors"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {path.title}
                    </h2>
                    <p
                      className="font-mono text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {path.description}
                    </p>
                  </div>
                  <div
                    className="flex-shrink-0 text-2xl group-hover:translate-x-1 transition-transform"
                    style={{ color: "var(--color-lime)" }}
                  >
                    →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      ))}

      {/* ── All Paths Grid ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <p
          className="font-mono text-xs mb-8 uppercase tracking-widest"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Semua Learning Path
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {all.map((path) => (
            <Link
              key={path.slug}
              href={`/learn/${path.slug}`}
              className="group block"
            >
              <div
                className="h-full rounded-xl p-6 transition-all duration-200 hover:border-[rgba(204,255,0,0.2)]"
                style={{
                  background: "var(--color-bg-surface)",
                  border: "0.5px solid var(--color-border-default)",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div
                    className="text-2xl w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--color-bg-elevated)" }}
                  >
                    {path.icon}
                  </div>
                  <span
                    className="font-mono text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 mt-1"
                    style={{
                      color: LEVEL_COLORS[path.level],
                      background: "rgba(255,255,255,0.04)",
                      border: `0.5px solid ${LEVEL_COLORS[path.level]}40`,
                    }}
                  >
                    {LEVEL_LABELS[path.level]}
                  </span>
                </div>

                <h3
                  className="font-unbounded font-bold text-base mb-2 group-hover:text-[var(--color-lime)] transition-colors leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {path.title}
                </h3>
                <p
                  className="font-mono text-xs leading-relaxed mb-4"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {path.description}
                </p>

                <div
                  className="flex items-center justify-between font-mono text-[11px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <span>
                    {path.lessons.length} lessons · {path.estimasi}
                  </span>
                  <span
                    className="group-hover:text-[var(--color-lime)] transition-colors"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Mulai →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="border-t"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2
            className="font-unbounded font-bold text-2xl mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            Sudah siap praktek?
          </h2>
          <p
            className="font-mono text-sm mb-8"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Generate dokumentasi project-mu dan langsung paste ke AI agent.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 font-mono font-bold text-sm px-6 py-3 rounded-lg transition-all"
            style={{
              background: "var(--color-lime)",
              color: "#0A0A0A",
            }}
          >
            Mulai Generate →
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
