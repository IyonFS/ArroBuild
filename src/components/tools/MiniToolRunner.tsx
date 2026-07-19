"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import type { MiniToolDefinition } from "@/lib/config/mini-tools";
import { tierLabel } from "@/components/tools/tool-meta";

/** Serializable tool props — no buildPrompt (server-only). */
export type MiniToolClientProps = Omit<MiniToolDefinition, "buildPrompt">;

interface MiniToolRunnerProps {
  tool: MiniToolClientProps;
}

export default function MiniToolRunner({ tool }: MiniToolRunnerProps) {
  const [input, setInput] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [balanceAfter, setBalanceAfter] = useState<number | null>(null);

  async function handleRun() {
    setLoading(true);
    setError("");
    setOutput("");
    setBalanceAfter(null);
    try {
      const res = await fetch("/api/tools/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id, input }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menjalankan tool");
        return;
      }
      setOutput(data.output ?? "");
      setBalanceAfter(data.balanceAfter ?? null);
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const canRun = tool.fields
    .filter((f) => f.required)
    .every((f) => (input[f.key] ?? "").trim().length > 0);

  return (
    <AppShell tone="marketing" showFooter padded={false}>
      <div className="tools-app min-h-screen">
        <section
          className="relative overflow-hidden border-b"
          style={{
            borderColor: "rgba(240,243,250,0.08)",
            background: "var(--app-bg-blueprint, #131A2C)",
            backgroundImage: "var(--app-blueprint-texture, var(--lp-blueprint-texture))",
            backgroundSize: "var(--app-blueprint-size, 40px 40px)",
          }}
        >
          <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
            <Link
              href="/tools"
              className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs no-underline"
              style={{ color: "var(--app-text-tertiary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFB020";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--app-text-tertiary)";
              }}
            >
              <ArrowLeft size={14} />
              Semua mini tools
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className="rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em]"
                style={{
                  borderColor: "rgba(255,176,32,0.35)",
                  background: "rgba(255,176,32,0.1)",
                  color: "#FFB020",
                }}
              >
                {tierLabel(tool.minTier)}
              </span>
              <span className="font-mono text-[11px]" style={{ color: "var(--app-text-tertiary)" }}>
                {tool.credits} kredit / pemakaian
              </span>
            </div>

            <h1
              className="mb-2 font-unbounded text-2xl font-extrabold tracking-tight sm:text-3xl"
              style={{ color: "var(--app-text-primary)", fontWeight: 800 }}
            >
              {tool.name}
            </h1>
            <p
              className="max-w-xl font-mono text-sm leading-relaxed"
              style={{ color: "var(--app-text-secondary)" }}
            >
              {tool.description}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6 space-y-4">
            {tool.fields.map((field) => (
              <label key={field.key} className="block">
                <span
                  className="mb-1.5 block font-mono text-sm font-semibold"
                  style={{ color: "var(--app-text-primary)" }}
                >
                  {field.label}
                  {field.required ? (
                    <span style={{ color: "#FFB020" }}> *</span>
                  ) : null}
                </span>
                {field.type === "textarea" ? (
                  <textarea
                    className="w-full min-h-[140px] rounded-lg border px-3 py-2.5 font-mono text-sm outline-none transition-colors"
                    style={{
                      borderColor: "var(--app-border-default)",
                      background: "var(--app-bg-elevated)",
                      color: "var(--app-text-primary)",
                    }}
                    placeholder={field.placeholder}
                    value={input[field.key] ?? ""}
                    onChange={(e) =>
                      setInput((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,176,32,0.55)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,176,32,0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--app-border-default)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2.5 font-mono text-sm outline-none transition-colors"
                    style={{
                      borderColor: "var(--app-border-default)",
                      background: "var(--app-bg-elevated)",
                      color: "var(--app-text-primary)",
                    }}
                    placeholder={field.placeholder}
                    value={input[field.key] ?? ""}
                    onChange={(e) =>
                      setInput((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,176,32,0.55)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,176,32,0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--app-border-default)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                )}
              </label>
            ))}
          </div>

          {error && (
            <p className="mb-4 font-mono text-sm" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleRun}
            disabled={loading || !canRun}
            className="rounded-lg px-5 py-2.5 font-mono text-sm font-bold transition-opacity disabled:opacity-40"
            style={{
              background: canRun && !loading ? "#FFB020" : "var(--app-bg-elevated)",
              color: canRun && !loading ? "#0D1321" : "var(--app-text-tertiary)",
              border: "none",
              cursor: canRun && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Memproses..." : `Jalankan (−${tool.credits} kredit)`}
          </button>

          {balanceAfter !== null && (
            <p className="mt-3 font-mono text-xs" style={{ color: "var(--app-text-tertiary)" }}>
              Saldo setelah: {balanceAfter.toLocaleString("id-ID")} kredit
            </p>
          )}

          {output && (
            <div
              className="prose prose-invert prose-sm mt-8 max-w-none rounded-xl border p-5 font-mono"
              style={{
                borderColor: "rgba(255,176,32,0.25)",
                background: "var(--app-bg-elevated)",
              }}
            >
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
