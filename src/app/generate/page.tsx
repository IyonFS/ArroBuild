"use client";

import { useState, useEffect, useRef } from "react";
import ProductTypeStep from "@/components/generate/ProductTypeStep";
import ContextStep from "@/components/generate/ContextStep";
import StackStep from "@/components/generate/StackStep";
import DocumentPickerStep from "@/components/generate/DocumentPickerStep";
import ConfirmScreen from "@/components/generate/ConfirmScreen";
import GenerationProgress from "@/components/generate/GenerationProgress";
import DocPreview from "@/components/generate/DocPreview";
import ModeSelectStep, {
  type IntakeMode,
} from "@/components/generate/ModeSelectStep";
import InterviewStep, {
  type InterviewResult,
} from "@/components/generate/InterviewStep";
import type {
  ProductType,
  ProjectStage,
  ContextData,
  Presets,
  GeneratedFiles,
  UserPlanStatus,
  FileKey,
  Feature,
  PerDocumentModelClass,
} from "@/components/generate/types";
import {
  getModelsForTier,
  STAGE_PRESETS,
  resolvePreviewTier,
  calcTotalCredits,
  isSubscribed,
} from "@/components/generate/types";
import AppShell from "@/components/layout/AppShell";
import {
  clearGenerateDraft,
  draftHasContent,
  readGenerateDraft,
  writeGenerateDraft,
  type GenerateDraft,
} from "@/lib/generate-draft";

type Step =
  | "mode"
  | "interview"
  | "product-type"
  | "context"
  | "stack"
  | "docs"
  | "confirm"
  | "generating"
  | "preview";

