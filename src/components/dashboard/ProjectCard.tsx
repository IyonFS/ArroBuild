"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { parseProjectIdea } from "@/lib/project-display";
import { getDisplayTitle } from "@/lib/project-meta";
import { ProductTypeIcon } from "@/lib/ui/app-icons";
import type { ProductType } from "@/components/generate/types";

interface ProjectCardProps {
  id: string;
  idea: string;
  status: string;
  createdAt: string;
  fileCount: number;
  presets?: unknown;
  planData?: unknown;
  canFork: boolean;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => void;
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string; border: string }> = {
  DONE: { label: "Selesai", bg: "rgba(52,211,153,0.12)", color: "#34D399", border: "rgba(52,211,153,0.35)" },
  GENERATING: { label: "Proses", bg: "rgba(56,189,248,0.12)", color: "#38BDF8", border: "rgba(56,189,248,0.35)" },
  PENDING: { label: "Antrian", bg: "rgba(255,176,32,0.12)", color: "#FFB020", border: "rgba(255,176,32,0.35)" },
  FAILED: { label: "Gagal", bg: "rgba(239,68,68,0.12)", color: "#EF4444", border: "rgba(239,68,68,0.35)" },
};

const PRODUCT_COLORS: Record<string, string> = {
  saas: "#FFB020",
  marketplace: "#FF9500",
  mobile: "#38BDF8",
  api: "#9D4EDD",
  "ai-app": "#34D399",
  ecommerce: "#FB923C",
  internal: "#2E8EFF",
  portfolio: "#F472B6",
  other: "#9CA3AF",
};

