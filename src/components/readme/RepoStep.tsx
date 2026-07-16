"use client";

import { useState } from "react";
import type { ManualFields } from "./types";
import ReadmeDialog from "./ReadmeDialog";

interface Props {
  repoUrl: string;
  confirmedTechStack: string;
  manual: ManualFields;
  onRepoUrlChange: (url: string) => void;
  onDetected: (data: {
    projectName: string;
    description: string;
    techStack: string;
    existingReadme: string | null;
  }) => void;
  onTechStackChange: (stack: string) => void;
  onManualChange: (manual: ManualFields) => void;
  onUseOldReadme: (use: boolean) => void;
  onSwitchManual: () => void;
  onBack: () => void;
  onNext: () => void;
}

type DialogState =
  | { type: "invalid_url" }
  | { type: "not_found" }
  | { type: "incomplete" }
  | { type: "old_readme" }
  | null;

export default function RepoStep({
  repoUrl,
  confirmedTechStack,
  manual,
  onRepoUrlChange,
  onDetected,
  onTechStackChange,
  onManualChange,
  onUseOldReadme,
  onSwitchManual,
  onBack,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState(false);
  const [editingStack, setEditingStack] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const fetchRepo = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    setDetected(false);
    try {
      const res = await fetch("/api/tools/github-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "INVALID_URL") setDialog({ type: "invalid_url" });
        else if (data.code === "NOT_FOUND") setDialog({ type: "not_found" });
        else if (data.code === "INCOMPLETE") setDialog({ type: "incomplete" });
        else setDialog({ type: "not_found" });
        return;
      }

      const repo = data.data;
      const stack = repo.techStack.join(", ");
      onDetected({
        projectName: repo.name,
        description: repo.description ?? "",
        techStack: stack,
        existingReadme: repo.existingReadme,
      });
      setDetected(true);

      if (repo.existingReadme) {
        setDialog({ type: "old_readme" });
      }
    } catch {
      setDialog({ type: "not_found" });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = detected && confirmedTechStack.trim() && manual.projectName.trim();

  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        URL GitHub Repo
      </h2>
      <p className="mb-6 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Hanya repo publik. Kami akan tampilkan data terdeteksi untuk dikonfirmasi.
      </p>

      <div className="flex gap-2">
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => {
            onRepoUrlChange(e.target.value);
            setDetected(false);
          }}
          placeholder="github.com/username/repo"
          className="flex-1 rounded-lg px-4 py-3 font-mono text-sm"
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-default)",
            color: "var(--color-text-primary)",
          }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={fetchRepo}
          disabled={loading || !repoUrl.trim()}
        >
          {loading ? "…" : "Fetch"}
        </button>
      </div>

      {detected && (
        <div
          className="mt-6 rounded-xl p-5"
          style={{
            background: "rgba(56,189,248,0.06)",
            border: "0.5px solid rgba(56,189,248,0.25)",
          }}
        >
          <p
            className="mb-3 font-mono text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--app-sky)" }}
          >
            Data terdeteksi — konfirmasi atau edit
          </p>

          <label className="mb-4 block">
            <span className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Nama proyek
            </span>
            <input
              value={manual.projectName}
              onChange={(e) => onManualChange({ ...manual, projectName: e.target.value })}
              className="mt-1 w-full rounded-lg px-3 py-2 font-mono text-sm"
              style={{
                background: "var(--color-bg-base)",
                border: "0.5px solid var(--color-border-default)",
                color: "var(--color-text-primary)",
              }}
            />
          </label>

          {editingStack ? (
            <label className="mb-4 block">
              <span className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Tech stack
              </span>
              <input
                value={confirmedTechStack}
                onChange={(e) => onTechStackChange(e.target.value)}
                className="mt-1 w-full rounded-lg px-3 py-2 font-mono text-sm"
                style={{
                  background: "var(--color-bg-base)",
                  border: "0.5px solid var(--color-border-default)",
                  color: "var(--color-text-primary)",
                }}
              />
            </label>
          ) : (
            <p className="mb-4 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Kami deteksi: <strong style={{ color: "var(--color-text-primary)" }}>{confirmedTechStack}</strong>{" "}
              — betul?{" "}
              <button
                type="button"
                className="font-mono text-xs underline"
                style={{ color: "var(--app-sky)" }}
                onClick={() => setEditingStack(true)}
              >
                Edit
              </button>
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Kembali
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canProceed}
          onClick={onNext}
        >
          Lanjut →
        </button>
      </div>

      <ReadmeDialog
        open={dialog?.type === "invalid_url"}
        title="URL tidak valid"
        description="Format yang benar: github.com/username/repo"
        actions={[{ label: "Coba lagi", onClick: () => setDialog(null), primary: true }]}
        onClose={() => setDialog(null)}
      />

      <ReadmeDialog
        open={dialog?.type === "not_found"}
        title="Repo tidak ditemukan"
        description="Repo ini private atau tidak ditemukan. ArroBuild cuma bisa baca repo publik."
        actions={[
          { label: "Coba URL lain", onClick: () => setDialog(null) },
          {
            label: "Pindah ke Mode Manual",
            onClick: () => {
              setDialog(null);
              onSwitchManual();
            },
            primary: true,
          },
        ]}
        onClose={() => setDialog(null)}
      />

      <ReadmeDialog
        open={dialog?.type === "incomplete"}
        title="Struktur repo tidak terbaca"
        description="Repo ditemukan, tapi kami tidak bisa membaca strukturnya (repo kosong atau tidak ada package.json). Lengkapi beberapa info dasar secara manual, atau pindah ke Mode Manual sepenuhnya."
        actions={[
          {
            label: "Lengkapi manual",
            onClick: () => {
              setDialog(null);
              setDetected(true);
            },
          },
          {
            label: "Pindah ke Mode Manual",
            onClick: () => {
              setDialog(null);
              onSwitchManual();
            },
            primary: true,
          },
        ]}
        onClose={() => setDialog(null)}
      />

      <ReadmeDialog
        open={dialog?.type === "old_readme"}
        title="README lama ditemukan"
        description="Kami menemukan README lama di repo ini. Mau dipakai sebagai referensi gaya, atau generate dari nol sesuai template pilihanmu?"
        actions={[
          {
            label: "Pakai sebagai referensi",
            onClick: () => {
              onUseOldReadme(true);
              setDialog(null);
            },
          },
          {
            label: "Generate dari nol",
            onClick: () => {
              onUseOldReadme(false);
              setDialog(null);
            },
            primary: true,
          },
        ]}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
