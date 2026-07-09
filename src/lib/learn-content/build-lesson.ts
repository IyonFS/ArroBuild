import type { Block } from "./types";

export interface LessonContentInput {
  outcome: string;
  coreConcept: string;
  corePoints?: string[];
  workedExample?: {
    heading?: string;
    content: string;
    language?: string;
  };
  practiceTask: string;
  pitfalls?: string[];
  tip?: string;
  warning?: string;
  cta?: { label: string; href: string };
}

/** Builds a consistent lesson block sequence from structured content input. */
export function buildLessonBlocks(input: LessonContentInput): Block[] {
  const blocks: Block[] = [
    {
      type: "callout",
      label: "Outcome",
      content: input.outcome,
    },
    { type: "heading", content: "Core Concept" },
    { type: "text", content: input.coreConcept },
  ];

  if (input.corePoints?.length) {
    blocks.push({ type: "list", items: input.corePoints });
  }

  if (input.workedExample) {
    blocks.push({
      type: "heading",
      content: input.workedExample.heading ?? "Worked Example",
    });
    blocks.push({
      type: "code",
      language: input.workedExample.language ?? "text",
      content: input.workedExample.content,
    });
  }

  blocks.push(
    { type: "heading", content: "Practice Task" },
    { type: "text", content: input.practiceTask }
  );

  if (input.pitfalls?.length) {
    blocks.push(
      { type: "heading", content: "Common Pitfalls" },
      { type: "list", items: input.pitfalls }
    );
  }

  if (input.tip) {
    blocks.push({ type: "tip", label: "Pro tip", content: input.tip });
  }

  if (input.warning) {
    blocks.push({ type: "warning", label: "Perhatian", content: input.warning });
  }

  if (input.cta) {
    blocks.push({
      type: "cta-link",
      label: input.cta.label,
      href: input.cta.href,
    });
  }

  return blocks;
}

/** Placeholder blocks for lessons awaiting real content. */
export function buildPlaceholderLessonBlocks(
  section: string,
  outcome: string
): Block[] {
  return buildLessonBlocks({
    outcome,
    coreConcept: `[Placeholder] Materi **${section}** akan diisi segera. Struktur lesson ini sudah siap — tinggal ganti teks di bagian Core Concept, Worked Example, dan Practice Task.`,
    corePoints: [
      "Struktur lesson mengikuti template standar ArroBuild Learn",
      "Konten final akan mengganti semua teks placeholder ini",
      "Format siap diterima dalam JSON atau Markdown terstruktur",
    ],
    workedExample: {
      heading: "Worked Example (placeholder)",
      language: "markdown",
      content: `# Contoh struktur materi
## Section utama
Penjelasan singkat di sini.

- Poin 1
- Poin 2

\`\`\`bash
# contoh perintah atau snippet
npm run dev
\`\`\``,
    },
    practiceTask:
      "[Placeholder] Setelah materi final tersedia, siswa akan mengerjakan tugas praktik 10–20 menit di bagian ini.",
    pitfalls: [
      "Jangan mengisi placeholder secara setengah — ganti seluruh section sekaligus",
      "Pastikan outcome lesson tetap satu kalimat yang terukur",
    ],
  });
}
