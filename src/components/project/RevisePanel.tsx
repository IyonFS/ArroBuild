"use client";

import { useEffect, useMemo, useState } from "react";
import {
  estimateRevisionCredits,
  parseMarkdownSections,
  unifiedDiff,
} from "@/lib/ai/section-revise";
import type { WorkspaceFile } from "./FileSidebar";

interface DiffRow {
  type: "same" | "add" | "del";
  text: string;
}

interface PreviewResult {
  reservationId: string;
  estimatedCredits: number;
  sectionName: string;
  beforeSection: string;
  afterSection: string;
  fullProposed: string;
  diff: DiffRow[];
}

interface Props {
  projectId: string;
  file: WorkspaceFile | null;
  onAccepted: (newContent: string, version: number, balanceAfter?: number) => void;
}

const QUICK_PROMPTS = [
  "Perjelas acceptance criteria",
  "Ringkas tanpa hilangkan FEAT-ID",
  "Tambah edge case & error state",
];

export default function RevisePanel({ projectId, file, onAccepted }: Props) {
  const sections = useMemo(
    () => (file ? parseMarkdownSections(file.content) : []),
    [file?.content, file?.id, file?.version]
  );
  const [sectionName, setSectionName] = useState("");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  useEffect(() => {
    setPreview(null);
    setError(null);
    setInstruction("");
    if (sections[0]) setSectionName(sections[0].title);
    else setSectionName("");
  }, [file?.id, file?.version]);

  // Re-sync default when sections list changes for same file
  useEffect(() => {
    if (!sectionName && sections[0]) setSectionName(sections[0].title);
    if (sectionName && !sections.some((s) => s.title === sectionName) && sections[0]) {
      setSectionName(sections[0].title);
    }
  }, [sections, sectionName]);

  const selected = sections.find((s) => s.title === sectionName);
  const estimate = selected ? estimateRevisionCredits(selected.content) : 0;

  const runPreview = async () => {
    if (!file || !sectionName || !instruction.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/project/${projectId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          fileKey: file.fileKey,
          sectionName,
          instruction: instruction.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat preview revisi");
      }
      setPreview({
        reservationId: data.reservationId,
        estimatedCredits: data.estimatedCredits,
        sectionName: data.sectionName,
        beforeSection: data.beforeSection,
        afterSection: data.afterSection,
        fullProposed: data.fullProposed,
        diff: data.diff ?? unifiedDiff(data.beforeSection, data.afterSection),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const cancelPreview = async () => {
    if (!preview) return;
    setBusy(true);
    try {
      await fetch(`/api/project/${projectId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          reservationId: preview.reservationId,
        }),
      });
      setPreview(null);
    } catch {
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };

  const acceptPreview = async () => {
    if (!file || !preview) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/project/${projectId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          fileKey: file.fileKey,
          reservationId: preview.reservationId,
          newContent: preview.fullProposed,
          sectionName: preview.sectionName,
          estimatedCredits: preview.estimatedCredits,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan revisi");
      }
      onAccepted(data.content, data.version, data.balanceAfter);
      setPreview(null);
      setInstruction("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  if (!file) {
    return (
      <div className="p-4 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
        Pilih dokumen untuk merevisi section.
      </div>
    );
  }

  return (
    <aside className="h-full flex flex-col overflow-hidden">
      <div
        className="px-4 py-3.5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Rewrite section
        </p>
        <p
          className="text-[11px] mt-1 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Pilih heading, tulis instruksi, lihat diff, lalu Accept.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Section picker — custom list, not native select */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[10px] uppercase tracking-[0.14em] font-semibold"
              style={{
                color: "rgba(255,255,255,0.45)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              Pilih section
            </span>
            <span
              className="text-[10px]"
              style={{
                color: "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              {sections.length} heading
            </span>
          </div>
          <div
            className="space-y-1.5 overflow-y-auto p-1.5"
            style={{
              maxHeight: 180,
              borderRadius: 14,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {sections.map((s) => {
              const active = s.title === sectionName;
              return (
                <button
                  key={`${s.startLine}-${s.title}`}
                  type="button"
                  disabled={!!preview || busy}
                  onClick={() => setSectionName(s.title)}
                  className="w-full text-left px-3 py-2.5 transition-all disabled:opacity-50"
                  style={{
                    borderRadius: 10,
                    paddingLeft: s.level === 3 ? 28 : 12,
                    background: active
                      ? "rgba(204,255,0,0.12)"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(204,255,0,0.4)"
                      : "1px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold w-6 h-6 inline-flex items-center justify-center flex-shrink-0"
                      style={{
                        borderRadius: 7,
                        background: active
                          ? "rgba(204,255,0,0.2)"
                          : "rgba(255,255,255,0.06)",
                        color: active
                          ? "var(--color-lime)"
                          : "rgba(255,255,255,0.4)",
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}
                    >
                      H{s.level}
                    </span>
                    <span
                      className="text-[13px] font-medium truncate"
                      style={{
                        color: active
                          ? "var(--color-lime)"
                          : "var(--color-text-primary)",
                      }}
                    >
                      {s.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instruction */}
        <div>
          <span
            className="text-[10px] uppercase tracking-[0.14em] font-semibold"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}
          >
            Instruksi
          </span>
          <div
            className="mt-2"
            style={{
              borderRadius: 14,
              background: "rgba(0,0,0,0.35)",
              border: instruction.trim()
                ? "1px solid rgba(204,255,0,0.35)"
                : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              disabled={!!preview || busy}
              rows={4}
              placeholder="Apa yang mau diubah di section ini?"
              className="w-full px-3.5 pt-3 pb-2 text-sm outline-none resize-none bg-transparent"
              style={{
                color: "var(--color-text-primary)",
                lineHeight: 1.55,
              }}
            />
            <div
              className="flex flex-wrap gap-1.5 px-3 pb-3"
            >
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={!!preview || busy}
                  onClick={() => setInstruction(q)}
                  className="text-[11px] px-2.5 py-1 transition-colors"
                  style={{
                    borderRadius: 999,
                    background: instruction === q
                      ? "rgba(204,255,0,0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color:
                      instruction === q
                        ? "var(--color-lime)"
                        : "rgba(255,255,255,0.5)",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl px-3.5 py-2.5 text-xs flex items-center justify-between gap-2"
          style={{
            background: "rgba(204,255,0,0.06)",
            border: "1px solid rgba(204,255,0,0.2)",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>Estimasi kredit</span>
          <span style={{ color: "var(--color-lime)", fontWeight: 700 }}>
            ~{preview?.estimatedCredits ?? estimate} · HEMAT
          </span>
        </div>

        {error && (
          <p className="text-xs" style={{ color: "#EF4444" }}>
            {error}
          </p>
        )}

        {!preview ? (
          <button
            type="button"
            onClick={() => void runPreview()}
            disabled={busy || !instruction.trim() || !sectionName}
            className="w-full py-3 text-sm font-bold disabled:opacity-40"
            style={{
              borderRadius: 12,
              background: "var(--color-lime)",
              color: "#0A0A0A",
            }}
          >
            {busy ? "Menyusun preview..." : "Preview revisi"}
          </button>
        ) : (
          <div className="space-y-3">
            <div
              className="rounded-xl overflow-hidden max-h-64 overflow-y-auto text-[11px] leading-relaxed"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              {preview.diff.map((row, i) => (
                <div
                  key={i}
                  className="px-2 py-0.5 whitespace-pre-wrap"
                  style={{
                    background:
                      row.type === "add"
                        ? "rgba(34,197,94,0.12)"
                        : row.type === "del"
                          ? "rgba(239,68,68,0.12)"
                          : "transparent",
                    color:
                      row.type === "add"
                        ? "#86EFAC"
                        : row.type === "del"
                          ? "#FCA5A5"
                          : "rgba(255,255,255,0.4)",
                  }}
                >
                  {row.type === "add" ? "+" : row.type === "del" ? "-" : " "}
                  {row.text || " "}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void cancelPreview()}
                disabled={busy}
                className="flex-1 py-3 text-sm font-semibold"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={() => void acceptPreview()}
                disabled={busy}
                className="flex-[1.3] py-3 text-sm font-bold"
                style={{
                  borderRadius: 12,
                  background: "var(--color-lime)",
                  color: "#0A0A0A",
                }}
              >
                Accept ({preview.estimatedCredits} kr)
              </button>
            </div>
          </div>
        )}

        {file.revisions && file.revisions.length > 0 && (
          <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p
              className="text-[10px] uppercase tracking-wider mb-2"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Riwayat
            </p>
            <ul className="space-y-1.5">
              {file.revisions.slice(0, 8).map((r) => (
                <li
                  key={r.id}
                  className="text-[11px]"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                  }}
                >
                  v{r.version}
                  {r.sectionName ? ` · ${r.sectionName}` : ""} ·{" "}
                  {new Date(r.createdAt).toLocaleString("id-ID")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
