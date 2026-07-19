"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Palette } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { MINI_TOOLS } from "@/lib/config/mini-tools";
import InputStep from "@/components/arrodesign/InputStep";
import ContextStep from "@/components/arrodesign/ContextStep";
import ConfirmStep from "@/components/arrodesign/ConfirmStep";
import ResultStep from "@/components/arrodesign/ResultStep";
import {
  INITIAL_ARRODESIGN_STATE,
  type ArroDesignFormState,
  type ArroDesignProgressEvent,
  type ArroDesignResultData,
} from "@/components/arrodesign/types";

const TOOL = MINI_TOOLS["arrodesign"];

const STEPS = [
  { label: "Input", num: 1 },
  { label: "Konteks", num: 2 },
  { label: "Analisis", num: 3 },
];

type WizardStep = 1 | 2 | 3 | "result";

function StepDots({
  current,
  completed,
}: {
  current: WizardStep;
  completed: Set<number>;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {STEPS.map((s, i) => {
        const isDone = typeof current === "number" ? completed.has(s.num) : true;
        const isCurrent = current === s.num;
        return (
          <div key={s.num} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  background: isDone
                    ? "#9D4EDD"
                    : isCurrent
                      ? "rgba(157,78,221,0.2)"
                      : "rgba(240,243,250,0.06)",
                  border: isCurrent
                    ? "1px solid rgba(157,78,221,0.6)"
                    : isDone
                      ? "none"
                      : "0.5px solid rgba(240,243,250,0.12)",
                  color: isDone
                    ? "#fff"
                    : isCurrent
                      ? "#9D4EDD"
                      : "rgba(240,243,250,0.3)",
                }}
              >
                {isDone ? "✓" : s.num}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 10,
                  color: isCurrent
                    ? "#9D4EDD"
                    : isDone
                      ? "rgba(240,243,250,0.55)"
                      : "rgba(240,243,250,0.25)",
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: 48,
                  height: 1,
                  background: isDone
                    ? "rgba(157,78,221,0.4)"
                    : "rgba(240,243,250,0.08)",
                  margin: "0 6px",
                  marginBottom: 14,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ArroDesignPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [state, setState] = useState<ArroDesignFormState>(INITIAL_ARRODESIGN_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressEvents, setProgressEvents] = useState<ArroDesignProgressEvent[]>([]);

  const patch = useCallback((p: Partial<ArroDesignFormState>) => {
    setState((prev) => ({ ...prev, ...p }));
  }, []);

  const goTo = (step: WizardStep, completed?: number) => {
    if (typeof completed === "number") {
      setCompletedSteps((prev) => new Set([...prev, completed]));
    }
    setCurrentStep(step);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setProgressEvents([]);

    try {
      const res = await fetch("/api/tools/arrodesign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: state.inputType,
          referenceUrl: state.referenceUrl || undefined,
          imageDataUrl: state.imageDataUrl || undefined,
          projectContext: state.projectContext || undefined,
          mode: state.mode,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      // Parse SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("Tidak ada response stream.");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr) as {
              type: "progress" | "result" | "error";
              step?: string;
              message?: string;
              error?: string;
              designMd?: string;
              stitchPrompt?: string;
              rawOutput?: string;
              inputType?: string;
              creditsUsed?: number;
              balanceAfter?: number;
              tavilyConfigured?: boolean;
            };

            if (event.type === "progress" && event.step && event.message) {
              setProgressEvents((prev) => [
                ...prev,
                {
                  step: event.step as ArroDesignProgressEvent["step"],
                  message: event.message!,
                },
              ]);
            } else if (event.type === "result") {
              const result: ArroDesignResultData = {
                designMd: event.designMd ?? "",
                stitchPrompt: event.stitchPrompt ?? "",
                rawOutput: event.rawOutput ?? "",
                inputType: (event.inputType ?? state.inputType) as ArroDesignFormState["inputType"],
                creditsUsed: event.creditsUsed ?? 0,
                balanceAfter: event.balanceAfter ?? 0,
                tavilyConfigured: event.tavilyConfigured ?? false,
              };
              patch({ result });
              setCurrentStep("result");
              setCompletedSteps(new Set([1, 2, 3]));
            } else if (event.type === "error") {
              throw new Error(event.error ?? "Analisis gagal.");
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue; // parsial JSON
            throw parseErr;
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi error tidak dikenal.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setState(INITIAL_ARRODESIGN_STATE);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setError(null);
    setProgressEvents([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell tone="marketing" showFooter padded={false}>
      <div className="tools-app min-h-screen">
        {/* Header */}
        <section
          className="relative border-b"
          style={{
            borderColor: "rgba(240,243,250,0.08)",
            background: "#131A2C",
            backgroundImage:
              "linear-gradient(rgba(157,78,221,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(157,78,221,0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        >
          <div className="relative z-10 mx-auto max-w-4xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
            <Link
              href="/tools"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 13,
                color: "rgba(240,243,250,0.4)",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} />
              Semua mini tools
            </Link>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(157,78,221,0.15)",
                  border: "0.5px solid rgba(157,78,221,0.4)",
                  color: "#9D4EDD",
                  flexShrink: 0,
                }}
              >
                <Palette size={20} strokeWidth={1.75} />
              </span>
              <div>
                <h1
                  className="font-unbounded"
                  style={{
                    margin: "0 0 4px",
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#F0F3FA",
                  }}
                >
                  ArroDesign
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 12,
                    color: "rgba(240,243,250,0.45)",
                  }}
                >
                  {TOOL?.description ?? "Screenshot/URL → design.md + prompt Stitch siap pakai"}
                </p>
              </div>
            </div>

            {/* Tier badge */}
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: 5,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "rgba(157,78,221,0.1)",
                  border: "0.5px solid rgba(157,78,221,0.3)",
                  color: "#9D4EDD",
                }}
              >
                Mini Tools · Core
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: 5,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "rgba(240,243,250,0.05)",
                  border: "0.5px solid rgba(240,243,250,0.12)",
                  color: "rgba(240,243,250,0.4)",
                }}
              >
                ~{TOOL?.credits ?? 180}–220 kredit / analisis
              </span>
            </div>
          </div>
        </section>

        {/* Wizard body */}
        <section
          className="min-h-[70vh] py-10 sm:py-14"
          style={{ background: "var(--app-bg-base)" }}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            {/* Step dots — sembunyikan di result */}
            {currentStep !== "result" && (
              <StepDots current={currentStep} completed={completedSteps} />
            )}

            {currentStep === 1 && (
              <InputStep
                state={state}
                onChange={patch}
                onNext={() => goTo(2, 1)}
              />
            )}

            {currentStep === 2 && (
              <ContextStep
                state={state}
                onChange={patch}
                onBack={() => goTo(1)}
                onNext={() => goTo(3, 2)}
              />
            )}

            {currentStep === 3 && (
              <ConfirmStep
                state={state}
                progressEvents={progressEvents}
                loading={loading}
                error={error}
                onBack={() => goTo(2)}
                onGenerate={() => {
                  setCompletedSteps((prev) => new Set([...prev, 3]));
                  void handleGenerate();
                }}
              />
            )}

            {currentStep === "result" && (
              <ResultStep
                state={state}
                onChange={patch}
                onReset={handleReset}
              />
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
