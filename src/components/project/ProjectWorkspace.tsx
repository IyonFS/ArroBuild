"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ALL_FILE_KEYS, FILE_META, type FileKey } from "@/components/generate/types";
import { normalizeDocumentKey } from "@/lib/config/documents";
import { buildFeatIndex } from "@/lib/ai/section-revise";
import { buildExportTree, renderExportTreeAscii } from "@/lib/export-tree";
import FileSidebar, { type WorkspaceFile } from "./FileSidebar";
import DocumentPanel from "./DocumentPanel";
import RevisePanel from "./RevisePanel";
import WhatsAppSupportModal from "@/components/support/WhatsAppSupportModal";
import type { WhatsappQuotaDisplay } from "@/components/support/WhatsAppSupportCard";
import type { UserPlanStatus } from "@/components/generate/types";

interface ProjectPayload {
  id: string;
  idea: string;
  status: string;
  createdAt: string;
  presets?: { agentTool?: string };
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
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [userTier, setUserTier] = useState<UserPlanStatus>("none");
  const [whatsappQuota, setWhatsappQuota] = useState<WhatsappQuotaDisplay | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const draggingRef = useRef<"left" | "right" | null>(null);
  const leftWidthRef = useRef(260);
  const rightWidthRef = useRef(340);

  useEffect(() => {
    // Restore persisted widths after mount. Deferred so state updates don't run
    // synchronously inside the effect body (and to avoid a hydration mismatch).
    queueMicrotask(() => {
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
    });
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

  const startDrag = (which: "left" | "right", e: React.MouseEvent) => {
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
        const ia = ALL_FILE_KEYS.indexOf(
          (normalizeDocumentKey(a.fileKey) ?? a.fileKey) as FileKey
        );
        const ib = ALL_FILE_KEYS.indexOf(
          (normalizeDocumentKey(b.fileKey) ?? b.fileKey) as FileKey
        );
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
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        setUserTier(data.plan ?? data.tier ?? "none");
        setWhatsappQuota(data.whatsappQuota ?? null);
        setUserEmail(data.user?.email ?? "");
      })
      .catch(() => {});
  }, []);

  const activeFile = files.find((f) => f.fileKey === activeKey) ?? null;

  const featIndex = useMemo(
    () =>
      buildFeatIndex(
        files.map((f) => ({ fileKey: f.fileKey, content: f.content }))
      ),
    [files]
  );

  const exportTreePreview = useMemo(() => {
    if (!project) return "";
    const tree = buildExportTree(
      files.map((f) => ({ fileName: f.fileName, fileKey: f.fileKey })),
      {
        agentTool: project.presets?.agentTool,
        folderName: `arrobuild-${projectId.slice(0, 8)}`,
      }
    );
    return renderExportTreeAscii(tree);
  }, [files, project, projectId]);

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

  const handleFileSaved = (newContent: string, version: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.fileKey === activeKey ? { ...f, content: newContent, version } : f
      )
    );
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
            background: "var(--app-amber)",
            color: "#0D1321",
          }}
        >
          Kembali ke dashboard
        </Link>
      </div>
    );
  }

  const activeMeta = activeFile
    ? FILE_META[
        (normalizeDocumentKey(activeFile.fileKey) ??
          activeFile.fileKey) as FileKey
      ]
    : null;

  return (
    <div
      className="workspace-app flex flex-col"
      style={{
        height: "100dvh",
        background: "var(--app-bg-base)",
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
                  background: "rgba(255,176,32,0.1)",
                  color: "var(--app-amber)",
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
              className="font-unbounded font-bold text-sm truncate"
              style={{ color: "var(--app-text-primary)" }}
              title={ideaPreview}
            >
              {ideaPreview}
            </p>
            {featFocus && (
              <p
                className="text-[11px] mt-0.5 truncate"
                style={{
                  color: "var(--app-amber)",
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
                  background: "rgba(255,176,32,0.06)",
                  color: "rgba(255,176,32,0.85)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                {creditHint}
              </span>
            )}
            {(userTier === "pro" || userTier === "pro_max") && (
              <button
                type="button"
                onClick={() => setWaModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  borderRadius: 12,
                  background: "rgba(37,211,102,0.12)",
                  border: "1px solid rgba(37,211,102,0.35)",
                  color: "#25D366",
                }}
                title="Chat founder via WhatsApp"
              >
                <span aria-hidden>WA</span>
                <span className="hidden md:inline">Founder</span>
                {whatsappQuota && whatsappQuota.limit > 0 && (
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(0,0,0,0.25)" }}
                  >
                    {whatsappQuota.remaining}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setExportPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{
                borderRadius: 12,
                background: "var(--app-amber)",
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
            </button>
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div
        className="flex lg:hidden flex-shrink-0 px-2 gap-1 py-2 sticky top-0 z-20"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        }}
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
            className="flex-1 py-2.5 text-xs font-semibold min-h-[44px] transition-colors duration-200"
            style={{
              borderRadius: 10,
              color:
                mobileTab === id ? "#0A0A0A" : "rgba(255,255,255,0.5)",
              background:
                mobileTab === id ? "var(--app-amber)" : "rgba(255,255,255,0.04)",
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
      <div className="flex-1 min-h-0 p-2 sm:p-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Mobile: single panel */}
        <div className="h-full min-h-0 lg:hidden">
          <div key={mobileTab} className="h-full min-h-0 animate-fade-slide-up">
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
                projectId={projectId}
                file={activeFile}
                scrollToLine={scrollToLine}
                onFeatClick={handleFeatClick}
                onSaved={handleFileSaved}
              />
            </section>
          )}
          {mobileTab === "revise" && (
            <section
              className="h-full min-h-0 overflow-hidden"
              style={{
                borderRadius: 16,
                background: "rgba(18,18,18,0.95)",
                border: "1px solid rgba(255,176,32,0.12)",
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
            onMouseDown={(e) => startDrag("left", e)}
            className="flex-shrink-0 flex items-center justify-center group"
            style={{ width: 12, cursor: "col-resize" }}
          >
            <div
              className="h-12 w-1 rounded-full transition-all group-hover:h-20 group-hover:w-1.5"
              style={{ background: "rgba(255,176,32,0.35)" }}
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
              projectId={projectId}
              file={activeFile}
              scrollToLine={scrollToLine}
              onFeatClick={handleFeatClick}
              onSaved={handleFileSaved}
            />
          </section>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Sesuaikan lebar panel revisi"
            onMouseDown={(e) => startDrag("right", e)}
            className="flex-shrink-0 flex items-center justify-center group"
            style={{ width: 12, cursor: "col-resize" }}
          >
            <div
              className="h-12 w-1 rounded-full transition-all group-hover:h-20 group-hover:w-1.5"
              style={{ background: "rgba(255,176,32,0.35)" }}
            />
          </div>

          <section
            className="min-h-0 overflow-hidden flex-shrink-0"
            style={{
              width: rightWidth,
              borderRadius: 16,
              background: "rgba(18,18,18,0.95)",
              border: "1px solid rgba(255,176,32,0.12)",
              boxShadow: "0 0 24px rgba(255,176,32,0.04)",
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

      {exportPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setExportPreviewOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-5"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-sm font-bold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Preview struktur ZIP
            </h3>
            <pre
              className="text-[11px] p-3 rounded-xl overflow-x-auto mb-4"
              style={{
                background: "rgba(0,0,0,0.4)",
                color: "rgba(255,176,32,0.85)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              {exportTreePreview}
            </pre>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setExportPreviewOpen(false)}
                className="px-4 py-2 text-xs rounded-lg"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Batal
              </button>
              <a
                href={`/api/export?projectId=${projectId}`}
                className="px-4 py-2 text-xs font-bold rounded-lg"
                style={{ background: "var(--app-amber)", color: "#0A0A0A" }}
              >
                Unduh ZIP
              </a>
            </div>
          </div>
        </div>
      )}

      <WhatsAppSupportModal
        open={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        tier={userTier}
        quota={whatsappQuota}
        userEmail={userEmail}
        projectId={projectId}
        projectLabel={productLabel}
        onQuotaChange={setWhatsappQuota}
      />
    </div>
  );
}
