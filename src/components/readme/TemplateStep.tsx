"use client";

import { Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getTemplatesByCategory,
  type ReadmeCategory,
  type ReadmeTemplate,
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
  .readme-gallery-md h1 {
    font-family: var(--font-unbounded), Unbounded, sans-serif;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin: 0 0 10px;
    color: #F0F3FA;
  }
  .readme-gallery-md h2 {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 18px 0 8px;
    padding-bottom: 6px;
    border-bottom: 0.5px solid rgba(240,243,250,0.12);
    color: rgba(240,243,250,0.9);
  }
  .readme-gallery-md h3 {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 14px;
    font-weight: 600;
    margin: 12px 0 6px;
    color: #38BDF8;
  }
  .readme-gallery-md p,
  .readme-gallery-md li {
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 13px;
    line-height: 1.65;
    color: rgba(240,243,250,0.62);
    margin: 6px 0;
  }
  .readme-gallery-md ul { margin: 6px 0 6px 18px; }
  .readme-gallery-md code {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(56,189,248,0.12);
    color: #38BDF8;
  }
  .readme-gallery-md pre {
    font-size: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    background: #0A0F1A;
    border: 0.5px solid rgba(240,243,250,0.1);
    overflow: hidden;
    margin: 12px 0;
  }
  .readme-gallery-md pre code {
    background: none;
    padding: 0;
    color: rgba(240,243,250,0.78);
  }
  .readme-gallery-md table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin: 10px 0;
    font-family: var(--font-jetbrains-mono), monospace;
  }
  .readme-gallery-md th,
  .readme-gallery-md td {
    padding: 8px 10px;
    border: 0.5px solid rgba(240,243,250,0.12);
    text-align: left;
    color: rgba(240,243,250,0.58);
  }
  .readme-gallery-md th {
    color: rgba(240,243,250,0.85);
    background: rgba(240,243,250,0.04);
  }
  .readme-gallery-md blockquote {
    border-left: 3px solid #FFB020;
    padding: 6px 0 6px 14px;
    margin: 12px 0;
    color: rgba(240,243,250,0.5);
    font-family: var(--font-jetbrains-mono), monospace;
    font-size: 13px;
  }
  .readme-gallery-md img {
    max-width: 100%;
    border-radius: 6px;
    margin: 8px 0;
  }
`;

function GalleryCard({
  tpl,
  selected,
  onSelect,
}: {
  tpl: ReadmeTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col overflow-hidden rounded-2xl text-left transition-all duration-150"
      style={{
        background: "var(--app-bg-elevated, #1F2A44)",
        border: selected
          ? "1.5px solid rgba(255,176,32,0.7)"
          : "0.5px solid rgba(240,243,250,0.1)",
        boxShadow: selected ? "0 12px 40px rgba(255,176,32,0.08)" : "0 8px 28px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={(e) => {
        if (selected) return;
        e.currentTarget.style.borderColor = "rgba(240,243,250,0.22)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        if (selected) return;
        e.currentTarget.style.borderColor = "rgba(240,243,250,0.1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Preview frame — sized for clear image OR readable markdown */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16 / 10",
          minHeight: 240,
          background: "#0D1321",
          borderBottom: "0.5px solid rgba(240,243,250,0.08)",
        }}
      >
        {/* Window chrome */}
        <div
          className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-2.5"
          style={{
            background: "linear-gradient(rgba(13,19,33,0.92), rgba(13,19,33,0.55))",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: 99, background: "rgba(240,243,250,0.22)" }} />
              <span style={{ width: 8, height: 8, borderRadius: 99, background: "rgba(240,243,250,0.14)" }} />
              <span style={{ width: 8, height: 8, borderRadius: 99, background: "rgba(240,243,250,0.08)" }} />
            </span>
            <span
              className="font-mono text-[11px] font-semibold"
              style={{ color: "rgba(240,243,250,0.45)" }}
            >
              README.md · {tpl.name}
            </span>
          </div>
          {selected && (
            <span
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "#FFB020", color: "#0D1321" }}
            >
              <Check size={11} strokeWidth={3} />
              Dipilih
            </span>
          )}
        </div>

        {tpl.previewImage ? (
          // Ready for real cover assets in /public/tools/readme/
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tpl.previewImage}
            alt={`Preview ${tpl.name}`}
            className="h-full w-full object-cover object-top"
            style={{ paddingTop: 36 }}
          />
        ) : (
          <div
            className="readme-gallery-md absolute inset-0 overflow-hidden px-5 pb-6 pt-12"
            style={{ background: "#0D1321" }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {tpl.sampleMarkdown.slice(0, 900)}
            </ReactMarkdown>
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{ background: "linear-gradient(transparent, #0D1321)" }}
        />
      </div>

      {/* Compact meta — preview stays the hero */}
      <div className="flex flex-col gap-2 px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            className="font-unbounded text-base font-bold tracking-tight sm:text-lg"
            style={{ color: "#F0F3FA" }}
          >
            {tpl.name}
          </h3>
          <span
            className="font-mono text-[11px]"
            style={{ color: "rgba(240,243,250,0.35)" }}
          >
            {tpl.bestFor}
          </span>
        </div>
        <p
          className="font-mono text-[13px] leading-relaxed"
          style={{ color: "rgba(240,243,250,0.58)", maxWidth: "42rem" }}
        >
          {tpl.blurb}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tpl.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md px-2.5 py-1 font-mono text-[11px] font-medium"
              style={{
                color: "rgba(240,243,250,0.55)",
                background: "rgba(240,243,250,0.05)",
                border: "0.5px solid rgba(240,243,250,0.1)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function TemplateStep({
  category,
  templateId,
  onCategoryChange,
  onTemplateChange,
  onBack,
  onNext,
}: Props) {
  const activeCategory = category ?? "repository";
  const templates = getTemplatesByCategory(activeCategory);

  return (
    <div className="mx-auto max-w-5xl">
      <style>{markdownStyles}</style>

      <h2
        className="mb-2 font-unbounded text-xl font-bold sm:text-[22px]"
        style={{ color: "var(--app-text-primary, #F0F3FA)" }}
      >
        Pilih gaya README
      </h2>
      <p
        className="mb-7 max-w-xl font-mono text-[13.5px] leading-relaxed"
        style={{ color: "var(--app-text-secondary, rgba(240,243,250,0.62))" }}
      >
        Preview besar dan jelas — pilih yang paling cocok sebelum generate.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["repository", "profile"] as const).map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className="rounded-lg px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: active ? "rgba(255,176,32,0.14)" : "var(--app-bg-elevated, #1F2A44)",
                border: active
                  ? "1.5px solid rgba(255,176,32,0.55)"
                  : "0.5px solid rgba(240,243,250,0.1)",
                color: active ? "#FFB020" : "rgba(240,243,250,0.55)",
              }}
            >
              {cat === "repository" ? "Repository" : "Profile GitHub"}
            </button>
          );
        })}
      </div>

      {/* 1 col mobile / 2 col desktop — never squeeze into 3 tiny cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {templates.map((tpl: ReadmeTemplate) => (
          <GalleryCard
            key={tpl.id}
            tpl={tpl}
            selected={templateId === tpl.id}
            onSelect={() => {
              if (!category) onCategoryChange(activeCategory);
              onTemplateChange(tpl.id);
            }}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Kembali
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!templateId}
          onClick={onNext}
        >
          Lanjut →
        </button>
      </div>
    </div>
  );
}
