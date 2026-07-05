import { LEARNING_PATHS } from "@/lib/learn-content";
import LearnHubHero from "@/components/learn/LearnHubHero";
import LearnHowTo from "@/components/learn/LearnHowTo";
import LearnPathSection from "@/components/learn/LearnPathSection";
import LearnFooter from "@/components/learn/LearnFooter";
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

      <div>
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8 text-center">
          <h2 className="learn-section-title-lg">Topik pembelajaran</h2>
          <p
            className="learn-body-sm mt-4 max-w-md mx-auto"
            style={{ color: "var(--learn-text-tertiary)" }}
          >
            Pilih path sesuai level dan tujuan belajarmu.
          </p>
        </div>

        {LEARNING_PATHS.map((path, index) => (
          <LearnPathSection
            key={path.slug}
            path={path}
            reverse={index % 2 === 1}
          />
        ))}
      </div>

      <LearnFooter />
    </div>
  );
}
