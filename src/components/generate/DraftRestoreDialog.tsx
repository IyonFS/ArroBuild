"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DraftRestoreDialogProps {
  savedAt: number;
  onContinue: () => void;
  onDiscard: () => void;
}

export default function DraftRestoreDialog({
  savedAt,
  onContinue,
  onDiscard,
}: DraftRestoreDialogProps) {
  const onDiscardRef = useRef(onDiscard);
  useEffect(() => {
    onDiscardRef.current = onDiscard;
  }, [onDiscard]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDiscardRef.current();
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={() => onDiscardRef.current()}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-restore-title"
        className="relative z-10 w-full max-w-md rounded-2xl px-6 py-6 animate-scale-in"
        style={{
          background: "#1F2A44",
          border: "1px solid rgba(255,176,32,0.35)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        }}
      >
        <p
          id="draft-restore-title"
          className="text-base font-semibold mb-2"
          style={{
            fontFamily: "var(--font-unbounded), sans-serif",
            color: "var(--app-amber)",
            letterSpacing: "-0.02em",
            fontSize: 15,
          }}
        >
          Draft tersimpan ditemukan
        </p>
        <p
          className="text-sm mb-6 leading-relaxed"
          style={{ color: "var(--app-text-secondary)" }}
        >
          Disimpan {new Date(savedAt).toLocaleString("id-ID")}. Lanjutkan dari step
          terakhir atau mulai dari awal?
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onDiscard}
            className="px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              borderRadius: 8,
              border: "1px solid var(--app-border-strong)",
              color: "var(--app-text-secondary)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              background: "transparent",
            }}
          >
            Buang, mulai baru
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
            style={{
              borderRadius: 8,
              background: "var(--app-amber)",
              color: "#0D1321",
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}
          >
            Lanjutkan draft
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
