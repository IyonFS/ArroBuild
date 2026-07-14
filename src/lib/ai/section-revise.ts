export interface DocSection {
  /** Heading text without markdown markers */
  title: string;
  /** Full heading line e.g. "## Fitur" */
  headingLine: string;
  level: 2 | 3;
  /** Body including heading line */
  content: string;
  startLine: number;
  endLine: number;
}

const HEADING_RE = /^(#{2,3})\s+(.+?)\s*$/;

export function estimateRevisionCredits(sectionContent: string): number {
  const tokens = Math.ceil(sectionContent.length / 4);
  return Math.min(12, Math.max(2, Math.ceil(tokens / 400)));
}

export function parseMarkdownSections(markdown: string): DocSection[] {
  const lines = markdown.split("\n");
  const sections: DocSection[] = [];
  let current: DocSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(HEADING_RE);
    if (match) {
      if (current) {
        current.endLine = i - 1;
        current.content = lines
          .slice(current.startLine, current.endLine + 1)
          .join("\n");
        sections.push(current);
      }
      const level = match[1].length as 2 | 3;
      current = {
        title: match[2].trim(),
        headingLine: line,
        level,
        content: line,
        startLine: i,
        endLine: i,
      };
    }
  }

  if (current) {
    current.endLine = lines.length - 1;
    current.content = lines.slice(current.startLine, current.endLine + 1).join("\n");
    sections.push(current);
  }

  // If no ##/### headings, treat whole doc as one section
  if (sections.length === 0 && markdown.trim()) {
    sections.push({
      title: "(Seluruh dokumen)",
      headingLine: "",
      level: 2,
      content: markdown,
      startLine: 0,
      endLine: lines.length - 1,
    });
  }

  return sections;
}

export function findSection(
  sections: DocSection[],
  sectionName: string
): DocSection | undefined {
  const needle = sectionName.trim().toLowerCase();
  if (!needle) return undefined;

  const exact = sections.find((s) => s.title.trim().toLowerCase() === needle);
  if (exact) return exact;

  const partial = sections.find(
    (s) =>
      s.title.trim().toLowerCase().includes(needle) ||
      needle.includes(s.title.trim().toLowerCase())
  );
  if (partial) return partial;

  // Fuzzy: strip parenthetical suffixes e.g. "(User Flow)"
  const simplified = needle.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (simplified !== needle) {
    return sections.find(
      (s) =>
        s.title.trim().toLowerCase() === simplified ||
        s.title.trim().toLowerCase().startsWith(simplified)
    );
  }

  return undefined;
}

export function findSectionByStartLine(
  sections: DocSection[],
  startLine: number
): DocSection | undefined {
  return sections.find((s) => s.startLine === startLine);
}

export function replaceSection(
  markdown: string,
  section: DocSection,
  newSectionContent: string
): string {
  const lines = markdown.split("\n");
  const before = lines.slice(0, section.startLine);
  const after = lines.slice(section.endLine + 1);
  const replacement = newSectionContent.replace(/\r\n/g, "\n").trimEnd();
  return [...before, replacement, ...after].join("\n").replace(/\n{3,}/g, "\n\n");
}

export function buildSectionRevisePrompt(params: {
  fileLabel: string;
  sectionTitle: string;
  sectionContent: string;
  instruction: string;
  documentContextSummary: string;
}): string {
  const { fileLabel, sectionTitle, sectionContent, instruction, documentContextSummary } =
    params;

  return `Kamu merevisi SATU section dokumen ArroBuild. Bahasa: ikut bahasa section (biasanya Indonesia).
File: ${fileLabel}
Section: ${sectionTitle}

Ringkasan konteks dokumen (bukan untuk disalin penuh):
${documentContextSummary.slice(0, 1200)}

Section saat ini:
"""
${sectionContent.slice(0, 6000)}
"""

Instruksi user:
"""
${instruction.slice(0, 800)}
"""

Aturan:
- Output HANYA isi section yang direvisi (sertakan heading ##/### jika section aslinya punya heading)
- Jangan tulis penjelasan di luar section
- Pertahankan FEAT-ID yang sudah ada (FEAT-001, FEAT-002, ...) kecuali user minta hapus/ubah
- Jangan mengubah section lain
- Panjang wajar; jangan meledak jadi dokumen penuh`;
}

export function summarizeDocForPrompt(markdown: string): string {
  const sections = parseMarkdownSections(markdown);
  const heads = sections.slice(0, 12).map((s) => `- ${s.title}`);
  const featMatches = markdown.match(/FEAT-\d{3}/g) ?? [];
  const uniqueFeats = [...new Set(featMatches)].slice(0, 20);
  return [
    `Headings:`,
    heads.join("\n") || "(tidak ada)",
    uniqueFeats.length ? `FEAT-IDs: ${uniqueFeats.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Simple unified line diff for UI */
export function unifiedDiff(before: string, after: string): Array<{
  type: "same" | "add" | "del";
  text: string;
}> {
  const a = before.split("\n");
  const b = after.split("\n");
  const rows: Array<{ type: "same" | "add" | "del"; text: string }> = [];

  // LCS-lite via greedy walk (good enough for section-sized diffs)
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      rows.push({ type: "same", text: a[i] });
      i++;
      j++;
      continue;
    }

    // Look ahead for sync point
    let found = false;
    for (let look = 1; look <= 8 && !found; look++) {
      if (i + look < a.length && j < b.length && a[i + look] === b[j]) {
        for (let k = 0; k < look; k++) rows.push({ type: "del", text: a[i + k] });
        i += look;
        found = true;
        break;
      }
      if (j + look < b.length && i < a.length && a[i] === b[j + look]) {
        for (let k = 0; k < look; k++) rows.push({ type: "add", text: b[j + k] });
        j += look;
        found = true;
        break;
      }
    }
    if (found) continue;

    if (i < a.length) {
      rows.push({ type: "del", text: a[i] });
      i++;
    }
    if (j < b.length) {
      rows.push({ type: "add", text: b[j] });
      j++;
    }
  }

  return rows;
}

export function buildFeatIndex(
  files: Array<{ fileKey: string; content: string }>
): Record<string, Array<{ fileKey: string; line: number; snippet: string }>> {
  const index: Record<
    string,
    Array<{ fileKey: string; line: number; snippet: string }>
  > = {};

  for (const file of files) {
    const lines = file.content.split("\n");
    lines.forEach((line, idx) => {
      const matches = line.match(/FEAT-\d{3}/g);
      if (!matches) return;
      for (const id of matches) {
        if (!index[id]) index[id] = [];
        index[id].push({
          fileKey: file.fileKey,
          line: idx + 1,
          snippet: line.trim().slice(0, 120),
        });
      }
    });
  }

  return index;
}
