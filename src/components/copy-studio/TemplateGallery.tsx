"use client";

import { Check } from "lucide-react";
import {
  COPY_STUDIO_TEMPLATES,
  type CopyStudioTemplate,
  type CopyStudioTemplateId,
} from "@/lib/config/copy-studio-templates";

interface Props {
  templateId: CopyStudioTemplateId | null;
  productName: string;
  targetUser: string;
  mainValue: string;
  notes: string;
  onTemplateChange: (id: CopyStudioTemplateId) => void;
  onFieldChange: (patch: {
    productName?: string;
    targetUser?: string;
    mainValue?: string;
    notes?: string;
  }) => void;
  onBack: () => void;
  onNext: () => void;
}

function TemplateCard({
  tpl,
  selected,
  onSelect,
}: {
  tpl: CopyStudioTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col overflow-hidden rounded-2xl text-left transition-all"
      style={{
        background: "var(--app-bg-elevated, #1F2A44)",
        border: selected
          ? "1.5px solid rgba(255,176,32,0.7)"
          : "0.5px solid rgba(240,243,250,0.1)",
      }}
    >
      <div
        className="relative px-5 pb-4 pt-5"
        style={{
          background: "#0D1321",
          borderBottom: "0.5px solid rgba(240,243,250,0.08)",
          minHeight: 160,
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "rgba(240,243,250,0.4)" }}
          >
            Struktur konten
          </span>
          {selected && (
            <span
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase"
              style={{ background: "#FFB020", color: "#0D1321" }}
            >
              <Check size={11} strokeWidth={3} />
              Dipilih
            </span>
          )}
        </div>
        <ol className="space-y-1.5">
          {tpl.sections.map((s, i) => (
            <li key={s.id} className="flex gap-2 font-mono text-[12px] leading-snug">
              <span style={{ color: "var(--app-sky)", minWidth: 16 }}>{i + 1}.</span>
              <span>
                <span style={{ color: "#F0F3FA", fontWeight: 600 }}>{s.title}</span>
                <span style={{ color: "rgba(240,243,250,0.45)" }}> — {s.contentHint}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-2 px-5 py-4">
        <h3 className="font-unbounded text-base font-bold" style={{ color: "#F0F3FA" }}>
          {tpl.name}
        </h3>
        <p
          className="font-mono text-[13px] leading-relaxed"
          style={{ color: "rgba(240,243,250,0.58)" }}
        >
          {tpl.blurb}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tpl.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md px-2.5 py-1 font-mono text-[11px]"
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

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: 13,
  background: "var(--color-bg-base, #131A2C)",
  border: "0.5px solid var(--color-border-default)",
  color: "var(--color-text-primary)",
} as const;

export default function TemplateGallery({
  templateId,
  productName,
  targetUser,
  mainValue,
  notes,
  onTemplateChange,
  onFieldChange,
  onBack,
  onNext,
}: Props) {
  const ready =
    Boolean(templateId) &&
    productName.trim() &&
    targetUser.trim() &&
    mainValue.trim();

  return (
    <div className="mx-auto max-w-5xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold sm:text-[22px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        Pilih template struktur
      </h2>
      <p
        className="mb-7 max-w-xl font-mono text-[13.5px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Ini arketipe konten — bukan gaya visual. Preview menunjukkan urutan section.
      </p>

      <div className="mb-8 grid gap-5 sm:grid-cols-2">
        {COPY_STUDIO_TEMPLATES.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            selected={templateId === tpl.id}
            onSelect={() => onTemplateChange(tpl.id)}
          />
        ))}
      </div>

      {templateId && (
        <div
          className="mb-8 rounded-xl p-5"
          style={{
            background: "var(--color-bg-elevated)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          <h3
            className="mb-4 font-unbounded text-sm font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Brief singkat
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                Nama produk / brand *
              </span>
              <input
                value={productName}
                onChange={(e) => onFieldChange({ productName: e.target.value })}
                style={fieldStyle}
                placeholder="Contoh: ArroBuild"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                Target user *
              </span>
              <input
                value={targetUser}
                onChange={(e) => onFieldChange({ targetUser: e.target.value })}
                style={fieldStyle}
                placeholder="Solo developer, UMKM, ..."
              />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                Value utama *
              </span>
              <textarea
                value={mainValue}
                onChange={(e) => onFieldChange({ mainValue: e.target.value })}
                rows={3}
                style={fieldStyle}
                placeholder="Apa yang membuat orang harus pakai ini?"
              />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                Catatan (opsional)
              </span>
              <textarea
                value={notes}
                onChange={(e) => onFieldChange({ notes: e.target.value })}
                rows={2}
                style={fieldStyle}
                placeholder="Tone, larangan kata, dsb."
              />
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Kembali
        </button>
        <button type="button" className="btn btn-primary" disabled={!ready} onClick={onNext}>
          Lanjut →
        </button>
      </div>
    </div>
  );
}
