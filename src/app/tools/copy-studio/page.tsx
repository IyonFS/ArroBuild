"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { MINI_TOOLS } from "@/lib/config/mini-tools";
import { COPY_STUDIO_CREDITS } from "@/lib/config/copy-studio-prompt";
import StepIndicator from "@/components/copy-studio/StepIndicator";
import ModeStep from "@/components/copy-studio/ModeStep";
import ScratchChooser from "@/components/copy-studio/ScratchChooser";
import TemplateGallery from "@/components/copy-studio/TemplateGallery";
import DiscussionStep from "@/components/copy-studio/DiscussionStep";
import ScreenshotStep from "@/components/copy-studio/ScreenshotStep";
import ConfirmStep from "@/components/copy-studio/ConfirmStep";
import ResultStep from "@/components/copy-studio/ResultStep";
import {
  INITIAL_COPY_STATE,
  buildRunPayload,
  estimateCredits,
  type CopyStudioFormState,
  type WizardStep,
} from "@/components/copy-studio/types";

const TOOL = MINI_TOOLS["copy-studio"];

type ContentPhase = "chooser" | "work";

export default function CopyStudioPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [contentPhase, setContentPhase] = useState<ContentPhase>("chooser");
  const [state, setState] = useState<CopyStudioFormState>(INITIAL_COPY_STATE);
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
      const payload = buildRunPayload(state);
      const res = await fetch("/api/tools/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "copy-studio",
          input: payload.input,
          images: payload.images,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal generate copy.");
        return;
      }
      setState((s) => ({ ...s, output: data.output }));
      goTo("result", 3);
    } catch {
      setError("Gagal generate copy. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Yakin ingin mengulang dari awal?")) {
      setState(INITIAL_COPY_STATE);
      setCurrentStep(1);
      setCompletedSteps(new Set());
      setContentPhase("chooser");
      setError(null);
    }
  };

  const productLabel =
    state.discussFields.productName || state.productName || "landing-copy";

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
                  background: "rgba(255,176,32,0.1)",
                  border: "0.5px solid rgba(255,176,32,0.35)",
                  color: "var(--app-amber)",
                }}
              >
                Mini Tools · dari {COPY_STUDIO_CREDITS.template} kredit
              </span>
            </div>

            <h1
              className="mb-3 font-unbounded text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl"
              style={{ color: "var(--app-text-primary)", fontWeight: 800 }}
            >
              Copy Studio
            </h1>
            <p
              className="max-w-xl font-mono text-sm leading-relaxed sm:text-[15px]"
              style={{ color: "var(--app-text-secondary)", maxWidth: 540 }}
            >
              {TOOL.description} Pasangan ArroDesign: mereka jawab tampilan, kamu jawab teksnya.
            </p>
          </div>
        </section>

        <section className="min-h-[70vh] py-10 sm:py-12" style={{ background: "var(--app-bg-base)" }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            {currentStep !== "result" && (
              <StepIndicator
                currentStep={currentStep}
                completedSteps={completedSteps}
                onGoTo={(step) => {
                  if (step === 2) setContentPhase(state.mode === "scratch" ? "chooser" : "work");
                  goTo(step);
                }}
              />
            )}

            <div className="mt-8">
              {currentStep === 1 && (
                <ModeStep
                  value={state.mode}
                  onChange={(mode) =>
                    setState((s) => ({
                      ...s,
                      mode,
                      scratchSubMode: mode === "scratch" ? s.scratchSubMode : null,
                    }))
                  }
                  onNext={() => {
                    setContentPhase(state.mode === "scratch" ? "chooser" : "work");
                    goTo(2, 1);
                  }}
                />
              )}

              {currentStep === 2 && state.mode === "screenshot" && (
                <ScreenshotStep
                  screenshots={state.screenshots}
                  productName={state.productName}
                  targetUser={state.targetUser}
                  mainValue={state.mainValue}
                  onChange={(screenshots) => setState((s) => ({ ...s, screenshots }))}
                  onFieldChange={(patch) => setState((s) => ({ ...s, ...patch }))}
                  onBack={() => goTo(1)}
                  onNext={() => goTo(3, 2)}
                />
              )}

              {currentStep === 2 &&
                state.mode === "scratch" &&
                contentPhase === "chooser" && (
                  <ScratchChooser
                    value={state.scratchSubMode}
                    onChange={(scratchSubMode) =>
                      setState((s) => ({ ...s, scratchSubMode }))
                    }
                    onBack={() => goTo(1)}
                    onNext={() => setContentPhase("work")}
                  />
                )}

              {currentStep === 2 &&
                state.mode === "scratch" &&
                contentPhase === "work" &&
                state.scratchSubMode === "template" && (
                  <TemplateGallery
                    templateId={state.templateId}
                    productName={state.productName}
                    targetUser={state.targetUser}
                    mainValue={state.mainValue}
                    notes={state.notes}
                    onTemplateChange={(templateId) =>
                      setState((s) => ({ ...s, templateId }))
                    }
                    onFieldChange={(patch) => setState((s) => ({ ...s, ...patch }))}
                    onBack={() => setContentPhase("chooser")}
                    onNext={() => goTo(3, 2)}
                  />
                )}

              {currentStep === 2 &&
                state.mode === "scratch" &&
                contentPhase === "work" &&
                state.scratchSubMode === "discussion" && (
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
                        productName: patch.filledFields.productName ?? s.productName,
                        targetUser: patch.filledFields.targetUser ?? s.targetUser,
                        mainValue: patch.filledFields.mainValue ?? s.mainValue,
                      }))
                    }
                    onBack={() => setContentPhase("chooser")}
                    onNext={() => goTo(3, 2)}
                  />
                )}

              {currentStep === 3 && (
                <ConfirmStep
                  state={state}
                  credits={credits}
                  loading={loading}
                  error={error}
                  onEdit={(step) => {
                    if (step === 2 && state.mode === "scratch") {
                      setContentPhase("work");
                    }
                    goTo(step);
                  }}
                  onBack={() => {
                    if (state.mode === "scratch") setContentPhase("work");
                    goTo(2);
                  }}
                  onGenerate={handleGenerate}
                />
              )}

              {currentStep === "result" && (
                <ResultStep
                  output={state.output}
                  productName={productLabel}
                  onReset={handleReset}
                  onOutputChange={(output) => setState((s) => ({ ...s, output }))}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
