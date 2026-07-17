"use client";

import { useState } from "react";
import Link from "next/link";
import type { PortfolioFormState } from "./types";
import { buildPortfolioPrompt } from "./buildPrompt";
import { OPEN_LEARN_IN_NEW_TAB } from "@/lib/learn-links";

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
    <button type="button" className="btn btn-primary" onClick={handleCopy}>
      {copied ? "Tersalin!" : "Copy Prompt"}
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

  return (
    <div className="mx-auto max-w-2xl">
      <div
        className="mb-6 flex flex-col gap-4 rounded-xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          background: "rgba(56,189,248,0.06)",
          border: "0.5px solid rgba(56,189,248,0.25)",
        }}
      >
        <div>
          <p
            className="font-mono text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--app-sky)" }}
          >
            Prompt siap!
          </p>
          <h2
            className="font-unbounded text-lg font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Portfolio prompt-mu sudah siap
          </h2>
          <p className="mt-1 font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {wordCount} kata · {charCount.toLocaleString()} karakter
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm self-start" onClick={onReset}>
          Buat ulang
        </button>
      </div>

      <div
        className="mb-6 overflow-hidden rounded-xl"
        style={{
          border: "0.5px solid var(--color-border-default)",
          background: "var(--color-bg-elevated)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "0.5px solid var(--color-border-default)" }}
        >
          <span
            className="font-mono text-[11px] font-semibold"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Prompt lengkap
          </span>
          <span className="font-mono text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
            read-only · scroll untuk lihat semua
          </span>
        </div>
        <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 280 }}>
          <pre
            className="m-0 whitespace-pre-wrap break-words text-[12px]"
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}
          >
            {prompt}
          </pre>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <CopyButton text={prompt} />
        <a
          href="https://claude.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          Buka Claude.ai →
        </a>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {(
          [
            { step: 1 as const, label: "Edit identitas" },
            { step: 2 as const, label: "Edit konten" },
            { step: 3 as const, label: "Edit desain" },
          ] as const
        ).map(({ step, label }) => (
          <button
            key={step}
            type="button"
            onClick={() => onEdit(step)}
            className="font-mono text-xs transition-opacity hover:opacity-80"
            style={{ color: "var(--app-sky)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="mb-6 overflow-hidden rounded-xl"
        style={{ border: "0.5px solid var(--color-border-default)" }}
      >
        <div
          className="px-5 py-4"
          style={{
            background: "var(--color-bg-elevated)",
            borderBottom: "0.5px solid var(--color-border-default)",
          }}
        >
          <p
            className="font-mono text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Langkah selanjutnya
          </p>
          <h3
            className="mt-1 font-unbounded text-base font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Panduan deploy ke internet gratis
          </h3>
          <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Setelah dapat kode dari Claude, ikuti 5 langkah ini.
          </p>
        </div>

        <div>
          {DEPLOY_STEPS.map((step, i) => (
            <div
              key={step.num}
              className="px-5 py-4"
              style={{
                borderBottom:
                  i < DEPLOY_STEPS.length - 1
                    ? "0.5px solid var(--color-border-default)"
                    : "none",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold"
                  style={{
                    background: "rgba(56,189,248,0.1)",
                    color: "var(--app-sky)",
                    border: "0.5px solid rgba(56,189,248,0.25)",
                  }}
                >
                  {step.num}
                </div>
                <div className="flex-1">
                  <p
                    className="mb-1 font-mono text-sm font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="mb-2 font-mono text-[12px] leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {step.body}
                  </p>
                  {step.num === 4 && (
                    <a
                      href="https://netlify.com/drop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-bold"
                      style={{
                        color: "var(--app-sky)",
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                      }}
                    >
                      Buka netlify.com/drop →
                    </a>
                  )}
                  {step.tip && (
                    <div
                      className="mt-2 rounded-lg px-3 py-2"
                      style={{
                        background: "rgba(255,176,32,0.05)",
                        border: "0.5px solid rgba(255,176,32,0.15)",
                      }}
                    >
                      <p
                        className="font-mono text-[11px] leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Tip: {step.tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl px-5 py-5"
        style={{
          background: "rgba(255,176,32,0.05)",
          border: "0.5px solid rgba(255,176,32,0.2)",
        }}
      >
        <p className="mb-2 font-unbounded text-sm font-bold" style={{ color: "var(--app-amber)" }}>
          Ini baru permulaan
        </p>
        <p
          className="mb-4 font-mono text-xs leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Langkah selanjutnya yang bisa kamu pelajari di Learn Hub:
        </p>
        <ul className="mb-4 flex flex-col gap-1.5">
          {[
            "Cara iterasi dan improve website dengan AI",
            "Pindah dari Netlify Drop ke GitHub Pages",
            "Beli domain custom",
            "Belajar struktur file HTML/CSS yang lebih rapi",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span style={{ color: "var(--app-amber)", fontSize: 12, flexShrink: 0 }}>→</span>
              <span className="font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/learn" {...OPEN_LEARN_IN_NEW_TAB} className="btn btn-primary btn-sm">
          Mulai belajar →
        </Link>
      </div>
    </div>
  );
}
