"use client";

import type {
  Clarifications,
  Platform,
  Monetization,
  Scope,
} from "./types";

interface ClarificationStepProps {
  clarifications: Clarifications;
  onChange: (v: Clarifications) => void;
  onNext: () => void;
  onBack: () => void;
}

function ToggleGroup<T extends string>({
  label,
  description,
  options,
  value,
  onChange,
}: {
  label: string;
  description: string;
  options: { value: T; label: string; emoji: string }[];
  value: T | undefined;
  onChange: (v: T | undefined) => void;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <p className="text-h3 mb-0.5">{label}</p>
        <p className="text-small">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              id={`clarify-${label.toLowerCase().replace(/\s/g, "-")}-${opt.value}`}
              onClick={() => onChange(active ? undefined : opt.value)}
              className="btn btn-secondary"
              style={
                active
                  ? {
                      borderColor: "var(--color-lime)",
                      background: "rgba(204,255,0,0.08)",
                      color: "var(--color-lime)",
                    }
                  : {}
              }
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PLATFORMS: { value: Platform; label: string; emoji: string }[] = [
  { value: "web", label: "Web App", emoji: "🌐" },
  { value: "mobile", label: "Mobile App", emoji: "📱" },
  { value: "desktop", label: "Desktop App", emoji: "💻" },
  { value: "api", label: "API / Backend", emoji: "⚡" },
];

const MONETIZATIONS: { value: Monetization; label: string; emoji: string }[] =
  [
    { value: "free", label: "Free", emoji: "🎁" },
    { value: "paid", label: "Paid", emoji: "💳" },
    { value: "freemium", label: "Freemium", emoji: "⭐" },
    { value: "open-source", label: "Open Source", emoji: "🔓" },
  ];

const SCOPES: { value: Scope; label: string; emoji: string }[] = [
  { value: "mvp", label: "MVP", emoji: "🚀" },
  { value: "full-product", label: "Full Product", emoji: "🏢" },
  { value: "experiment", label: "Experiment", emoji: "🧪" },
];

export default function ClarificationStep({
  clarifications,
  onChange,
  onNext,
  onBack,
}: ClarificationStepProps) {
  return (
    <div className="animate-fade-in-up">
      {/* Heading */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 badge badge-success mb-5">
          <span>Step 2 of 4</span>
        </div>
        <h1 className="text-h1 mb-3">A few quick questions</h1>
        <p className="text-body-lg max-w-lg mx-auto">
          These help the AI generate more accurate and relevant documentation.
          All questions are optional — skip any that don&apos;t apply.
        </p>
      </div>

      <div className="card mb-6">
        <ToggleGroup
          label="Platform"
          description="Where will this product run?"
          options={PLATFORMS}
          value={clarifications.platform}
          onChange={(v) => onChange({ ...clarifications, platform: v })}
        />
        <div
          className="my-6"
          style={{ height: "0.5px", background: "var(--color-border-default)" }}
        />
        <ToggleGroup
          label="Monetization"
          description="How will this product make money?"
          options={MONETIZATIONS}
          value={clarifications.monetization}
          onChange={(v) => onChange({ ...clarifications, monetization: v })}
        />
        <div
          className="my-6"
          style={{ height: "0.5px", background: "var(--color-border-default)" }}
        />
        <ToggleGroup
          label="Scope"
          description="What stage are you building for?"
          options={SCOPES}
          value={clarifications.scope}
          onChange={(v) => onChange({ ...clarifications, scope: v })}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button id="clarify-back-btn" onClick={onBack} className="btn btn-secondary flex-1">
          ← Back
        </button>
        <button id="clarify-next-btn" onClick={onNext} className="btn btn-primary flex-[2]">
          Continue →
        </button>
      </div>
    </div>
  );
}
