const fs = require("fs");
const path = require("path");

const filesToProcess = [
  "src/lib/ai/tier-enforcer.ts",
  "src/lib/ai/prompts/architecture.ts",
  "src/lib/ai/prompts/prd.ts",
  "src/lib/ai/prompts/agents-prompt.ts",
  "src/lib/ai/prompts/design-system.ts",
  "src/lib/ai/orchestrator.ts",
  "src/components/dashboard/UpgradePlanPicker.tsx",
];

for (const relPath of filesToProcess) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, "utf-8");

  // EXACT replacements to avoid partial word matches
  const replacements = [
    [/STARTER:/g, 'BASE:'],
    [/PRO:/g, 'CORE:'],
    [/PRO_MAX:/g, 'PRIME:'],
    
    [/starter:/g, 'base:'],
    [/\bpro:/g, 'core:'],
    [/pro_max:/g, 'prime:'],
    
    [/"STARTER"/g, '"BASE"'],
    [/"PRO"/g, '"CORE"'],
    [/"PRO_MAX"/g, '"PRIME"'],
    
    [/"starter"/g, '"base"'],
    [/"pro"/g, '"core"'],
    [/"pro_max"/g, '"prime"'],

    [/'starter'/g, "'base'"],
    [/'pro'/g, "'core'"],
    [/'pro_max'/g, "'prime'"],
    
    [/\.STARTER/g, '.BASE'],
    [/\.PRO/g, '.CORE'],
    [/\.PRO_MAX/g, '.PRIME'],

    [/\.starter\b/g, '.base'],
    [/\.pro\b/g, '.core'],
    [/\.pro_max\b/g, '.prime'],
  ];

  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }

  fs.writeFileSync(fullPath, content);
  console.log("Safely updated", relPath);
}
