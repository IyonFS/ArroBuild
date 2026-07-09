import type {
  ContextData,
  Feature,
  FileKey,
  PerDocumentModelClass,
  Presets,
  ProductType,
  ProjectStage,
} from "@/components/generate/types";
import type { IntakeMode } from "@/components/generate/ModeSelectStep";

export const GENERATE_DRAFT_KEY = "arrobuild_generate_draft_v1";
export const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface GenerateDraft {
  version: 1;
  savedAt: number;
  step?: string;
  intakeMode?: IntakeMode | null;
  productType?: ProductType | null;
  stage?: ProjectStage | null;
  contextData?: ContextData;
  features?: Feature[];
  presets?: Presets;
  selectedDocs?: FileKey[];
  selectedModelId?: string;
  perDocModelClass?: PerDocumentModelClass;
}

export function readGenerateDraft(): GenerateDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GENERATE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GenerateDraft;
    if (!parsed || parsed.version !== 1 || typeof parsed.savedAt !== "number") {
      return null;
    }
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(GENERATE_DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeGenerateDraft(draft: Omit<GenerateDraft, "version" | "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: GenerateDraft = {
      ...draft,
      version: 1,
      savedAt: Date.now(),
    };
    localStorage.setItem(GENERATE_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function clearGenerateDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GENERATE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function draftHasContent(draft: GenerateDraft): boolean {
  return Boolean(
    draft.productType ||
      draft.stage ||
      (draft.features && draft.features.length > 0) ||
      (draft.contextData &&
        Object.values(draft.contextData).some(
          (v) => typeof v === "string" && v.trim().length > 0
        ))
  );
}
