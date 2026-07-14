import { generate } from "@/lib/ai/generator";
import { PRODUCT_TYPES, FEATURE_PRIORITIES } from "@/lib/config/options";

export const INTERVIEW_MAX_TURNS = 8;
export const INTERVIEW_FREE_SESSIONS_PER_MONTH = 3;
/** Midpoint of 6–12 credit range for paid interview sessions. */
export const INTERVIEW_CREDIT_ESTIMATE = 8;

export type InterviewMessageRole = "assistant" | "user";

export interface InterviewMessage {
  role: InterviewMessageRole;
  content: string;
}

export interface InterviewFeature {
  id: string;
  title: string;
  description?: string;
  priority: (typeof FEATURE_PRIORITIES)[number];
}

export interface InterviewFilledFields {
  productType?: (typeof PRODUCT_TYPES)[number];
  projectStage?: "idea" | "prototype" | "production";
  targetUser?: string;
  mainProblem?: string;
  productName?: string;
  freeText?: string;
  features?: InterviewFeature[];
  [key: string]: unknown;
}

export interface InterviewTurnResult {
  assistantMessage: string;
  filledFields: InterviewFilledFields;
  turnCount: number;
  isComplete: boolean;
  shouldFallback: boolean;
}

const PRODUCT_TYPE_SET = new Set<string>(PRODUCT_TYPES);

