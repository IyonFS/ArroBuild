import type { StackAdvisorMode } from "@/lib/config/stack-advisor-prompt";
import type { StackDiscussFields, StackDiscussMessage } from "@/lib/ai/stack-discuss";
import type { AdvisorParsedResult } from "@/lib/config/stack-advisor-prompt";
import { estimateStackAdvisorCredits } from "@/lib/config/stack-advisor-prompt";
import type { StackPackage } from "@/lib/config/stack-advisor-kb";
import { getStackPackage } from "@/lib/config/stack-advisor-kb";

export type WizardStep = 1 | 2 | 3 | "result";

export interface EnrichedPackage {
  pick: {
    packageId: string;
    whyPicked: string[];
    watchOuts: string[];
  };
  pkg: StackPackage;
}

export interface StackAdvisorFormState {
  mode: StackAdvisorMode | null;
  productType: string;
  stage: string;
  priority: string;
  budgetNote: string;
  notes: string;
  discussMessages: StackDiscussMessage[];
  discussFields: StackDiscussFields;
  discussTurnCount: number;
  discussComplete: boolean;
  rawOutput: string;
  parsed: AdvisorParsedResult | null;
  enriched: EnrichedPackage[];
  selectedPackageId: string | null;
}

export const INITIAL_STACK_STATE: StackAdvisorFormState = {
  mode: null,
  productType: "",
  stage: "idea",
  priority: "",
  budgetNote: "",
  notes: "",
  discussMessages: [],
  discussFields: {},
  discussTurnCount: 0,
  discussComplete: false,
  rawOutput: "",
  parsed: null,
  enriched: [],
  selectedPackageId: null,
};

export function estimateCredits(state: StackAdvisorFormState): number {
  if (!state.mode) return 0;
  return estimateStackAdvisorCredits(state.mode);
}

export function buildRunInput(state: StackAdvisorFormState): Record<string, string> {
  if (state.mode === "diskusi") {
    const f = state.discussFields;
    return {
      mode: "diskusi",
      productType: f.productType || state.productType,
      stage: f.stage || state.stage,
      priority: f.priority || state.priority,
      budgetNote: f.budgetNote || state.budgetNote,
      notes: f.notes || state.notes,
      discussionBrief: [
        f.targetUser && `Target: ${f.targetUser}`,
        f.mainProblem && `Problem: ${f.mainProblem}`,
        f.notes && `Notes: ${f.notes}`,
        state.discussMessages
          .slice(-4)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n"),
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }

  return {
    mode: "cepat",
    productType: state.productType,
    stage: state.stage,
    priority: state.priority,
    budgetNote: state.budgetNote,
    notes: state.notes,
  };
}

export function enrichFromParsed(parsed: AdvisorParsedResult | null): EnrichedPackage[] {
  if (!parsed || parsed.status !== "ok") return [];
  const out: EnrichedPackage[] = [];
  for (const pick of parsed.packages) {
    const pkg = getStackPackage(pick.packageId);
    if (!pkg) continue;
    out.push({
      pick: {
        packageId: pick.packageId,
        whyPicked: pick.whyPicked.length ? pick.whyPicked : pkg.why.slice(0, 2).map((w) => `Dipilih karena: ${w}`),
        watchOuts: pick.watchOuts.length ? pick.watchOuts : pkg.tradeoffs.slice(0, 2),
      },
      pkg,
    });
  }
  return out;
}

export function canProceedFromStep2(state: StackAdvisorFormState): boolean {
  if (state.mode === "diskusi") {
    return (
      state.discussComplete ||
      Boolean(
        state.discussFields.productType &&
          state.discussFields.priority &&
          (state.discussFields.mainProblem ||
            state.discussFields.targetUser ||
            state.discussFields.notes)
      )
    );
  }
  return Boolean(state.productType && state.priority);
}
