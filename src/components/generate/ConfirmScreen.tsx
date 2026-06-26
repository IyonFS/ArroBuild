"use client";

import type { ProductType, ProjectStage, Presets, FileKey, ModelOption } from "./types";
import { FILE_META, MODEL_OPTIONS } from "./types";

interface Props {
  productType: ProductType;
  stage: ProjectStage | null;
  contextSummary: string;
  presets: Presets;
  selectedDocs: FileKey[];
  selectedModelId: string;
  onEdit: (step: "product-type" | "context" | "stack" | "docs") => void;
  onGenerate: () => void;
}

const PRODUCT_LABELS: Record<ProductType, string> = {
  saas: "SaaS",
  marketplace: "Marketplace",
  mobile: "Mobile App",
  api: "API / Dev Tool",
  "ai-app": "AI-Powered App",
  ecommerce: "E-Commerce",
  portfolio: "Portfolio",
  internal: "Internal Tool",
  other: "Lainnya",
};

const STAGE_LABELS: Record<ProjectStage, string> = {
  idea: "Ide baru",
  prototype: "Ada prototype / MVP",
  production: "Sudah production",
};

const FRAMEWORK_LABELS: Record<string, string> = {
  nextjs: "Next.js",
  nuxt: "Nuxt.js",
  remix: "Remix",
  sveltekit: "SvelteKit",
  astro: "Astro",
  "react-spa": "React SPA",
  "vue-spa": "Vue SPA",
  "vanilla-js": "Vanilla JS",
  laravel: "Laravel",
  express: "Express.js",
  nestjs: "NestJS",
  fastapi: "FastAPI",
  django: "Django",
  rails: "Rails",
  "go-fiber": "Go Fiber",
  hono: "Hono",
  "react-native": "React Native",
  flutter: "Flutter",
  expo: "Expo",
  "ai-recommend": "Biarkan AI rekomendasikan",
};

const DESIGN_LABELS: Record<string, string> = {
  "neo-brutalist": "Neo-Brutalist",
  minimal: "Minimal",
  corporate: "Corporate",
  bold: "Bold & Colorful",
  glassmorphism: "Glassmorphism",
  dashboard: "Dashboard / Data",
  "ai-recommend": "Biarkan AI pilihkan",
  apple: "Apple Style",
  linear: "Linear Style",
  stripe: "Stripe Style",
  notion: "Notion Style",
  vercel: "Vercel Style",
};

const AGENT_LABELS: Record<string, string> = {
  cursor: "Cursor",
  "claude-code": "Claude Code",
  windsurf: "Windsurf",
  cline: "Cline",
  opencode: "OpenCode",
  custom: "Custom / Lainnya",
};

