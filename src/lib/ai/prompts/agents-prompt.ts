import {
  buildBaseContext,
  summarizeForContext,
  GenerationInput,
  AgentToolPreset,
} from "./shared";

const AGENT_TOOL_FORMATS: Record<AgentToolPreset, { fileName: string; format: string }> = {
  cursor: {
    fileName: "cursor-rules.md",
    format: "Markdown with .cursor/rules/ instruction format",
  },
  "claude-code": {
    fileName: "CLAUDE.md",
    format: "Claude Code standard format with directives",
  },
  windsurf: {
    fileName: ".windsurfrules",
    format: "Windsurf rules format",
  },
  cline: {
    fileName: ".clinerules",
    format: "Cline rules format",
  },
  opencode: {
    fileName: "opencode-rules.md",
    format: "Generic markdown rules",
  },
};

export function buildAgentsPrompt(
  input: GenerationInput,
  contextMd: string,
  prdMd: string
): string {
  const base = buildBaseContext(input);
  const toolConfig = AGENT_TOOL_FORMATS[input.presets.agentTool];
  const contextSummary = summarizeForContext(contextMd, 400);
  const prdSummary = summarizeForContext(prdMd, 300);

  return `You are a senior developer who is an expert at configuring AI coding agents for maximum productivity.

Generate an **agents.md** file that defines AI agent roles and coding rules, optimized for the "${input.presets.agentTool}" tool.

${base}

Target Tool: ${input.presets.agentTool} (output format: ${toolConfig.format})

<previous_docs>
${contextSummary}
---
${prdSummary}
</previous_docs>

---

Generate with these sections:

## Part 1: AI Agent Roles
1. **Product Manager Agent** — validates scope, manages PRD, writes user stories. Include trigger and prompt starter.
2. **Architect Agent** — technical decisions, API design, DB schema. Include trigger and prompt starter.
3. **UI/UX Agent** — component creation, design consistency. Include trigger and prompt starter.
4. **Code Reviewer Agent** — reviews AI-generated code. Include trigger and prompt starter.
5. **QA Agent** — test cases, validation. Include trigger and prompt starter.
6. **Documentation Agent** — keeps docs updated. Include trigger and prompt starter.

## Part 2: Coding Rules for ${input.presets.agentTool}
7. **General Rules** — naming conventions, file structure, import ordering
8. **Framework-Specific Rules** — rules specific to ${input.presets.framework}
9. **Error Handling** — patterns for error handling in this stack
10. **Security Rules** — env vars, input validation, auth patterns
11. **Performance Rules** — lazy loading, caching, optimization patterns

## Part 3: Workflow
12. **Agent Workflow** — recommended order of agent usage in a sprint
13. **Context Loading Protocol** — which files to load in which order

Rules:
- Output only valid Markdown.
- Prompt starters must be copy-pasteable.
- Rules must be specific to the chosen framework and tool.
- Include code examples where helpful.`;
}
