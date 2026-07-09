"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ContextData, Feature, ProductType, ProjectStage } from "./types";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

interface FilledFields {
  productType?: ProductType;
  projectStage?: ProjectStage;
  targetUser?: string;
  mainProblem?: string;
  productName?: string;
  freeText?: string;
  features?: Feature[];
  [key: string]: unknown;
}

export interface InterviewResult {
  productType: ProductType | null;
  stage: ProjectStage | null;
  contextData: ContextData;
  features: Feature[];
  incomplete: boolean;
}

interface Props {
  onFinished: (result: InterviewResult) => void;
  onBack: () => void;
}

function toInterviewResult(fields: FilledFields, incomplete: boolean): InterviewResult {
  const contextData: ContextData = {};
  if (fields.targetUser) contextData.targetUser = String(fields.targetUser);
  if (fields.mainProblem) contextData.mainProblem = String(fields.mainProblem);
  if (fields.productName) contextData.productName = String(fields.productName);
  if (fields.freeText) contextData.freeText = String(fields.freeText);
  if (fields.pricingModel) contextData.pricingModel = String(fields.pricingModel);
  if (fields.platforms) contextData.platforms = String(fields.platforms);
  if (fields.aiUseCase) contextData.aiUseCase = String(fields.aiUseCase);

  const features = Array.isArray(fields.features)
    ? fields.features.map((f, i) => ({
        id: f.id || `FEAT-${String(i + 1).padStart(3, "0")}`,
        title: f.title || `Fitur ${i + 1}`,
        description: f.description,
        priority: f.priority === "nice-to-have" ? "nice-to-have" as const : "must-have" as const,
      }))
    : [];

  return {
    productType: fields.productType ?? null,
    stage: fields.projectStage ?? "idea",
    contextData,
    features,
    incomplete,
  };
}

export default function InterviewStep({ onFinished, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filledFields, setFilledFields] = useState<FilledFields>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [maxTurns, setMaxTurns] = useState(8);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(true);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldFallback, setShouldFallback] = useState(false);
  const [quotaNote, setQuotaNote] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const startSession = useCallback(async () => {
    setStarting(true);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memulai sesi");
      }
      setSessionId(data.sessionId);
      setMessages(data.messages ?? [{ role: "assistant", content: data.greeting }]);
      setFilledFields(data.filledFields ?? {});
      setTurnCount(data.turnCount ?? 0);
      setMaxTurns(data.maxTurns ?? 8);
      if (data.quota) {
        if (data.quota.isPaidSession) {
          setQuotaNote(
            `Sesi berbayar · ~${data.quota.estimatedCredits} kredit (saldo ${data.quota.creditBalance})`
          );
        } else {
          setQuotaNote(
            `Sesi gratis · sisa kuota ${data.quota.freeRemaining}/3 bulan ini`
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulai sesi");
    } finally {
      setStarting(false);
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void startSession();
  }, [startSession]);

  const sendTurn = async () => {
    if (!sessionId || !input.trim() || busy) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "turn",
          sessionId,
          userMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses jawaban");
      }

      setMessages(data.messages ?? []);
      setFilledFields(data.filledFields ?? {});
      setTurnCount(data.turnCount ?? turnCount + 1);
      setIsComplete(Boolean(data.isComplete));
      setShouldFallback(Boolean(data.shouldFallback));

      if (data.shouldFallback) {
        // Auto-finish into manual form with prefilled data
        await finish("FALLBACK", data.filledFields ?? {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setMessages((prev) => prev.slice(0, -1));
      setInput(userMessage);
    } finally {
      setBusy(false);
    }
  };

  const finish = async (
    status: "COMPLETED" | "FALLBACK",
    fieldsOverride?: FilledFields
  ) => {
    if (!sessionId) {
      onFinished(toInterviewResult(fieldsOverride ?? filledFields, status === "FALLBACK"));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", sessionId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyelesaikan sesi");
      }
      onFinished(
        toInterviewResult(
          data.filledFields ?? fieldsOverride ?? filledFields,
          status === "FALLBACK" || !data.isComplete
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      // Still allow continuing with local fields
      onFinished(
        toInterviewResult(fieldsOverride ?? filledFields, status === "FALLBACK")
      );
    } finally {
      setBusy(false);
    }
  };

  const handleBack = async () => {
    if (sessionId) {
      try {
        await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "abandon", sessionId }),
        });
      } catch {
        /* ignore */
      }
    }
    onBack();
  };

  const fieldChips = [
    filledFields.productType && `Tipe: ${filledFields.productType}`,
    filledFields.targetUser && `Target: ${filledFields.targetUser}`,
    filledFields.mainProblem && `Masalah: ${filledFields.mainProblem}`,
    filledFields.features?.length
      ? `Fitur: ${filledFields.features.length}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 sm:py-12 flex flex-col" style={{ minHeight: "70vh" }}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p
            className="text-xs uppercase tracking-[0.18em] mb-2"
            style={{
              color: "rgba(204,255,0,0.7)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}
          >
            Mode Dipandu AI · {turnCount}/{maxTurns}
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{
              fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            Ceritakan idenya
          </h1>
          {quotaNote && (
            <p
              className="text-xs mt-2"
              style={{
                color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              {quotaNote}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleBack()}
          className="text-sm px-3 py-1.5"
          style={{
            color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
          }}
        >
          Kembali
        </button>
      </div>

      {fieldChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {fieldChips.map((chip) => (
            <span
              key={chip}
              className="text-[11px] px-2.5 py-1"
              style={{
                borderRadius: 999,
                background: "rgba(204,255,0,0.08)",
                color: "rgba(204,255,0,0.85)",
                border: "1px solid rgba(204,255,0,0.2)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-3 mb-4 p-4"
        style={{
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
          maxHeight: "48vh",
        }}
      >
        {starting && messages.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Menyiapkan sesi wawancara...
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-4 py-3 text-sm"
              style={{
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background:
                  m.role === "user"
                    ? "rgba(204,255,0,0.12)"
                    : "rgba(255,255,255,0.05)",
                color:
                  m.role === "user"
                    ? "var(--color-text-primary)"
                    : "rgba(255,255,255,0.75)",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {busy && !starting && (
          <p
            className="text-xs"
            style={{
              color: "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}
          >
            AI mengetik...
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm mb-3" style={{ color: "#FB923C" }}>
          {error}
        </p>
      )}

      {!shouldFallback && (
        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendTurn();
              }
            }}
            disabled={busy || !sessionId || isComplete}
            placeholder="Ketik jawabanmu..."
            className="flex-1 px-4 py-3 text-sm outline-none"
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.35)",
              color: "var(--color-text-primary)",
            }}
          />
          <button
            type="button"
            onClick={() => void sendTurn()}
            disabled={busy || !input.trim() || !sessionId || isComplete}
            className="px-5 py-3 text-sm font-semibold disabled:opacity-40"
            style={{
              borderRadius: 12,
              background: "var(--color-lime)",
              color: "#0A0A0A",
            }}
          >
            Kirim
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {(isComplete || (filledFields.productType && filledFields.targetUser)) && (
          <button
            type="button"
            onClick={() => void finish("COMPLETED")}
            disabled={busy}
            className="px-5 py-2.5 text-sm font-semibold"
            style={{
              borderRadius: 10,
              background: "var(--color-lime)",
              color: "#0A0A0A",
            }}
          >
            Lanjut ke stack
          </button>
        )}
        <button
          type="button"
          onClick={() => void finish("FALLBACK")}
          disabled={busy}
          className="px-5 py-2.5 text-sm"
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Isi manual
        </button>
      </div>
    </div>
  );
}
