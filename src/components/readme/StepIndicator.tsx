"use client";

import type { WizardStep } from "./types";

interface Props {
  currentStep: WizardStep;
  onGoTo: (step: 1 | 2 | 3 | 4) => void;
  completedSteps: Set<number>;
}

const STEPS = [
  { num: 1 as const, label: "Mode" },
  { num: 2 as const, label: "Data" },
  { num: 3 as const, label: "Template" },
  { num: 4 as const, label: "Generate" },
];

export default function StepIndicator({ currentStep, onGoTo, completedSteps }: Props) {
  const isResult = currentStep === "result";
  const currentNum = isResult ? 5 : (currentStep as number);

  return (
    <div className="w-full">
      <div className="mb-4 h-px w-full" style={{ background: "var(--color-border-default)" }}>
        <div
          className="h-px transition-all duration-500"
          style={{
            background: "var(--app-sky)",
            width: isResult ? "100%" : `${((currentNum - 1) / 4) * 100}%`,
          }}
        />
      </div>

      <div className="mx-auto flex max-w-2xl items-center gap-0 px-1 sm:gap-1 sm:px-2">
        {STEPS.map(({ num, label }) => {
          const done = completedSteps.has(num);
          const active = currentStep === num;
          const clickable = done && !active;

          return (
            <button
              key={num}
              type="button"
              onClick={() => clickable && onGoTo(num)}
              disabled={!clickable}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg px-1 py-2 transition-all sm:gap-1.5 sm:px-2"
              style={{
                cursor: clickable ? "pointer" : "default",
                opacity: active || done ? 1 : 0.45,
              }}
            >
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold sm:h-7 sm:w-7 sm:text-[11px]"
                style={{
                  background: active || done ? "rgba(56,189,248,0.15)" : "transparent",
                  border: `1.5px solid ${active || done ? "var(--app-sky)" : "var(--color-border-default)"}`,
                  color: active || done ? "var(--app-sky)" : "var(--color-text-tertiary)",
                }}
              >
                {done && !active ? "✓" : num}
              </span>
              <span
                className="hidden font-mono text-[10px] font-semibold sm:inline sm:text-[11px]"
                style={{ color: active ? "var(--app-sky)" : "var(--color-text-secondary)" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
