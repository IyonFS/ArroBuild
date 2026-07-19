"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface DialogAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface ReadmeDialogProps {
  open: boolean;
  title: string;
  description: string;
  actions: DialogAction[];
  onClose?: () => void;
}

export default function ReadmeDialog({
  open,
  title,
  description,
  actions,
  onClose,
}: ReadmeDialogProps) {
  const firstBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(13,19,33,0.72)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl p-6 animate-fade-in-up"
        style={{
          background: "var(--app-bg-elevated, #1F2A44)",
          border: "0.5px solid var(--app-border-strong, rgba(240,243,250,0.18))",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
          color: "var(--app-text-primary, #F0F3FA)",
        }}
      >
        <h3
          className="mb-2 font-unbounded text-lg font-bold"
          style={{ color: "var(--app-text-primary, #F0F3FA)" }}
        >
          {title}
        </h3>
        <p
          className="mb-6 font-mono text-sm leading-relaxed"
          style={{ color: "var(--app-text-secondary, rgba(240,243,250,0.62))" }}
        >
          {description}
        </p>
        <div className="flex flex-col-reverse items-stretch justify-end gap-2 sm:flex-row sm:items-center">
          {actions.map((action, i) => (
            <button
              key={action.label}
              ref={i === actions.length - 1 ? firstBtnRef : undefined}
              type="button"
              onClick={action.onClick}
              className="rounded-lg px-4 py-2.5 font-mono text-xs font-bold transition-opacity hover:opacity-90"
              style={
                action.primary
                  ? {
                      background: "var(--app-amber, #FFB020)",
                      color: "#0D1321",
                    }
                  : {
                      background: "transparent",
                      color: "var(--app-text-secondary, rgba(240,243,250,0.62))",
                      border: "0.5px solid var(--app-border-default, rgba(240,243,250,0.08))",
                    }
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
