"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProjectSummary } from "./types";

interface Props {
  projectId: string | null;
  onSelect: (project: ProjectSummary, architecture: string, prd: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function ProjectStep({ projectId, onSelect, onBack, onNext }: Props) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingId, setFetchingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (project: ProjectSummary) => {
    setFetchingId(project.id);
    try {
      const res = await fetch(`/api/project/${project.id}`);
      const data = await res.json();
      const arch =
        data.files?.find((f: { fileKey: string }) => f.fileKey === "architecture")?.content ?? "";
      const prd =
        data.files?.find((f: { fileKey: string }) => f.fileKey === "prd")?.content ?? "";
      onSelect(project, arch, prd);
    } finally {
      setFetchingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Pilih project
      </h2>
      <p className="mb-8 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Kami akan pakai PRD dan Architecture dari project ini.
      </p>

      {loading ? (
        <p className="font-mono text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          Memuat project…
        </p>
      ) : projects.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          <p className="mb-4 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Kamu belum punya project.
          </p>
          <Link href="/generate" className="btn btn-primary btn-sm">
            Generate project dulu →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((p) => {
            const selected = projectId === p.id;
            const fetching = fetchingId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={!!fetchingId}
                onClick={() => handleSelect(p)}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: selected ? "rgba(56,189,248,0.08)" : "var(--color-bg-elevated)",
                  border: selected
                    ? "1.5px solid rgba(56,189,248,0.5)"
                    : "0.5px solid var(--color-border-default)",
                }}
              >
                <div
                  className="font-mono text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {p.idea.slice(0, 80)}
                  {fetching && " …"}
                </div>
                <div
                  className="mt-1 font-mono text-[11px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {p._count?.files ?? 0} dokumen · {p.status}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Kembali
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!projectId}
          onClick={onNext}
        >
          Lanjut →
        </button>
      </div>
    </div>
  );
}
