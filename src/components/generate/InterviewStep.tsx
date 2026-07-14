"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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

const STARTER_CHIPS = [
  "SaaS buat freelancer",
  "Marketplace lokal",
  "Tools internal tim",
  "AI app untuk edukasi",
];

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
        priority: f.priority === "nice-to-have" ? ("nice-to-have" as const) : ("must-have" as const),
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

function ProgressDots({ turnCount, maxTurns }: { turnCount: number; maxTurns: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Progress ${turnCount} dari ${maxTurns}`}>
      {Array.from({ length: maxTurns }, (_, i) => {
        const filled = i < turnCount;
        return (
          <motion.span
            key={i}
            className="inline-block rounded-full"
            style={{
              width: filled ? 8 : 6,
              height: filled ? 8 : 6,
              background: filled ? "var(--app-amber)" : "var(--app-bg-hover)",
              border: filled ? "none" : "1px solid var(--app-border-default)",
            }}
            initial={false}
            animate={filled ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={filled ? { duration: 0.35, ease: "easeOut" } : undefined}
          />
        );
      })}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="px-4 py-3 flex items-center gap-1"
        style={{
          borderRadius: "12px 12px 12px 2px",
          background: "var(--app-bg-elevated)",
          border: "0.5px solid var(--app-border-default)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--app-sky)" }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
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
      if (!res.ok) throw new Error(data.error || "Gagal memulai sesi");
      setSessionId(data.sessionId);
      setMessages(data.messages ?? [{ role: "assistant", content: data.greeting }]);
      setFilledFields(data.filledFields ?? {});
      setTurnCount(data.turnCount ?? 0);
      setMaxTurns(data.maxTurns ?? 8);
      if (data.quota) {
        setQuotaNote(
          data.quota.isPaidSession
            ? `Sesi berbayar · ~${data.quota.estimatedCredits} kredit (saldo ${data.quota.creditBalance})`
            : `Sesi gratis · sisa kuota ${data.quota.freeRemaining}/3 bulan ini`
        );
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

  const sendTurn = async (messageOverride?: string) => {
    const userMessage = (messageOverride ?? input).trim();
    if (!sessionId || !userMessage || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "turn", sessionId, userMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses jawaban");

      setMessages(data.messages ?? []);
      setFilledFields(data.filledFields ?? {});
      setTurnCount(data.turnCount ?? turnCount + 1);
      setIsComplete(Boolean(data.isComplete));
      setShouldFallback(Boolean(data.shouldFallback));

      if (data.shouldFallback) {
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

  const finish = async (status: "COMPLETED" | "FALLBACK", fieldsOverride?: FilledFields) => {
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
      if (!res.ok) throw new Error(data.error || "Gagal menyelesaikan sesi");
      onFinished(
        toInterviewResult(
          data.filledFields ?? fieldsOverride ?? filledFields,
          status === "FALLBACK" || !data.isComplete
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      onFinished(toInterviewResult(fieldsOverride ?? filledFields, status === "FALLBACK"));
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

  const showStarters =
    !busy &&
    !starting &&
    messages.length === 1 &&
    messages[0]?.role === "assistant" &&
    turnCount === 0;

  return (
    <div
      className="generate-app max-w-[640px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col"
      style={{ minHeight: "70vh" }}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className="font-mono text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--app-sky)" }}
            >
              Mode Dipandu AI
            </span>
            <ProgressDots turnCount={turnCount} maxTurns={maxTurns} />
            <span className="font-mono text-[11px]" style={{ color: "var(--app-text-tertiary)" }}>
              {turnCount}/{maxTurns}
            </span>
          </div>
          <h1
            className="font-unbounded font-extrabold text-[clamp(22px,3vw,28px)]"
            style={{ color: "var(--app-text-primary)", letterSpacing: "-0.02em" }}
          >
            Ceritakan idenya
          </h1>
          {quotaNote && (
            <p className="font-mono text-[12px] mt-2" style={{ color: "var(--app-text-secondary)", opacity: 0.7 }}>
              {quotaNote}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleBack()}
          className="font-mono text-[12px] px-3 py-1.5 rounded-lg shrink-0 transition-colors hover:bg-[var(--app-bg-hover)]"
          style={{ color: "var(--app-text-tertiary)", border: "0.5px solid var(--app-border-default)" }}
        >
          Kembali
        </button>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-3 mb-4 p-4"
        style={{
          borderRadius: 12,
          border: "0.5px solid var(--app-border-default)",
          background: "var(--app-bg-elevated)",
          maxHeight: "52vh",
        }}
      >
        {starting && messages.length === 0 && (
          <p className="font-mono text-[13px]" style={{ color: "var(--app-text-tertiary)" }}>
            Menyiapkan sesi wawancara...
          </p>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] as const }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[88%] px-4 py-3 font-mono text-[13px] leading-relaxed"
              style={{
                borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background:
                  m.role === "user"
                    ? "rgba(56,189,248,0.1)"
                    : "var(--app-bg-hover)",
                border:
                  m.role === "user"
                    ? "1px solid rgba(56,189,248,0.35)"
                    : "0.5px solid var(--app-border-default)",
                color: m.role === "user" ? "var(--app-text-primary)" : "var(--app-text-secondary)",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          </motion.div>
        ))}

        {showStarters && (
          <div className="flex flex-wrap gap-2 pt-1">
            {STARTER_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => void sendTurn(chip)}
                className="generate-chip"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {busy && !starting && <TypingIndicator />}
      </div>

      {error && (
        <p className="font-mono text-[13px] mb-3" style={{ color: "#EF4444" }}>
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
            className="flex-1 px-4 py-3 font-mono text-[13px] outline-none rounded-lg"
            style={{
              border: "0.5px solid var(--app-border-default)",
              background: "var(--app-bg-elevated)",
              color: "var(--app-text-primary)",
            }}
          />
          <button
            type="button"
            onClick={() => void sendTurn()}
            disabled={busy || !input.trim() || !sessionId || isComplete}
            className="px-5 py-3 font-mono text-[13px] font-bold rounded-lg disabled:opacity-40 transition-opacity"
            style={{ background: "var(--app-amber)", color: "#0D1321" }}
          >
            Kirim
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {(isComplete || (filledFields.productType && filledFields.targetUser)) && (
          <button
            type="button"
            onClick={() => void finish("COMPLETED")}
            disabled={busy}
            className="px-5 py-2.5 font-mono text-[13px] font-bold rounded-lg"
            style={{ background: "var(--app-amber)", color: "#0D1321" }}
          >
            Lanjut ke stack
          </button>
        )}
        <button
          type="button"
          onClick={() => void finish("FALLBACK")}
          disabled={busy}
          className="font-mono text-[13px] px-2 py-2 underline-offset-2 hover:underline"
          style={{ color: "var(--app-sky)", background: "transparent", border: "none" }}
        >
          Isi manual
        </button>
      </div>
    </div>
  );
}
