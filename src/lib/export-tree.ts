import {
  DOCUMENT_DEFINITIONS,
  normalizeDocumentKey,
  type DocumentFileKey,
} from "@/lib/config/documents";

export interface ExportTreeNode {
  name: string;
  kind: "folder" | "file";
  children?: ExportTreeNode[];
}

interface ExportFile {
  fileName: string;
  fileKey?: string;
}

function agentExtraFiles(agentTool?: string): string[] {
  switch (agentTool) {
    case "cursor":
      return [".cursorrules"];
    case "claude-code":
      return ["CLAUDE.md"];
    case "windsurf":
      return [".windsurfrules"];
    case "cline":
      return [".clinerules"];
    default:
      return ["README.md"];
  }
}

export function buildExportTree(
  files: ExportFile[],
  options?: { agentTool?: string; folderName?: string }
): ExportTreeNode {
  const folderName = options?.folderName ?? "arrobuild-export";
  const docFiles = files.map((f) => f.fileName);
  const extras = agentExtraFiles(options?.agentTool);
  const allNames = [...new Set([...docFiles, ...extras, "README.md"])];

  return {
    name: folderName,
    kind: "folder",
    children: allNames.sort().map((name) => ({
      name,
      kind: "file" as const,
    })),
  };
}

export function renderExportTreeAscii(node: ExportTreeNode, indent = ""): string {
  if (node.kind === "file") return `${indent}${node.name}`;
  const lines = [`${indent}${node.name}/`];
  const children = node.children ?? [];
  children.forEach((child, i) => {
    const isLast = i === children.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const childIndent = indent + (isLast ? "    " : "│   ");
    if (child.kind === "file") {
      lines.push(`${indent}${branch}${child.name}`);
    } else {
      lines.push(`${indent}${branch}${child.name}/`);
      const nested = renderExportTreeAscii(child, childIndent);
      lines.push(nested);
    }
  });
  return lines.join("\n");
}

export function fileKeyFromGenerated(fileName: string): DocumentFileKey | null {
  for (const def of Object.values(DOCUMENT_DEFINITIONS)) {
    if (def.fileName === fileName) return def.key;
  }
  return normalizeDocumentKey(fileName.replace(/\.md$/, ""));
}
