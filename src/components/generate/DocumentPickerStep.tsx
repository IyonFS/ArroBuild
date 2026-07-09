"use client";

import type {
  FileKey,
  ProjectStage,
  UserPlanStatus,
  ModelClass,
  PerDocumentModelClass,
} from "./types";
import {
  ALL_FILE_KEYS,
  FILE_META,
  STAGE_PRESETS,
  MODEL_CLASSES,
  TIER_MODEL_CLASSES,
  DOC_DEFAULT_MODEL_CLASS,
  TIER_CREDIT_POOL,
  TIER_LABELS,
  PLAN_STATUS_LABELS,
  calcDocCredits,
  calcTotalCredits,
  resolvePreviewTier,
  isSubscribed,
} from "./types";

interface Props {
  value: FileKey[];
  stage: ProjectStage | null;
  plan: UserPlanStatus;
  perDocModelClass: PerDocumentModelClass;
  onDocsChange: (v: FileKey[]) => void;
  onModelClassChange: (overrides: PerDocumentModelClass) => void;
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
    label: "Quick Start",
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

export default function DocumentPickerStep({
  value,
  stage,
  plan,
  perDocModelClass,
  onDocsChange,
  onModelClassChange,
  onNext,
  onBack,
}: Props) {
  const tier = resolvePreviewTier(plan);
  const toggle = (key: FileKey) => {
    if (value.includes(key)) {
      if (key === "prd") return;
      onDocsChange(value.filter((k) => k !== key));
    } else {
      onDocsChange([...value, key]);
    }
  };

  const stagePreset = stage ? STAGE_PRESETS[stage] : null;
  const activePreset = SMART_PRESETS.find(
    (p) => JSON.stringify([...p.docs].sort()) === JSON.stringify([...value].sort())
  );

  const availableClasses = TIER_MODEL_CLASSES[tier];
  const totalCredits = calcTotalCredits(value, tier, perDocModelClass);
  const creditPool = TIER_CREDIT_POOL[tier];

  const setDocClass = (doc: FileKey, mc: ModelClass) => {
    onModelClassChange({ ...perDocModelClass, [doc]: mc });
  };

  const coreDocs: FileKey[] = ["prd", "context", "plan", "design-system", "agents"];
  const extendedDocs: FileKey[] = ["production-hardening", "scale-performance", "growth-quality"];

  return (
    <div className="font-inter w-full max-w-6xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="mb-8">
        <span
          className="font-mono text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-5 inline-block"
          style={{
            background: "rgba(204,255,0,0.08)",
            color: "var(--color-lime)",
            border: "0.5px solid rgba(204,255,0,0.25)",
          }}
        >
          Step 4 of 4 — Dokumen & Model
        </span>
        <h2
          className="font-unbounded font-bold text-2xl sm:text-3xl mb-3"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
        >
          Pilih dokumen & kelas model AI
        </h2>
        <p className="font-inter text-base" style={{ color: "var(--color-text-secondary)" }}>
          Pilih dokumen yang ingin digenerate, lalu atur kelas model per dokumen.{" "}
          <span style={{ color: "rgba(255,255,255,0.35)" }}>
            Kelas lebih tinggi = hasil lebih detail, kredit lebih banyak.
          </span>
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
              className="font-mono text-xs font-bold tracking-widest uppercase mb-3"
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all"
                    style={{
                      background: isActive ? "rgba(204,255,0,0.1)" : "var(--color-bg-surface)",
                      border: isActive
                        ? "0.5px solid rgba(204,255,0,0.4)"
                        : "0.5px solid var(--color-border-default)",
                      color: isActive ? "var(--color-lime)" : "var(--color-text-secondary)",
                    }}
                    title={preset.desc}
                  >
                    <span>{preset.icon}</span>
                    <span className="font-semibold">{preset.label}</span>
                    {isRecommended && (
                      <span
                        className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded"
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
            <p
              className="font-mono text-xs font-bold tracking-widest uppercase px-3 py-2"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Dokumen Inti
            </p>
            {coreDocs.map((key) => renderDocRow(key, true))}

            {/* Extended docs */}
            <p
              className="font-mono text-xs font-bold tracking-widest uppercase px-3 py-2 mt-2"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Dokumen Lanjutan
            </p>
            {extendedDocs.map((key) => renderDocRow(key, false))}

            <div
              className="flex items-center justify-between px-3 py-2 mt-2 rounded-lg"
              style={{
                borderTop: "0.5px solid var(--color-border-default)",
                marginTop: 8,
              }}
            >
              <span
                className="font-inter font-semibold text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {value.length} dokumen dipilih
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onDocsChange([...ALL_FILE_KEYS])}
                  className="font-mono text-xs px-2.5 py-1.5 rounded transition-all"
                  style={{
                    color: "var(--color-text-tertiary)",
                    border: "0.5px solid var(--color-border-default)",
                  }}
                >
                  Semua
                </button>
                <button
                  onClick={() => onDocsChange(["prd"])}
                  className="font-mono text-xs px-2.5 py-1.5 rounded transition-all"
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

        {/* RIGHT — Per-document model class + credit estimate */}
        <div className="flex flex-col gap-4">
          {/* Per-document model class picker */}
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
                className="font-mono text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Model AI per Dokumen
              </p>
            </div>

            <div className="p-3">
              {/* Class legend */}
              <div className="flex flex-wrap gap-2 mb-4 px-1">
                {MODEL_CLASSES.map((mc) => {
                  const isAvailable = availableClasses.includes(mc.id);
                  return (
                    <div
                      key={mc.id}
                      className="flex items-center gap-1.5 text-[10px]"
                      style={{
                        color: isAvailable ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                      }}
                      title={`${mc.exampleModels} — ${mc.creditsPer1kTokens} kredit/1k token`}
                    >
                      <span>{mc.icon}</span>
                      <span className="font-semibold">{mc.label}</span>
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>
                        {mc.creditsPer1kTokens}×
                      </span>
                      {!isAvailable && (
                        <span style={{ color: "rgba(255,199,0,0.5)" }}>🔒</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Per-doc rows */}
              {value.length === 0 ? (
                <p
                  className="text-sm text-center py-6"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Pilih dokumen di kiri untuk mengatur model
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {value.map((doc) => {
                    const meta = FILE_META[doc];
                    const currentClass =
                      perDocModelClass[doc] ?? DOC_DEFAULT_MODEL_CLASS[doc][tier];
                    const credits = calcDocCredits(doc, tier, currentClass);

                    return (
                      <div
                        key={doc}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.02)" }}
                      >
                        {/* Doc name */}
                        <span
                          className="text-sm font-medium flex-shrink-0 min-w-[120px]"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {meta.icon} {meta.label.length > 18 ? meta.label.slice(0, 16) + "…" : meta.label}
                        </span>

                        {/* Class selector buttons */}
                        <div className="flex gap-1 flex-1">
                          {MODEL_CLASSES.map((mc) => {
                            const isSelected = currentClass === mc.id;
                            const isAvailable = availableClasses.includes(mc.id);
                            const isDefault = DOC_DEFAULT_MODEL_CLASS[doc][tier] === mc.id;

                            return (
                              <button
                                key={mc.id}
                                onClick={() => isAvailable && setDocClass(doc, mc.id)}
                                disabled={!isAvailable}
                                className="flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all relative"
                                style={{
                                  background: isSelected
                                    ? mc.id === "hemat"
                                      ? "rgba(34,197,94,0.15)"
                                      : mc.id === "menengah"
                                      ? "rgba(59,130,246,0.15)"
                                      : mc.id === "flagship"
                                      ? "rgba(168,85,247,0.15)"
                                      : "rgba(255,199,0,0.15)"
                                    : "transparent",
                                  border: isSelected
                                    ? `1px solid ${
                                        mc.id === "hemat"
                                          ? "rgba(34,197,94,0.4)"
                                          : mc.id === "menengah"
                                          ? "rgba(59,130,246,0.4)"
                                          : mc.id === "flagship"
                                          ? "rgba(168,85,247,0.4)"
                                          : "rgba(255,199,0,0.4)"
                                      }`
                                    : "0.5px solid rgba(255,255,255,0.08)",
                                  color: isSelected
                                    ? mc.id === "hemat"
                                      ? "#22C55E"
                                      : mc.id === "menengah"
                                      ? "#60A5FA"
                                      : mc.id === "flagship"
                                      ? "#A855F7"
                                      : "#FFC700"
                                    : isAvailable
                                    ? "rgba(255,255,255,0.35)"
                                    : "rgba(255,255,255,0.15)",
                                  cursor: isAvailable ? "pointer" : "not-allowed",
                                  opacity: isAvailable ? 1 : 0.5,
                                  fontFamily: "var(--font-jetbrains-mono), monospace",
                                }}
                                title={
                                  isAvailable
                                    ? `${mc.label} — ${mc.exampleModels}`
                                    : `🔒 Upgrade ke ${plan === "none" || plan === "starter" ? "Pro" : "Pro Max"}`
                                }
                              >
                                {mc.icon}
                                {!isAvailable && (
                                  <span className="ml-0.5">🔒</span>
                                )}
                                {isDefault && !isSelected && isAvailable && (
                                  <span
                                    className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full"
                                    style={{ background: "rgba(204,255,0,0.5)" }}
                                    title="Default"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Credit cost */}
                        <span
                          className="text-[11px] font-bold flex-shrink-0 min-w-[50px] text-right"
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                          }}
                        >
                          {credits} kr
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Credit estimate card */}
          <div
            className="rounded-xl p-4"
            style={{
              border: "0.5px solid var(--color-border-default)",
              background: "var(--color-bg-elevated)",
            }}
          >
            <p
              className="font-mono text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Estimasi Kredit
            </p>
            <div className="flex flex-col gap-2">
              {/* Per-doc breakdown */}
              {value.map((doc) => {
                const meta = FILE_META[doc];
                const mc = perDocModelClass[doc] ?? DOC_DEFAULT_MODEL_CLASS[doc][tier];
                const classInfo = MODEL_CLASSES.find((c) => c.id === mc);
                const credits = calcDocCredits(doc, tier, mc);
                return (
                  <div key={doc} className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {meta.icon} {meta.label}
                      <span
                        className="ml-1.5 text-[10px]"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        {classInfo?.label}
                      </span>
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}
                    >
                      {credits}
                    </span>
                  </div>
                );
              })}

              {/* Total */}
              <div
                className="flex items-center justify-between pt-3 mt-1"
                style={{ borderTop: "0.5px solid var(--color-border-default)" }}
              >
                <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  Total kredit
                </span>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: "var(--color-lime)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                  }}
                >
                  {totalCredits}
                </span>
              </div>

              {/* Pool info */}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Pool {isSubscribed(plan) ? TIER_LABELS[plan] : PLAN_STATUS_LABELS.none}/bulan
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                  }}
                >
                  {creditPool.toLocaleString()} kredit
                </span>
              </div>

              {/* Usage bar */}
              <div className="mt-1">
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((totalCredits / creditPool) * 100, 100)}%`,
                      background:
                        totalCredits / creditPool > 0.8
                          ? "#EF4444"
                          : totalCredits / creditPool > 0.5
                          ? "#F59E0B"
                          : "var(--color-lime)",
                    }}
                  />
                </div>
                <p
                  className="text-[10px] mt-1 text-right"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {((totalCredits / creditPool) * 100).toFixed(1)}% dari pool bulanan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-xl font-inter font-semibold text-base transition-all"
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
          className="flex-1 py-4 rounded-xl font-inter font-bold text-base transition-all"
          style={{
            background: value.length > 0 ? "var(--color-lime)" : "var(--color-bg-elevated)",
            color: value.length > 0 ? "#0A0A0A" : "var(--color-text-disabled)",
            border: value.length > 0 ? "none" : "0.5px solid var(--color-border-default)",
            cursor: value.length > 0 ? "pointer" : "not-allowed",
          }}
        >
          {value.length === 0
            ? "Pilih dokumen yang mau digenerate"
            : `Review & Generate (${value.length} dok · ${totalCredits} kredit) →`}
        </button>
      </div>
    </div>
  );

  // ── Render helper ──

  function renderDocRow(key: FileKey, _isCore: boolean) {
    const meta = FILE_META[key];
    const isSelected = value.includes(key);
    const isRequired = key === "prd";

    return (
      <button
        key={key}
        onClick={() => toggle(key)}
        className="flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all w-full mb-0.5"
        style={{
          background: isSelected ? "rgba(204,255,0,0.05)" : "transparent",
          border: isSelected
            ? "0.5px solid rgba(204,255,0,0.2)"
            : "0.5px solid transparent",
        }}
      >
        <div
          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
          style={{
            background: isSelected ? "var(--color-lime)" : "transparent",
            border: isSelected ? "none" : "0.5px solid var(--color-border-strong)",
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
              className="font-inter font-semibold text-sm"
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
                className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
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
            className="font-inter text-xs mt-1"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {meta.phase}
          </p>
        </div>
      </button>
    );
  }
}
