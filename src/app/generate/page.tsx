"use client";

import { useState, useEffect } from "react";
import ProductTypeStep from "@/components/generate/ProductTypeStep";
import ContextStep from "@/components/generate/ContextStep";
import StackStep from "@/components/generate/StackStep";
import DocumentPickerStep from "@/components/generate/DocumentPickerStep";
import ConfirmScreen from "@/components/generate/ConfirmScreen";
import GenerationProgress from "@/components/generate/GenerationProgress";
import DocPreview from "@/components/generate/DocPreview";
import type {
  ProductType,
  ProjectStage,
  ContextData,
  Presets,
  GeneratedFiles,
  UserTier,
  FileKey,
} from "@/components/generate/types";
import { getModelsForTier, STAGE_PRESETS } from "@/components/generate/types";
import AppShell from "@/components/layout/AppShell";

type Step =
  | "product-type"
  | "context"
  | "stack"
  | "docs"
  | "confirm"
  | "generating"
  | "preview";

const FLOW_STEPS: Step[] = [
  "product-type",
  "context",
  "stack",
  "docs",
  "confirm",
  "generating",
  "preview",
];

const STEP_LABELS = ["Tipe", "Cerita", "Stack", "Dokumen"];

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("product-type");

  // Step 1
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [stage, setStage] = useState<ProjectStage | null>(null);

  // Step 2
  const [contextData, setContextData] = useState<ContextData>({});

  // Step 3
  const [presets, setPresets] = useState<Presets>({
    framework: "nextjs",
    design: "neo-brutalist",
    agentTool: "cursor",
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
  const [tier, setTier] = useState<UserTier>("free");

  // Output
  const [projectId, setProjectId] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles>({});

  // Limits
  const [projectCount, setProjectCount] = useState<number>(0);
  const [projectLimit, setProjectLimit] = useState<number | null>(null);

  useEffect(() => {
    // Fetch user tier and models
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data: { tier?: UserTier; projectCount?: number; projectLimit?: number | null }) => {
        const userTier = data.tier ?? "free";
        setTier(userTier);
        setProjectCount(data.projectCount ?? 0);
        setProjectLimit(data.projectLimit ?? null);
        
        const models = getModelsForTier(userTier);
        if (!models.some((m) => m.id === selectedModelId)) {
          setSelectedModelId(models[0]?.id ?? "gemini-2.5-flash");
        }
      })
      .catch(() => {});

    // Check for fork data
    const forkIdea = sessionStorage.getItem("arrobuild_fork_idea");
    const forkPresets = sessionStorage.getItem("arrobuild_fork_presets");
    if (forkIdea) {
      try {
        if (forkIdea.startsWith("{")) {
          const parsed = JSON.parse(forkIdea);
          setProductType(parsed.type);
          setContextData(parsed.data || {});
        } else {
          setProductType("saas");
          setContextData({ freeText: forkIdea });
        }
      } catch (e) {}
      sessionStorage.removeItem("arrobuild_fork_idea");
    }
    if (forkPresets) {
      try {
        setPresets(JSON.parse(forkPresets));
      } catch (e) {}
      sessionStorage.removeItem("arrobuild_fork_presets");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When stage changes, auto-apply smart preset for docs
  const handleStageChange = (s: ProjectStage) => {
    setStage(s);
    setSelectedDocs([...STAGE_PRESETS[s]]);
  };

  // Step index for the 4-step indicator (exclude confirm/generating/preview)
  const stepIndex = ["product-type", "context", "stack", "docs"].indexOf(step);

  // Build idea string from contextData + productType
  const buildIdeaString = (): string => {
    const parts: string[] = [];
    if (productType) parts.push(`Product type: ${productType}`);
    if (stage) parts.push(`Project stage: ${stage}`);
    if (contextData.targetUser) parts.push(`Target user: ${contextData.targetUser}`);
    if (contextData.mainProblem) parts.push(`Main problem: ${contextData.mainProblem}`);
    if (contextData.coreFeatures) parts.push(`Core features: ${contextData.coreFeatures}`);
    if (contextData.pricingModel) parts.push(`Pricing model: ${contextData.pricingModel}`);
    if (contextData.buyerDesc) parts.push(`Buyer: ${contextData.buyerDesc}`);
    if (contextData.sellerDesc) parts.push(`Seller: ${contextData.sellerDesc}`);
    if (contextData.transactionType) parts.push(`Transaction type: ${contextData.transactionType}`);
    if (contextData.marketplaceSides) parts.push(`Marketplace sides: ${contextData.marketplaceSides}`);
    if (contextData.category) parts.push(`Category: ${contextData.category}`);
    if (contextData.platforms) parts.push(`Platforms: ${contextData.platforms}`);
    if (contextData.nativeFeatures) parts.push(`Native features: ${contextData.nativeFeatures}`);
    if (contextData.targetDev) parts.push(`Target developer: ${contextData.targetDev}`);
    if (contextData.authMethod) parts.push(`Auth method: ${contextData.authMethod}`);
    if (contextData.inputOutput) parts.push(`Input/Output: ${contextData.inputOutput}`);
    if (contextData.deploymentTarget) parts.push(`Deployment target: ${contextData.deploymentTarget}`);
    if (contextData.stackHighlight) parts.push(`Stack highlight: ${contextData.stackHighlight}`);
    if (contextData.audienceType) parts.push(`Audience type: ${contextData.audienceType}`);
    if (contextData.caseStudy) parts.push(`Case study: ${contextData.caseStudy}`);
    if (contextData.teamSize) parts.push(`Team size: ${contextData.teamSize}`);
    if (contextData.replacesTool) parts.push(`Replaces tool: ${contextData.replacesTool}`);
    if (contextData.integrations) parts.push(`Integrations: ${contextData.integrations}`);
    if (contextData.aiUseCase) parts.push(`AI use case: ${contextData.aiUseCase}`);
    if (contextData.aiModel) parts.push(`AI model planned: ${contextData.aiModel}`);
    if (contextData.productType) parts.push(`Product type sold: ${contextData.productType}`);
    if (contextData.productName) parts.push(`Product name: ${contextData.productName}`);
    if (contextData.referenceProducts) parts.push(`Reference products: ${contextData.referenceProducts}`);
    if (contextData.antiFeatures) parts.push(`Explicitly avoid: ${contextData.antiFeatures}`);
    if (contextData.launchTimeline) parts.push(`Launch timeline: ${contextData.launchTimeline}`);
    if (contextData.freeText) parts.push(`Additional context: ${contextData.freeText}`);
    return parts.join("\n");
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
    setPresets({ framework: "nextjs", design: "neo-brutalist", agentTool: "cursor" });
    setSelectedDocs(["prd", "context", "plan", "design-system", "agents"]);
    setSelectedModelId("gemini-2.5-flash");
    setProjectId(null);
    setGeneratedFiles({});
    setStep("product-type");
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
            background: "var(--color-bg-base)",
          }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <a
              href="/"
              className="flex items-center gap-2 font-mono text-xs flex-shrink-0"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <svg
                width="13"
                height="13"
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
              <span className="hidden sm:inline">ArroBuild</span>
            </a>

            {/* Step indicator — only during form steps */}
            {showStepIndicator && (
              <div className="flex items-center gap-1 flex-1 justify-center">
                {STEP_LABELS.map((label, i) => {
                  const isCompleted = i < stepIndex;
                  const isActive = i === stepIndex;
                  const summary = stepSummaries[
                    ["product-type", "context", "stack", "docs"][i]
                  ];
                  const stepName = ["product-type", "context", "stack", "docs"][
                    i
                  ] as Step;

                  return (
                    <div key={label} className="flex items-center gap-1">
                      <button
                        onClick={() => isCompleted && setStep(stepName)}
                        className="flex items-center gap-1.5 transition-all"
                        style={{
                          cursor: isCompleted ? "pointer" : "default",
                        }}
                        disabled={!isCompleted}
                      >
                        {/* Step dot */}
                        <div
                          className="flex items-center justify-center transition-all"
                          style={{
                            width: isActive ? 22 : 18,
                            height: isActive ? 22 : 18,
                            borderRadius: isActive ? 6 : "50%",
                            background: isCompleted
                              ? "rgba(204,255,0,0.12)"
                              : isActive
                              ? "var(--color-bg-elevated)"
                              : "transparent",
                            border: isCompleted
                              ? "0.5px solid rgba(204,255,0,0.4)"
                              : isActive
                              ? "0.5px solid var(--color-text-tertiary)"
                              : "0.5px solid var(--color-border-default)",
                          }}
                        >
                          {isCompleted ? (
                            <svg
                              width="7"
                              height="7"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="var(--color-lime)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <span
                              className="font-mono"
                              style={{
                                fontSize: 9,
                                color: isActive
                                  ? "var(--color-text-primary)"
                                  : "var(--color-text-tertiary)",
                              }}
                            >
                              {i + 1}
                            </span>
                          )}
                        </div>

                        {/* Label + summary */}
                        <div className="hidden sm:flex flex-col items-start">
                          <span
                            className="font-mono text-[10px] leading-none"
                            style={{
                              color: isActive
                                ? "var(--color-text-primary)"
                                : isCompleted
                                ? "var(--color-lime)"
                                : "var(--color-text-tertiary)",
                              fontWeight: isActive ? 700 : 500,
                            }}
                          >
                            {label}
                          </span>
                          {isCompleted && summary && (
                            <span
                              className="font-mono text-[9px] leading-none mt-0.5 max-w-[60px] truncate"
                              style={{ color: "var(--color-text-tertiary)" }}
                            >
                              {summary}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Connector */}
                      {i < 3 && (
                        <div
                          className="w-6 sm:w-8 h-px"
                          style={{
                            background:
                              i < stepIndex
                                ? "rgba(204,255,0,0.3)"
                                : "var(--color-border-default)",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Confirm/Generate status */}
            {step === "confirm" && (
              <span
                className="font-mono text-xs flex-1 text-center"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Review pilihan
              </span>
            )}
            {step === "generating" && (
              <span
                className="font-mono text-xs flex-1 text-center"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Generating...
              </span>
            )}
            {step === "preview" && (
              <span
                className="font-mono text-xs flex-1 text-center"
                style={{ color: "var(--color-lime)" }}
              >
                ✦ Docs siap!
              </span>
            )}

            {/* Progress % for form steps */}
            {showStepIndicator && (
              <span
                className="font-mono text-[10px] flex-shrink-0"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {Math.round(((stepIndex + 1) / 4) * 100)}%
              </span>
            )}
          </div>

          {/* Thin progress bar at bottom of header */}
          {showStepIndicator && (
            <div
              className="h-0.5"
              style={{ background: "var(--color-border-default)" }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${((stepIndex + 1) / 4) * 100}%`,
                  background: "var(--color-lime)",
                }}
              />
            </div>
          )}
        </header>

        {/* ── Main content ── */}
        <main className="relative z-10">
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
              onNext={() => setStep("stack")}
              onBack={() => setStep("product-type")}
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
              selectedModelId={selectedModelId}
              tier={tier}
              onDocsChange={setSelectedDocs}
              onModelChange={setSelectedModelId}
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
              selectedModelId={selectedModelId}
              limitReached={projectLimit !== null && projectCount >= projectLimit}
              onEdit={(s) => setStep(s)}
              onGenerate={() => setStep("generating")}
            />
          )}

          {step === "generating" && (
            <GenerationProgress
              idea={buildIdeaString()}
              clarifications={{}}
              presets={presets}
              tier={tier}
              modelId={selectedModelId}
              selectedDocs={selectedDocs}
              onProjectCreated={setProjectId}
              onComplete={(files) => {
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
