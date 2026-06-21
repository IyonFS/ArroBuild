"use client";

import { useState, useEffect } from "react";
import IdeaInput from "@/components/generate/IdeaInput";
import ClarificationStep from "@/components/generate/ClarificationStep";
import PresetSelector from "@/components/generate/PresetSelector";
import GenerationProgress from "@/components/generate/GenerationProgress";
import DocPreview from "@/components/generate/DocPreview";
import type {
  Clarifications,
  Presets,
  GeneratedFiles,
  UserTier,
} from "@/components/generate/types";
import { getModelsForTier } from "@/components/generate/types";
import AppShell from "@/components/layout/AppShell";

type Step = "idea" | "clarify" | "preset" | "generating" | "preview";

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("idea");
  const [idea, setIdea] = useState("");
  const [clarifications, setClarifications] = useState<Clarifications>({});
  const [presets, setPresets] = useState<Presets>({
    framework: "nextjs",
    design: "linear",
    agentTool: "cursor",
  });
  const [projectId, setProjectId] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles>({});
  const [tier, setTier] = useState<UserTier>("free");
  const [selectedModelId, setSelectedModelId] = useState("gemini-2.5-flash");

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data: { tier?: UserTier }) => {
        const userTier = data.tier ?? "free";
        setTier(userTier);
        const models = getModelsForTier(userTier);
        if (!models.some((m) => m.id === selectedModelId)) {
          setSelectedModelId(models[0]?.id ?? "gemini-2.5-flash");
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const STEPS: Step[] = ["idea", "clarify", "preset", "generating", "preview"];
  const stepIndex = STEPS.indexOf(step);

  const STEP_LABELS = ["Idea", "Clarify", "Presets", "Generating", "Preview"];

  return (
    <AppShell tone="app" showFooter={false} padded={false}>
      <div className="relative">
        {/* Sub-header step bar */}
        <header
          className="glass sticky top-[56px] z-40 border-b"
          style={{ borderColor: "var(--bg-border)" }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            ArroBuild
          </a>

          {/* Step indicator */}
          {step !== "preview" && (
            <div className="flex items-center gap-2">
              {STEPS.slice(0, 4).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-1.5"
                    style={{
                      color:
                        i < stepIndex
                          ? "var(--green-text)"
                          : i === stepIndex
                          ? "var(--text-primary)"
                          : "var(--text-disabled)",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{
                        background:
                          i < stepIndex
                            ? "var(--green-muted)"
                            : i === stepIndex
                            ? "var(--bg-card)"
                            : "transparent",
                        border:
                          i === stepIndex
                            ? "1px solid var(--text-tertiary)"
                            : i < stepIndex
                            ? "1px solid var(--green-muted)"
                            : "1px solid var(--text-disabled)",
                      }}
                    >
                      {i < stepIndex ? (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="var(--green-text)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span className="text-xs hidden sm:inline">
                      {STEP_LABELS[i]}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className="w-8 h-px"
                      style={{
                        background:
                          i < stepIndex
                            ? "var(--green-muted)"
                            : "var(--bg-border)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {step === "preview" && (
            <span
              className="text-xs badge badge-success"
            >
              ✓ Generation complete
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 relative z-10">
        {step === "idea" && (
          <IdeaInput
            idea={idea}
            onChange={setIdea}
            onNext={() => setStep("clarify")}
          />
        )}

        {step === "clarify" && (
          <ClarificationStep
            clarifications={clarifications}
            onChange={setClarifications}
            onNext={() => setStep("preset")}
            onBack={() => setStep("idea")}
          />
        )}

        {step === "preset" && (
          <PresetSelector
            presets={presets}
            onChange={setPresets}
            onNext={() => setStep("generating")}
            onBack={() => setStep("clarify")}
            tier={tier}
            selectedModelId={selectedModelId}
            onModelChange={setSelectedModelId}
          />
        )}

        {step === "generating" && (
          <GenerationProgress
            idea={idea}
            clarifications={clarifications}
            presets={presets}
            tier={tier}
            modelId={selectedModelId}
            onProjectCreated={setProjectId}
            onComplete={(files) => {
              setGeneratedFiles(files);
              setStep("preview");
            }}
            onError={() => setStep("preset")}
          />
        )}

        {step === "preview" && (
          <DocPreview
            projectId={projectId}
            files={generatedFiles}
            onRestart={() => {
              setIdea("");
              setClarifications({});
              setPresets({ framework: "nextjs", design: "linear", agentTool: "cursor" });
              setSelectedModelId("gemini-2.5-flash");
              setProjectId(null);
              setGeneratedFiles({});
              setStep("idea");
            }}
          />
        )}
      </main>
      </div>
    </AppShell>
  );
}