function formatTime(secs: number): string {
  if (secs < 60) return `~${secs} detik`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `~${m} mnt ${s} dtk` : `~${m} menit`;
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="font-mono text-[10px] font-bold tracking-wide uppercase mt-0.5 flex-shrink-0 w-24"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </span>
      <span
        className="font-mono text-xs"
        style={{ color: "var(--color-text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ConfirmScreen({
  productType,
  stage,
  contextSummary,
  presets,
  selectedDocs,
  selectedModelId,
  onEdit,
  onGenerate,
}: Props) {
  const model = MODEL_OPTIONS.find((m) => m.id === selectedModelId) ?? MODEL_OPTIONS[0];
  const estimateSecs = selectedDocs.length * (model?.estimatePerDoc ?? 30);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <span
          className="font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-4 inline-block"
          style={{
            background: "rgba(204,255,0,0.08)",
            color: "var(--color-lime)",
            border: "0.5px solid rgba(204,255,0,0.25)",
          }}
        >
          Review & Generate
        </span>
        <h2
          className="font-unbounded font-bold text-xl sm:text-2xl mb-2"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
        >
          Sudah semuanya?
        </h2>
        <p
          className="font-mono text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Cek ringkasan proyekmu sebelum generate. Klik bagian manapun untuk edit.
        </p>
      </div>

      {/* Summary blocks */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Product & Stage */}
        <button
          onClick={() => onEdit("product-type")}
          className="text-left px-4 py-4 rounded-xl transition-all group w-full"
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--color-lime)" }}
            >
              — Tipe & Fase
            </span>
            <span
              className="font-mono text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Edit →
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <SummaryRow label="Tipe" value={PRODUCT_LABELS[productType]} />
            <SummaryRow label="Fase" value={stage ? STAGE_LABELS[stage] : "—"} />
          </div>
        </button>

        {/* Context */}
        {contextSummary && (
          <button
            onClick={() => onEdit("context")}
            className="text-left px-4 py-4 rounded-xl transition-all group w-full"
            style={{
              background: "var(--color-bg-elevated)",
              border: "0.5px solid var(--color-border-default)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="font-mono text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "var(--color-lime)" }}
              >
                — Cerita Produk
              </span>
              <span
                className="font-mono text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Edit →
              </span>
            </div>
            <p
              className="font-mono text-xs"
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {contextSummary}
            </p>
          </button>
        )}

        {/* Stack */}
        <button
          onClick={() => onEdit("stack")}
          className="text-left px-4 py-4 rounded-xl transition-all group w-full"
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--color-lime)" }}
            >
              — Stack & Style
            </span>
            <span
              className="font-mono text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Edit →
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <SummaryRow
              label="Framework"
              value={FRAMEWORK_LABELS[presets.framework] ?? presets.framework}
            />
            <SummaryRow
              label="Design"
              value={DESIGN_LABELS[presets.design] ?? presets.design}
            />
            <SummaryRow
              label="AI Tool"
              value={AGENT_LABELS[presets.agentTool] ?? presets.agentTool}
            />
            {presets.database && (
              <SummaryRow label="Database" value={presets.database} />
            )}
          </div>
        </button>

        {/* Docs & Model */}
        <button
          onClick={() => onEdit("docs")}
          className="text-left px-4 py-4 rounded-xl transition-all group w-full"
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--color-lime)" }}
            >
              — Dokumen & Model
            </span>
            <span
              className="font-mono text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Edit →
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedDocs.map((key) => (
              <span
                key={key}
                className="font-mono text-[10px] px-2 py-1 rounded"
                style={{
                  background: "rgba(204,255,0,0.08)",
                  color: "var(--color-lime)",
                  border: "0.5px solid rgba(204,255,0,0.2)",
                }}
              >
                {FILE_META[key].icon} {FILE_META[key].label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span
              className="font-mono text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Model: <strong style={{ color: "var(--color-text-secondary)" }}>{model?.label}</strong>
            </span>
            <span
              className="font-mono text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Estimasi:{" "}
              <strong style={{ color: "var(--color-lime)" }}>
                {formatTime(estimateSecs)}
              </strong>
            </span>
          </div>
        </button>
      </div>

      {/* Tip */}
      <div
        className="flex items-start gap-2 px-4 py-3 rounded-xl mb-6"
        style={{
          background: "rgba(59,130,246,0.06)",
          border: "0.5px solid rgba(59,130,246,0.2)",
        }}
      >
        <span style={{ color: "#3B82F6", fontSize: 13, marginTop: 1 }}>ⓘ</span>
        <p
          className="font-mono text-xs"
          style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}
        >
          Pastikan deskripsi proyekmu sudah lengkap untuk hasil yang lebih relevan dan spesifik.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onEdit("docs")}
          className="px-5 py-3 rounded-xl font-mono text-sm transition-all"
          style={{
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-secondary)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          ← Ubah pilihan
        </button>
        <button
          onClick={onGenerate}
          className="flex-1 py-3 rounded-xl font-mono font-bold text-sm transition-all flex items-center justify-center gap-2"
          style={{
            background: "var(--color-lime)",
            color: "#0A0A0A",
          }}
        >
          <span>✦</span>
          <span>Generate sekarang →</span>
        </button>
      </div>
    </div>
  );
}
