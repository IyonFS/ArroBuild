import { generate } from "@/lib/ai/generator";
import { INTERVIEW_MAX_TURNS } from "@/lib/ai/interview";
import { COPY_STUDIO_DISCUSSION_MAX_TURNS } from "@/lib/config/copy-studio-prompt";

export type CopyDiscussMessage = { role: "assistant" | "user"; content: string };

export interface CopyDiscussFields {
  productName?: string;
  targetUser?: string;
  mainValue?: string;
  tone?: string;
  sectionsHint?: string;
  notes?: string;
  [key: string]: unknown;
}

export function summarizeCopyFields(fields: CopyDiscussFields): string {
  const lines: string[] = [];
  if (fields.productName) lines.push(`productName: ${fields.productName}`);
  if (fields.targetUser) lines.push(`targetUser: ${fields.targetUser}`);
  if (fields.mainValue) lines.push(`mainValue: ${fields.mainValue}`);
  if (fields.tone) lines.push(`tone: ${fields.tone}`);
  if (fields.sectionsHint) lines.push(`sectionsHint: ${fields.sectionsHint}`);
  if (fields.notes) lines.push(`notes: ${fields.notes}`);
  return lines.length > 0 ? lines.join("\n") : "(belum ada field terisi)";
}

export function hasMinimumCopyFields(fields: CopyDiscussFields): boolean {
  return Boolean(
    fields.productName?.trim() &&
      fields.targetUser?.trim() &&
      fields.mainValue?.trim()
  );
}

/**
 * Same capping pattern as Mode Dipandu AI:
 * structured field summary + last 2 raw exchanges + hard turn cap.
 */
export function buildCappedCopyDiscussPrompt(params: {
  filledFields: CopyDiscussFields;
  messages: CopyDiscussMessage[];
  userMessage: string;
  turnCount: number;
}): string {
  const { filledFields, messages, userMessage, turnCount } = params;
  const max = COPY_STUDIO_DISCUSSION_MAX_TURNS;
  const recent = messages.slice(-4);
  const recentBlock =
    recent.length === 0
      ? "(belum ada giliran sebelumnya)"
      : recent
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n");

  const remaining = max - turnCount;
  const complete = hasMinimumCopyFields(filledFields);

  return `Kamu adalah copy coach ArroBuild untuk landing page. Bahasa: Indonesia santai, max 3 kalimat pertanyaan.
Tujuan: kumpulkan brief copy minimal — productName, targetUser, mainValue. Opsional: tone, sectionsHint, notes.

Field yang sudah terisi (ringkasan terstruktur — jangan minta ulang yang sudah jelas):
${summarizeCopyFields(filledFields)}

2 giliran mentah terakhir saja:
${recentBlock}

Giliran saat ini: ${turnCount + 1}/${max} (sisa ${remaining}).
Status minimal lengkap: ${complete ? "YA" : "BELUM"}.

Pesan user baru:
"""
${userMessage.slice(0, 1500)}
"""

Aturan:
- Jangan ulang pertanyaan yang field-nya sudah terisi
- Jika minimal lengkap, konfirmasi ringkas dan tanya apakah mau koreksi atau siap generate
- Jika giliran terakhir dan masih kurang, rangkum yang ada dan sarankan lanjut generate

Balas HANYA JSON valid (tanpa markdown fence):
{"assistantMessage":"...","filledFields":{"productName":"?","targetUser":"?","mainValue":"?","tone":"?","sectionsHint":"?","notes":"?"},"isComplete":false}`;
}

function asString(value: unknown, max = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

export function mergeCopyFields(
  current: CopyDiscussFields,
  patch: CopyDiscussFields
): CopyDiscussFields {
  const merged = { ...current };
  for (const key of [
    "productName",
    "targetUser",
    "mainValue",
    "tone",
    "sectionsHint",
    "notes",
  ] as const) {
    const v = asString(patch[key]);
    if (v) merged[key] = v;
  }
  return merged;
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence?.[1]?.trim() ?? trimmed;
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
  } catch {
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(body.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function runCopyDiscussTurn(params: {
  filledFields: CopyDiscussFields;
  messages: CopyDiscussMessage[];
  userMessage: string;
  turnCount: number;
}): Promise<{
  assistantMessage: string;
  filledFields: CopyDiscussFields;
  turnCount: number;
  isComplete: boolean;
  shouldFallback: boolean;
}> {
  const max = COPY_STUDIO_DISCUSSION_MAX_TURNS;
  if (params.turnCount >= max) {
    return {
      assistantMessage:
        "Kuota diskusi sudah habis. Kita lanjut generate dari brief yang terkumpul ya.",
      filledFields: params.filledFields,
      turnCount: params.turnCount,
      isComplete: true,
      shouldFallback: !hasMinimumCopyFields(params.filledFields),
    };
  }

  const prompt = buildCappedCopyDiscussPrompt(params);
  const raw = await generate(prompt, {
    temperature: 0.5,
    maxOutputTokens: 800,
  });

  const parsed = parseJsonObject(raw);
  const patch = (parsed?.filledFields ?? {}) as CopyDiscussFields;
  const filledFields = mergeCopyFields(params.filledFields, patch);
  const nextTurn = params.turnCount + 1;
  const modelComplete = Boolean(parsed?.isComplete);
  const isComplete =
    modelComplete ||
    nextTurn >= max ||
    (hasMinimumCopyFields(filledFields) && modelComplete);

  const assistantMessage =
    asString(parsed?.assistantMessage, 800) ??
    (hasMinimumCopyFields(filledFields)
      ? "Brief sudah cukup. Mau koreksi atau lanjut generate?"
      : "Ceritakan nama produk, siapa targetnya, dan value utamanya.");

  return {
    assistantMessage,
    filledFields,
    turnCount: nextTurn,
    isComplete: isComplete || nextTurn >= max,
    shouldFallback: nextTurn >= max && !hasMinimumCopyFields(filledFields),
  };
}

/** Re-export for callers that compare against interview cap. */
export const COPY_DISCUSS_MAX = Math.min(
  COPY_STUDIO_DISCUSSION_MAX_TURNS,
  INTERVIEW_MAX_TURNS
);
