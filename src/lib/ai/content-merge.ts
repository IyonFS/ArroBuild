/**

 * Merge, dedupe, and normalize LLM document output.

 */



const MAIN_HEADING = /^#\s+Product Requirements Document\s*$/gim;

const MAIN_HEADING_ONCE = /^#\s+Product Requirements Document\s*$/im;

const YAML_FENCE = /```yaml[\s\S]*?```/gi;

const RAW_YAML_START = /^---\s*\nproject_id:\s*["']/im;



export function stripOuterCodeFences(content: string): string {

  let text = content.trim();

  if (text.startsWith("```markdown") || text.startsWith("```md")) {

    text = text

      .replace(/^```(?:markdown|md)\s*\n?/, "")

      .replace(/\n?```\s*$/, "")

      .trim();

  }

  return text;

}



function countHeadings(text: string): number {

  return (text.match(/^#{1,3}\s+.+/gm) ?? []).length;

}



function scoreDocumentHalf(text: string): number {

  const trimmed = text.trim();

  if (!trimmed) return 0;



  let score = trimmed.length;

  score += countHeadings(trimmed) * 250;

  if (/```yaml/i.test(trimmed) || RAW_YAML_START.test(trimmed)) score += 600;

  if (MAIN_HEADING_ONCE.test(trimmed)) score += 400;



  const lastChar = trimmed.at(-1) ?? "";

  if (!".!?*`)]}>\"'".includes(lastChar) && !trimmed.endsWith("---")) {

    score -= 500;

  }



  return score;

}



/** Index where a second copy of the document starts (YAML block or main H1). */

export function findDuplicateSplitPoint(content: string): number | null {

  const h1Matches = [...content.matchAll(MAIN_HEADING)];

  if (h1Matches.length > 1 && h1Matches[1].index != null && h1Matches[1].index > 400) {

    return h1Matches[1].index;

  }



  const yamlMatches = [...content.matchAll(YAML_FENCE)];

  if (yamlMatches.length > 1 && yamlMatches[1].index != null && yamlMatches[1].index > 200) {

    return yamlMatches[1].index;

  }



  const projectIdMatches = [...content.matchAll(/^project_id:\s*["']/gim)];

  if (projectIdMatches.length > 1 && projectIdMatches[1].index != null && projectIdMatches[1].index > 200) {

    const idx = projectIdMatches[1].index;

    const lineStart = content.lastIndexOf("\n", idx) + 1;

    const prefix = content.slice(Math.max(0, lineStart - 4), lineStart);

    if (prefix === "---\n" || prefix.endsWith("```")) {

      return lineStart > 4 && prefix === "---\n" ? lineStart - 4 : lineStart;

    }

    return lineStart;

  }



  const rawYamlMatches = [...content.matchAll(/^---\s*\nproject_id:\s*["']/gim)];

  if (rawYamlMatches.length > 1 && rawYamlMatches[1].index != null && rawYamlMatches[1].index > 200) {

    return rawYamlMatches[1].index;

  }



  return null;

}



export function hasDuplicateDocumentStructure(content: string): boolean {

  return findDuplicateSplitPoint(content) != null;

}



export function dedupeRepeatedDocument(content: string): string {

  const split = findDuplicateSplitPoint(content);

  if (split == null) return content;



  const first = content.slice(0, split).trimEnd();

  const second = content.slice(split).trimStart();



  if (!second) return first;

  if (!first) return second;



  return scoreDocumentHalf(second) > scoreDocumentHalf(first) ? second : first;

}



function stripRestartPrefix(text: string): string {

  let out = text.trimStart();

  out = out.replace(/^```yaml[\s\S]*?```\s*/i, "");

  out = out.replace(/^---\s*\n[\s\S]*?---\s*\n?/i, "");

  out = out.replace(MAIN_HEADING_ONCE, "");

  return out.trimStart();

}



/** Merge continuation pass — avoid duplicated headers when model restarts. */

export function mergeContinuationContent(existing: string, addition: string): string {

  const base = existing.trimEnd();

  let extra = addition.trimStart();

  if (!extra) return base;



  if (

    extra.startsWith("```yaml") ||

    extra.startsWith("---\nproject_id:") ||

    MAIN_HEADING_ONCE.test(extra) ||

    /^project_id:\s*["']/m.test(extra.slice(0, 200))

  ) {

    extra = stripRestartPrefix(extra);

    if (!extra) return base;

  }



  const maxOverlap = Math.min(base.length, extra.length, 1200);

  for (let len = maxOverlap; len >= 8; len--) {

    const suffix = base.slice(-len);

    if (extra.startsWith(suffix)) {

      return base + extra.slice(len);

    }

  }



  if (!base.endsWith("\n")) return `${base}\n${extra}`;

  return base + extra;

}



export function sanitizeGeneratedContent(content: string): string {

  return dedupeRepeatedDocument(stripOuterCodeFences(content)).trim();

}


