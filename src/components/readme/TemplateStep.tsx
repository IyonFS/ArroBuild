"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getTemplatesByCategory,
  type ReadmeCategory,
  type ReadmeTemplateId,
} from "@/lib/config/readme-templates";

interface Props {
  category: ReadmeCategory | null;
  templateId: ReadmeTemplateId | null;
  onCategoryChange: (category: ReadmeCategory) => void;
  onTemplateChange: (id: ReadmeTemplateId) => void;
  onBack: () => void;
  onNext: () => void;
}

const markdownStyles = `
  .readme-template-preview h1 { font-size: 0.9rem; font-weight: 700; margin: 0.5rem 0 0.35rem; color: var(--color-text-primary); }
  .readme-template-preview h2 { font-size: 0.78rem; font-weight: 600; margin: 0.45rem 0 0.25rem; color: var(--color-text-primary); }
  .readme-template-preview p, .readme-template-preview li { font-size: 0.68rem; line-height: 1.5; color: var(--color-text-secondary); margin: 0.2rem 0; }
  .readme-template-preview code { font-size: 0.62rem; padding: 1px 4px; border-radius: 3px; background: rgba(56,189,248,0.1); color: var(--app-sky); }
  .readme-template-preview pre { font-size: 0.62rem; padding: 0.5rem; border-radius: 6px; background: #1a1f2e; overflow: hidden; margin: 0.35rem 0; }
  .readme-template-preview table { font-size: 0.62rem; width: 100%; }
  .readme-template-preview th, .readme-template-preview td { padding: 2px 6px; border: 0.5px solid var(--color-border-default); }
`;

export default function TemplateStep({
  category,
  templateId,
  onCategoryChange,
  onTemplateChange,
  onBack,
  onNext,
}: Props) {
  const templates = category ? getTemplatesByCategory(category) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <style>{markdownStyles}</style>

      <h2
        className="mb-2 font-unbounded text-xl font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Pilih template
      </h2>
      <p className="mb-6 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Preview render nyata dari sample content — bukan gambar statis.
      </p>

      <div className="mb-6 flex gap-2">
        {(["repository", "profile"] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className="rounded-lg px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              background:
                category === cat ? "rgba(56,189,248,0.12)" : "var(--color-bg-elevated)",
              border:
                category === cat
                  ? "1.5px solid rgba(56,189,248,0.5)"
                  : "0.5px solid var(--color-border-default)",
              color: category === cat ? "var(--app-sky)" : "var(--color-text-secondary)",
            }}
          >
            {cat === "repository" ? "Repository" : "Profile GitHub"}
          </button>
        ))}
      </div>

      {category && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => {
            const selected = templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onTemplateChange(tpl.id)}
                className="flex flex-col rounded-xl text-left transition-all overflow-hidden"
                style={{
                  background: selected ? "rgba(56,189,248,0.06)" : "var(--color-bg-elevated)",
                  border: selected
                    ? "1.5px solid rgba(56,189,248,0.5)"
                    : "0.5px solid var(--color-border-default)",
                }}
              >
                <div className="p-3 border-b" style={{ borderColor: "var(--color-border-default)" }}>
                  <div
                    className="font-unbounded text-xs font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {tpl.name}
                  </div>
                  <p
                    className="mt-0.5 font-mono text-[10px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {tpl.description}
                  </p>
                </div>
                <div
                  className="readme-template-preview flex-1 overflow-hidden p-3"
                  style={{ maxHeight: 180, background: "var(--color-bg-base)" }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {tpl.sampleMarkdown.slice(0, 600)}
                  </ReactMarkdown>
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
          disabled={!category || !templateId}
          onClick={onNext}
        >
          Lanjut →
        </button>
      </div>
    </div>
  );
}
