"use client";

import type { Step } from "./types";

interface Props {
  currentStep: Step;
  onGoTo: (step: 1 | 2 | 3) => void;
  completedSteps: Set<number>;
}

const STEPS = [
  { num: 1 as const, label: "Identitas" },
  { num: 2 as const, label: "Konten" },
  { num: 3 as const, label: "Desain" },
];

export default function StepIndicator({ currentStep, onGoTo, completedSteps }: Props) {
  const isResult = currentStep === "result";
  const currentNum = isResult ? 4 : (currentStep as number);

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div
        className="h-px w-full mb-4"
        style={{ background: "var(--color-border-default)" }}
      >
        <div
          className="h-px transition-all duration-500"
          style={{
            background: "var(--color-lime)",
            width: isResult ? "100%" : `${((currentNum - 1) / 3) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0 sm:gap-2 max-w-2xl mx-auto px-4">
        {STEPS.map(({ num, label }) => {
          const done = completedSteps.has(num);
          const active = currentStep === num;
          const clickable = done && !active;

          return (
            <button
              key={num}
              onClick={() => clickable && onGoTo(num)}
              disabled={!clickable}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all"
              style={{
                cursor: clickable ? "pointer" : "default",
                background: active ? "rgba(204,255,0,0.08)" : "transparent",
                border: active ? "0.5px solid rgba(204,255,0,0.25)" : "0.5px solid transparent",
                opacity: !done && !active ? 0.4 : 1,
              }}
            >
              {/* Circle */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: done
                    ? "var(--color-lime)"
                    : active
                    ? "rgba(204,255,0,0.15)"
                    : "var(--color-bg-elevated)",
                  border: active ? "1px solid rgba(204,255,0,0.5)" : done ? "none" : "0.5px solid var(--color-border-default)",
                }}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#0A0A0A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="font-mono text-[9px] font-bold" style={{ color: active ? "var(--color-lime)" : "var(--color-text-tertiary)" }}>
                    {num}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="font-mono text-[11px] font-semibold hidden sm:block"
                style={{ color: active ? "var(--color-lime)" : done ? "var(--color-text-secondary)" : "var(--color-text-tertiary)" }}
              >
                {label}
              </span>
            </button>
          );
        })}

        {/* Connector dots */}
        <div className="flex-1" />

        {/* Result indicator */}
        <div
          className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg"
          style={{
            background: isResult ? "rgba(204,255,0,0.08)" : "transparent",
            border: isResult ? "0.5px solid rgba(204,255,0,0.25)" : "0.5px solid transparent",
            opacity: !isResult && !completedSteps.has(3) ? 0.3 : 1,
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isResult ? "var(--color-lime)" : "var(--color-bg-elevated)",
              border: isResult ? "none" : "0.5px solid var(--color-border-default)",
            }}
          >
            <span style={{ fontSize: 10 }}>{isResult ? "✦" : "⬡"}</span>
          </div>
          <span
            className="font-mono text-[11px] font-semibold hidden sm:block"
            style={{ color: isResult ? "var(--color-lime)" : "var(--color-text-tertiary)" }}
          >
            Prompt
          </span>
        </div>
      </div>
    </div>
  );
}
