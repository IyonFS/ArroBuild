import AppShell from "@/components/layout/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs — ArroBuild",
  description: "Referensi teknis untuk ArroBuild, file output, dan integrasi ekosistem AI agent.",
};

const FILES_REFERENCE = [
  { file: "prd.md", desc: "Struktur Product Requirements Document, penjelasan field-by-field." },
  { file: "context.md", desc: "Instruksi meta untuk AI agent, mencakup core value dan business rules." },
  { file: "plan.md", desc: "Masterplan teknis langkah demi langkah." },
  { file: "design-system.md", desc: "Spesifikasi UI/UX, tokens, dan komponen." },
  { file: "agents.md", desc: "Pengaturan role AI agent, persona, dan tools yang dibutuhkan." },
  { file: "production-hardening.md", desc: "Checklist rilis produksi, security, dan scaling." },
  { file: "scale-performance.md", desc: "Arsitektur cloud, database indexing, dan strategi caching." },
  { file: "growth-quality.md", desc: "Analytics setup, eksperimen A/B, dan quality control." },
];

const EXPORT_FORMATS = [
  { format: "CLAUDE.md", desc: "Digunakan oleh Claude Code. Menggabungkan context.md dan agents.md." },
  { format: ".cursorrules", desc: "Digunakan oleh Cursor. Menggabungkan design-system.md dan plan.md dengan format khusus." },
  { format: "agents.json", desc: "Schema array JSON berisi daftar agen AI dan instruksinya untuk setup custom pipeline." },
  { format: "system-prompt.txt", desc: "Mega-prompt berisi semua dokumen untuk di-copy paste ke ChatGPT atau Claude Web." },
];

export default function DocsPage() {
  return (
    <AppShell tone="app" showFooter>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-16">
          <h1
            className="font-unbounded font-black text-4xl mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Technical Reference
          </h1>
          <p
            className="font-mono text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Dokumentasi teknis untuk memahami struktur output ArroBuild dan cara memanfaatkannya di dalam ekosistem AI. Untuk tutorial edukasi, silakan kunjungi <a href="/learn" className="text-lime hover:underline">Learn Hub</a>.
          </p>
        </div>

        {/* ── Overview ── */}
        <section className="mb-16">
          <h2
            className="font-unbounded font-bold text-2xl mb-6 border-b pb-4"
            style={{
              color: "var(--color-text-primary)",
              borderColor: "var(--color-border-default)",
            }}
          >
            1. Overview
          </h2>
          <div
            className="font-mono text-sm leading-relaxed space-y-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <p>
              ArroBuild adalah mesin orkestrasi <i>generative AI</i> yang mengubah satu kalimat ide menjadi dokumentasi arsitektur perangkat lunak yang komprehensif. ArroBuild didesain secara khusus untuk developer yang melakukan <strong>vibe coding</strong> (mendelegasikan tugas *coding* ke AI agent seperti Cursor, Windsurf, atau Claude Code).
            </p>
            <p>
              Output dari ArroBuild dioptimalkan untuk mesin, meminimalkan halusinasi AI, dan memaksimalkan konsistensi proyek dari awal hingga rilis produksi.
            </p>
          </div>
        </section>

        {/* ── Output Files Reference ── */}
        <section className="mb-16">
          <h2
            className="font-unbounded font-bold text-2xl mb-6 border-b pb-4"
            style={{
              color: "var(--color-text-primary)",
              borderColor: "var(--color-border-default)",
            }}
          >
            2. Output Files Reference
          </h2>
          <div className="grid gap-4">
            {FILES_REFERENCE.map((item) => (
              <div
                key={item.file}
                className="p-4 rounded-lg border glass"
                style={{
                  borderColor: "var(--color-border-default)",
                  background: "var(--color-bg-elevated)",
                }}
              >
                <div className="font-mono font-bold text-lime mb-2">{item.file}</div>
                <div
                  className="font-mono text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Export Formats ── */}
        <section className="mb-16">
          <h2
            className="font-unbounded font-bold text-2xl mb-6 border-b pb-4"
            style={{
              color: "var(--color-text-primary)",
              borderColor: "var(--color-border-default)",
            }}
          >
            3. Export Formats
          </h2>
          <div
            className="font-mono text-sm leading-relaxed mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ArroBuild menyediakan sistem *smart bundle* yang membungkus output `.md` biasa ke dalam format spesifik yang otomatis dibaca oleh alat pengembangan lokal Anda.
          </div>
          <div className="grid gap-4">
            {EXPORT_FORMATS.map((item) => (
              <div
                key={item.format}
                className="p-4 rounded-lg border glass"
                style={{
                  borderColor: "var(--color-border-default)",
                  background: "var(--color-bg-elevated)",
                }}
              >
                <div className="font-mono font-bold text-white mb-2">{item.format}</div>
                <div
                  className="font-mono text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── API Reference (Coming Soon) ── */}
        <section className="mb-16">
          <h2
            className="font-unbounded font-bold text-2xl mb-6 border-b pb-4"
            style={{
              color: "var(--color-text-primary)",
              borderColor: "var(--color-border-default)",
            }}
          >
            4. API Reference
          </h2>
          <div
            className="p-8 rounded-lg border border-dashed text-center"
            style={{
              borderColor: "var(--color-border-default)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div className="font-mono text-sm text-white mb-2">REST API & Webhooks</div>
            <div
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Coming Soon di Fase Berikutnya
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
