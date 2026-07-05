"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface DropdownItem {
  title: string;
  href: string;
  description?: string;
  meta?: string;
}

interface LearnNavDropdownProps {
  label: string;
  items: DropdownItem[];
  align?: "left" | "center";
}

export default function LearnNavDropdown({
  label,
  items,
  align = "left",
}: LearnNavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 learn-nav-text learn-hover-link transition-colors"
        style={{ color: "var(--learn-text-secondary)" }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms ease",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+8px)] z-50 min-w-[280px] max-w-[360px] rounded-xl py-2 shadow-lg"
          style={{
            left: align === "left" ? 0 : "50%",
            transform: align === "center" ? "translateX(-50%)" : undefined,
            background: "var(--learn-bg-surface)",
            border: "0.5px solid var(--learn-border)",
          }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 transition-colors hover:bg-[var(--learn-bg-elevated)] learn-hover-link"
            >
              <div className="flex items-start justify-between gap-3">
                <p
                  className="learn-nav-text text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.title}
                </p>
                {item.meta && (
                  <span
                    className="learn-nav-text text-[10px] shrink-0 mt-0.5"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {item.meta}
                  </span>
                )}
              </div>
              {item.description && (
                <p
                  className="learn-nav-text text-xs mt-1 leading-relaxed"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {item.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
