"use client";

import { FILE_META, type FileKey } from "@/components/generate/types";
import { normalizeDocumentKey } from "@/lib/config/documents";
import { DocIcon } from "@/lib/ui/app-icons";

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
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {files.map((file) => {
          const normalized = normalizeDocumentKey(file.fileKey);
          const key = (normalized ?? file.fileKey) as FileKey;
          const meta = normalized ? FILE_META[normalized] : FILE_META[key];
          const active = file.fileKey === activeKey;
          const featN = featCounts[file.fileKey] ?? 0;
          return (
            <button
              key={file.id}
              type="button"
              onClick={() => onSelect(file.fileKey)}
              className={`workspace-file-item w-full text-left px-3.5 py-3 rounded-lg ${active ? "is-active" : ""}`}
              style={{
                border: "0.5px solid var(--app-border-default)",
                background: active ? undefined : "var(--app-bg-elevated)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="text-[13px] font-semibold leading-snug flex items-center gap-2"
                  style={{
                    color: active ? "var(--app-amber)" : "var(--app-text-primary)",
                  }}
                >
                  {normalized ? (
                    <DocIcon doc={normalized} size={14} />
                  ) : (
                    <span className="opacity-70">📄</span>
                  )}
                  {meta?.label ?? file.label}
                </span>
                <span
                  className="text-[10px] flex-shrink-0 mt-0.5 px-1.5 py-0.5 font-mono"
                  style={{
                    borderRadius: 6,
                    background: "var(--app-bg-hover)",
                    color: active ? "var(--app-amber)" : "var(--app-text-tertiary)",
                  }}
                >
                  v{file.version}
                </span>
              </div>
              <div
                className="text-[11px] mt-1.5 flex items-center gap-2 font-mono"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                <span>{file.fileName}</span>
                {featN > 0 && (
                  <span style={{ color: active ? "var(--app-amber)" : undefined }}>
                    · {featN} FEAT
                  </span>
                )}
              </div>
            </button>
          );
        })}
        {files.length === 0 && (
          <p className="text-xs px-3 py-6 font-mono" style={{ color: "var(--app-text-tertiary)" }}>
            Belum ada dokumen.
          </p>
        )}
      </div>
    </aside>
  );
}
