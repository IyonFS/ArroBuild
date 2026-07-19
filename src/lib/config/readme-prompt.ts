import { getTemplateById, type ReadmeTemplateId } from "./readme-templates";

const README_GENERATOR_SYSTEM = `You are an expert technical writer creating professional README.md files for developers.
Follow the template style guide exactly.
Output ONLY valid markdown for the README — no preamble, no explanation outside the README.
Use the same language as the project description (Indonesian or English).
Do not invent features, tech stack items, or project details not mentioned in the source data.
If information is missing, use sensible placeholders marked with [TODO] rather than fabricating specifics.`;

export interface ReadmePromptInput {
  mode: "project" | "repo" | "manual";
  category: "repository" | "profile";
  templateId: ReadmeTemplateId;
  projectName: string;
  description?: string;
  techStack?: string;
  features?: string;
  architecture?: string;
  prd?: string;
  useOldReadme?: string;
  oldReadme?: string;
}

export function buildReadmePrompt(input: ReadmePromptInput): string {
  const template = getTemplateById(input.templateId);
  const styleGuide = template?.styleGuide ?? "Standard professional README.";

  const sections: string[] = [
    README_GENERATOR_SYSTEM,
    "",
    `## Template Style`,
    styleGuide,
    "",
    `## Category`,
    input.category === "profile" ? "GitHub Profile README" : "Repository README",
    "",
    `## Project Name`,
    input.projectName || "Untitled Project",
  ];

  if (input.description?.trim()) {
    sections.push("", "## Description", input.description.trim());
  }

  if (input.techStack?.trim()) {
    sections.push("", "## Tech Stack (confirmed by user)", input.techStack.trim());
  }

  if (input.features?.trim()) {
    sections.push("", "## Key Features", input.features.trim());
  }

  if (input.mode === "project") {
    if (input.prd?.trim()) {
      sections.push("", "## PRD (source of truth for features)", input.prd.trim());
    }
    if (input.architecture?.trim()) {
      sections.push("", "## Architecture (source of truth for stack & structure)", input.architecture.trim());
    }
  }

  if (input.useOldReadme === "true" && input.oldReadme?.trim()) {
    sections.push(
      "",
      "## Existing README (use as style reference — preserve tone where appropriate)",
      input.oldReadme.trim()
    );
  }

  sections.push("", "Generate the complete README.md now:");

  return sections.join("\n");
}

export function readmeInputToRecord(input: ReadmePromptInput): Record<string, string> {
  return {
    mode: input.mode,
    category: input.category,
    templateId: input.templateId,
    projectName: input.projectName,
    description: input.description ?? "",
    techStack: input.techStack ?? "",
    features: input.features ?? "",
    architecture: input.architecture ?? "",
    prd: input.prd ?? "",
    useOldReadme: input.useOldReadme ?? "false",
    oldReadme: input.oldReadme ?? "",
  };
}

export function recordToReadmeInput(input: Record<string, string>): ReadmePromptInput {
  return {
    mode: (input.mode as ReadmePromptInput["mode"]) || "manual",
    category: (input.category as ReadmePromptInput["category"]) || "repository",
    templateId: (input.templateId as ReadmeTemplateId) || "minimal",
    projectName: input.projectName ?? "",
    description: input.description,
    techStack: input.techStack,
    features: input.features,
    architecture: input.architecture,
    prd: input.prd,
    useOldReadme: input.useOldReadme,
    oldReadme: input.oldReadme,
  };
}
