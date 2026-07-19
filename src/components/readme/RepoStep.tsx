"use client";

import { useState } from "react";
import type { ManualFields } from "./types";
import ReadmeDialog from "./ReadmeDialog";

interface Props {
  repoUrl: string;
  confirmedTechStack: string;
  manual: ManualFields;
  useOldReadme: boolean | null;
  existingReadme: string | null;
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
  | { type: "rate_limit" }
  | { type: "login_required" }
  | { type: "old_readme" }
  | { type: "generic"; message: string }
  | null;

const inputStyle = {
  background: "var(--color-bg-base)",
  border: "0.5px solid var(--color-border-default)",
  color: "var(--color-text-primary)",
} as const;

export default function RepoStep({
  repoUrl,
  confirmedTechStack,
  manual,
  useOldReadme,
  existingReadme,
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
  const [needsManualFill, setNeedsManualFill] = useState(false);
  const [editingStack, setEditingStack] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const applyDetected = (repo: {
    name: string;
    description: string | null;
    techStack: string[];
    existingReadme: string | null;
  }) => {
    const stack = repo.techStack.join(", ");
    onDetected({
      projectName: repo.name,
      description: repo.description ?? "",
      techStack: stack,
      existingReadme: repo.existingReadme,
    });
    setDetected(true);
  };

  const fetchRepo = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    setDetected(false);
    setNeedsManualFill(false);
    try {
      const res = await fetch("/api/tools/github-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || data.code === "UNAUTHORIZED") {
          setDialog({ type: "login_required" });
        } else if (data.code === "INVALID_URL") {
          setDialog({ type: "invalid_url" });
        } else if (data.code === "NOT_FOUND") {
          setDialog({ type: "not_found" });
        } else if (data.code === "RATE_LIMIT") {
          setDialog({ type: "rate_limit" });
        } else {
          setDialog({
            type: "generic",
            message: data.error || "Gagal mengambil data repo. Coba lagi.",
          });
        }
        return;
      }

      const repo = data.data;
      applyDetected(repo);

      if (data.incomplete || repo.incomplete) {
        setDialog({ type: "incomplete" });
        return;
      }

      if (repo.existingReadme) {
        setDialog({ type: "old_readme" });
      }
    } catch {
      setDialog({ type: "not_found" });
    } finally {
      setLoading(false);
    }
  };

  const oldReadmeChoicePending = Boolean(existingReadme) && useOldReadme === null;
  const canProceed =
    detected &&
    manual.projectName.trim() &&
    manual.description.trim() &&
    confirmedTechStack.trim() &&
    !oldReadmeChoicePending &&
    dialog === null;

  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        URL GitHub Repo
      </h2>
      <p className="mb-2 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Hanya repo publik. Kami akan tampilkan data terdeteksi untuk dikonfirmasi.
      </p>
      <p className="mb-6 font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        Contoh: github.com/gyonmd-tech/Hybloggyon — nama repo harus sama persis (huruf besar/kecil ikut).
      </p>

      <div className="flex gap-2">
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => {
            onRepoUrlChange(e.target.value);
            setDetected(false);
            setNeedsManualFill(false);
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
            {needsManualFill
              ? "Lengkapi info dasar"
              : "Data terdeteksi — konfirmasi atau edit"}
          </p>

          <label className="mb-4 block">
            <span className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Nama proyek *
            </span>
            <input
              value={manual.projectName}
              onChange={(e) => onManualChange({ ...manual, projectName: e.target.value })}
              className="mt-1 w-full rounded-lg px-3 py-2 font-mono text-sm"
              style={inputStyle}
            />
          </label>

          {(needsManualFill || !manual.description) && (
            <label className="mb-4 block">
              <span className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Deskripsi *
              </span>
              <textarea
                value={manual.description}
                onChange={(e) => onManualChange({ ...manual, description: e.target.value })}
                rows={3}
                placeholder="Apa yang dilakukan proyek ini?"
                className="mt-1 w-full resize-y rounded-lg px-3 py-2 font-mono text-sm"
                style={inputStyle}
              />
            </label>
          )}

          {needsManualFill || editingStack ? (
            <label className="mb-4 block">
              <span className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Tech stack *
              </span>
              <input
                value={confirmedTechStack}
                onChange={(e) => {
                  onTechStackChange(e.target.value);
                  onManualChange({ ...manual, techStack: e.target.value });
                }}
                placeholder="Next.js, TypeScript, Tailwind"
                className="mt-1 w-full rounded-lg px-3 py-2 font-mono text-sm"
                style={inputStyle}
              />
            </label>
          ) : (
            <p className="mb-4 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Kami deteksi:{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {confirmedTechStack || "—"}
              </strong>{" "}
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

          {needsManualFill && (
            <label className="mb-2 block">
              <span className="font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Fitur utama
              </span>
              <textarea
                value={manual.features}
                onChange={(e) => onManualChange({ ...manual, features: e.target.value })}
                rows={3}
                placeholder="Satu fitur per baris…"
                className="mt-1 w-full resize-y rounded-lg px-3 py-2 font-mono text-sm"
                style={inputStyle}
              />
            </label>
          )}

          {oldReadmeChoicePending && (
            <p
              className="mt-3 font-mono text-xs"
              style={{ color: "var(--color-warning, #D97706)" }}
            >
              Pilih dulu: pakai README lama sebagai referensi, atau generate dari nol.
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
        description="Repo tidak ditemukan atau private. Cek ejaan URL (username/nama-repo harus sama persis dengan di GitHub). ArroBuild hanya bisa baca repo publik."
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
        open={dialog?.type === "login_required"}
        title="Login diperlukan"
        description="Mode Repo butuh akun ArroBuild. Masuk dulu, lalu fetch ulang URL-nya."
        actions={[
          { label: "Nanti saja", onClick: () => setDialog(null) },
          {
            label: "Masuk",
            onClick: () => {
              window.location.href = "/login?next=/tools/readme-generator";
            },
            primary: true,
          },
        ]}
        onClose={() => setDialog(null)}
      />

      <ReadmeDialog
        open={dialog?.type === "generic"}
        title="Gagal fetch repo"
        description={dialog?.type === "generic" ? dialog.message : ""}
        actions={[{ label: "Coba lagi", onClick: () => setDialog(null), primary: true }]}
        onClose={() => setDialog(null)}
      />

      <ReadmeDialog
        open={dialog?.type === "rate_limit"}
        title="Rate limit GitHub"
        description="GitHub API rate limit tercapai. Coba lagi beberapa menit, atau pastikan GITHUB_TOKEN sudah di-set di server."
        actions={[{ label: "Coba lagi", onClick: () => setDialog(null), primary: true }]}
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
              setNeedsManualFill(true);
              setEditingStack(true);
              setDialog(existingReadme ? { type: "old_readme" } : null);
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
      />
    </div>
  );
}
