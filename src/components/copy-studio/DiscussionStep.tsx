"use client";

import { useState } from "react";
import {
  COPY_STUDIO_DISCUSSION_MAX_TURNS,
} from "@/lib/config/copy-studio-prompt";
import type { CopyDiscussFields, CopyDiscussMessage } from "@/lib/ai/copy-discuss";

interface Props {
  messages: CopyDiscussMessage[];
  filledFields: CopyDiscussFields;
  turnCount: number;
  isComplete: boolean;
  onUpdate: (patch: {
    messages: CopyDiscussMessage[];
    filledFields: CopyDiscussFields;
    turnCount: number;
    isComplete: boolean;
  }) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function DiscussionStep({
  messages,
  filledFields,
  turnCount,
  isComplete,
  onUpdate,
  onBack,
  onNext,
}: Props) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = COPY_STUDIO_DISCUSSION_MAX_TURNS - turnCount;
  const canSend = draft.trim() && !loading && turnCount < COPY_STUDIO_DISCUSSION_MAX_TURNS;

  const send = async () => {
    if (!canSend) return;
    setLoading(true);
    setError(null);
    const userMessage = draft.trim();
    setDraft("");

    const nextMessages: CopyDiscussMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];

    try {
      const res = await fetch("/api/tools/copy-studio/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filledFields,
          messages,
          userMessage,
          turnCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal kirim pesan.");
        setDraft(userMessage);
        return;
      }

      onUpdate({
        messages: [
          ...nextMessages,
          { role: "assistant", content: data.assistantMessage },
        ],
        filledFields: data.filledFields ?? filledFields,
        turnCount: data.turnCount ?? turnCount + 1,
        isComplete: Boolean(data.isComplete),
      });
    } catch {
      setError("Gagal kirim pesan.");
      setDraft(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    if (messages.length > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/copy-studio/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filledFields: {},
          messages: [],
          userMessage: "Halo, aku mau buat copy landing page dari nol.",
          turnCount: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mulai diskusi.");
        return;
      }
      onUpdate({
        messages: [
          { role: "user", content: "Halo, aku mau buat copy landing page dari nol." },
          { role: "assistant", content: data.assistantMessage },
        ],
        filledFields: data.filledFields ?? {},
        turnCount: data.turnCount ?? 1,
        isComplete: Boolean(data.isComplete),
      });
    } catch {
      setError("Gagal mulai diskusi.");
    } finally {
      setLoading(false);
    }
  };

  const ready =
    isComplete ||
    Boolean(filledFields.productName && filledFields.targetUser && filledFields.mainValue);

  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold sm:text-[22px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        Mode Diskusi
      </h2>
      <p
        className="mb-4 font-mono text-[13.5px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Chat santai dengan hard cap {COPY_STUDIO_DISCUSSION_MAX_TURNS} giliran — sama pola Mode
        Dipandu AI (ringkasan field + 2 giliran terakhir).
      </p>

      <div
        className="mb-4 flex items-center justify-between rounded-lg px-4 py-2.5"
        style={{
          background: "rgba(56,189,248,0.06)",
          border: "0.5px solid rgba(56,189,248,0.25)",
        }}
      >
        <span className="font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Giliran terpakai
        </span>
        <span className="font-mono text-sm font-bold" style={{ color: "var(--app-sky)" }}>
          {turnCount}/{COPY_STUDIO_DISCUSSION_MAX_TURNS}
          {remaining > 0 ? ` · sisa ${remaining}` : " · habis"}
        </span>
      </div>

      {Object.keys(filledFields).length > 0 && (
        <div
          className="mb-4 rounded-xl px-4 py-3 font-mono text-[12px] leading-relaxed"
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-default)",
            color: "var(--color-text-secondary)",
          }}
        >
          <div
            className="mb-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--app-amber)" }}
          >
            Field terisi
          </div>
          {filledFields.productName && <div>Nama: {filledFields.productName}</div>}
          {filledFields.targetUser && <div>Target: {filledFields.targetUser}</div>}
          {filledFields.mainValue && <div>Value: {filledFields.mainValue}</div>}
          {filledFields.tone && <div>Tone: {filledFields.tone}</div>}
        </div>
      )}

      <div
        className="mb-4 flex max-h-[42vh] flex-col gap-3 overflow-y-auto rounded-xl p-4"
        style={{
          background: "var(--color-bg-elevated)",
          border: "0.5px solid var(--color-border-default)",
          minHeight: 200,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
            <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Mulai diskusi untuk kumpulkan brief.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => void startChat()}
              disabled={loading}
            >
              {loading ? "Memulai…" : "Mulai diskusi"}
            </button>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className="rounded-lg px-3 py-2 font-mono text-[13px] leading-relaxed"
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "90%",
                background:
                  m.role === "user" ? "rgba(255,176,32,0.12)" : "rgba(56,189,248,0.08)",
                color: "var(--color-text-primary)",
              }}
            >
              {m.content}
            </div>
          ))
        )}
      </div>

      {error && (
        <p className="mb-3 font-mono text-sm" style={{ color: "#EF4444" }}>
          {error}
        </p>
      )}

      <div className="mb-6 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          disabled={loading || turnCount >= COPY_STUDIO_DISCUSSION_MAX_TURNS}
          placeholder="Tulis jawaban…"
          className="min-w-0 flex-1"
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 13,
            background: "var(--color-bg-base, #131A2C)",
            border: "0.5px solid var(--color-border-default)",
            color: "var(--color-text-primary)",
          }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!canSend}
          onClick={() => void send()}
        >
          {loading ? "…" : "Kirim"}
        </button>
      </div>

      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Kembali
        </button>
        <button type="button" className="btn btn-primary" disabled={!ready} onClick={onNext}>
          Lanjut ke generate →
        </button>
      </div>
    </div>
  );
}