const STEP_LABELS = ["Tipe", "Cerita", "Stack", "Dokumen"];

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("mode");
  const [intakeMode, setIntakeMode] = useState<IntakeMode | null>(null);

  // Step 1
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [stage, setStage] = useState<ProjectStage | null>(null);

  // Step 2
  const [contextData, setContextData] = useState<ContextData>({});
  const [features, setFeatures] = useState<Feature[]>([]);

  // Step 3
  const [presets, setPresets] = useState<Presets>({
    framework: "nextjs",
    design: "neo-brutalist",
    agentTool: "cursor",
    stackBundle: undefined,
    programmingLanguage: undefined,
    database: undefined,
    deployment: undefined,
    animationLibrary: undefined,
    designReferenceNote: undefined,
    versionControl: undefined,
    designHandoffTool: undefined,
    projectManagementTool: undefined,
  });

  // Step 4
  const [selectedDocs, setSelectedDocs] = useState<FileKey[]>([
    "prd",
    "context",
    "plan",
    "design-system",
    "agents",
  ]);
  const [selectedModelId, setSelectedModelId] = useState("gemini-2.5-flash");
  const [perDocModelClass, setPerDocModelClass] = useState<PerDocumentModelClass>({});
  const [plan, setPlan] = useState<UserPlanStatus>("none");
  const [creditBalance, setCreditBalance] = useState(0);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Output
  const [projectId, setProjectId] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles>({});

  // Limits
  const [projectCount, setProjectCount] = useState<number>(0);
  const [projectLimit, setProjectLimit] = useState<number | null>(null);

  const [pendingDraft, setPendingDraft] = useState<GenerateDraft | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const skipAutosave = useRef(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then(
        (data: {
          tier?: UserPlanStatus;
          plan?: UserPlanStatus;
          projectCount?: number;
          projectLimit?: number | null;
          user?: { creditBalance?: number; hasActiveSubscription?: boolean };
        }) => {
          const userPlan = data.plan ?? data.tier ?? "none";
          setPlan(userPlan);
          setCreditBalance(data.user?.creditBalance ?? 0);
          setHasActiveSubscription(Boolean(data.user?.hasActiveSubscription));
          setProjectCount(data.projectCount ?? 0);
          setProjectLimit(data.projectLimit ?? null);

          if (isSubscribed(userPlan)) {
            const models = getModelsForTier(userPlan);
            if (!models.some((m) => m.id === selectedModelId)) {
              setSelectedModelId(models[0]?.id ?? "gemini-2.5-flash");
            }
          }
        }
      )
      .catch(() => {});

    // Check for fork data
    const forkIdea = sessionStorage.getItem("arrobuild_fork_idea");
    const forkPresets = sessionStorage.getItem("arrobuild_fork_presets");
    let usedFork = false;
    if (forkIdea) {
      usedFork = true;
      try {
        if (forkIdea.startsWith("{")) {
          const parsed = JSON.parse(forkIdea);
          setProductType(parsed.type);
          setContextData(parsed.data || {});
        } else {
          setProductType("saas");
          setContextData({ freeText: forkIdea });
        }
        setIntakeMode("cepat");
        setStep("product-type");
      } catch {
        /* ignore bad fork payload */
      }
      sessionStorage.removeItem("arrobuild_fork_idea");
    }
    if (forkPresets) {
      try {
        setPresets(JSON.parse(forkPresets));
      } catch {
        /* ignore */
      }
      sessionStorage.removeItem("arrobuild_fork_presets");
    }

    if (!usedFork) {
      const draft = readGenerateDraft();
      if (draft && draftHasContent(draft)) {
        setPendingDraft(draft);
      }
    }

    skipAutosave.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave form draft (debounce) — skip generating/preview
  useEffect(() => {
    if (skipAutosave.current) return;
    if (step === "generating" || step === "preview" || step === "interview") return;
    if (pendingDraft) return; // wait until user accepts/discards

    const timer = window.setTimeout(() => {
      writeGenerateDraft({
        step,
        intakeMode,
        productType,
        stage,
        contextData,
        features,
        presets,
        selectedDocs,
        selectedModelId,
        perDocModelClass,
      });
      setDraftSavedAt(Date.now());
    }, 700);

    return () => window.clearTimeout(timer);
  }, [
    step,
    intakeMode,
    productType,
    stage,
    contextData,
    features,
    presets,
    selectedDocs,
    selectedModelId,
    perDocModelClass,
    pendingDraft,
  ]);

  const applyDraft = (draft: GenerateDraft) => {
    if (draft.intakeMode) setIntakeMode(draft.intakeMode);
    if (draft.productType) setProductType(draft.productType);
    if (draft.stage) setStage(draft.stage);
    if (draft.contextData) setContextData(draft.contextData);
    if (draft.features) setFeatures(draft.features);
    if (draft.presets) setPresets(draft.presets);
    if (draft.selectedDocs) setSelectedDocs(draft.selectedDocs);
    if (draft.selectedModelId) setSelectedModelId(draft.selectedModelId);
    if (draft.perDocModelClass) setPerDocModelClass(draft.perDocModelClass);

    const restoreStep = draft.step as Step | undefined;
    const allowed: Step[] = [
      "mode",
      "product-type",
      "context",
      "stack",
      "docs",
      "confirm",
    ];
    if (restoreStep && allowed.includes(restoreStep)) {
      setStep(restoreStep);
    } else if (draft.productType) {
      setStep("context");
    }
    setPendingDraft(null);
  };

  const discardDraft = () => {
    clearGenerateDraft();
    setPendingDraft(null);
  };

  const refreshCredits = () => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then(
        (data: {
          tier?: UserPlanStatus;
          plan?: UserPlanStatus;
          user?: { creditBalance?: number; hasActiveSubscription?: boolean };
        }) => {
          if (data.plan || data.tier) setPlan(data.plan ?? data.tier ?? "none");
          if (typeof data.user?.creditBalance === "number") {
            setCreditBalance(data.user.creditBalance);
          }
          if (typeof data.user?.hasActiveSubscription === "boolean") {
            setHasActiveSubscription(data.user.hasActiveSubscription);
          }
        }
      )
      .catch(() => {});
  };

  // Refresh balance when entering review so paywall isn't stale after interview spend
  useEffect(() => {
    if (step === "confirm" || step === "docs") refreshCredits();
  }, [step]);

  // When stage changes, auto-apply smart preset for docs
  const handleStageChange = (s: ProjectStage) => {
    setStage(s);
    setSelectedDocs([...STAGE_PRESETS[s]]);
  };

  const handleModeSelect = (mode: IntakeMode) => {
    setIntakeMode(mode);
    if (mode === "cepat") setStep("product-type");
    else setStep("interview");
  };

  const handleInterviewFinished = (result: InterviewResult) => {
    if (result.productType) setProductType(result.productType);
    if (result.stage) {
      setStage(result.stage);
      setSelectedDocs([...STAGE_PRESETS[result.stage]]);
    }
    setContextData(result.contextData);
    setFeatures(result.features);
    refreshCredits();

    const hasMinimum =
      Boolean(result.productType) &&
      Boolean(result.contextData.targetUser) &&
      Boolean(result.contextData.mainProblem) &&
      result.features.length >= 1;

    if (result.incomplete || !hasMinimum) {
      if (result.productType) setStep("context");
      else setStep("product-type");
      return;
    }

    setStep("stack");
  };

  // Step index for the 4-step indicator (exclude mode/interview/confirm/generating/preview)
  const stepIndex = ["product-type", "context", "stack", "docs"].indexOf(step);

  // Build structured Knowledge Model JSON from all form state
  const buildKnowledgeModel = () => {
    const km: Record<string, unknown> = {};

    // Core identity
    if (productType) km.productType = productType;
    if (stage) km.projectStage = stage;

    // Context fields (only non-empty)
    const ctx: Record<string, string> = {};
    for (const [key, val] of Object.entries(contextData)) {
      if (val && typeof val === "string" && val.trim()) {
        ctx[key] = val.trim();
      } else if (typeof val === "boolean") {
        ctx[key] = String(val);
      }
    }
    if (Object.keys(ctx).length > 0) km.context = ctx;

    // Structured features
    if (features.length > 0) {
      km.features = features.map((f) => ({
        id: f.id,
        title: f.title,
        priority: f.priority,
        ...(f.description ? { description: f.description } : {}),
      }));
    }

    // Stack & preferences
    const stack: Record<string, string> = {};
    if (presets.framework) stack.framework = presets.framework;
    if (presets.design) stack.design = presets.design;
    if (presets.agentTool) stack.agentTool = presets.agentTool;
    if (presets.programmingLanguage) stack.programmingLanguage = presets.programmingLanguage;
    if (presets.database) stack.database = presets.database;
    if (presets.deployment) stack.deployment = presets.deployment;
    if (presets.animationLibrary) stack.animationLibrary = presets.animationLibrary;
    if (presets.stackBundle) stack.stackBundle = presets.stackBundle;
    if (presets.designReferenceNote) stack.designReferenceNote = presets.designReferenceNote;
    if (presets.versionControl) stack.versionControl = presets.versionControl;
    if (presets.designHandoffTool) stack.designHandoffTool = presets.designHandoffTool;
    if (presets.projectManagementTool) stack.projectManagementTool = presets.projectManagementTool;
    if (Object.keys(stack).length > 0) km.stack = stack;

    return km;
  };

  // Serialize Knowledge Model to string for API backward compat
  // (API still expects `idea: string`)
  const buildIdeaString = (): string => {
    const km = buildKnowledgeModel();
    return JSON.stringify(km, null, 2);
  };

  // Summary string for confirm screen
  const buildContextSummary = (): string => {
    const parts: string[] = [];
    if (contextData.targetUser) parts.push(`Target: ${contextData.targetUser}`);
    if (contextData.mainProblem) parts.push(`Problem: ${contextData.mainProblem}`);
    if (contextData.coreFeatures) parts.push(`Fitur: ${contextData.coreFeatures}`);
    if (contextData.buyerDesc) parts.push(`Buyer: ${contextData.buyerDesc}`);
    if (contextData.aiUseCase) parts.push(`AI: ${contextData.aiUseCase}`);
    if (contextData.freeText) parts.push(contextData.freeText);
    return parts.slice(0, 3).join(" · ");
  };

  const handleReset = () => {
    setProductType(null);
    setStage(null);
    setContextData({});
    setFeatures([]);
    setPresets({
      framework: "nextjs",
      design: "neo-brutalist",
      agentTool: "cursor",
      stackBundle: undefined,
      programmingLanguage: undefined,
      database: undefined,
      deployment: undefined,
      animationLibrary: undefined,
      designReferenceNote: undefined,
      versionControl: undefined,
      designHandoffTool: undefined,
      projectManagementTool: undefined,
    });
    setSelectedDocs(["prd", "context", "plan", "design-system", "agents"]);
    setSelectedModelId("gemini-2.5-flash");
    setPerDocModelClass({});
    setProjectId(null);
    setGeneratedFiles({});
    setIntakeMode(null);
    setPendingDraft(null);
    setDraftSavedAt(null);
    clearGenerateDraft();
    setStep("mode");
  };

  const isFormStep = stepIndex >= 0;
  const showStepIndicator = isFormStep;

  // Step summary for breadcrumb
  const stepSummaries: Record<string, string> = {
    "product-type": productType ?? "",
    context: contextData.targetUser ? contextData.targetUser.split(" ").slice(0, 2).join(" ") : "",
    stack: presets.framework,
    docs: `${selectedDocs.length} dok`,
  };

  return (
    <AppShell tone="app" showFooter={false} padded={false}>
      <div className="relative">
        {/* ── Sub-header step bar ── */}
        <header
          className="sticky top-[60px] z-40 border-b"
          style={{
            borderColor: "var(--color-border-default)",
            background: "rgba(10,10,10,0.9)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
            {/* Back to home */}
            <a
              href="/"
              className="flex items-center gap-1.5 text-sm flex-shrink-0 transition-colors hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">ArroBuild</span>
            </a>

            {/* Step indicator — only during form steps */}
            {showStepIndicator && (
              <div className="flex items-center gap-0 flex-1 justify-center">
                {STEP_LABELS.map((label, i) => {
                  const isCompleted = i < stepIndex;
                  const isActive = i === stepIndex;
                  const summary = stepSummaries[
                    ["product-type", "context", "stack", "docs"][i]
                  ];
                  const stepName = ["product-type", "context", "stack", "docs"][i] as Step;

                  return (
                    <div key={label} className="flex items-center">
                      <button
                        onClick={() => isCompleted && setStep(stepName)}
                        className="flex items-center gap-2.5 transition-all group px-3"
                        style={{ cursor: isCompleted ? "pointer" : "default" }}
                        disabled={!isCompleted}
                      >
                        {/* Step circle */}
                        <div
                          className="flex-shrink-0 flex items-center justify-center transition-all duration-300"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: isCompleted
                              ? "rgba(204,255,0,0.12)"
                              : isActive
                              ? "rgba(204,255,0,0.08)"
                              : "transparent",
                            border: isCompleted
                              ? "1.5px solid rgba(204,255,0,0.5)"
                              : isActive
                              ? "1.5px solid rgba(204,255,0,0.6)"
                              : "0.5px solid rgba(255,255,255,0.12)",
                            boxShadow: isActive ? "0 0 12px rgba(204,255,0,0.15)" : "none",
                          }}
                        >
                          {isCompleted ? (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="#CCFF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? "var(--color-lime)" : "rgba(255,255,255,0.3)",
                                fontFamily: "var(--font-jetbrains-mono), monospace",
                              }}
                            >
                              {i + 1}
                            </span>
                          )}
                        </div>

                        {/* Label + summary */}
                        <div className="hidden sm:flex flex-col items-start">
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: isActive ? 600 : 500,
                              color: isActive
                                ? "var(--color-text-primary)"
                                : isCompleted
                                ? "var(--color-lime)"
                                : "rgba(255,255,255,0.3)",
                              fontFamily: "var(--font-inter), system-ui, sans-serif",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {label}
                          </span>
                          {isCompleted && summary && (
                            <span
                              className="max-w-[70px] truncate"
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.25)",
                                fontFamily: "var(--font-jetbrains-mono), monospace",
                                marginTop: 1,
                              }}
                            >
                              {summary}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Connector line */}
                      {i < 3 && (
                        <div
                          className="w-8 sm:w-12 h-px transition-all duration-500"
                          style={{
                            background: i < stepIndex
                              ? "rgba(204,255,0,0.35)"
                              : "rgba(255,255,255,0.08)",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mode / interview / confirm status */}
            {step === "mode" && (
              <span
                className="text-xs flex-1 text-center"
                style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              >
                Pilih mode isi plan
              </span>
            )}
            {step === "interview" && (
              <span
                className="text-xs flex-1 text-center"
                style={{ color: "var(--color-lime)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              >
                Mode Dipandu AI
              </span>
            )}
            {step === "confirm" && (
              <span
                className="text-xs flex-1 text-center"
                style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              >
                Review pilihan
              </span>
            )}
            {step === "generating" && (
              <span
                className="text-xs flex-1 text-center"
                style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              >
                Generating...
              </span>
            )}
            {step === "preview" && (
              <span
                className="text-xs flex-1 text-center"
                style={{ color: "var(--color-lime)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              >
                ✦ Docs siap!
              </span>
            )}

            {/* Progress % + autosave hint */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {draftSavedAt &&
                step !== "generating" &&
                step !== "preview" &&
                !pendingDraft && (
                  <span
                    className="hidden sm:inline text-[10px]"
                    style={{
                      color: "rgba(204,255,0,0.55)",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                    }}
                  >
                    Draft tersimpan
                  </span>
                )}
              {showStepIndicator && (
                <>
                  <div
                    className="w-16 h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${((stepIndex + 1) / 4) * 100}%`,
                        background: "var(--color-lime)",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      minWidth: 28,
                      textAlign: "right",
                    }}
                  >
                    {Math.round(((stepIndex + 1) / 4) * 100)}%
                  </span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Draft restore banner */}
        {pendingDraft && (
          <div
            className="sticky top-[124px] z-30 px-4 py-3"
            style={{
              background: "rgba(204,255,0,0.08)",
              borderBottom: "1px solid rgba(204,255,0,0.25)",
            }}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-lime)" }}
                >
                  Draft tersimpan ditemukan
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Disimpan{" "}
                  {new Date(pendingDraft.savedAt).toLocaleString("id-ID")} · lanjut
                  dari step sebelumnya?
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={discardDraft}
                  className="px-4 py-2 text-sm font-medium"
                  style={{
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Buang
                </button>
                <button
                  type="button"
                  onClick={() => applyDraft(pendingDraft)}
                  className="px-4 py-2 text-sm font-bold"
                  style={{
                    borderRadius: 10,
                    background: "var(--color-lime)",
                    color: "#0A0A0A",
                  }}
                >
                  Lanjutkan draft
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ── Main content ── */}
        <main className="relative z-10">
          {step === "mode" && <ModeSelectStep onSelect={handleModeSelect} />}

          {step === "interview" && (
            <InterviewStep
              onFinished={handleInterviewFinished}
              onBack={() => {
                setIntakeMode(null);
                setStep("mode");
              }}
            />
          )}

          {step === "product-type" && (
            <ProductTypeStep
              value={productType}
              stage={stage}
              onChange={setProductType}
              onStageChange={handleStageChange}
              onNext={() => setStep("context")}
            />
          )}

          {step === "context" && productType && (
            <ContextStep
              productType={productType}
              value={contextData}
              onChange={setContextData}
              features={features}
              onFeaturesChange={setFeatures}
              onNext={() => setStep("stack")}
              onBack={() =>
                setStep(intakeMode === "dipandu" ? "mode" : "product-type")
              }
            />
          )}

          {step === "stack" && productType && (
            <StackStep
              value={presets}
              productType={productType}
              onChange={setPresets}
              onNext={() => setStep("docs")}
              onBack={() => setStep("context")}
            />
          )}

          {step === "docs" && (
            <DocumentPickerStep
              value={selectedDocs}
              stage={stage}
              plan={plan}
              perDocModelClass={perDocModelClass}
              onDocsChange={setSelectedDocs}
              onModelClassChange={setPerDocModelClass}
              onNext={() => setStep("confirm")}
              onBack={() => setStep("stack")}
            />
          )}

          {step === "confirm" && productType && (
            <ConfirmScreen
              productType={productType}
              stage={stage}
              contextSummary={buildContextSummary()}
              presets={presets}
              selectedDocs={selectedDocs}
              perDocModelClass={perDocModelClass}
              plan={plan}
              creditBalance={creditBalance}
              hasActiveSubscription={hasActiveSubscription}
              limitReached={projectLimit !== null && projectCount >= projectLimit}
              onEdit={(s) => setStep(s)}
              onGenerate={() => {
                refreshCredits();
                setStep("generating");
              }}
            />
          )}

          {step === "generating" && (
            <GenerationProgress
              idea={buildIdeaString()}
              clarifications={{}}
              presets={presets}
              plan={plan}
              modelId={selectedModelId}
              selectedDocs={selectedDocs}
              perDocModelClass={perDocModelClass}
              estimatedCredits={calcTotalCredits(
                selectedDocs,
                resolvePreviewTier(plan),
                perDocModelClass
              )}
              productType={productType ?? undefined}
              projectStage={stage ?? undefined}
              features={features}
              onProjectCreated={setProjectId}
              onComplete={(files) => {
                clearGenerateDraft();
                setDraftSavedAt(null);
                setGeneratedFiles(files);
                setStep("preview");
              }}
              onError={() => setStep("confirm")}
            />
          )}

          {step === "preview" && (
            <DocPreview
              projectId={projectId}
              files={generatedFiles}
              onRestart={handleReset}
            />
          )}
        </main>
      </div>
    </AppShell>
  );
}
