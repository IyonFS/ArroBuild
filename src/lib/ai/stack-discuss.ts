import { generate } from "@/lib/ai/generator";
import { INTERVIEW_MAX_TURNS } from "@/lib/ai/interview";
import { STACK_ADVISOR_DISCUSSION_MAX_TURNS } from "@/lib/config/stack-advisor-prompt";

export type StackDiscussMessage = { role: "assistant" | "user"; content: string };

export interface StackDiscussFields {
  productType?: string;
  stage?: string;
  priority?: string;
  targetUser?: string;
  mainProblem?: string;
  budgetNote?: string;
  notes?: string;
  [key: string]: unknown;
}

export function summarizeStackFields(fields: StackDiscussFields): string {
  const lines: string[] = [];
  if (fields.productType) lines.push(`productType: ${fields.productType}`);
  if (fields.stage) lines.push(`stage: ${fields.stage}`);
  if (fields.priority) lines.push(`priority: ${fields.priority}`);
  if (fields.targetUser) lines.push(`targetUser: ${fields.targetUser}`);
  if (fields.mainProblem) lines.push(`mainProblem: ${fields.mainProblem}`);
  if (fields.budgetNote) lines.push(`budgetNote: ${fields.budgetNote}`);
  if (fields.notes) lines.push(`notes: ${fields.notes}`);
  return lines.length > 0 ? lines.join("\n") : "(belum ada field terisi)";
}

export function hasMinimumStackFields(fields: StackDiscussFields): boolean {
  return Boolean(
    fields.productType?.trim() &&
      fields.priority?.trim() &&
      (fields.mainProblem?.trim() || fields.targetUser?.trim() || fields.notes?.trim())
  );
}

export function buildCappedStackDiscussPrompt(params: {
  filledFields: StackDiscussFields;
  messages: StackDiscussMessage[];
  userMessage: string;
  turnCount: number;
}): string {
  const { filledFields, messages, userMessage, turnCount } = params;
  const max = STACK_ADVISOR_DISCUSSION_MAX_TURNS;
  const recent = messages.slice(-4);
  const recentBlock =
    recent.length === 0
      ? "(belum ada giliran sebelumnya)"
      : recent
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n");

  const remaining = max - turnCount;
  const complete = hasMinimumStackFields(filledFields);

  return `Kamu adalah Stack Advisor coach ArroBuild. Bahasa: Indonesia santai, max 3 kalimat pertanyaan.
Tujuan: kumpulkan brief minimal — productType, priority (speed|cost|scale), dan sedikit konteks (targetUser / mainProblem / notes).
Opsional: stage (idea|prototype|production), budgetNote.

productType harus salah satu: saas, marketplace, mobile, api, portfolio, internal, ecommerce, ai-app, other
priority harus salah satu: speed, cost, scale

Field yang sudah terisi:
${summarizeStackFields(filledFields)}

2 giliran mentah terakhir saja:
${recentBlock}

Giliran: ${turnCount + 1}/${max} (sisa ${remaining}). Minimal lengkap: ${complete ? "YA" : "BELUM"}.

Pesan user:
"""
${userMessage.slice(0, 1500)}
"""

Aturan:
- Jangan ulang pertanyaan field yang sudah terisi
- Kalau jawaban terlalu vague, tanya balik spesifik — jangan buru-buru bilang siap
- Jika minimal lengkap, konfirmasi dan tanya siap generate rekomendasi

Balas HANYA JSON (tanpa fence):
{"assistantMessage":"...","filledFields":{"productType":"?","stage":"?","priority":"?","targetUser":"?","mainProblem":"?","budgetNote":"?","notes":"?"},"isComplete":false}`;
}

function asString(value: unknown, max = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

export function mergeStackFields(
  current: StackDiscussFields,
  patch: StackDiscussFields
): StackDiscussFields {
  const merged = { ...current };
  for (const key of [
    "productType",
    "stage",
    "priority",
    "targetUser",
    "mainProblem",
    "budgetNote",
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

export async function runStackDiscussTurn(params: {
  filledFields: StackDiscussFields;
  messages: StackDiscussMessage[];
  userMessage: string;
  turnCount: number;
}): Promise<{
  assistantMessage: string;
  filledFields: StackDiscussFields;
  turnCount: number;
  isComplete: boolean;
  shouldFallback: boolean;
}> {
  const max = STACK_ADVISOR_DISCUSSION_MAX_TURNS;
  if (params.turnCount >= max) {
    return {
      assistantMessage:
        "Kuota diskusi sudah habis. Kita pakai brief yang terkumpul untuk rekomendasi ya.",
      filledFields: params.filledFields,
      turnCount: params.turnCount,
      isComplete: true,
      shouldFallback: !hasMinimumStackFields(params.filledFields),
    };
  }

  const prompt = buildCappedStackDiscussPrompt(params);
  const raw = await generate(prompt, {
    temperature: 0.5,
    maxOutputTokens: 800,
  });

  const parsed = parseJsonObject(raw);
  const patch = (parsed?.filledFields ?? {}) as StackDiscussFields;
  const filledFields = mergeStackFields(params.filledFields, patch);
  const nextTurn = params.turnCount + 1;
  const modelComplete = Boolean(parsed?.isComplete);
  const isComplete =
    modelComplete || nextTurn >= max || (hasMinimumStackFields(filledFields) && modelComplete);

  const assistantMessage =
    asString(parsed?.assistantMessage, 800) ??
    (hasMinimumStackFields(filledFields)
      ? "Brief sudah cukup. Mau koreksi atau lanjut ke rekomendasi?"
      : "Ceritakan tipenya (SaaS/mobile/dll), prioritas (cepat/hemat/skala), dan sedikit konteks proyeknya.");

  return {
    assistantMessage,
    filledFields,
    turnCount: nextTurn,
    isComplete: isComplete || nextTurn >= max,
    shouldFallback: nextTurn >= max && !hasMinimumStackFields(filledFields),
  };
}

export const STACK_DISCUSS_MAX = Math.min(
  STACK_ADVISOR_DISCUSSION_MAX_TURNS,
  INTERVIEW_MAX_TURNS
);