export default function ProjectCard({
  id,
  idea,
  status,
  createdAt,
  fileCount,
  presets,
  planData,
  canFork,
  onRename,
  onDelete,
}: ProjectCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [saving, setSaving] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const customTitle = getDisplayTitle(planData);
  const display = parseProjectIdea(idea, customTitle);
  const statusStyle = STATUS_STYLES[status] ?? {
    label: status,
    bg: "rgba(240,243,250,0.06)",
    color: "var(--app-text-secondary)",
    border: "var(--app-border-default)",
  };
  const accent = PRODUCT_COLORS[display.productType] ?? PRODUCT_COLORS.other;
  const isDone = status === "DONE" && fileCount > 0;
  const isGenerating = status === "GENERATING";
  const canDelete = !isGenerating;
  const dateLabel = new Date(createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || menuBtnRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menuOpen]);

  function openMenu() {
    const btn = menuBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, left: Math.max(8, rect.right - 176) });
    setMenuOpen((v) => !v);
  }

  function startRename() {
    setRenameValue(customTitle ?? display.title);
    setRenaming(true);
    setMenuOpen(false);
  }

  async function submitRename() {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onRename(id, trimmed);
      setRenaming(false);
    } finally {
      setSaving(false);
    }
  }

  function handleFork() {
    sessionStorage.setItem("arrobuild_fork_idea", idea);
    sessionStorage.setItem("arrobuild_fork_presets", JSON.stringify(presets ?? {}));
    router.push("/generate");
    setMenuOpen(false);
  }

  const dropdown =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            className="dashboard-dropdown fixed w-44 py-1.5 z-[150]"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {isDone && (
              <Link href={`/project/${id}`} className="dashboard-dropdown-item" onClick={() => setMenuOpen(false)}>
                Buka workspace
              </Link>
            )}
            {isDone && (
              <a href={`/api/export?projectId=${id}`} className="dashboard-dropdown-item">
                Download ZIP
              </a>
            )}
            <button type="button" className="dashboard-dropdown-item w-full text-left" onClick={startRename}>
              Rename
            </button>
            {canFork && (
              <button type="button" className="dashboard-dropdown-item w-full text-left" onClick={handleFork}>
                Fork project
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                className="dashboard-dropdown-item dashboard-dropdown-danger w-full text-left"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(id);
                }}
              >
                Hapus project
              </button>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <article className="dashboard-project-row group px-4 sm:px-5 py-4">
        <div className="flex flex-col gap-2">
          {/* Row 1: badges + status */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                style={{
                  background: `${accent}18`,
                  color: accent,
                  border: `1px solid ${accent}40`,
                }}
              >
                <ProductTypeIcon type={display.productType as ProductType} size={12} />
                {display.productTypeLabel}
              </span>
              {display.stageLabel && (
                <span className="font-mono text-[12px]" style={{ color: "var(--app-text-tertiary)" }}>
                  {display.stageLabel}
                </span>
              )}
            </div>
            <span
              className="font-mono text-[12px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full"
              style={{
                background: statusStyle.bg,
                color: statusStyle.color,
                border: `1px solid ${statusStyle.border}`,
              }}
            >
              {statusStyle.label}
            </span>
          </div>

          {/* Row 2: title */}
          {renaming ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="input flex-1 text-sm"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={120}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitRename();
                  if (e.key === "Escape") setRenaming(false);
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ background: "var(--app-amber)", color: "#0D1321" }}
                  onClick={() => void submitRename()}
                  disabled={saving || !renameValue.trim()}
                >
                  {saving ? "…" : "Simpan"}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRenaming(false)} disabled={saving}>
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <h3
              className="font-unbounded text-[16px] font-bold leading-snug line-clamp-2"
              style={{ color: "var(--app-text-primary)" }}
            >
              {display.title}
            </h3>
          )}

          {/* Row 3: metadata */}
          {!renaming && display.subtitle && (
            <p
              className="font-mono text-[13px] leading-relaxed line-clamp-1"
              style={{ color: "var(--app-text-secondary)", opacity: 0.7 }}
            >
              {display.subtitle}
            </p>
          )}

          {/* Row 4: footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[12px]" style={{ color: "var(--app-text-secondary)", opacity: 0.7 }}>
              <span>{fileCount} file</span>
              <span>·</span>
              <span>{dateLabel}</span>
              {display.frameworkLabel && (
                <>
                  <span>·</span>
                  <span>{display.frameworkLabel}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
              {isDone && (
                <Link
                  href={`/project/${id}`}
                  className="font-mono text-[12px] font-bold px-3 py-1.5 rounded-lg transition-transform hover:-translate-y-px"
                  style={{ background: "var(--app-amber)", color: "#0D1321" }}
                >
                  Buka
                </Link>
              )}
              {isDone && (
                <a
                  href={`/api/export?projectId=${id}`}
                  className="font-mono text-[12px] font-semibold px-3 py-1.5 rounded-lg hidden sm:inline-flex transition-colors"
                  style={{
                    border: "0.5px solid var(--app-border-strong)",
                    color: "var(--app-text-secondary)",
                  }}
                >
                  Download
                </a>
              )}
              {status === "FAILED" && (
                <Link
                  href="/generate"
                  className="font-mono text-[12px] font-semibold px-3 py-1.5 rounded-lg"
                  style={{ border: "0.5px solid var(--app-border-strong)", color: "var(--app-text-secondary)" }}
                >
                  Coba lagi
                </Link>
              )}
              <button
                type="button"
                className="dashboard-icon-action p-2"
                onClick={startRename}
                title="Rename project"
              >
                <Pencil size={14} strokeWidth={1.75} />
              </button>
              {canDelete ? (
                <button
                  type="button"
                  className="dashboard-icon-action p-2 group/del"
                  onClick={() => onDelete(id)}
                  title="Hapus project"
                >
                  <Trash2 size={14} strokeWidth={1.75} className="group-hover/del:text-red-400 transition-colors" />
                </button>
              ) : (
                <button type="button" className="dashboard-icon-action p-2 opacity-40 cursor-not-allowed" disabled>
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              )}
              <button
                ref={menuBtnRef}
                type="button"
                className="dashboard-menu-btn p-2 rounded-lg lg:hidden"
                onClick={openMenu}
                aria-label="Menu project"
                aria-expanded={menuOpen}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>
      {dropdown}
    </>
  );
}
