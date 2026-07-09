"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ALL_FILE_KEYS, FILE_META, type FileKey } from "@/components/generate/types";
import { buildFeatIndex } from "@/lib/ai/section-revise";
import FileSidebar, { type WorkspaceFile } from "./FileSidebar";
import DocumentPanel from "./DocumentPanel";
import RevisePanel from "./RevisePanel";

interface ProjectPayload {
  id: string;
  idea: string;
  status: string;
  createdAt: string;
  files: WorkspaceFile[];
}

type MobileTab = "files" | "doc" | "revise";

interface Props {
  projectId: string;
}

export default function ProjectWorkspace({ projectId }: Props) {
  const [project, setProject] = useState<ProjectPayload | null>(null);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);
  const [featFocus, setFeatFocus] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("doc");
  const [creditHint, setCreditHint] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(340);
  const draggingRef = useRef<"left" | "right" | null>(null);
  const leftWidthRef = useRef(260);
  const rightWidthRef = useRef(340);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("arrobuild_workspace_widths");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { left?: number; right?: number };
      if (parsed.left) {
        const w = Math.min(420, Math.max(200, parsed.left));
        setLeftWidth(w);
        leftWidthRef.current = w;
      }
      if (parsed.right) {
        const w = Math.min(480, Math.max(280, parsed.right));
        setRightWidth(w);
        rightWidthRef.current = w;
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const which = draggingRef.current;
      if (!which) return;
      const root = document.getElementById("ws-panels");
      if (!root) return;
      const rect = root.getBoundingClientRect();
      if (which === "left") {
        const next = Math.min(420, Math.max(200, e.clientX - rect.left));
        leftWidthRef.current = next;
        setLeftWidth(next);
      } else {
        const next = Math.min(480, Math.max(280, rect.right - e.clientX));
        rightWidthRef.current = next;
        setRightWidth(next);
      }
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      try {
        localStorage.setItem(
          "arrobuild_workspace_widths",
          JSON.stringify({
            left: leftWidthRef.current,
            right: rightWidthRef.current,
          })
        );
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startDrag = (which: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = which;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/project/${projectId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat project");
      }
      const p = data.project as ProjectPayload;
      const ordered = [...(p.files ?? [])].sort((a, b) => {
        const ia = ALL_FILE_KEYS.indexOf(a.fileKey as FileKey);
        const ib = ALL_FILE_KEYS.indexOf(b.fileKey as FileKey);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });
      setProject(p);
      setFiles(ordered);
      setActiveKey((prev) => prev || ordered[0]?.fileKey || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFile = files.find((f) => f.fileKey === activeKey) ?? null;

  const featIndex = useMemo(
    () =>
      buildFeatIndex(
        files.map((f) => ({ fileKey: f.fileKey, content: f.content }))
      ),
    [files]
  );

  const featCounts = useMemo(() => {
    const unique: Record<string, Set<string>> = {};
    for (const [id, locs] of Object.entries(featIndex)) {
      for (const loc of locs) {
        if (!unique[loc.fileKey]) unique[loc.fileKey] = new Set();
        unique[loc.fileKey].add(id);
      }
    }
    const result: Record<string, number> = {};
    for (const [k, set] of Object.entries(unique)) {
      result[k] = set.size;
    }
    return result;
  }, [featIndex]);

  const handleFeatClick = (featId: string) => {
    setFeatFocus(featId);
    const locs = featIndex[featId] ?? [];
    const other = locs.find((l) => l.fileKey !== activeKey) ?? locs[0];
    if (!other) return;
    setActiveKey(other.fileKey);
    setScrollToLine(other.line);
    setMobileTab("doc");
  };

  const handleAccepted = (
    newContent: string,
    version: number,
    balanceAfter?: number
  ) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.fileKey === activeKey
          ? {
              ...f,
              content: newContent,
              version,
              revisions: [
                {
                  id: `local-${version}`,
                  version,
                  revisionType: "section",
                  sectionName: null,
                  createdAt: new Date().toISOString(),
                },
                ...(f.revisions ?? []),
              ],
            }
          : f
      )
    );
    if (typeof balanceAfter === "number") {
      setCreditHint(`${balanceAfter.toLocaleString()} kredit tersisa`);
    }
    void load();
  };

  let ideaPreview = project?.idea ?? "";
  let productLabel = "Project";
  try {
    if (ideaPreview.startsWith("{")) {
      const parsed = JSON.parse(ideaPreview);
      productLabel = String(parsed.productType ?? "Project").toUpperCase();
      ideaPreview =
        parsed.context?.mainProblem ||
        parsed.context?.targetUser ||
        parsed.productType ||
        ideaPreview.slice(0, 120);
    }
  } catch {
    ideaPreview = ideaPreview.slice(0, 120);
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-sm"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Memuat workspace...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p style={{ color: "#EF4444" }}>{error || "Project tidak ditemukan"}</p>
        <Link
          href="/dashboard"
          className="px-5 py-3 text-sm font-semibold"
          style={{
            borderRadius: 12,
            background: "var(--color-lime)",
            color: "#0A0A0A",
          }}
        >
          Kembali ke dashboard
        </Link>
      </div>
    );
  }

  const activeMeta = activeFile
    ? FILE_META[activeFile.fileKey as FileKey]
    : null;

  return (
    <div
      className="flex flex-col"
      style={{
        height: "100dvh",
        background: "#070707",
      }}
    >
      {/* Workspace chrome — no marketing nav */}
      <header
        className="flex-shrink-0 px-4 sm:px-5"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(12,12,12,0.96)",
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4 h-[64px]">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-90"
            style={{
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "var(--color-text-primary)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                style={{
                  borderRadius: 999,
                  background: "rgba(204,255,0,0.1)",
                  color: "var(--color-lime)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                {productLabel}
              </span>
              <span
                className="text-[10px] hidden md:inline"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                Workspace · {files.length} dokumen
              </span>
            </div>
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--color-text-primary)" }}
              title={ideaPreview}
            >
              {ideaPreview}
            </p>
            {featFocus && (
              <p
                className="text-[11px] mt-0.5 truncate"
                style={{
                  color: "var(--color-lime)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                Fokus {featFocus}
                {(featIndex[featFocus] ?? []).length > 1
                  ? ` · ${(featIndex[featFocus] ?? []).length} referensi`
                  : ""}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {creditHint && (
              <span
                className="text-[11px] hidden lg:inline px-2.5 py-1.5"
                style={{
                  borderRadius: 8,
                  background: "rgba(204,255,0,0.06)",
                  color: "rgba(204,255,0,0.75)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                {creditHint}
              </span>
            )}
            <a
              href={`/api/export?projectId=${projectId}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{
                borderRadius: 12,
                background: "var(--color-lime)",
                color: "#0A0A0A",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V3" />
              </svg>
              <span className="hidden sm:inline">Unduh ZIP</span>
              <span className="sm:hidden">ZIP</span>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div
        className="flex lg:hidden flex-shrink-0 px-3 gap-1 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {(
          [
            ["files", "Files"],
            ["doc", "Dokumen"],
            ["revise", "Revisi"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobileTab(id)}
            className="flex-1 py-2.5 text-xs font-semibold"
            style={{
              borderRadius: 10,
              color:
                mobileTab === id ? "#0A0A0A" : "rgba(255,255,255,0.5)",
              background:
                mobileTab === id ? "var(--color-lime)" : "rgba(255,255,255,0.04)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Desktop panel labels */}
      <div
        className="hidden lg:flex flex-shrink-0 px-4 pt-3 gap-0"
        id="ws-panel-labels"
      >
        <p
          className="text-[10px] uppercase tracking-[0.16em] px-1 flex-shrink-0"
          style={{
            width: leftWidth,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          }}
        >
          Dokumen
        </p>
        <div className="w-3 flex-shrink-0" />
        <p
          className="text-[10px] uppercase tracking-[0.16em] px-1 min-w-0 flex-1"
          style={{
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          }}
        >
          {activeMeta ? `Editor · ${activeMeta.label}` : "Editor"}
        </p>
        <div className="w-3 flex-shrink-0" />
        <p
          className="text-[10px] uppercase tracking-[0.16em] px-1 flex-shrink-0"
          style={{
            width: rightWidth,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          }}
        >
          Revisi AI
        </p>
      </div>

      {/* 3 resizable panels */}
      <div className="flex-1 min-h-0 p-3 sm:p-4 pt-2">
        {/* Mobile: single panel */}
        <div className="h-full min-h-0 lg:hidden">
          {mobileTab === "files" && (
            <section
              className="h-full min-h-0 overflow-hidden"
              style={{
                borderRadius: 16,
                background: "rgba(18,18,18,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <FileSidebar
                files={files}
                activeKey={activeKey}
                onSelect={(key) => {
                  setActiveKey(key);
                  setScrollToLine(null);
                  setMobileTab("doc");
                }}
                featCounts={featCounts}
              />
            </section>
          )}
          {mobileTab === "doc" && (
            <section
              className="h-full min-h-0 overflow-hidden"
              style={{
                borderRadius: 16,
                background: "rgba(14,14,14,0.98)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <DocumentPanel
                file={activeFile}
                scrollToLine={scrollToLine}
                onFeatClick={handleFeatClick}
              />
            </section>
          )}
          {mobileTab === "revise" && (
            <section
              className="h-full min-h-0 overflow-hidden"
              style={{
                borderRadius: 16,
                background: "rgba(18,18,18,0.95)",
                border: "1px solid rgba(204,255,0,0.12)",
              }}
            >
              <RevisePanel
                projectId={projectId}
                file={activeFile}
                onAccepted={handleAccepted}
              />
            </section>
          )}
        </div>

        {/* Desktop: resizable columns */}
        <div
          id="ws-panels"
          className="hidden lg:flex h-full min-h-0 gap-0"
        >
          <section
            className="min-h-0 overflow-hidden flex-shrink-0"
            style={{
              width: leftWidth,
              borderRadius: 16,
              background: "rgba(18,18,18,0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            }}
          >
            <FileSidebar
              files={files}
              activeKey={activeKey}
              onSelect={(key) => {
                setActiveKey(key);
                setScrollToLine(null);
              }}
              featCounts={featCounts}
            />
          </section>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Sesuaikan lebar panel dokumen"
            onMouseDown={startDrag("left")}
            className="flex-shrink-0 flex items-center justify-center group"
            style={{ width: 12, cursor: "col-resize" }}
          >
            <div
              className="h-12 w-1 rounded-full transition-all group-hover:h-20 group-hover:w-1.5"
              style={{ background: "rgba(204,255,0,0.35)" }}
            />
          </div>

          <section
            className="min-h-0 overflow-hidden flex-1 min-w-0"
            style={{
              borderRadius: 16,
              background: "rgba(14,14,14,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <DocumentPanel
              file={activeFile}
              scrollToLine={scrollToLine}
              onFeatClick={handleFeatClick}
            />
          </section>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Sesuaikan lebar panel revisi"
            onMouseDown={startDrag("right")}
            className="flex-shrink-0 flex items-center justify-center group"
            style={{ width: 12, cursor: "col-resize" }}
          >
            <div
              className="h-12 w-1 rounded-full transition-all group-hover:h-20 group-hover:w-1.5"
              style={{ background: "rgba(204,255,0,0.35)" }}
            />
          </div>

          <section
            className="min-h-0 overflow-hidden flex-shrink-0"
            style={{
              width: rightWidth,
              borderRadius: 16,
              background: "rgba(18,18,18,0.95)",
              border: "1px solid rgba(204,255,0,0.12)",
              boxShadow: "0 0 24px rgba(204,255,0,0.04)",
            }}
          >
            <RevisePanel
              projectId={projectId}
              file={activeFile}
              onAccepted={handleAccepted}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
