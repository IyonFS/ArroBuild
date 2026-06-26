"use client";

import { useState } from "react";
import type { DesignData, ColorThemeId, FontPairId, Vibe, HeroLayout, BgEffect, BorderStyle } from "./types";
import { COLOR_THEMES, FONT_PAIRS, VIBES } from "./types";

interface Props {
  value: DesignData;
  onChange: (v: DesignData) => void;
  onNext: () => void;
  onBack: () => void;
}

const BG_EFFECTS: { id: BgEffect; label: string }[] = [
  { id: "dot-grid", label: "Dot grid" },
  { id: "diagonal-lines", label: "Garis diagonal" },
  { id: "noise", label: "Noise texture" },
  { id: "geometric", label: "Geometric pattern" },
  { id: "gradient-mesh", label: "Gradient mesh" },
  { id: "plain", label: "Polos saja" },
];

const BORDER_STYLES: { id: BorderStyle; label: string }[] = [
  { id: "rounded", label: "Rounded (modern)" },
  { id: "slightly-rounded", label: "Sedikit rounded" },
  { id: "sharp", label: "Sharp/kotak (brutalist)" },
];

export default function DesignStep({ value, onChange, onNext, onBack }: Props) {
  const [focusedCustom, setFocusedCustom] = useState("");

  const set = <K extends keyof DesignData>(key: K, val: DesignData[K]) =>
    onChange({ ...value, [key]: val });

  const setSections = (key: keyof DesignData["sections"], val: boolean) =>
    onChange({ ...value, sections: { ...value.sections, [key]: val } });

  const activeTheme = COLOR_THEMES.find((t) => t.id === value.themeId);

  // Preview swatch for the currently selected custom/preset theme
  const previewBg = value.themeId === "custom" ? (value.customBg || "#0A0A0A") : (activeTheme?.bg || "#0A0A0A");
  const previewPrimary = value.themeId === "custom" ? (value.customPrimary || "#CCFF00") : (activeTheme?.primary || "#CCFF00");
  const previewText = value.themeId === "custom" ? (value.customText || "#FFFFFF") : (activeTheme?.text || "#FFFFFF");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <span
          className="font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-4 inline-block"
          style={{ background: "rgba(204,255,0,0.08)", color: "var(--color-lime)", border: "0.5px solid rgba(204,255,0,0.25)" }}
        >
          Step 3 of 3 — Desain
        </span>
        <h2
          className="font-unbounded font-bold text-xl sm:text-2xl mb-2"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
        >
          Tampilan & visual
        </h2>
        <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Pilih warna, font, dan layout portfolio-mu.
        </p>
      </div>

      <div className="flex flex-col gap-8 mb-8">
        {/* ── Color Theme ── */}
        <div>
          <p className="font-mono font-bold text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--color-text-tertiary)" }}>
            Tema Warna
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {COLOR_THEMES.map((theme) => {
              const active = value.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => set("themeId", theme.id)}
                  className="flex flex-col items-start gap-1.5 p-3 rounded-xl transition-all text-left"
                  style={{
                    background: active ? "rgba(204,255,0,0.06)" : "var(--color-bg-elevated)",
                    border: active ? "1px solid rgba(204,255,0,0.45)" : "0.5px solid var(--color-border-default)",
                  }}
                >
                  {/* Color swatches */}
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded" style={{ background: theme.bg, border: "0.5px solid rgba(255,255,255,0.15)" }} />
                    <div className="w-4 h-4 rounded" style={{ background: theme.primary }} />
                    <div className="w-4 h-4 rounded" style={{ background: theme.text, border: "0.5px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] font-semibold" style={{ color: active ? "var(--color-lime)" : "var(--color-text-primary)" }}>
                      {theme.name}
                    </p>
                    <p className="font-mono text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {theme.vibe}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom color option */}
          <button
            onClick={() => set("themeId", "custom")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all mb-3"
            style={{
              background: value.themeId === "custom" ? "rgba(204,255,0,0.08)" : "var(--color-bg-elevated)",
              border: value.themeId === "custom" ? "1px solid rgba(204,255,0,0.45)" : "0.5px solid var(--color-border-default)",
              color: value.themeId === "custom" ? "var(--color-lime)" : "var(--color-text-secondary)",
            }}
          >
            <span>✏️</span>
            <span>Custom — input HEX manual</span>
          </button>

          {value.themeId === "custom" && (
            <div
              className="p-4 rounded-xl"
              style={{ background: "var(--color-bg-elevated)", border: "0.5px solid var(--color-border-default)" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    { key: "customBg" as const, label: "Background", placeholder: "#0A0A0A" },
                    { key: "customPrimary" as const, label: "Primary/Accent", placeholder: "#CCFF00", hint: "Warna aksen untuk button, link, highlight" },
                    { key: "customText" as const, label: "Text", placeholder: "#FFFFFF" },
                  ]
                ).map(({ key, label, placeholder, hint }) => (
                  <div key={key}>
                    <label className="font-mono text-[11px] font-semibold mb-1 block" style={{ color: "var(--color-text-secondary)" }}>
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={value[key] || placeholder}
                        onChange={(e) => set(key, e.target.value)}
                        className="w-9 h-9 rounded cursor-pointer border-0"
                        style={{ padding: 2, background: "transparent" }}
                      />
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={value[key] || ""}
                        onChange={(e) => set(key, e.target.value)}
                        style={{
                          background: "var(--color-bg-surface)",
                          border: focusedCustom === key ? "0.5px solid rgba(204,255,0,0.5)" : "0.5px solid var(--color-border-default)",
                          color: "var(--color-text-primary)",
                          padding: "7px 10px",
                          borderRadius: 8,
                          flex: 1,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12,
                          outline: "none",
                        }}
                        onFocus={() => setFocusedCustom(key)}
                        onBlur={() => setFocusedCustom("")}
                      />
                    </div>
                    {hint && <p className="font-mono text-[10px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>{hint}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini preview bar */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mt-2"
            style={{ background: previewBg, border: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            <div
              className="font-mono text-xs font-bold px-3 py-1.5 rounded"
              style={{ background: previewPrimary, color: previewBg }}
            >
              Button
            </div>
            <span className="font-mono text-xs" style={{ color: previewText }}>
              Preview tema warna
            </span>
            <div className="ml-auto w-2 h-2 rounded-full" style={{ background: previewPrimary }} />
          </div>
        </div>

        {/* ── Font Pair ── */}
        <div>
          <p className="font-mono font-bold text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--color-text-tertiary)" }}>
            Font Pair
          </p>
          <div className="flex flex-col gap-2">
            {FONT_PAIRS.map((fp) => {
              const active = value.fontPairId === fp.id;
              return (
                <button
                  key={fp.id}
                  onClick={() => set("fontPairId", fp.id)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: active ? "rgba(204,255,0,0.06)" : "var(--color-bg-elevated)",
                    border: active ? "1px solid rgba(204,255,0,0.45)" : "0.5px solid var(--color-border-default)",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: active ? "var(--color-lime)" : "var(--color-border-strong)",
                      background: active ? "var(--color-lime)" : "transparent",
                    }}
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#0A0A0A" }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold" style={{ color: active ? "var(--color-lime)" : "var(--color-text-primary)" }}>
                        {fp.label}
                      </span>
                      {fp.id !== "ai-pick" && (
                        <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                          {fp.display} + {fp.body}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {fp.vibe}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Vibe ── */}
        <div>
          <p className="font-mono font-bold text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--color-text-tertiary)" }}>
            Suasana Visual
          </p>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((vibe) => {
              const active = value.vibe === vibe;
              return (
                <button
                  key={vibe}
                  onClick={() => set("vibe", active ? undefined : vibe)}
                  className="font-mono text-xs px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: active ? "rgba(204,255,0,0.08)" : "var(--color-bg-elevated)",
                    border: active ? "1px solid rgba(204,255,0,0.45)" : "0.5px solid var(--color-border-default)",
                    color: active ? "var(--color-lime)" : "var(--color-text-secondary)",
                  }}
                >
                  {vibe}
                </button>
              );
            })}
            <button
              onClick={() => set("vibe", undefined)}
              className="font-mono text-xs px-3 py-2 rounded-lg transition-all"
              style={{
                background: !value.vibe ? "rgba(204,255,0,0.08)" : "var(--color-bg-elevated)",
                border: !value.vibe ? "1px solid rgba(204,255,0,0.45)" : "0.5px solid var(--color-border-default)",
                color: !value.vibe ? "var(--color-lime)" : "var(--color-text-secondary)",
              }}
            >
              🤖 Biarkan AI pilih
            </button>
          </div>
        </div>

        {/* ── Layout & Effect ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "0.5px solid var(--color-border-default)", background: "var(--color-bg-elevated)" }}
        >
          {/* Hero Layout */}
          <div className="px-4 py-4" style={{ borderBottom: "0.5px solid var(--color-border-default)" }}>
            <p className="font-mono font-bold text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--color-text-tertiary)" }}>
              Hero Layout
            </p>
            <div className="flex gap-3">
              {(
                [
                  { id: "centered" as HeroLayout, label: "Rata tengah", desc: "Text fokus, tanpa foto" },
                  { id: "two-column" as HeroLayout, label: "2 Kolom", desc: "Teks kiri, visual kanan" },
                ] as const
              ).map(({ id, label, desc }) => {
                const active = value.heroLayout === id;
                return (
                  <button
                    key={id}
                    onClick={() => set("heroLayout", id)}
                    className="flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all"
                    style={{
                      background: active ? "rgba(204,255,0,0.06)" : "var(--color-bg-surface)",
                      border: active ? "1px solid rgba(204,255,0,0.45)" : "0.5px solid var(--color-border-default)",
                    }}
                  >
                    {/* Mini layout icon */}
                    <div
                      className="w-16 h-10 rounded flex overflow-hidden gap-0.5"
                      style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                    >
                      {id === "centered" ? (
                        <div className="w-full flex flex-col items-center justify-center gap-0.5">
                          <div className="h-1.5 w-10 rounded" style={{ background: active ? "var(--color-lime)" : "rgba(255,255,255,0.2)" }} />
                          <div className="h-1 w-7 rounded" style={{ background: "rgba(255,255,255,0.15)" }} />
                          <div className="h-1 w-6 rounded" style={{ background: "rgba(255,255,255,0.1)" }} />
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 flex flex-col justify-center gap-0.5 pl-1">
                            <div className="h-1.5 w-full rounded" style={{ background: active ? "var(--color-lime)" : "rgba(255,255,255,0.2)" }} />
                            <div className="h-1 w-3/4 rounded" style={{ background: "rgba(255,255,255,0.15)" }} />
                          </div>
                          <div className="w-6 rounded m-0.5" style={{ background: "rgba(255,255,255,0.1)" }} />
                        </>
                      )}
                    </div>
                    <p className="font-mono text-xs font-semibold" style={{ color: active ? "var(--color-lime)" : "var(--color-text-primary)" }}>
                      {label}
                    </p>
                    <p className="font-mono text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Effect */}
          <div className="px-4 py-4" style={{ borderBottom: "0.5px solid var(--color-border-default)" }}>
            <p className="font-mono font-bold text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--color-text-tertiary)" }}>
              Background Effect
            </p>
            <div className="flex flex-wrap gap-2">
              {BG_EFFECTS.map(({ id, label }) => {
                const active = value.bgEffect === id;
                return (
                  <button
                    key={id}
                    onClick={() => set("bgEffect", id)}
                    className="font-mono text-[11px] px-2.5 py-1.5 rounded-lg transition-all"
                    style={{
                      background: active ? "rgba(204,255,0,0.08)" : "var(--color-bg-surface)",
                      border: active ? "0.5px solid rgba(204,255,0,0.4)" : "0.5px solid var(--color-border-default)",
                      color: active ? "var(--color-lime)" : "var(--color-text-secondary)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Border Radius */}
          <div className="px-4 py-4" style={{ borderBottom: "0.5px solid var(--color-border-default)" }}>
            <p className="font-mono font-bold text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--color-text-tertiary)" }}>
              Border Radius Style
            </p>
            <div className="flex flex-wrap gap-2">
              {BORDER_STYLES.map(({ id, label }) => {
                const active = value.borderStyle === id;
                return (
                  <button
                    key={id}
                    onClick={() => set("borderStyle", id)}
                    className="font-mono text-[11px] px-2.5 py-1.5 rounded-lg transition-all"
                    style={{
                      background: active ? "rgba(204,255,0,0.08)" : "var(--color-bg-surface)",
                      border: active ? "0.5px solid rgba(204,255,0,0.4)" : "0.5px solid var(--color-border-default)",
                      color: active ? "var(--color-lime)" : "var(--color-text-secondary)",
                      borderRadius: id === "sharp" ? 4 : id === "slightly-rounded" ? 8 : 10,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sections checklist */}
          <div className="px-4 py-4">
            <p className="font-mono font-bold text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--color-text-tertiary)" }}>
              Section yang Ditampilkan
            </p>
            <div className="flex flex-wrap gap-y-2 gap-x-4">
              {(
                [
                  { key: "hero", label: "Hero / About", required: true },
                  { key: "skills", label: "Skills" },
                  { key: "proyek", label: "Proyek" },
                  { key: "layanan", label: "Layanan / Services" },
                  { key: "kontak", label: "Kontak" },
                  { key: "testimonial", label: "Testimonial" },
                ] as { key: keyof DesignData["sections"]; label: string; required?: boolean }[]
              ).map(({ key, label, required }) => {
                const checked = value.sections[key];
                return (
                  <button
                    key={key}
                    onClick={() => !required && setSections(key, !checked)}
                    className="flex items-center gap-2 font-mono text-xs"
                    style={{ cursor: required ? "default" : "pointer" }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: checked ? "var(--color-lime)" : "transparent",
                        border: checked ? "none" : "0.5px solid var(--color-border-strong)",
                      }}
                    >
                      {checked && (
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ color: checked ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
                      {label}
                      {required && (
                        <span className="ml-1 font-bold" style={{ color: "var(--color-lime)" }}>
                          *
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl font-mono text-sm transition-all"
          style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-default)" }}
        >
          ← Kembali
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl font-mono font-bold text-sm transition-all"
          style={{ background: "var(--color-lime)", color: "#0A0A0A" }}
        >
          Generate Prompt →
        </button>
      </div>
    </div>
  );
}
