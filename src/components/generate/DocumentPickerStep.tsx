"use client";

import type { FileKey, ModelOption, ProjectStage } from "./types";
import { ALL_FILE_KEYS, FILE_META, MODEL_OPTIONS, STAGE_PRESETS } from "./types";

interface Props {
  value: FileKey[];
  stage: ProjectStage | null;
  selectedModelId: string;
  tier: "free" | "paid" | "unlimited";
  onDocsChange: (v: FileKey[]) => void;
  onModelChange: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const SMART_PRESETS: {
  id: string;
  label: string;
  icon: string;
  docs: FileKey[];
  desc: string;
}[] = [
  {
    id: "starter",
    label: "Starter Pack",
    icon: "✦",
    docs: ["prd", "context", "plan"],
    desc: "Ide baru, mau mulai cepat",
  },
  {
    id: "foundation",
    label: "Full Foundation",
    icon: "✦",
    docs: ["prd", "context", "plan", "design-system", "agents"],
    desc: "Sebelum mulai coding serius",
  },
  {
    id: "production",
    label: "Production Ready",
    icon: "✦",
    docs: ["prd", "context", "plan", "design-system", "agents", "production-hardening"],
    desc: "Mau launch ke publik",
  },
  {
    id: "complete",
    label: "Complete Suite",
    icon: "✦",
    docs: [...ALL_FILE_KEYS],
    desc: "Dokumentasi paling lengkap",
  },
];

function formatTime(secs: number): string {
  if (secs < 60) return `~${secs} detik`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `~${m} mnt ${s} dtk` : `~${m} menit`;
}

export default function DocumentPickerStep({
  value,
  stage,
  selectedModelId,
  tier,
  onDocsChange,
  onModelChange,
  onNext,
  onBack,
}: Props) {
  const toggle = (key: FileKey) => {
    if (value.includes(key)) {
      if (key === "prd") return; // prd always required
      onDocsChange(value.filter((k) => k !== key));
    } else {
      onDocsChange([...value, key]);
    }
  };

  // Get smart preset recommendation from stage
  const stagePreset = stage ? STAGE_PRESETS[stage] : null;
  const activePreset = SMART_PRESETS.find(
    (p) => JSON.stringify([...p.docs].sort()) === JSON.stringify([...value].sort())
  );

  // Get available models based on tier
  const availableModels = MODEL_OPTIONS.filter(
    (m) => tier !== "free" || m.tier === "free"
  );
  const selectedModel = MODEL_OPTIONS.find((m) => m.id === selectedModelId) ?? MODEL_OPTIONS[0];

  // Estimate time
  const estimateSecs = value.length * (selectedModel?.estimatePerDoc ?? 30);

  // Core vs extended docs
  const coreDocs: FileKey[] = ["prd", "context", "plan", "design-system", "agents"];
  const extendedDocs: FileKey[] = ["production-hardening", "scale-performance", "growth-quality"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
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
          Step 4 of 4 — Dokumen & Model
        </span>
        <h2
          className="font-unbounded font-bold text-xl sm:text-2xl mb-2"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
        >
          Pilih dokumen & model AI
        </h2>
        <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Pilih dokumen yang ingin digenerate, lalu pilih model AI yang dipakai.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* LEFT — Document picker */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: "0.5px solid var(--color-border-default)",
            background: "var(--color-bg-elevated)",
          }}
        >
          {/* Smart presets */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: "0.5px solid var(--color-border-default)" }}
          >
            <p
              className="font-mono text-[10px] font-bold tracking-widest uppercase mb-2"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Smart Preset
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SMART_PRESETS.map((preset) => {
                const isActive = activePreset?.id === preset.id;
                const isRecommended =
                  stagePreset &&
                  JSON.stringify([...preset.docs].sort()) ===
                    JSON.stringify([...stagePreset].sort());
                return (
                  <button
                    key={preset.id}
                    onClick={() => onDocsChange([...preset.docs])}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all"
                    style={{
                      background: isActive
                        ? "rgba(204,255,0,0.1)"
                        : "var(--color-bg-surface)",
                      border: isActive
                        ? "0.5px solid rgba(204,255,0,0.4)"
                        : "0.5px solid var(--color-border-default)",
                      color: isActive
                        ? "var(--color-lime)"
                        : "var(--color-text-secondary)",
                    }}
                    title={preset.desc}
                  >
                    <span>{preset.icon}</span>
                    <span className="font-semibold">{preset.label}</span>
                    {isRecommended && (
                      <span
                        className="text-[9px] font-bold tracking-wide uppercase px-1 py-0.5 rounded"
                        style={{
                          background: "rgba(204,255,0,0.15)",
                          color: "var(--color-lime)",
                        }}
                      >
                        Rekomendasi
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document list — core */}
          <div className="p-2">
            {/* Core docs label */}
            <p
              className="font-mono text-[10px] font-bold tracking-widest uppercase px-2 py-1.5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Dokumen Inti
            </p>
            {coreDocs.map((key) => {
              const meta = FILE_META[key];
              const isSelected = value.includes(key);
              const isRequired = key === "prd";

              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all w-full mb-0.5"
                  style={{
                    background: isSelected
                      ? "rgba(204,255,0,0.05)"
                      : "transparent",
                    border: isSelected
                      ? "0.5px solid rgba(204,255,0,0.2)"
                      : "0.5px solid transparent",
                  }}
                >
                  {/* Checkbox */}
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    style={{
                      background: isSelected ? "var(--color-lime)" : "transparent",
                      border: isSelected
                        ? "none"
                        : "0.5px solid var(--color-border-strong)",
                    }}
                  >
                    {isSelected && (
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="#0A0A0A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono font-semibold text-xs"
                        style={{
                          color: isSelected
                            ? "var(--color-text-primary)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {meta.icon} {meta.label}
                      </span>
                      {isRequired && (
                        <span
                          className="font-mono text-[9px] px-1 py-0.5 rounded font-bold uppercase tracking-wide"
                          style={{
                            background: "rgba(204,255,0,0.1)",
                            color: "var(--color-lime)",
                          }}
                        >
                          wajib
                        </span>
                      )}
                    </div>
                    <p
                      className="font-mono text-[10px] mt-0.5"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {meta.phase}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Extended docs */}
            <p
              className="font-mono text-[10px] font-bold tracking-widest uppercase px-2 py-1.5 mt-2"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Dokumen Lanjutan
            </p>
            {extendedDocs.map((key) => {
              const meta = FILE_META[key];
              const isSelected = value.includes(key);

              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all w-full mb-0.5"
                  style={{
                    background: isSelected
                      ? "rgba(204,255,0,0.05)"
                      : "transparent",
                    border: isSelected
                      ? "0.5px solid rgba(204,255,0,0.2)"
                      : "0.5px solid transparent",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    style={{
                      background: isSelected ? "var(--color-lime)" : "transparent",
                      border: isSelected
                        ? "none"
                        : "0.5px solid var(--color-border-strong)",
                    }}
                  >
                    {isSelected && (
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="#0A0A0A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-mono font-semibold text-xs"
                      style={{
                        color: isSelected
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)",
                      }}
                    >
                      {meta.icon} {meta.label}
                    </span>
                    <p
                      className="font-mono text-[10px] mt-0.5"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      💡 Untuk: {meta.phase}
                    </p>
                  </div>
                </button>
              );
            })}

            <div
              className="flex items-center justify-between px-3 py-2 mt-2 rounded-lg"
              style={{
                borderTop: "0.5px solid var(--color-border-default)",
                marginTop: 8,
              }}
            >
              <span
                className="font-mono text-xs font-bold"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {value.length} dokumen dipilih
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onDocsChange([...ALL_FILE_KEYS])}
                  className="font-mono text-[11px] px-2 py-1 rounded transition-all"
                  style={{
                    color: "var(--color-text-tertiary)",
                    border: "0.5px solid var(--color-border-default)",
                  }}
                >
                  Semua
                </button>
                <button
                  onClick={() => onDocsChange(["prd"])}
                  className="font-mono text-[11px] px-2 py-1 rounded transition-all"
                  style={{
                    color: "var(--color-text-tertiary)",
                    border: "0.5px solid var(--color-border-default)",
                  }}
                >
                  PRD saja
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Model selector + estimate */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: "0.5px solid var(--color-border-default)",
              background: "var(--color-bg-elevated)",
            }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "0.5px solid var(--color-border-default)" }}
            >
              <p
                className="font-mono text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Pilih Model AI
              </p>
            </div>

            <div className="p-2">
              {MODEL_OPTIONS.map((model) => {
                const isActive = selectedModelId === model.id;
                const isLocked = tier === "free" && model.tier === "paid";
                return (
                  <button
                    key={model.id}
                    onClick={() => !isLocked && onModelChange(model.id)}
                    disabled={isLocked}
                    className="flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all w-full mb-0.5"
                    style={{
                      background: isActive
                        ? "rgba(204,255,0,0.06)"
                        : "transparent",
                      border: isActive
                        ? "0.5px solid rgba(204,255,0,0.25)"
                        : "0.5px solid transparent",
                      opacity: isLocked ? 0.45 : 1,
                      cursor: isLocked ? "not-allowed" : "pointer",
                    }}
                  >
                    {/* Radio */}
                    <div
                      className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        borderColor: isActive
                          ? "var(--color-lime)"
                          : "var(--color-border-strong)",
                        background: isActive ? "var(--color-lime)" : "transparent",
                      }}
                    >
                      {isActive && (
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "#0A0A0A" }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-mono font-bold text-xs"
                          style={{
                            color: isActive
                              ? "var(--color-lime)"
                              : "var(--color-text-primary)",
                          }}
                        >
                          {model.icon} {model.label}
                        </span>
                        {isLocked && (
                          <span
                            className="font-mono text-[9px] px-1 py-0.5 rounded font-bold uppercase tracking-wide"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              color: "var(--color-text-tertiary)",
                            }}
                          >
                            ★ Pro
                          </span>
                        )}
                      </div>
                      <p
                        className="font-mono text-[10px] mt-0.5"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {model.description} · {model.speed}
                      </p>
                    </div>
                  </button>
                );
              })}

              {tier === "free" && (
                <div
                  className="mx-3 mt-2 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(255,92,26,0.06)",
                    border: "0.5px solid rgba(255,92,26,0.2)",
                  }}
                >
                  <p
                    className="font-mono text-[10px]"
                    style={{ color: "rgba(255,92,26,0.8)" }}
                  >
                    ★ = Perlu akun Pro untuk akses model premium
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Estimate card */}
          <div
            className="rounded-xl p-4"
            style={{
              border: "0.5px solid var(--color-border-default)",
              background: "var(--color-bg-elevated)",
            }}
          >
            <p
              className="font-mono text-[10px] font-bold tracking-widest uppercase mb-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Estimasi
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Dokumen
                </span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {value.length} file
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Model
                </span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {selectedModel?.label}
                </span>
              </div>
              <div
                className="flex items-center justify-between pt-2 mt-1"
                style={{ borderTop: "0.5px solid var(--color-border-default)" }}
              >
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Estimasi waktu
                </span>
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: "var(--color-lime)" }}
                >
                  {formatTime(estimateSecs)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl font-mono text-sm transition-all"
          style={{
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-secondary)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          ← Kembali
        </button>
        <button
          onClick={onNext}
          disabled={value.length === 0}
          className="flex-1 py-3 rounded-xl font-mono font-bold text-sm transition-all"
          style={{
            background:
              value.length > 0 ? "var(--color-lime)" : "var(--color-bg-elevated)",
            color: value.length > 0 ? "#0A0A0A" : "var(--color-text-disabled)",
            border:
              value.length > 0 ? "none" : "0.5px solid var(--color-border-default)",
            cursor: value.length > 0 ? "pointer" : "not-allowed",
          }}
        >
          {value.length === 0
            ? "Pilih dokumen yang mau digenerate"
            : `Review & Generate (${value.length} dok) →`}
        </button>
      </div>
    </div>
  );
}
