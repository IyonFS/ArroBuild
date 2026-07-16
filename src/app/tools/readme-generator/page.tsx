"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { MINI_TOOLS } from "@/lib/config/mini-tools";
import StepIndicator from "@/components/readme/StepIndicator";
import ModeStep from "@/components/readme/ModeStep";
import ProjectStep from "@/components/readme/ProjectStep";
import RepoStep from "@/components/readme/RepoStep";
import ManualStep from "@/components/readme/ManualStep";
import TemplateStep from "@/components/readme/TemplateStep";
import ConfirmStep from "@/components/readme/ConfirmStep";
import ResultStep from "@/components/readme/ResultStep";
import {
  INITIAL_README_STATE,
  buildRunInput,
  type ReadmeFormState,
  type WizardStep,
  type ProjectSummary,
} from "@/components/readme/types";

const TOOL = MINI_TOOLS["readme-generator"];

export default function ReadmeGeneratorPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [state, setState] = useState<ReadmeFormState>(INITIAL_README_STATE);
  const [hasProjects, setHasProjects] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => setHasProjects((data.projects?.length ?? 0) > 0))
      .catch(() => setHasProjects(false));
  }, []);

  const goTo = (step: WizardStep, completed?: number) => {
    if (completed) {
      setCompletedSteps((prev) => new Set([...prev, completed]));
    }
    setCurrentStep(step);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "readme-generator",
          input: buildRunInput(state),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal generate README.");
        return;
      }
      setState((s) => ({ ...s, output: data.output }));
      goTo("result", 4);
    } catch {
      setError("Gagal generate README. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Yakin ingin mengulang dari awal?")) {
      setState(INITIAL_README_STATE);
      setCurrentStep(1);
      setCompletedSteps(new Set());
      setError(null);
    }
  };

  const projectName =
    state.mode === "manual"
      ? state.manual.projectName
      : state.mode === "repo"
        ? state.manual.projectName
        : state.projectName;

  return (
    <AppShell tone="marketing" showFooter padded={false}>
      <div className="tools-app min-h-screen readme-generator-app">
        <section
          className="relative overflow-hidden border-b"
          style={{
            borderColor: "rgba(240,243,250,0.08)",
            background: "var(--app-bg-blueprint, #131A2C)",
            backgroundImage: "var(--app-blueprint-texture, var(--lp-blueprint-texture))",
            backgroundSize: "var(--app-blueprint-size, 40px 40px)",
          }}
        >
          <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <Link
              href="/tools"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 16,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 13,
                color: "rgba(240,243,250,0.45)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} />
              Semua mini tools
            </Link>

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
                background: "rgba(56,189,248,0.1)",
                border: "0.5px solid rgba(56,189,248,0.35)",
                color: "var(--app-sky)",
              }}
            >
              Mini Tools · {TOOL.credits} kredit
            </span>

            <h1
              className="mb-4 mt-4 font-unbounded text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl"
              style={{ color: "var(--app-text-primary)", fontWeight: 800 }}
            >
              README Generator
            </h1>
            <p
              className="max-w-xl font-mono text-sm leading-relaxed sm:text-[15px]"
              style={{ color: "var(--app-text-secondary)", maxWidth: 520 }}
            >
              {TOOL.description} Pilih gaya dulu, semua keputusan eksplisit — tidak ada yang
              dipilih diam-diam.
            </p>
          </div>
        </section>

        <section className="min-h-[70vh] py-10 sm:py-12" style={{ background: "var(--app-bg-base)" }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            {currentStep !== "result" && (
              <StepIndicator
                currentStep={currentStep}
                completedSteps={completedSteps}
                onGoTo={(step) => goTo(step)}
              />
            )}

            <div className="mt-8">
              {currentStep === 1 && (
                <ModeStep
                  value={state.mode}
                  hasProjects={hasProjects}
                  onChange={(mode) => setState((s) => ({ ...s, mode }))}
                  onNext={() => goTo(2, 1)}
                />
              )}

              {currentStep === 2 && state.mode === "project" && (
                <ProjectStep
                  projectId={state.projectId}
                  onSelect={(project: ProjectSummary, architecture, prd) =>
                    setState((s) => ({
                      ...s,
                      projectId: project.id,
                      projectName: project.idea.slice(0, 80),
                      architecture,
                      prd,
                    }))
                  }
                  onBack={() => goTo(1)}
                  onNext={() => goTo(3, 2)}
                />
              )}

              {currentStep === 2 && state.mode === "repo" && (
                <RepoStep
                  repoUrl={state.repoUrl}
                  confirmedTechStack={state.confirmedTechStack}
                  manual={state.manual}
                  onRepoUrlChange={(repoUrl) => setState((s) => ({ ...s, repoUrl }))}
                  onDetected={(data) =>
                    setState((s) => ({
                      ...s,
                      projectName: data.projectName,
                      confirmedTechStack: data.techStack,
                      existingReadme: data.existingReadme,
                      manual: {
                        ...s.manual,
                        projectName: data.projectName,
                        description: data.description,
                        techStack: data.techStack,
                      },
                    }))
                  }
                  onTechStackChange={(confirmedTechStack) =>
                    setState((s) => ({ ...s, confirmedTechStack }))
                  }
                  onManualChange={(manual) => setState((s) => ({ ...s, manual }))}
                  onUseOldReadme={(use) => setState((s) => ({ ...s, useOldReadme: use }))}
                  onSwitchManual={() => {
                    setState((s) => ({ ...s, mode: "manual" }));
                    goTo(2);
                  }}
                  onBack={() => goTo(1)}
                  onNext={() => goTo(3, 2)}
                />
              )}

              {currentStep === 2 && state.mode === "manual" && (
                <ManualStep
                  value={state.manual}
                  onChange={(manual) => setState((s) => ({ ...s, manual }))}
                  onBack={() => goTo(1)}
                  onNext={() => goTo(3, 2)}
                />
              )}

              {currentStep === 3 && (
                <TemplateStep
                  category={state.category}
                  templateId={state.templateId}
                  onCategoryChange={(category) =>
                    setState((s) => ({ ...s, category, templateId: null }))
                  }
                  onTemplateChange={(templateId) => setState((s) => ({ ...s, templateId }))}
                  onBack={() => goTo(2)}
                  onNext={() => goTo(4, 3)}
                />
              )}

              {currentStep === 4 && (
                <ConfirmStep
                  state={state}
                  credits={TOOL.credits}
                  loading={loading}
                  error={error}
                  onEdit={(step) => goTo(step)}
                  onBack={() => goTo(3)}
                  onGenerate={handleGenerate}
                />
              )}

              {currentStep === "result" && (
                <ResultStep
                  output={state.output}
                  projectName={projectName}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
