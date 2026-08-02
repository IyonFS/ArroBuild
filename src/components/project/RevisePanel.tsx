"use client";

import { useEffect, useMemo, useState } from "react";
import {
  estimateRevisionCredits,
  parseMarkdownSections,
  unifiedDiff,
} from "@/lib/ai/section-revise";
import { parseApiErrorMessage } from "@/lib/parse-api-error";
import { normalizeDocumentKey } from "@/lib/config/documents";
import type { WorkspaceFile } from "./FileSidebar";

async function readApiJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(parseApiErrorMessage(res.status, text));
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(parseApiErrorMessage(res.status, text));
  }
}

interface DiffRow {
  type: "same" | "add" | "del";
  text: string;
}

interface PreviewResult {
  reservationId: string | null;
  isFreeRevision?: boolean;
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
    [file]
  );
  const [sectionName, setSectionName] = useState("");
  const [sectionStartLine, setSectionStartLine] = useState<number | null>(null);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [freeRevisionAvailable, setFreeRevisionAvailable] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        setFreeRevisionAvailable(data.revisionQuota?.hasFreeRevision === true);
      })
      .catch(() => {});
  }, []);

  // Reset per-file state and keep the selected section valid. Adjust state
  // during render instead of in effects to avoid cascading renders.
  const fileKey = `${file?.id ?? ""}:${file?.version ?? ""}`;
  const [prevFileKey, setPrevFileKey] = useState(fileKey);
  if (fileKey !== prevFileKey) {
    setPrevFileKey(fileKey);
    setPreview(null);
    setError(null);
    setInstruction("");
    setSectionName(sections[0]?.title ?? "");
    setSectionStartLine(sections[0]?.startLine ?? null);
  } else if (
    sections.length > 0 &&
    (!sectionName || !sections.some((s) => s.title === sectionName))
  ) {
    setSectionName(sections[0].title);
    setSectionStartLine(sections[0].startLine);
  }

  const selected = sections.find((s) => s.title === sectionName);
  const estimate = selected ? estimateRevisionCredits(selected.content) : 0;

  const restoreRevision = async (revisionId: string) => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/project/${projectId}/revisions/${revisionId}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal restore versi");
      onAccepted(data.content, data.version);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal restore");
    } finally {
      setBusy(false);
    }
  };

  const runPreview = async () => {
    if (!file || !sectionName || !instruction.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const normalizedKey = normalizeDocumentKey(file.fileKey) ?? file.fileKey;
      const res = await fetch(`/api/project/${projectId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          fileKey: normalizedKey,
          sectionName,
          ...(sectionStartLine != null ? { sectionStartLine } : {}),
          instruction: instruction.trim(),
        }),
      });
      const data = await readApiJson(res);
      if (!res.ok) {
        throw new Error(
          (typeof data.error === "string" ? data.error : null) ||
            "Gagal membuat preview revisi"
        );
      }
      setPreview({
        reservationId: (data.reservationId as string | null) ?? null,
        isFreeRevision: data.isFreeRevision === true,
        estimatedCredits: (data.estimatedCredits as number) ?? 0,
        sectionName: data.sectionName as string,
        beforeSection: data.beforeSection as string,
        afterSection: data.afterSection as string,
        fullProposed: data.fullProposed as string,
        diff:
          (data.diff as DiffRow[]) ??
          unifiedDiff(data.beforeSection as string, data.afterSection as string),
      });
      if (data.isFreeRevision === true) {
        setFreeRevisionAvailable(true);
      }
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
      if (preview.reservationId) {
        await fetch(`/api/project/${projectId}/revise`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "cancel",
            reservationId: preview.reservationId,
          }),
        });
      }
      setPreview(null);
    } catch {
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };

  const acceptPreview = async () => {
    if (!file || !preview) return;
    const wasFreeRevision = preview.isFreeRevision === true;
    setBusy(true);
    setError(null);
    try {
      const normalizedKey = normalizeDocumentKey(file.fileKey) ?? file.fileKey;
      const res = await fetch(`/api/project/${projectId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          fileKey: normalizedKey,
          ...(preview.reservationId
            ? { reservationId: preview.reservationId }
            : {}),
          isFreeRevision: preview.isFreeRevision === true,
          newContent: preview.fullProposed,
          sectionName: preview.sectionName,
          estimatedCredits: preview.estimatedCredits,
        }),
      });
      const data = await readApiJson(res);
      if (!res.ok) {
        throw new Error(
          (typeof data.error === "string" ? data.error : null) ||
            "Gagal menyimpan revisi"
        );
      }
      onAccepted(
        data.content as string,
        data.version as number,
        data.balanceAfter as number | undefined
      );
      setPreview(null);
      setInstruction("");
      if (wasFreeRevision) {
        setFreeRevisionAvailable(false);
      }
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
              background: "var(--app-bg-base)",
              border: "1px solid var(--app-border-default)",
            }}
          >
            {sections.map((s) => {
              const active = s.title === sectionName;
              return (
                <button
                  key={`${s.startLine}-${s.title}`}
                  type="button"
                  disabled={!!preview || busy}
                  onClick={() => {
                    setSectionName(s.title);
                    setSectionStartLine(s.startLine);
                  }}
                  className="w-full text-left px-3 py-2.5 transition-all disabled:opacity-50"
                  style={{
                    borderRadius: 10,
                    paddingLeft: s.level === 3 ? 28 : 12,
                    background: active
                      ? "rgba(255,176,32,0.12)"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(255,176,32,0.4)"
                      : "1px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold w-6 h-6 inline-flex items-center justify-center flex-shrink-0"
                      style={{
                        borderRadius: 7,
                        background: active
                          ? "rgba(255,176,32,0.2)"
                          : "var(--app-bg-elevated)",
                        color: active
                          ? "var(--app-amber)"
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
                          ? "var(--app-amber)"
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
              background: "var(--app-bg-base)",
              border: instruction.trim()
                ? "1px solid rgba(255,176,32,0.35)"
                : "1px solid var(--app-border-default)",
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
                  className={`generate-chip !text-[11px] !py-1 !px-2.5 ${instruction === q ? "is-selected" : ""}`}
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
            background: "rgba(255,176,32,0.06)",
            border: "1px solid rgba(255,176,32,0.2)",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>Estimasi kredit</span>
          <span style={{ color: "var(--app-amber)", fontWeight: 700 }}>
            {preview?.isFreeRevision || (!preview && freeRevisionAvailable)
              ? "Gratis (1×/bulan Pro)"
              : `~${preview?.estimatedCredits ?? estimate} kredit`}
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
              background: "var(--app-amber)",
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
                border: "1px solid var(--app-border-default)",
                background: "var(--app-bg-base)",
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
                  border: "1px solid var(--app-border-strong)",
                  color: "rgba(255,255,255,0.7)",
                  background: "var(--app-bg-elevated)",
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
                  background: "var(--app-amber)",
                  color: "#0A0A0A",
                }}
              >
                Accept ({preview.isFreeRevision ? "gratis" : `${preview.estimatedCredits} kr`})
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
                <li key={r.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void restoreRevision(r.id)}
                    className="text-[11px] text-left w-full hover:opacity-100 opacity-80 transition-opacity"
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                    }}
                  >
                    ↩ v{r.version}
                    {r.sectionName ? ` · ${r.sectionName}` : ""} ·{" "}
                    {new Date(r.createdAt).toLocaleString("id-ID")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
