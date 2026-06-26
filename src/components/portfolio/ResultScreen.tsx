"use client";

import { useState } from "react";
import type { PortfolioFormState } from "./types";
import { buildPortfolioPrompt } from "./buildPrompt";

interface Props {
  state: PortfolioFormState;
  onEdit: (step: 1 | 2 | 3) => void;
  onReset: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-5 py-3 rounded-xl font-mono font-bold text-sm transition-all"
      style={{
        background: copied ? "rgba(34,197,94,0.15)" : "var(--color-lime)",
        color: copied ? "#22C55E" : "#0A0A0A",
        border: copied ? "1px solid rgba(34,197,94,0.4)" : "none",
      }}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Tersalin!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          ⎘ Copy Prompt
        </>
      )}
    </button>
  );
}

const DEPLOY_STEPS = [
  {
    num: 1,
    title: "Minta kode ke AI",
    body: "Setelah copy prompt, buka Claude.ai (atau AI lain). Paste prompt, klik send. Tunggu AI selesai generate.",
    tip: "Kalau hasilnya terpotong, ketik \"lanjutkan\" dan AI akan melanjutkan dari titik terakhir.",
  },
  {
    num: 2,
    title: "Simpan sebagai file HTML",
    body: "Copy semua kode yang diberikan AI (mulai dari <!DOCTYPE html> sampai </html>), lalu buka Notepad (Windows) atau TextEdit (Mac), paste, dan simpan dengan nama index.html.",
    tip: "Pastikan ekstensinya .html, bukan .txt. Atau pakai VS Code jika sudah terinstal.",
  },
  {
    num: 3,
    title: "Buka di browser dulu",
    body: "Double-click file index.html untuk test. Kalau ada yang tidak sesuai, kembali ke Claude dan minta revisi — misalnya: \"Ubah warna button jadi merah\" atau \"Buat font heading lebih besar\".",
    tip: null,
  },
  {
    num: 4,
    title: "Deploy ke Netlify Drop",
    body: "Buka netlify.com/drop, buat folder portfolio, pindahkan index.html ke sana, lalu drag & drop folder itu ke kotak di halaman Netlify. Tunggu beberapa detik — website sudah live dengan URL seperti amazing-babbage-1234ab.netlify.app!",
    tip: "URL-nya acak tapi bisa diganti jika daftar akun Netlify gratis.",
  },
  {
    num: 5,
    title: "Share & iterate",
    body: "Website sudah bisa dibagikan via link. Ingin update? Edit index.html (minta bantuan Claude), lalu drag & drop ulang ke Netlify Drop — website otomatis terupdate.",
    tip: null,
  },
];