function asString(value: unknown, max = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function normalizeFeatures(raw: unknown, existing: InterviewFeature[]): InterviewFeature[] {
  if (!Array.isArray(raw) || raw.length === 0) return existing;

  const next: InterviewFeature[] = [];
  for (let i = 0; i < raw.length && i < 12; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const title = asString(rec.title, 120);
    if (!title) continue;
    const priority =
      rec.priority === "nice-to-have" ? "nice-to-have" : "must-have";
    const id =
      asString(rec.id, 20) ?? `FEAT-${String(i + 1).padStart(3, "0")}`;
    next.push({
      id: id.startsWith("FEAT-") ? id : `FEAT-${String(i + 1).padStart(3, "0")}`,
      title,
      description: asString(rec.description, 300),
      priority,
    });
  }

  return next.length > 0 ? next : existing;
}

export function mergeFilledFields(
  current: InterviewFilledFields,
  patch: InterviewFilledFields
): InterviewFilledFields {
  const merged: InterviewFilledFields = { ...current };

  if (patch.productType && PRODUCT_TYPE_SET.has(patch.productType)) {
    merged.productType = patch.productType;
  }
  if (
    patch.projectStage === "idea" ||
    patch.projectStage === "prototype" ||
    patch.projectStage === "production"
  ) {
    merged.projectStage = patch.projectStage;
  }

  for (const key of [
    "targetUser",
    "mainProblem",
    "productName",
    "freeText",
    "pricingModel",
    "platforms",
    "aiUseCase",
  ] as const) {
    const value = asString(patch[key]);
    if (value) merged[key] = value;
  }

  merged.features = normalizeFeatures(patch.features, current.features ?? []);
  return merged;
}

export function hasMinimumFields(fields: InterviewFilledFields): boolean {
  return Boolean(
    fields.productType &&
      asString(fields.targetUser) &&
      asString(fields.mainProblem) &&
      (fields.features?.length ?? 0) >= 1
  );
}

export function summarizeFilledFields(fields: InterviewFilledFields): string {
  const lines: string[] = [];
  if (fields.productType) lines.push(`productType: ${fields.productType}`);
  if (fields.projectStage) lines.push(`projectStage: ${fields.projectStage}`);
  if (fields.productName) lines.push(`productName: ${fields.productName}`);
  if (fields.targetUser) lines.push(`targetUser: ${fields.targetUser}`);
  if (fields.mainProblem) lines.push(`mainProblem: ${fields.mainProblem}`);
  if (fields.freeText) lines.push(`notes: ${fields.freeText}`);
  if (fields.features?.length) {
    lines.push(
      `features: ${fields.features
        .map((f) => `${f.id} ${f.title} (${f.priority})`)
        .join("; ")}`
    );
  }
  return lines.length > 0 ? lines.join("\n") : "(belum ada field terisi)";
}

/**
 * Cap context: structured summary of filled fields + only the last 2 raw turns.
 * Never send the full conversation history to the model.
 */
export function buildCappedInterviewPrompt(params: {
  filledFields: InterviewFilledFields;
  messages: InterviewMessage[];
  userMessage: string;
  turnCount: number;
}): string {
  const { filledFields, messages, userMessage, turnCount } = params;
  const recent = messages.slice(-4); // last 2 exchanges (user+assistant)
  const recentBlock =
    recent.length === 0
      ? "(belum ada giliran sebelumnya)"
      : recent
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n");

  const remaining = INTERVIEW_MAX_TURNS - turnCount;
  const complete = hasMinimumFields(filledFields);

  return `Kamu adalah interviewer ArroBuild. Bahasa: Indonesia santai, singkat, max 3 kalimat pertanyaan.
Tujuan: isi Knowledge Model minimal: productType, targetUser, mainProblem, minimal 1 fitur (FEAT-001...).

Field yang sudah terisi (ringkasan terstruktur — gunakan ini, jangan minta ulang yang sudah jelas):
${summarizeFilledFields(filledFields)}

2 giliran mentah terakhir saja:
${recentBlock}

Giliran saat ini: ${turnCount + 1}/${INTERVIEW_MAX_TURNS} (sisa ${remaining}).
Status minimal lengkap: ${complete ? "YA" : "BELUM"}.

Pesan user baru:
"""
${userMessage.slice(0, 1500)}
"""

Aturan:
- productType harus salah satu: ${PRODUCT_TYPES.join(", ")}
- Extraksi fitur jadi id FEAT-00X, title singkat, priority must-have|nice-to-have
- Jangan ulang pertanyaan yang field-nya sudah terisi
- Jika minimal sudah lengkap, konfirmasi ringkas dan tanya apakah mau koreksi atau lanjut
- Jika ini giliran terakhir dan masih kurang, jujur bilang lanjut manual

Balas HANYA JSON valid (tanpa markdown):
{
  "assistantMessage": "teks ke user",
  "filledFields": {
    "productType": "saas|...",
    "targetUser": "...",
    "mainProblem": "...",
    "productName": "...",
    "projectStage": "idea|prototype|production",
    "features": [{"id":"FEAT-001","title":"...","priority":"must-have","description":"..."}]
  },
  "isComplete": true|false
}`;
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function runInterviewTurn(params: {
  filledFields: InterviewFilledFields;
  messages: InterviewMessage[];
  userMessage: string;
  turnCount: number;
}): Promise<InterviewTurnResult> {
  const nextTurn = params.turnCount + 1;
  const prompt = buildCappedInterviewPrompt(params);

  let raw: string;
  try {
    raw = await generate(prompt, {
      model: process.env.GEMINI_API_KEY
        ? "gemini-3.1-flash-lite"
        : process.env.DEEPSEEK_API_KEY
          ? "deepseek-v4-flash"
          : "gemini-3.1-flash-lite",
      maxOutputTokens: 1024,
      temperature: 0.4,
    });
  } catch (error) {
    const fallbackMessage =
      nextTurn >= INTERVIEW_MAX_TURNS
        ? "Sepertinya ini butuh diskusi lebih detail — yuk lanjut isi sisanya manual, jawabanmu sejauh ini tetap tersimpan."
        : "Aku belum menangkap dengan jelas. Bisa ceritakan produknya sebentar: buat siapa, masalah apa yang diselesaikan, dan 1 fitur wajib?";

    const fields = mergeFilledFields(params.filledFields, {
      freeText: params.userMessage.slice(0, 400),
    });

    return {
      assistantMessage: fallbackMessage,
      filledFields: fields,
      turnCount: nextTurn,
      isComplete: hasMinimumFields(fields),
      shouldFallback: nextTurn >= INTERVIEW_MAX_TURNS && !hasMinimumFields(fields),
    };
  }

  const parsed = extractJsonObject(raw);
  const patchFields =
    parsed?.filledFields && typeof parsed.filledFields === "object"
      ? (parsed.filledFields as InterviewFilledFields)
      : {};
  const assistantMessage =
    asString(parsed?.assistantMessage, 800) ??
    (nextTurn >= INTERVIEW_MAX_TURNS
      ? "Sepertinya ini butuh diskusi lebih detail — yuk lanjut isi sisanya manual, jawabanmu sejauh ini tetap tersimpan."
      : "Ceritakan lebih detail dikit: buat siapa, masalah utamanya apa, dan fitur wajib versi pertama?");

  const filledFields = mergeFilledFields(params.filledFields, patchFields);
  const isComplete =
    Boolean(parsed?.isComplete) || hasMinimumFields(filledFields);
  const shouldFallback =
    nextTurn >= INTERVIEW_MAX_TURNS && !hasMinimumFields(filledFields);

  return {
    assistantMessage: shouldFallback
      ? "Sepertinya ini butuh diskusi lebih detail — yuk lanjut isi sisanya manual, jawabanmu sejauh ini tetap tersimpan."
      : assistantMessage,
    filledFields,
    turnCount: nextTurn,
    isComplete: isComplete && !shouldFallback,
    shouldFallback,
  };
}

export const INTERVIEW_GREETING =
  "Oke, kita ngobrol santai aja. Ceritakan produk yang ada di kepalamu — sebebas mungkin, nanti aku yang rapikan.";
