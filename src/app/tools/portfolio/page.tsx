"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <AppShell tone="marketing" showFooter padded={false}>
      <div className="tools-app min-h-screen">
        <section
          className="relative overflow-hidden border-b"
          style={{
            borderColor: "rgba(240,243,250,0.08)",
            background: "var(--app-bg-blueprint, #131A2C)",
            backgroundImage: "var(--app-blueprint-texture, var(--lp-blueprint-texture))",
            backgroundSize: "var(--app-blueprint-size, 40px 40px)",
          }}
        >
          <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-12">
            <Link
              href="/tools"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 13,
                color: "rgba(240,243,250,0.45)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--app-sky)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(240,243,250,0.45)";
              }}
            >
              <ArrowLeft size={14} />
              Semua mini tools
            </Link>

            <div style={{ marginTop: 20, marginBottom: 16 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "rgba(255,176,32,0.1)",
                  border: "0.5px solid rgba(255,176,32,0.35)",
                  color: "var(--app-amber)",
                }}
              >
                Mini Tools · Gratis
              </span>
            </div>

            <h1
              className="mb-3 font-unbounded text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl"
              style={{ color: "var(--app-text-primary)", fontWeight: 800 }}
            >
              Portfolio Generator
            </h1>
            <p
              className="max-w-xl font-mono text-sm leading-relaxed sm:text-[15px]"
              style={{ color: "var(--app-text-secondary)", maxWidth: 520 }}
            >
              Generate prompt super lengkap untuk website portfoliomu. Bawa ke AI favoritmu dan mulai{" "}
              <i>vibe coding</i> hari ini.
            </p>
          </div>
        </section>

        <section
          className="min-h-[70vh] py-10 sm:py-12"
          style={{ background: "var(--app-bg-base)" }}
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            {currentStep !== "result" && (
              <StepIndicator
                currentStep={currentStep}
                onGoTo={handleGoTo}
                completedSteps={completedSteps}
              />
            )}

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
                <ResultScreen state={state} onEdit={handleGoTo} onReset={handleReset} />
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
