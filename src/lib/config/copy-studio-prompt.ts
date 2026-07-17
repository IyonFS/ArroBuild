import {
  getCopyStudioTemplate,
  type CopyStudioTemplateId,
} from "@/lib/config/copy-studio-templates";

export type CopyStudioMode = "arrodesign" | "screenshot" | "scratch";
export type ScratchSubMode = "template" | "discussion";

export const COPY_STUDIO_CREDITS = {
  template: 8,
  discussion: 8,
  screenshotPerSection: 12,
} as const;

export const COPY_STUDIO_DISCUSSION_MAX_TURNS = 8;

const SYSTEM = `You are a conversion copywriter for landing pages (SaaS, UMKM, company profile, portfolio, events).
Write persuasive, concrete copy in the same language as the user's input (Indonesian or English).
Output clean markdown with one ## heading per section.
Do NOT invent fake testimonials, metrics, or brand names — use placeholders like [Nama Klien] when needed.
Never claim the copy is identical to a competitor's site; frame as original copy inspired by the user's brief.`;

export interface CopyStudioRunInput {
  mode: CopyStudioMode | string;
  scratchSubMode?: ScratchSubMode | string;
  templateId?: string;
  productName?: string;
  targetUser?: string;
  mainValue?: string;
  notes?: string;
  /** JSON string of confirmed screenshot sections after user review */
  confirmedSections?: string;
  /** Free-form brief from discussion mode */
  discussionBrief?: string;
}

export function estimateCopyStudioCredits(input: {
  mode: string;
  scratchSubMode?: string | null;
  sectionCount?: number;
}): number {
  if (input.mode === "screenshot") {
    const n = Math.max(1, input.sectionCount ?? 1);
    return n * COPY_STUDIO_CREDITS.screenshotPerSection;
  }
  if (input.mode === "scratch" && input.scratchSubMode === "discussion") {
    return COPY_STUDIO_CREDITS.discussion;
  }
  return COPY_STUDIO_CREDITS.template;
}

export function recordToCopyStudioInput(
  input: Record<string, string>
): CopyStudioRunInput {
  return {
    mode: input.mode ?? "scratch",
    scratchSubMode: input.scratchSubMode as ScratchSubMode | undefined,
    templateId: input.templateId,
    productName: input.productName,
    targetUser: input.targetUser,
    mainValue: input.mainValue,
    notes: input.notes,
    confirmedSections: input.confirmedSections,
    discussionBrief: input.discussionBrief,
  };
}

export function buildCopyStudioPrompt(input: Record<string, string>): string {
  const data = recordToCopyStudioInput(input);

  if (data.mode === "screenshot") {
    return buildScreenshotFinalizePrompt(data);
  }

  if (data.scratchSubMode === "discussion") {
    return buildDiscussionPrompt(data);
  }

  return buildTemplatePrompt(data);
}

function buildTemplatePrompt(data: CopyStudioRunInput): string {
  const templateId = (data.templateId ?? "saas-launch") as CopyStudioTemplateId;
  const template = getCopyStudioTemplate(templateId);
  const sectionList =
    template?.sections
      .map((s, i) => `${i + 1}. **${s.title}** — ${s.contentHint}`)
      .join("\n") ?? "1. Hero\n2. Value props\n3. CTA";

  return `${SYSTEM}

## Mode
Template: ${template?.name ?? templateId}
Structure (follow this section order exactly):
${sectionList}

## Brief
- Nama produk / brand: ${data.productName || "(belum diisi)"}
- Target user: ${data.targetUser || "(belum diisi)"}
- Value utama: ${data.mainValue || "(belum diisi)"}
- Catatan tambahan: ${data.notes || "—"}

Write the full landing page copy script, one markdown section per structure item above.`;
}

function buildDiscussionPrompt(data: CopyStudioRunInput): string {
  return `${SYSTEM}

## Mode
Diskusi ide → script landing page

## Brief hasil diskusi
${data.discussionBrief || data.notes || "(kosong)"}

## Field terisi
- Nama: ${data.productName || "—"}
- Target: ${data.targetUser || "—"}
- Value: ${data.mainValue || "—"}

Infer a sensible section structure from the brief (hero → body → CTA) and write the full markdown copy script.`;
}

function buildScreenshotFinalizePrompt(data: CopyStudioRunInput): string {
  return `${SYSTEM}

## Mode
Screenshot sections (sudah dikonfirmasi user)

## Confirmed section notes
${data.confirmedSections || "(tidak ada)"}

## Brief
- Nama: ${data.productName || "—"}
- Target: ${data.targetUser || "—"}
- Value: ${data.mainValue || "—"}
- Catatan: ${data.notes || "—"}

Write polished landing page copy per section. Preserve meaning from confirmed notes.
If a note was marked ambiguous, prefer the user's edited text over guessing.`;
}

/** Vision system prompt for screenshot analysis (extract + draft copy + confidence). */
export function buildScreenshotVisionPrompt(meta: {
  productName?: string;
  targetUser?: string;
  mainValue?: string;
  sectionLabels: string[];
}): string {
  const labels =
    meta.sectionLabels.length > 0
      ? meta.sectionLabels.map((l, i) => `${i + 1}. ${l}`).join("\n")
      : "(label tidak diberi — tebak urutan section dari gambar)";

  return `${SYSTEM}

## Mode
Analisis screenshot landing page per section.

Gambar dilampirkan berurutan. Label section (jika ada):
${labels}

Konteks produk (opsional):
- Nama: ${meta.productName || "—"}
- Target: ${meta.targetUser || "—"}
- Value: ${meta.mainValue || "—"}

Untuk SETIAP section / gambar, output markdown:

### Section: <nama>
**Confidence:** [CONFIRMED] atau [PERLU DIKONFIRMASI]
**Alasan confidence:** satu kalimat singkat
**Draft copy:**
- Headline: ...
- Body: ...
- CTA (jika ada): ...

Aturan confidence:
- [CONFIRMED] hanya jika teks di gambar jelas terbaca
- [PERLU DIKONFIRMASI] jika buram, terpotong, terlalu kecil, atau ambigu
Jangan menebak diam-diam — tandai ketidakpastian.`;
}
