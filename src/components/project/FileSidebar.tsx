"use client";

import { FILE_META, type FileKey } from "@/components/generate/types";

export interface WorkspaceFile {
  id: string;
  fileKey: string;
  fileName: string;
  label: string;
  content: string;
  version: number;
  modelClass: string | null;
  tokensUsed: number | null;
  revisions?: Array<{
    id: string;
    version: number;
    revisionType: string;
    sectionName: string | null;
    createdAt: string;
  }>;
}

interface Props {
  files: WorkspaceFile[];
  activeKey: string;
  onSelect: (fileKey: string) => void;
  featCounts?: Record<string, number>;
}

export default function FileSidebar({
  files,
  activeKey,
  onSelect,
  featCounts = {},
}: Props) {
  return (
    <aside className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {files.map((file) => {
          const key = file.fileKey as FileKey;
          const meta = FILE_META[key];
          const active = file.fileKey === activeKey;
          const featN = featCounts[file.fileKey] ?? 0;
          return (
            <button
              key={file.id}
              type="button"
              onClick={() => onSelect(file.fileKey)}
              className="w-full text-left px-3.5 py-3 transition-all"
              style={{
                borderRadius: 12,
                background: active ? "rgba(204,255,0,0.1)" : "rgba(255,255,255,0.02)",
                border: active
                  ? "1px solid rgba(204,255,0,0.4)"
                  : "1px solid rgba(255,255,255,0.06)",
                boxShadow: active ? "0 0 16px rgba(204,255,0,0.08)" : "none",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="text-[13px] font-semibold leading-snug"
                  style={{
                    color: active
                      ? "var(--color-lime)"
                      : "var(--color-text-primary)",
                  }}
                >
                  <span className="mr-1.5 opacity-80">{meta?.icon ?? "📄"}</span>
                  {meta?.label ?? file.label}
                </span>
                <span
                  className="text-[10px] flex-shrink-0 mt-0.5 px-1.5 py-0.5"
                  style={{
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.05)",
                    color: active ? "rgba(204,255,0,0.8)" : "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                  }}
                >
                  v{file.version}
                </span>
              </div>
              <div
                className="text-[11px] mt-1.5 flex items-center gap-2"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                <span>{file.fileName}</span>
                {featN > 0 && (
                  <span style={{ color: active ? "rgba(204,255,0,0.7)" : undefined }}>
                    · {featN} FEAT
                  </span>
                )}
              </div>
            </button>
          );
        })}
        {files.length === 0 && (
          <p className="text-xs px-3 py-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            Belum ada dokumen.
          </p>
        )}
      </div>
    </aside>
  );
}
