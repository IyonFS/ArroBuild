/**
 * ArroDesign UI — State Types
 */

export type ArroDesignWizardStep = 1 | 2 | 3 | "result";
export type ArroDesignInputType = "image" | "url";
export type ArroDesignMode = "fresh" | "project";
export type ArroDesignProgressStep =
  | "init"
  | "fetching"
  | "searching"
  | "analyzing"
  | "generating"
  | "done"
  | "error";

export interface ArroDesignProgressEvent {
  step: ArroDesignProgressStep;
  message: string;
}

export interface ArroDesignResultData {
  designMd: string;
  stitchPrompt: string;
  rawOutput: string;
  inputType: ArroDesignInputType;
  creditsUsed: number;
  balanceAfter: number;
  tavilyConfigured: boolean;
}

export interface ArroDesignFormState {
  // Step 1 — Input
  inputType: ArroDesignInputType;
  referenceUrl: string;
  imageDataUrl: string;
  imageFileName: string;

  // Step 2 — Context
  mode: ArroDesignMode;
  projectContext: string;

  // Step 3 / Result
  result: ArroDesignResultData | null;
  progressSteps: ArroDesignProgressEvent[];
  showInferred: boolean;
  activeTab: "design" | "stitch";
}

export const INITIAL_ARRODESIGN_STATE: ArroDesignFormState = {
  inputType: "url",
  referenceUrl: "",
  imageDataUrl: "",
  imageFileName: "",
  mode: "fresh",
  projectContext: "",
  result: null,
  progressSteps: [],
  showInferred: true,
  activeTab: "design",
};

export const PROGRESS_LABELS: Record<ArroDesignProgressStep, string> = {
  init: "Menyiapkan...",
  fetching: "Mengambil halaman referensi...",
  searching: "Mencari konteks eksternal...",
  analyzing: "Analysis Engine membaca referensi...",
  generating: "Menyusun design.md...",
  done: "Selesai!",
  error: "Terjadi error",
};

export function getProgressPercent(step: ArroDesignProgressStep): number {
  const map: Record<ArroDesignProgressStep, number> = {
    init: 5,
    fetching: 20,
    searching: 40,
    analyzing: 60,
    generating: 80,
    done: 100,
    error: 0,
  };
  return map[step];
}
