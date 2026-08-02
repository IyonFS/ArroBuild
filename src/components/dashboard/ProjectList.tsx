"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import ProjectCard from "./ProjectCard";
import ConfirmDialog from "./ConfirmDialog";
import { parseProjectIdea } from "@/lib/project-display";
import { getDisplayTitle } from "@/lib/project-meta";
import { useToast } from "@/components/ui/Toast";

export interface DashboardProject {
  id: string;
  idea: string;
  status: string;
  createdAt: string;
  presets?: unknown;
  planData?: unknown;
  _count: { files: number };
}

type StatusFilter = "all" | "DONE" | "FAILED" | "active";

const FILTER_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "DONE", label: "Selesai" },
  { id: "FAILED", label: "Gagal" },
  { id: "active", label: "Proses" },
];

interface ProjectListProps {
  projects: DashboardProject[];
  canFork: boolean;
  onProjectsChange: (projects: DashboardProject[]) => void;
  onRefresh?: () => Promise<boolean | void>;
}

export default function ProjectList({
  projects,
  canFork,
  onProjectsChange,
  onRefresh,
}: ProjectListProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const counts = useMemo(
    () => ({
      all: projects.length,
      DONE: projects.filter((p) => p.status === "DONE").length,
      FAILED: projects.filter((p) => p.status === "FAILED").length,
      active: projects.filter((p) => p.status === "GENERATING" || p.status === "PENDING").length,
    }),
    [projects]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter === "DONE" && p.status !== "DONE") return false;
      if (filter === "FAILED" && p.status !== "FAILED") return false;
      if (filter === "active" && p.status !== "GENERATING" && p.status !== "PENDING") return false;

      if (!q) return true;
      const custom = getDisplayTitle(p.planData);
      const display = parseProjectIdea(p.idea, custom);
      const haystack = [display.title, display.subtitle, display.productTypeLabel, p.status]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, query, filter]);

  async function handleRename(id: string, title: string) {
    const res = await fetch(`/api/project/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayTitle: title }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error ?? "Gagal rename project", "error");
      throw new Error(data.error);
    }
    onProjectsChange(
      projects.map((p) =>
        p.id === id
          ? {
              ...p,
              planData: {
                ...(typeof p.planData === "object" && p.planData ? p.planData : {}),
                displayTitle: title,
              },
            }
          : p
      )
    );
    toast("Nama project diperbarui", "success");
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/project/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error ?? "Gagal hapus project", "error");
        return;
      }
      onProjectsChange(projects.filter((p) => p.id !== deleteId));
      toast("Project berhasil dihapus", "success");
      setDeleteId(null);
      await onRefresh?.();
    } finally {
      setDeleting(false);
    }
  }

  const deleteTarget = projects.find((p) => p.id === deleteId);
  const deleteTitle = deleteTarget
    ? parseProjectIdea(deleteTarget.idea, getDisplayTitle(deleteTarget.planData)).title
    : "";

  return (
    <>
      <section className="mb-8">
        <div
          className="rounded-xl p-4 sm:p-5 mb-4"
          style={{
            background: "var(--app-bg-elevated)",
            border: "0.5px solid var(--app-border-default)",
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2
                className="font-unbounded text-[17px] font-bold mb-1"
                style={{ color: "var(--app-text-primary)" }}
              >
                Project kamu
              </h2>
              <p className="font-mono text-[12px]" style={{ color: "var(--app-text-secondary)", opacity: 0.7 }}>
                Menampilkan {filtered.length} dari {projects.length} project
              </p>
            </div>

            <div className="dashboard-search-field w-full lg:max-w-xs relative">
              <Search className="dashboard-search-icon" size={15} strokeWidth={2} aria-hidden />
              <input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                placeholder="Cari project..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Cari project"
                className="input dashboard-search-input text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 border-b relative" style={{ borderColor: "var(--app-border-default)" }}>
            {FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.id;
              const count = counts[opt.id];
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilter(opt.id)}
                  className="relative px-4 py-2.5 font-mono text-[12px] font-semibold transition-colors"
                  style={{
                    color: active ? "var(--app-text-primary)" : "var(--app-text-secondary)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {opt.label}
                    <span
                      className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: active ? "rgba(255,176,32,0.12)" : "var(--app-bg-hover)",
                        color: active ? "var(--app-amber)" : "var(--app-text-tertiary)",
                      }}
                    >
                      {count}
                    </span>
                  </span>
                  {active && (
                    <motion.span
                      layoutId="dashboard-project-filter-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ 
                        background: "var(--app-bg-hover)",
                        border: "0.5px solid var(--app-border-strong)"
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div
            className="dashboard-empty-state rounded-xl px-6 py-14 text-center"
            style={{
              background: "var(--app-bg-elevated)",
              border: "0.5px dashed var(--app-border-default)",
            }}
          >
            {projects.length === 0 ? (
              <>
                <p className="font-unbounded text-lg font-bold mb-2" style={{ color: "var(--app-text-primary)" }}>
                  Belum ada project
                </p>
                <p
                  className="font-mono text-[13px] mb-6 max-w-sm mx-auto"
                  style={{ color: "var(--app-text-secondary)", opacity: 0.7 }}
                >
                  Mulai dari satu ide — ArroBuild akan susun PRD dan file pendukungnya.
                </p>
                <Link
                  href="/generate"
                  className="btn btn-primary btn-sm"
                  style={{ background: "var(--app-amber)", color: "#0D1321" }}
                >
                  Mulai generate
                </Link>
              </>
            ) : (
              <>
                <p className="font-unbounded text-base font-bold mb-2" style={{ color: "var(--app-text-primary)" }}>
                  Tidak ada hasil
                </p>
                <p className="font-mono text-[13px] mb-4" style={{ color: "var(--app-text-secondary)" }}>
                  Coba ubah filter atau kata kunci pencarian.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Reset filter
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ 
              background: "var(--app-bg-elevated)",
              border: "1px solid var(--app-border-default)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
            }}
          >
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                idea={project.idea}
                status={project.status}
                createdAt={project.createdAt}
                fileCount={project._count.files}
                presets={project.presets}
                planData={project.planData}
                canFork={canFork}
                onRename={handleRename}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Hapus project?"
        description={`"${deleteTitle}" akan dihapus permanen beserta semua file yang digenerate. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, hapus"
        destructive
        loading={deleting}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => !deleting && setDeleteId(null)}
      />
    </>
  );
}
