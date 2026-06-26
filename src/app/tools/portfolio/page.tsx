"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import type { PortfolioFormState, Step } from "@/components/portfolio/types";
import IdentitasStep from "@/components/portfolio/IdentitasStep";
import KontenStep from "@/components/portfolio/KontenStep";
import DesignStep from "@/components/portfolio/DesignStep";
import ResultScreen from "@/components/portfolio/ResultScreen";
import StepIndicator from "@/components/portfolio/StepIndicator";

const INITIAL_STATE: PortfolioFormState = {
  identitas: {
    nama: "",
    profesi: "",
    profesiCustom: "",
    tagline: "",
    bio: "",
    kota: "",
    email: "",
    sosial: {},
  },
  konten: {
    skills: [],
    proyek: [{ id: "1", nama: "", deskripsi: "" }],
    layanan: [],
  },
  design: {
    themeId: "midnight-pro",
    fontPairId: "techy-bold",
    heroLayout: "two-column",
    bgEffect: "dot-grid",
    borderStyle: "rounded",
    sections: {
      hero: true,
      skills: true,
      proyek: true,
      layanan: false,
      kontak: true,
      testimonial: false,
    },
  },
};

export default function PortfolioToolPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [state, setState] = useState<PortfolioFormState>(INITIAL_STATE);

  const handleNext = (nextStep: Step, completed: number) => {
    setCompletedSteps((prev) => new Set([...prev, completed]));
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = (prevStep: Step) => {
    setCurrentStep(prevStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoTo = (step: 1 | 2 | 3) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    if (confirm("Yakin ingin mengulang dari awal? Semua data akan hilang.")) {
      setState(INITIAL_STATE);
      setCurrentStep(1);
      setCompletedSteps(new Set());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleApplyDemo = (demo: Partial<PortfolioFormState>) => {
    setState((prev) => ({
      ...prev,
      identitas: { ...prev.identitas, ...(demo.identitas || {}) },
      konten: { ...prev.konten, ...(demo.konten || {}) },
    }));
  };

  const resolvedProfesi =
    state.identitas.profesi === "lainnya"
      ? state.identitas.profesiCustom || "Creative Professional"
      : state.identitas.profesi;

  return (
    <AppShell tone="marketing" showFooter>
      <section
        className="border-b relative overflow-hidden"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />
        <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6"
            style={{
              background: "rgba(204,255,0,0.08)",
              border: "0.5px solid rgba(204,255,0,0.3)",
              color: "var(--color-lime)",
            }}
          >
            Mini Tools · Gratis
          </div>

          <h1
            className="font-unbounded font-black text-4xl sm:text-5xl leading-[1.1] tracking-tight mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Portfolio Generator
          </h1>
          <p
            className="text-lg font-mono max-w-xl leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Generate prompt super lengkap untuk membuat website portfoliomu sendiri. Bawa prompt ini ke AI favoritmu dan mulai <i>vibe coding</i> pertamamu hari ini.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[var(--bg-base)] min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4">
          <StepIndicator
            currentStep={currentStep}
            onGoTo={handleGoTo}
            completedSteps={completedSteps}
          />

          <div className="mt-8 transition-opacity duration-300">
            {currentStep === 1 && (
              <IdentitasStep
                value={state.identitas}
                onChange={(identitas) => setState({ ...state, identitas })}
                onApplyDemo={handleApplyDemo}
                onNext={() => handleNext(2, 1)}
              />
            )}
            {currentStep === 2 && (
              <KontenStep
                profesi={resolvedProfesi}
                value={state.konten}
                onChange={(konten) => setState({ ...state, konten })}
                onBack={() => handleBack(1)}
                onNext={() => handleNext(3, 2)}
              />
            )}
            {currentStep === 3 && (
              <DesignStep
                value={state.design}
                onChange={(design) => setState({ ...state, design })}
                onBack={() => handleBack(2)}
                onNext={() => handleNext("result", 3)}
              />
            )}
            {currentStep === "result" && (
              <ResultScreen
                state={state}
                onEdit={handleGoTo}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
