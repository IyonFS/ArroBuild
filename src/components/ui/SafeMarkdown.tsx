import { Children, Fragment, type ReactNode } from "react";
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export function filterInferredMarkdown(content: string, showInferred: boolean): string {
  if (showInferred) return content;

  return content
    .split("\n")
    .filter((line) => !line.includes("[INFERRED]") || line.includes("[EXTRACTED]"))
    .join("\n");
}

export function safeMarkdownUrl(url: string, key: string): string {
  if (key === "src") return "";

  const normalized = url.trim();
  if (
    normalized.startsWith("/") ||
    normalized.startsWith("#") ||
    normalized.startsWith("?") ||
    /^https?:/i.test(normalized)
  ) {
    return defaultUrlTransform(normalized);
  }

  return "";
}

function confidenceTag(label: "EXTRACTED" | "INFERRED", key: number) {
  const extracted = label === "EXTRACTED";
  return (
    <span
      key={`${label}-${key}`}
      data-confidence={label.toLowerCase()}
      style={{
        display: "inline-block",
        padding: "1px 5px",
        borderRadius: 3,
        background: extracted ? "rgba(52,211,153,0.15)" : "rgba(157,78,221,0.12)",
        color: extracted ? "#34D399" : "#9D4EDD",
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1.5,
      }}
    >
      [{label}]
    </span>
  );
}

function renderConfidenceTags(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== "string") return child;

    return child.split(/(\[EXTRACTED\]|\[INFERRED\])/g).map((part, index) => {
      if (part === "[EXTRACTED]") return confidenceTag("EXTRACTED", index);
      if (part === "[INFERRED]") return confidenceTag("INFERRED", index);
      return <Fragment key={`text-${index}`}>{part}</Fragment>;
    });
  });
}

const components: Components = {
  h1: ({ children }) => (
    <h1 style={{ margin: "20px 0 8px", fontSize: 16, color: "#F0F3FA", fontWeight: 700 }}>
      {renderConfidenceTags(children)}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ margin: "12px 0 6px", fontSize: 14, color: "#F0F3FA", fontWeight: 700 }}>
      {renderConfidenceTags(children)}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ margin: "12px 0 6px", fontSize: 13, color: "#F0F3FA", fontWeight: 700 }}>
      {renderConfidenceTags(children)}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ margin: "0 0 8px", lineHeight: 1.75 }}>{renderConfidenceTags(children)}</p>
  ),
  ul: ({ children }) => <ul style={{ margin: "6px 0 10px", paddingLeft: 22 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: "6px 0 10px", paddingLeft: 22 }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4 }}>{renderConfidenceTags(children)}</li>,
  strong: ({ children }) => (
    <strong style={{ color: "#F0F3FA", fontWeight: 700 }}>{renderConfidenceTags(children)}</strong>
  ),
  em: ({ children }) => <em>{renderConfidenceTags(children)}</em>,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: "10px 0",
        padding: "6px 12px",
        borderLeft: "2px solid rgba(157,78,221,0.45)",
        color: "rgba(240,243,250,0.62)",
      }}
    >
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code
      style={{
        padding: "1px 5px",
        borderRadius: 3,
        background: "rgba(240,243,250,0.07)",
        color: "#38BDF8",
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      style={{
        margin: "10px 0",
        padding: 12,
        overflowX: "auto",
        borderRadius: 6,
        background: "rgba(0,0,0,0.25)",
      }}
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: "auto", margin: "10px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th
      style={{
        padding: "7px 9px",
        border: "0.5px solid rgba(240,243,250,0.12)",
        color: "#F0F3FA",
        textAlign: "left",
      }}
    >
      {renderConfidenceTags(children)}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ padding: "7px 9px", border: "0.5px solid rgba(240,243,250,0.1)" }}>
      {renderConfidenceTags(children)}
    </td>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      style={{ color: "#38BDF8", textDecoration: "underline" }}
    >
      {renderConfidenceTags(children)}
    </a>
  ),
  img: ({ alt }) => <span aria-label={alt ?? "Gambar dihapus"}>[{alt ?? "Gambar dihapus"}]</span>,
};

export default function SafeMarkdown({
  content,
  showInferred = true,
}: {
  content: string;
  showInferred?: boolean;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 12,
        lineHeight: 1.75,
        color: "rgba(240,243,250,0.75)",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
        urlTransform={safeMarkdownUrl}
      >
        {filterInferredMarkdown(content, showInferred)}
      </ReactMarkdown>
    </div>
  );
}
