"use client";

import Link from "next/link";
import type { Block } from "@/lib/learn-content";

interface Props {
  blocks: Block[];
}

export default function LessonContent({ blocks }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={i}
                className="font-unbounded font-bold text-lg mt-6 first:mt-0"
                style={{ color: "var(--color-text-primary)" }}
              >
                {block.content}
              </h2>
            );

          case "text":
            return (
              <p
                key={i}
                className="font-mono text-sm leading-[1.8]"
                style={{ color: "var(--color-text-secondary)" }}
                dangerouslySetInnerHTML={{
                  __html: renderInline(block.content ?? ""),
                }}
              />
            );

          case "list":
            return (
              <ul key={i} className="flex flex-col gap-2 pl-0">
                {block.items?.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 font-mono text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    <span
                      className="mt-[0.4rem] w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: "var(--color-lime)" }}
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
                  background: "rgba(204,255,0,0.05)",
                  border: "0.5px solid rgba(204,255,0,0.2)",
                }}
              >
                {block.label && (
                  <p
                    className="font-mono font-bold text-xs mb-2"
                    style={{ color: "var(--color-lime)" }}
                  >
                    ⚡ {block.label}
                  </p>
                )}
                <p
                  className="font-mono text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
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
                    className="font-mono font-bold text-xs mb-2"
                    style={{ color: "#60a5fa" }}
                  >
                    💡 {block.label}
                  </p>
                )}
                <p
                  className="font-mono text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
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
                    className="font-mono font-bold text-xs mb-2"
                    style={{ color: "var(--color-orange)" }}
                  >
                    ⚠ {block.label}
                  </p>
                )}
                <p
                  className="font-mono text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
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
                  className="inline-flex items-center gap-2 font-mono font-bold text-sm px-5 py-2.5 rounded-lg transition-all hover:opacity-90"
                  style={{
                    background: "var(--color-lime)",
                    color: "#0A0A0A",
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
    .replace(/`(.+?)`/g, "<code style=\"font-family:monospace;font-size:12px;padding:1px 5px;border-radius:3px;background:rgba(204,255,0,0.08);color:var(--color-lime);border:0.5px solid rgba(204,255,0,0.2)\">$1</code>");
}
