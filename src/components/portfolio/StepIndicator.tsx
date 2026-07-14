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
      <div
        className="mb-4 h-px w-full"
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

      <div className="mx-auto flex max-w-2xl items-center gap-0 px-2 sm:gap-2 sm:px-4">
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
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 transition-all sm:gap-2 sm:px-3"
              style={{
                cursor: clickable ? "pointer" : "default",
                background: active ? "rgba(255,176,32,0.1)" : "transparent",
                border: active
                  ? "0.5px solid rgba(255,176,32,0.35)"
                  : "0.5px solid transparent",
                opacity: !done && !active ? 0.4 : 1,
              }}
            >
              <div
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-all"
                style={{
                  background: done
                    ? "var(--color-lime)"
                    : active
                      ? "rgba(255,176,32,0.15)"
                      : "var(--color-bg-elevated)",
                  border: active
                    ? "1px solid rgba(255,176,32,0.5)"
                    : done
                      ? "none"
                      : "0.5px solid var(--color-border-default)",
                }}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#0D1321"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span
                    className="font-mono text-[9px] font-bold"
                    style={{
                      color: active ? "var(--color-lime)" : "var(--color-text-tertiary)",
                    }}
                  >
                    {num}
                  </span>
                )}
              </div>

              <span
                className="hidden font-mono text-[11px] font-semibold sm:block"
                style={{
                  color: active
                    ? "var(--color-lime)"
                    : done
                      ? "var(--color-text-secondary)"
                      : "var(--color-text-tertiary)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}

        <div className="flex-1" />

        <div
          className="flex items-center gap-1.5 rounded-lg px-2 py-2 sm:px-3"
          style={{
            background: isResult ? "rgba(255,176,32,0.1)" : "transparent",
            border: isResult
              ? "0.5px solid rgba(255,176,32,0.35)"
              : "0.5px solid transparent",
            opacity: !isResult && !completedSteps.has(3) ? 0.3 : 1,
          }}
        >
          <div
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: isResult ? "var(--color-lime)" : "var(--color-bg-elevated)",
              border: isResult ? "none" : "0.5px solid var(--color-border-default)",
              color: isResult ? "#0D1321" : undefined,
            }}
          >
            <span style={{ fontSize: 10 }}>{isResult ? "✦" : "⬡"}</span>
          </div>
          <span
            className="hidden font-mono text-[11px] font-semibold sm:block"
            style={{
              color: isResult ? "var(--color-lime)" : "var(--color-text-tertiary)",
            }}
          >
            Prompt
          </span>
        </div>
      </div>
    </div>
  );
}
