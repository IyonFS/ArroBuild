import type { GenerationInput } from "./shared";

function mapPriority(priority?: string): string {
  if (priority === "must-have") return "P0";
  if (priority === "nice-to-have") return "P1";
  return "P2";
}

export function buildPrdYamlMetadata(
  input: GenerationInput,
  projectId = "pending"
): string {
  const features = input.features ?? [];
  const featureLines =
    features.length > 0
      ? features
          .map(
            (f) =>
              `  - id: ${f.id}\n    name: "${f.title.replace(/"/g, '\\"')}"\n    priority: ${mapPriority(f.priority)}`
          )
          .join("\n")
      : `  - id: FEAT-001\n    name: "Core feature"\n    priority: P0`;

  return `\`\`\`yaml
---
project_id: "${projectId}"
product_type: "${input.productType ?? "saas"}"
stage: "${input.projectStage ?? "idea"}"
generated_at: "${new Date().toISOString()}"
features:
${featureLines}
---
\`\`\``;
}

export function buildFeatIdContextBlock(input: GenerationInput): string {
  const features = input.features ?? [];
  if (features.length === 0) return "";
  const lines = features.map(
    (f) =>
      `- ${f.id}: ${f.title} (${mapPriority(f.priority)})${f.description ? ` — ${f.description}` : ""}`
  );
  return `=== FEAT-ID REGISTRY (from user form — do NOT rename IDs) ===\n${lines.join("\n")}`;
}
