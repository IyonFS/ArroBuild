"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  searchLearn,
  type LearnSearchResult,
} from "@/lib/learn-search";

function SearchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function LearnSearchField({
  inputRef,
  autoFocus,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LearnSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const runSearch = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const next = searchLearn(value);
    setResults(next);
    setOpen(value.trim().length > 0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (autoFocus) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus, inputRef]);

  const navigateTo = (href: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!open && event.key === "ArrowDown" && results.length > 0) {
      setOpen(true);
      setActiveIndex(0);
      event.preventDefault();
      return;
    }

    if (!open || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      navigateTo(results[activeIndex].href);
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        <SearchIcon />
      </span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => runSearch(event.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        onKeyDown={onInputKeyDown}
        placeholder="Cari tutorial..."
        aria-label="Cari tutorial"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        role="combobox"
        className="learn-search-input w-full h-10 pl-9 pr-16 rounded-lg learn-nav-text text-sm outline-none"
        style={{
          background: "var(--learn-bg-elevated)",
          border: "0.5px solid var(--learn-border)",
          color: "var(--color-text-secondary)",
        }}
      />
      <kbd
        className="hidden lg:inline-flex absolute right-2 top-1/2 -translate-y-1/2 learn-nav-text text-[10px] px-1.5 py-0.5 rounded"
        style={{
          color: "var(--learn-text-tertiary)",
          border: "0.5px solid var(--learn-border)",
          background: "var(--learn-bg-elevated)",
        }}
      >
        Ctrl K
      </kbd>

      {open && query.trim() && results.length === 0 && (
        <div
          className="absolute top-[calc(100%+6px)] left-0 right-0 z-[80] rounded-xl px-3 py-3 shadow-xl"
          style={{
            background: "var(--learn-bg-surface)",
            border: "0.5px solid var(--learn-border)",
          }}
        >
          <p
            className="learn-nav-text text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Tidak ada hasil untuk &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {open && results.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 right-0 z-[80] rounded-xl py-1.5 shadow-xl max-h-80 overflow-y-auto"
          style={{
            background: "var(--learn-bg-surface)",
            border: "0.5px solid var(--learn-border)",
          }}
        >
          {results.map((result, index) => (
            <button
              key={`${result.href}-${result.type}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => navigateTo(result.href)}
              className="learn-search-result w-full text-left px-3 py-2.5"
              style={{
                background:
                  index === activeIndex
                    ? "rgba(255,92,26,0.1)"
                    : "transparent",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className="learn-nav-text text-sm font-medium truncate"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {result.title}
                </p>
                <span
                  className="learn-nav-text text-[10px] uppercase shrink-0"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {result.type === "path" ? "Path" : "Lesson"}
                </span>
              </div>
              <p
                className="learn-nav-text text-xs mt-0.5 truncate"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {result.pathTitle}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LearnSearch() {
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (window.innerWidth < 768) {
          setMobileOpen(true);
          return;
        }
        desktopInputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="relative w-full max-w-md hidden md:block">
        <LearnSearchField inputRef={desktopInputRef} />
      </div>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden learn-search-trigger flex items-center justify-center w-9 h-9 rounded-lg"
        style={{
          border: "0.5px solid var(--learn-border)",
          color: "var(--learn-text-secondary)",
          background: "var(--learn-bg-elevated)",
        }}
        aria-label="Buka pencarian"
      >
        <SearchIcon size={16} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <div
            className="learn-search-overlay absolute inset-0"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div
            className="absolute left-4 right-4 top-[80px] rounded-xl p-3"
            style={{
              background: "var(--learn-bg-surface)",
              border: "0.5px solid var(--learn-border)",
            }}
          >
            <LearnSearchField
              inputRef={mobileInputRef}
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  );
}
