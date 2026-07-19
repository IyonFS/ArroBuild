"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { MINI_TOOLS } from "@/lib/config/mini-tools";
import { STACK_ADVISOR_CREDITS } from "@/lib/config/stack-advisor-prompt";
import {
  fallbackSortPackages,
  parseAdvisorOutput,
} from "@/lib/config/stack-advisor-prompt";
import StepIndicator from "@/components/stack-advisor/StepIndicator";
import ModeStep from "@/components/stack-advisor/ModeStep";
import QuickFormStep from "@/components/stack-advisor/QuickFormStep";
import DiscussionStep from "@/components/stack-advisor/DiscussionStep";
import ConfirmStep from "@/components/stack-advisor/ConfirmStep";
import ResultStep from "@/components/stack-advisor/ResultStep";
import {
  INITIAL_STACK_STATE,
  buildRunInput,
  enrichFromParsed,
  estimateCredits,
  type StackAdvisorFormState,
  type WizardStep,
} from "@/components/stack-advisor/types";

const TOOL = MINI_TOOLS["stack-advisor"];

export default function StackAdvisorPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [state, setState] = useState<StackAdvisorFormState>(INITIAL_STACK_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goTo = (step: WizardStep, completed?: number) => {
    if (completed) {
      setCompletedSteps((prev) => new Set([...prev, completed]));
    }
    setCurrentStep(step);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const credits = estimateCredits(state);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "stack-advisor",
          input: buildRunInput(state),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal generate rekomendasi.");
        return;
      }

      let parsed = parseAdvisorOutput(data.output ?? "");
      if (!parsed || (parsed.status === "ok" && parsed.packages.length === 0)) {
        const input = buildRunInput(state);
        parsed = fallbackSortPackages({
          productType: input.productType,
          priority: input.priority,
          stage: input.stage,
        });
      }

      const enriched = enrichFromParsed(parsed);
      setState((s) => ({
        ...s,
        rawOutput: data.output ?? "",
        parsed,
        enriched,
        selectedPackageId: enriched[0]?.pkg.id ?? null,
      }));
      goTo("result", 3);
    } catch {
      setError("Gagal generate rekomendasi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Yakin ingin mengulang dari awal?")) {
      setState(INITIAL_STACK_STATE);
      setCurrentStep(1);
      setCompletedSteps(new Set());
      setError(null);
    }
  };

  const productType =
    state.mode === "diskusi"
      ? state.discussFields.productType || state.productType
      : state.productType;

  return (
    <AppShell tone="marketing" showFooter padded={false}>
      <div className="tools-app min-h-screen">
        <section
          className="relative border-b"
          style={{
            borderColor: "rgba(240,243,250,0.08)",
            background: "#131A2C",
            backgroundImage: "var(--app-blueprint-texture, var(--lp-blueprint-texture))",
            backgroundSize: "var(--app-blueprint-size, 32px 32px)",
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
                  background: "rgba(56,189,248,0.1)",
                  border: "0.5px solid rgba(56,189,248,0.35)",
                  color: "var(--app-sky)",
                }}
              >
                Mini Tools · {STACK_ADVISOR_CREDITS.cepat} kredit
              </span>
            </div>

            <h1
              className="mb-3 font-unbounded text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl"
              style={{ color: "var(--app-text-primary)", fontWeight: 800 }}
            >
              Stack Advisor
            </h1>
            <p
              className="max-w-xl font-mono text-sm leading-relaxed sm:text-[15px]"
              style={{ color: "var(--app-text-secondary)", maxWidth: 540 }}
            >
              {TOOL.description} Cocok sebelum masuk Generate — curhat dulu, pilih paket, baru
              approve ke Step 3.
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
                  onChange={(mode) => setState((s) => ({ ...s, mode }))}
                  onNext={() => goTo(2, 1)}
                />
              )}

              {currentStep === 2 && state.mode === "cepat" && (
                <QuickFormStep
                  productType={state.productType}
                  stage={state.stage}
                  priority={state.priority}
                  budgetNote={state.budgetNote}
                  notes={state.notes}
                  onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
                  onBack={() => goTo(1)}
                  onNext={() => goTo(3, 2)}
                />
              )}

              {currentStep === 2 && state.mode === "diskusi" && (
                <DiscussionStep
                  messages={state.discussMessages}
                  filledFields={state.discussFields}
                  turnCount={state.discussTurnCount}
                  isComplete={state.discussComplete}
                  onUpdate={(patch) =>
                    setState((s) => ({
                      ...s,
                      discussMessages: patch.messages,
                      discussFields: patch.filledFields,
                      discussTurnCount: patch.turnCount,
                      discussComplete: patch.isComplete,
                      productType: patch.filledFields.productType ?? s.productType,
                      priority: patch.filledFields.priority ?? s.priority,
                      stage: patch.filledFields.stage ?? s.stage,
                      budgetNote: patch.filledFields.budgetNote ?? s.budgetNote,
                      notes: patch.filledFields.notes ?? s.notes,
                    }))
                  }
                  onBack={() => goTo(1)}
                  onNext={() => goTo(3, 2)}
                />
              )}

              {currentStep === 3 && (
                <ConfirmStep
                  state={state}
                  credits={credits}
                  loading={loading}
                  error={error}
                  onEdit={(step) => goTo(step)}
                  onBack={() => goTo(2)}
                  onGenerate={handleGenerate}
                />
              )}

              {currentStep === "result" && (
                <ResultStep
                  parsed={state.parsed}
                  enriched={state.enriched}
                  selectedPackageId={state.selectedPackageId}
                  productType={productType}
                  onSelect={(id) => setState((s) => ({ ...s, selectedPackageId: id }))}
                  onReset={handleReset}
                  onRetry={() => goTo(2)}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
