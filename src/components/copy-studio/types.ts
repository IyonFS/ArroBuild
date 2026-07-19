import {
  estimateCopyStudioCredits,
  type CopyStudioMode,
  type ScratchSubMode,
} from "@/lib/config/copy-studio-prompt";
import type { CopyStudioTemplateId } from "@/lib/config/copy-studio-templates";
import type { CopyDiscussFields, CopyDiscussMessage } from "@/lib/ai/copy-discuss";

export type WizardStep = 1 | 2 | 3 | "result";

export interface ScreenshotSection {
  id: string;
  label: string;
  /** data:image/...;base64,... */
  dataUrl: string;
  fileName: string;
}

export interface CopyStudioFormState {
  mode: CopyStudioMode | null;
  scratchSubMode: ScratchSubMode | null;
  templateId: CopyStudioTemplateId | null;
  productName: string;
  targetUser: string;
  mainValue: string;
  notes: string;
  screenshots: ScreenshotSection[];
  discussMessages: CopyDiscussMessage[];
  discussFields: CopyDiscussFields;
  discussTurnCount: number;
  discussComplete: boolean;
  output: string;
}

export const INITIAL_COPY_STATE: CopyStudioFormState = {
  mode: null,
  scratchSubMode: null,
  templateId: null,
  productName: "",
  targetUser: "",
  mainValue: "",
  notes: "",
  screenshots: [],
  discussMessages: [],
  discussFields: {},
  discussTurnCount: 0,
  discussComplete: false,
  output: "",
};

export function estimateCredits(state: CopyStudioFormState): number {
  if (!state.mode) return 0;
  return estimateCopyStudioCredits({
    mode: state.mode,
    scratchSubMode: state.scratchSubMode,
    sectionCount: state.screenshots.length || 1,
  });
}

export function buildRunPayload(state: CopyStudioFormState): {
  input: Record<string, string>;
  images?: { sectionLabel: string; dataUrl: string }[];
} {
  const input: Record<string, string> = {
    mode: state.mode ?? "scratch",
    scratchSubMode: state.scratchSubMode ?? "template",
    templateId: state.templateId ?? "saas-launch",
    productName: state.productName,
    targetUser: state.targetUser,
    mainValue: state.mainValue,
    notes: state.notes,
    sectionCount: String(Math.max(1, state.screenshots.length)),
  };

  if (state.mode === "scratch" && state.scratchSubMode === "discussion") {
    const f = state.discussFields;
    input.productName = f.productName || state.productName;
    input.targetUser = f.targetUser || state.targetUser;
    input.mainValue = f.mainValue || state.mainValue;
    input.discussionBrief = [
      summarizeDiscuss(f),
      state.discussMessages
        .slice(-4)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (state.mode === "screenshot") {
    return {
      input,
      images: state.screenshots.map((s) => ({
        sectionLabel: s.label,
        dataUrl: s.dataUrl,
      })),
    };
  }

  return { input };
}

function summarizeDiscuss(f: CopyDiscussFields): string {
  return [
    f.productName && `Nama: ${f.productName}`,
    f.targetUser && `Target: ${f.targetUser}`,
    f.mainValue && `Value: ${f.mainValue}`,
    f.tone && `Tone: ${f.tone}`,
    f.sectionsHint && `Sections: ${f.sectionsHint}`,
    f.notes && `Notes: ${f.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function canProceedFromStep2(state: CopyStudioFormState): boolean {
  if (state.mode === "screenshot") {
    return state.screenshots.length > 0;
  }
  if (state.mode === "scratch" && state.scratchSubMode === "discussion") {
    return (
      state.discussComplete ||
      Boolean(
        state.discussFields.productName &&
          state.discussFields.targetUser &&
          state.discussFields.mainValue
      )
    );
  }
  if (state.mode === "scratch" && state.scratchSubMode === "template") {
    return Boolean(
      state.templateId &&
        state.productName.trim() &&
        state.targetUser.trim() &&
        state.mainValue.trim()
    );
  }
  return false;
}
