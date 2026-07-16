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
        className="absolute inset-0 dashboard-modal-overlay"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl p-6 dashboard-modal-panel animate-fade-in-up"
      >
        <h3
          className="font-unbounded text-lg font-bold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h3>
        <p
          className="font-mono text-sm mb-6 leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {description}
        </p>
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          {actions.map((action, i) => (
            <button
              key={action.label}
              ref={i === actions.length - 1 ? firstBtnRef : undefined}
              type="button"
              className={`btn btn-sm ${action.primary ? "btn-primary" : "btn-ghost"}`}
              onClick={action.onClick}
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
