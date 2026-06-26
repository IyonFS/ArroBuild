import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — ArroBuild",
  description: "Daftar tools AI agent yang terintegrasi langsung dengan ekspor dari ArroBuild.",
};

const INTEGRATIONS = [
  {
    id: "cursor",
    name: "Cursor",
    status: "Supported",
    description: "AI Code Editor terbaik saat ini. ArroBuild mengekspor file `.cursorrules` secara otomatis agar Cursor paham design system dan plan kamu.",
    icon: "⚡",
    link: "https://cursor.sh",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    status: "Supported",
    description: "CLI agent dari Anthropic. ArroBuild menyediakan file `CLAUDE.md` terpadu sebagai system prompt agar Claude Code langsung memahami konteks proyek.",
    icon: "🧠",
    link: "https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    status: "Supported",
    description: "Generative AI editor. Dapat menggunakan output ArroBuild secara langsung sebagai dokumentasi proyek awal.",
    icon: "🌊",
    link: "https://codeium.com/windsurf",
  },
  {
    id: "github",
    name: "GitHub",
    status: "Coming Soon",
    description: "Koneksi langsung ke repo GitHub. ArroBuild akan otomatis membuat repo dan melakukan initial commit berisi semua dokumen generate.",
    icon: "🐙",
    link: "#",
  },
  {
    id: "notion",
    name: "Notion",
    status: "Coming Soon",
    description: "Sinkronisasi dokumen hasil generate langsung ke workspace Notion kamu sebagai knowledge base tim.",
    icon: "📝",
    link: "#",
  },
];

export default function IntegrationsPage() {
  return (
    <AppShell tone="marketing" showFooter>
      <section
        className="border-b"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6"
            style={{
              background: "rgba(204,255,0,0.08)",
              border: "0.5px solid rgba(204,255,0,0.3)",
              color: "var(--color-lime)",
            }}
          >
            Fase 4 · Siap Pakai
          </div>

          <h1
            className="font-unbounded font-black text-4xl sm:text-5xl leading-[1.1] tracking-tight mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            AI Integrations
          </h1>
          <p
            className="text-lg font-mono max-w-xl leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ArroBuild menghasilkan struktur output yang terkalibrasi khusus agar langsung bisa dikonsumsi oleh AI tools favorit kamu tanpa konfigurasi tambahan.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INTEGRATIONS.map((tool) => (
              <div
                key={tool.id}
                className="glass rounded-xl p-8 flex flex-col relative overflow-hidden group border"
                style={{
                  borderColor: "var(--color-border-default)",
                  background: "var(--color-bg-elevated)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tool.icon}</span>
                    <h2
                      className="font-unbounded font-bold text-xl"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {tool.name}
                    </h2>
                  </div>
                  <div
                    className="px-2 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest"
                    style={{
                      background:
                        tool.status === "Supported"
                          ? "rgba(204,255,0,0.1)"
                          : "rgba(255,255,255,0.05)",
                      color:
                        tool.status === "Supported"
                          ? "var(--color-lime)"
                          : "var(--color-text-tertiary)",
                      border: `0.5px solid ${
                        tool.status === "Supported"
                          ? "rgba(204,255,0,0.3)"
                          : "rgba(255,255,255,0.1)"
                      }`,
                    }}
                  >
                    {tool.status}
                  </div>
                </div>

                <p
                  className="font-mono text-sm leading-relaxed mb-8 flex-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {tool.description}
                </p>

                {tool.status === "Supported" && (
                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs hover:underline flex items-center gap-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Pelajari lebih lanjut ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