export default function ResultScreen({ state, onEdit, onReset }: Props) {
  const prompt = buildPortfolioPrompt(state);
  const charCount = prompt.length;
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;

  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt.slice(0, 2000))}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Success header */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 rounded-xl mb-6"
        style={{ background: "rgba(204,255,0,0.05)", border: "0.5px solid rgba(204,255,0,0.2)" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: "var(--color-lime)", fontSize: 16 }}>✦</span>
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--color-lime)" }}>
              Prompt siap!
            </span>
          </div>
          <h2
            className="font-unbounded font-bold text-lg"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
          >
            Portfolio prompt-mu sudah siap
          </h2>
          <p className="font-mono text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            {wordCount} kata · {charCount.toLocaleString()} karakter
          </p>
        </div>
        <button
          onClick={onReset}
          className="font-mono text-xs px-3 py-2 rounded-lg transition-all flex-shrink-0"
          style={{ border: "0.5px solid var(--color-border-default)", color: "var(--color-text-tertiary)" }}
        >
          ↻ Buat ulang
        </button>
      </div>

      {/* Prompt display */}
      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{ border: "0.5px solid var(--color-border-default)", background: "var(--color-bg-elevated)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "0.5px solid var(--color-border-default)" }}
        >
          <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>
            Prompt lengkap
          </span>
          <span className="font-mono text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
            read-only · scroll untuk lihat semua
          </span>
        </div>
        <div
          className="overflow-y-auto px-4 py-4"
          style={{ maxHeight: 280 }}
        >
          <pre
            className="whitespace-pre-wrap break-words text-[12px]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {prompt}
          </pre>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <CopyButton text={prompt} />
        <a
          href="https://claude.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-mono font-bold text-sm transition-all"
          style={{
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-primary)",
            border: "0.5px solid var(--color-border-strong)",
          }}
        >
          <span>✦</span>
          Buka Claude.ai →
        </a>
      </div>

      {/* Edit links */}
      <div className="flex flex-wrap gap-3 mb-8">
        {([
          { step: 1 as const, label: "← Edit identitas" },
          { step: 2 as const, label: "← Edit konten" },
          { step: 3 as const, label: "← Edit desain" },
        ]).map(({ step, label }) => (
          <button
            key={step}
            onClick={() => onEdit(step)}
            className="font-mono text-xs transition-all"
            style={{ color: "var(--color-text-tertiary)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Deploy guide */}
      <div
        className="rounded-xl overflow-hidden mb-6"
        style={{ border: "0.5px solid var(--color-border-default)" }}
      >
        <div
          className="px-5 py-4"
          style={{ background: "var(--color-bg-elevated)", borderBottom: "0.5px solid var(--color-border-default)" }}
        >
          <p className="font-mono font-bold text-[10px] tracking-widest uppercase" style={{ color: "var(--color-text-tertiary)" }}>
            — Langkah Selanjutnya
          </p>
          <h3 className="font-mono font-bold text-base mt-1" style={{ color: "var(--color-text-primary)" }}>
            Panduan deploy ke internet gratis
          </h3>
          <p className="font-mono text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Setelah dapat kode dari Claude, ikuti 5 langkah ini.
          </p>
        </div>

        <div>
          {DEPLOY_STEPS.map((step, i) => (
            <div
              key={step.num}
              className="px-5 py-4"
              style={{ borderBottom: i < DEPLOY_STEPS.length - 1 ? "0.5px solid var(--color-border-default)" : "none" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold mt-0.5"
                  style={{ background: "rgba(204,255,0,0.1)", color: "var(--color-lime)", border: "0.5px solid rgba(204,255,0,0.2)" }}
                >
                  {step.num}
                </div>
                <div className="flex-1">
                  <p className="font-mono font-bold text-sm mb-1" style={{ color: "var(--color-text-primary)" }}>
                    {step.title}
                  </p>
                  <p className="font-mono text-[12px] leading-relaxed mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    {step.body}
                  </p>
                  {step.num === 4 && (
                    <a
                      href="https://netlify.com/drop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-bold transition-colors"
                      style={{ color: "var(--color-lime)", textDecoration: "underline", textUnderlineOffset: 3 }}
                    >
                      → Buka netlify.com/drop
                    </a>
                  )}
                  {step.tip && (
                    <div
                      className="flex items-start gap-2 px-3 py-2 rounded-lg mt-2"
                      style={{ background: "rgba(204,255,0,0.04)", border: "0.5px solid rgba(204,255,0,0.12)" }}
                    >
                      <span style={{ color: "var(--color-lime)", fontSize: 11, flexShrink: 0 }}>💡</span>
                      <p className="font-mono text-[11px] italic" style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                        {step.tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "Ini baru permulaan" callout */}
      <div
        className="px-5 py-5 rounded-xl"
        style={{ background: "linear-gradient(135deg, rgba(204,255,0,0.04) 0%, rgba(255,92,26,0.03) 100%)", border: "0.5px solid rgba(204,255,0,0.15)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: 20 }}>🚀</span>
          <p className="font-mono font-bold text-sm" style={{ color: "var(--color-lime)" }}>
            Selamat! Kamu baru saja selesai vibe coding pertamamu.
          </p>
        </div>
        <p className="font-mono text-xs mb-4" style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Langkah selanjutnya yang bisa kamu pelajari:
        </p>
        <div className="flex flex-col gap-1.5 mb-4">
          {[
            "Cara iterasi dan improve website dengan AI",
            "Pindah dari Netlify Drop ke GitHub Pages",
            "Beli domain custom (Rp 100rb/tahun di Niaga)",
            "Belajar struktur file HTML/CSS yang lebih rapi",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span style={{ color: "var(--color-lime)", fontSize: 12, flexShrink: 0 }}>→</span>
              <p className="font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {item}
              </p>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs mb-3" style={{ color: "var(--color-text-tertiary)" }}>
          Semua ada di Learn Hub ArroBuild — gratis.
        </p>
        <a
          href="/learn"
          className="inline-flex items-center gap-2 font-mono text-sm font-bold px-4 py-2.5 rounded-lg transition-all"
          style={{ background: "var(--color-lime)", color: "#0A0A0A" }}
        >
          Mulai belajar →
        </a>
      </div>
    </div>
  );
}
