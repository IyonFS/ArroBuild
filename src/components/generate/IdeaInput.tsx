"use client";

import { trackEvent } from "@/lib/analytics";

interface IdeaInputProps {
  idea: string;
  onChange: (v: string) => void;
  onNext: () => void;
}

const MIN_CHARS = 50;
const MAX_CHARS = 2000;

const EXAMPLES = [
  "A SaaS platform where restaurant owners can manage their menu, tables, and orders in real-time with QR code-based ordering for customers.",
  "An AI-powered journaling app that analyzes your mood patterns over time and gives weekly insights to help improve mental wellbeing.",
  "A marketplace for freelance video editors where clients can post projects with reference footage and editors can bid with short clips showcasing their style.",
];

export default function IdeaInput({ idea, onChange, onNext }: IdeaInputProps) {
  const count = idea.length;
  const isValid = count >= MIN_CHARS && count <= MAX_CHARS;
  const progress = Math.min(count / MIN_CHARS, 1);

  function handleExample(example: string) {
    onChange(example);
  }

  return (
    <div className="animate-fade-in-up">
      {/* Heading */}
      <div className="mb-10 text-center">
        <div
          className="inline-flex items-center gap-2 badge badge-success mb-5"
        >
          <span>Step 1 of 4</span>
        </div>
        <h1 className="text-h1 mb-3">What are you building?</h1>
        <p className="text-body-lg max-w-lg mx-auto">
          Describe your product idea in detail. The more context you give, the
          better the generated documentation will be.
        </p>
      </div>

      {/* Textarea card */}
      <div className="card mb-4">
        <textarea
          id="idea-input"
          value={idea}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your product idea... What problem does it solve? Who are the users? What are the core features?"
          maxLength={MAX_CHARS}
          rows={8}
          className="w-full bg-transparent resize-none text-body-lg outline-none placeholder:text-tertiary leading-relaxed"
          style={{
            color: "var(--color-text-primary)",
          }}
        />

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "0.5px solid var(--color-border-default)" }}>
          {/* Progress bar */}
          <div className="flex items-center gap-3 flex-1">
            <div
              className="h-1 flex-1 max-w-32 rounded-full overflow-hidden"
              style={{ background: "var(--color-border-default)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress * 100}%`,
                  background:
                    progress >= 1 ? "var(--color-lime)" : "var(--color-text-tertiary)",
                }}
              />
            </div>
            <span
              className="text-caption"
              style={{
                color:
                  count < MIN_CHARS
                    ? "var(--color-text-tertiary)"
                    : "var(--color-lime)",
              }}
            >
              {count < MIN_CHARS
                ? `${MIN_CHARS - count} more chars needed`
                : `${count} / ${MAX_CHARS}`}
            </span>
          </div>
        </div>
      </div>

      {/* Example prompts */}
      <div className="mb-8">
        <p className="text-label mb-3">Try an example</p>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              id={`example-${i}`}
              onClick={() => handleExample(ex)}
              className="card card-interactive text-left p-3 text-small w-full"
              style={{
                color: "var(--color-text-secondary)",
                borderColor: idea === ex ? "var(--color-lime)" : undefined,
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        id="idea-next-btn"
        onClick={() => {
          trackEvent("idea_submitted", { charCount: count });
          onNext();
        }}
        disabled={!isValid}
        className="btn btn-primary btn-lg w-full"
      >
        Continue
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
