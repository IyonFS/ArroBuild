import { LEARNING_PATHS } from "@/lib/learn-content";
import LearnHubHero from "@/components/learn/LearnHubHero";
import LearnHowTo from "@/components/learn/LearnHowTo";
import LearnPathSection from "@/components/learn/LearnPathSection";
import Footer from "@/components/marketing/Footer";
import { PATH_LEVEL_ORDER, getLevelTheme } from "@/lib/learn-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Hub — ArroBuild",
  description:
    "Resource edukasi vibe coding dan agent engineering. Belajar dari nol sampai deploy project pertamamu dengan AI agent.",
};

export default function LearnPage() {
  return (
    <div className="relative z-10 flex flex-col min-h-full">
      <LearnHubHero />
      <LearnHowTo />

      <section
        id="path-katalog"
        style={{ background: "var(--app-bg-base)" }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-6">
          <h2 className="learn-section-title-lg mb-3">Katalog path</h2>
          <p className="learn-body-sm" style={{ maxWidth: 480 }}>
            Dikelompokkan menurut level. Mulai dari pemula, lanjut ke workflow, lalu advanced.
          </p>
        </div>

        {PATH_LEVEL_ORDER.map((level) => {
          const paths = LEARNING_PATHS.filter((p) => p.level === level);
          if (paths.length === 0) return null;
          const theme = getLevelTheme(level);

          return (
            <div key={level} className="max-w-6xl mx-auto px-6 pb-12">
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: theme.accent }}
                  aria-hidden
                />
                <h3
                  className="learn-nav-text text-xs font-bold uppercase tracking-widest"
                  style={{ color: theme.accent }}
                >
                  {theme.label}
                </h3>
                <span
                  className="flex-1 h-px"
                  style={{ background: "var(--learn-border)" }}
                  aria-hidden
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paths.map((path) => (
                  <LearnPathSection key={path.slug} path={path} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <Footer />
    </div>
  );
}
