"use client";

import Link from "next/link";
import type { Block } from "@/lib/learn-content";

interface Props {
  blocks: Block[];
  variant?: "learn" | "default";
}

export default function LessonContent({ blocks, variant = "learn" }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        if (variant === "learn" && block.type === "cta-link") {
          return null;
        }

        switch (block.type) {
          case "heading":
            return (
              <h2
                key={i}
                className="learn-section-title text-lg mt-7 first:mt-0"
                style={{ color: "var(--color-text-primary)" }}
              >
                {block.content}
              </h2>
            );

          case "text":
            return (
              <p
                key={i}
                className="learn-body"
                dangerouslySetInnerHTML={{
                  __html: renderInline(block.content ?? ""),
                }}
              />
            );

          case "list":
            return (
              <ul key={i} className="flex flex-col gap-2.5 pl-0">
                {block.items?.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 learn-body-sm"
                  >
                    <span
                      className="mt-[0.4rem] w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--color-orange)" }}
                    />
                    <span
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: renderInline(item),
                      }}
                    />
                  </li>
                ))}
              </ul>
            );

          case "code":
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{
                  border: "0.5px solid var(--color-border-default)",
                }}
              >
                {block.language && (
                  <div
                    className="flex items-center justify-between px-4 py-2 border-b font-mono text-xs"
                    style={{
                      background: "var(--color-bg-elevated)",
                      borderColor: "var(--color-border-default)",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    <span>{block.language}</span>
                  </div>
                )}
                <pre
                  className="p-5 overflow-x-auto font-mono text-sm leading-relaxed"
                  style={{
                    background: "#0D0D0D",
                    color: "var(--color-text-primary)",
                    margin: 0,
                  }}
                >
                  <code>{block.content}</code>
                </pre>
              </div>
            );

          case "callout":
            return (
              <div
                key={i}
                className="rounded-xl p-5"
                style={{
                  background: "rgba(255,92,26,0.06)",
                  border: "0.5px solid rgba(255,92,26,0.28)",
                }}
              >
                {block.label && (
                  <p
                    className="learn-label mb-2"
                    style={{ color: "var(--color-orange)" }}
                  >
                    {block.label}
                  </p>
                )}
                <p
                  className="learn-body-sm"
                  dangerouslySetInnerHTML={{
                    __html: renderInline(block.content ?? ""),
                  }}
                />
              </div>
            );

          case "tip":
            return (
              <div
                key={i}
                className="rounded-xl p-5"
                style={{
                  background: "rgba(59,130,246,0.06)",
                  border: "0.5px solid rgba(59,130,246,0.3)",
                }}
              >
                {block.label && (
                  <p
                    className="font-mono font-bold text-xs mb-2 uppercase tracking-wide"
                    style={{ color: "#60a5fa" }}
                  >
                    Tip · {block.label}
                  </p>
                )}
                <p
                  className="learn-body-sm"
                  dangerouslySetInnerHTML={{
                    __html: renderInline(block.content ?? ""),
                  }}
                />
              </div>
            );

          case "warning":
            return (
              <div
                key={i}
                className="rounded-xl p-5"
                style={{
                  background: "rgba(255,92,26,0.06)",
                  border: "0.5px solid rgba(255,92,26,0.3)",
                }}
              >
                {block.label && (
                  <p
                    className="font-mono font-bold text-xs mb-2 uppercase tracking-wide"
                    style={{ color: "var(--color-orange)" }}
                  >
                    Perhatian · {block.label}
                  </p>
                )}
                <p
                  className="learn-body-sm"
                  dangerouslySetInnerHTML={{
                    __html: renderInline(block.content ?? ""),
                  }}
                />
              </div>
            );

          case "cta-link":
            return (
              <div key={i} className="pt-2">
                <Link
                  href={block.href ?? "/generate"}
                  className="learn-hover-btn inline-flex items-center gap-2 font-mono font-bold text-sm px-5 py-2.5 rounded-lg"
                  style={{
                    background: "var(--color-orange)",
                    color: "#FFFFFF",
                  }}
                >
                  {block.label ?? "Coba langsung →"}
                </Link>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

// Minimal inline markdown: **bold**, `code`
function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong style=\"color:var(--color-text-primary)\">$1</strong>")
    .replace(/`(.+?)`/g, "<code style=\"font-family:monospace;font-size:12px;padding:1px 5px;border-radius:3px;background:rgba(255,92,26,0.1);color:var(--color-orange);border:0.5px solid rgba(255,92,26,0.25)\">$1</code>");
}
