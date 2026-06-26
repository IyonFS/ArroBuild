import Link from "next/link";
import { notFound } from "next/navigation";
import { getPath } from "@/lib/learn-content";
import AppShell from "@/components/layout/AppShell";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ path: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path: pathSlug } = await params;
  const path = getPath(pathSlug);
  if (!path) return { title: "Not Found" };
  return {
    title: `${path.title} — Learn Hub · ArroBuild`,
    description: path.description,
  };
}

export default async function LearnPathPage({ params }: Props) {
  const { path: pathSlug } = await params;
  const path = getPath(pathSlug);
  if (!path) notFound();

  return (
    <AppShell tone="marketing" showFooter>
      {/* ── Breadcrumb ── */}
      <div
        className="border-b"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4">
          <nav
            className="flex items-center gap-2 font-mono text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <Link
              href="/learn"
              className="hover:text-white transition-colors"
            >
              Learn Hub
            </Link>
            <span>/</span>
            <span style={{ color: "var(--color-text-secondary)" }}>
              {path.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Header ── */}
      <section
        className="border-b"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-start gap-6">
            <div
              className="text-4xl w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--color-bg-elevated)",
                border: "0.5px solid var(--color-border-default)",
              }}
            >
              {path.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(204,255,0,0.08)",
                    border: "0.5px solid rgba(204,255,0,0.3)",
                    color: "var(--color-lime)",
                  }}
                >
                  {path.level === "pemula"
                    ? "Pemula"
                    : path.level === "menengah"
                    ? "Menengah"
                    : "Lanjut"}
                </span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {path.estimasi} total · {path.lessons.length} lessons
                </span>
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid var(--color-border-default)",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  {path.tag}
                </span>
              </div>
              <h1
                className="font-unbounded font-black text-2xl sm:text-3xl leading-tight mb-3"
                style={{ color: "var(--color-text-primary)" }}
              >
                {path.title}
              </h1>
              <p
                className="font-mono text-sm leading-relaxed max-w-xl"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {path.description}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={`/learn/${path.slug}/${path.lessons[0]?.slug}`}
              className="inline-flex items-center gap-2 font-mono font-bold text-sm px-6 py-3 rounded-lg transition-all"
              style={{
                background: "var(--color-lime)",
                color: "#0A0A0A",
              }}
            >
              Mulai Belajar →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lesson List ── */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <p
          className="font-mono text-xs mb-6 uppercase tracking-widest"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {path.lessons.length} Lessons
        </p>

        <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border-default)" }}>
          {path.lessons.map((lesson, i) => (
            <Link
              key={lesson.slug}
              href={`/learn/${path.slug}/${lesson.slug}`}
              className="group flex items-center gap-5 py-5 hover:bg-[var(--color-bg-elevated)] -mx-4 px-4 rounded-xl transition-all"
            >
              {/* Number */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "0.5px solid var(--color-border-default)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-mono font-semibold text-sm mb-1 group-hover:text-[var(--color-lime)] transition-colors"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {lesson.title}
                </h3>
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {lesson.estimasi}
                </span>
              </div>

              {/* Arrow */}
              <div
                className="flex-shrink-0 group-hover:text-[var(--color-lime)] group-hover:translate-x-1 transition-all"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
