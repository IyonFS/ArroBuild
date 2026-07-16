import type { ReadmeCategory, ReadmeTemplateId } from "@/lib/config/readme-templates";

export type InputMode = "project" | "repo" | "manual";

export type WizardStep = 1 | 2 | 3 | 4 | "result";

export interface ManualFields {
  projectName: string;
  description: string;
  techStack: string;
  features: string;
}

export interface ReadmeFormState {
  mode: InputMode | null;
  projectId: string | null;
  projectName: string;
  architecture: string;
  prd: string;
  repoUrl: string;
  confirmedTechStack: string;
  existingReadme: string | null;
  useOldReadme: boolean | null;
  manual: ManualFields;
  category: ReadmeCategory | null;
  templateId: ReadmeTemplateId | null;
  output: string;
}

export const INITIAL_README_STATE: ReadmeFormState = {
  mode: null,
  projectId: null,
  projectName: "",
  architecture: "",
  prd: "",
  repoUrl: "",
  confirmedTechStack: "",
  existingReadme: null,
  useOldReadme: null,
  manual: {
    projectName: "",
    description: "",
    techStack: "",
    features: "",
  },
  category: null,
  templateId: null,
  output: "",
};

export interface ProjectSummary {
  id: string;
  idea: string;
  status: string;
  createdAt: string;
  _count?: { files: number };
}

export function buildRunInput(state: ReadmeFormState): Record<string, string> {
  const base = {
    mode: state.mode ?? "manual",
    category: state.category ?? "repository",
    templateId: state.templateId ?? "minimal",
    useOldReadme: state.useOldReadme ? "true" : "false",
    oldReadme: state.existingReadme ?? "",
  };

  if (state.mode === "project") {
    return {
      ...base,
      projectName: state.projectName,
      description: state.prd.slice(0, 500),
      techStack: extractTechFromArchitecture(state.architecture),
      features: extractFeaturesFromPrd(state.prd),
      architecture: state.architecture,
      prd: state.prd,
    };
  }

  if (state.mode === "repo") {
    return {
      ...base,
      projectName: state.manual.projectName || state.projectName,
      description: state.manual.description,
      techStack: state.confirmedTechStack,
      features: state.manual.features,
    };
  }

  return {
    ...base,
    projectName: state.manual.projectName,
    description: state.manual.description,
    techStack: state.manual.techStack,
    features: state.manual.features,
  };
}

function extractTechFromArchitecture(arch: string): string {
  const lines = arch.split("\n").filter((l) => /stack|tech|framework|database|language/i.test(l));
  return lines.slice(0, 8).join("\n") || arch.slice(0, 400);
}

function extractFeaturesFromPrd(prd: string): string {
  const featureSection = prd.match(/(?:##?\s*fitur|features?)[\s\S]{0,1500}/i);
  return featureSection?.[0]?.slice(0, 800) ?? prd.slice(0, 500);
}
