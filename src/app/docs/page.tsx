"use client";

import { useState } from "react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { SparklesIcon } from "@/components/marketing/icons";

type Level = "pemula" | "intermediate" | "advanced";

interface Section {
  title: string;
  content: string[];
}

const LEVELS: {
  id: Level;
  label: string;
  tier: string;
  icon: string;
  color: string;
  sections: Section[];
}[] = [
  {
    id: "pemula",
    label: "Pemula",
    tier: "Free",
    icon: "🌱",
    color: "var(--green-500)",
    sections: [
      {
        title: "Apa itu Vibe Coding?",
        content: [
          "Vibe coding adalah cara baru menulis software — kamu menjelaskan apa yang kamu inginkan, lalu AI coding agent (seperti Cursor, Claude Code, Windsurf) yang menulis kodenya.",
          "Alih-alih menulis setiap baris kode secara manual, kamu bertindak sebagai \"product manager\" yang mengarahkan AI untuk membangun aplikasi sesuai visi kamu.",
          "Tapi tanpa perencanaan yang jelas, AI akan menghasilkan kode yang inkonsisten, scope terus membengkak, dan kamu kehilangan kontrol.",
        ],
      },
      {
        title: "Mengapa PRD Penting?",
        content: [
          "PRD (Product Requirements Document) adalah \"blueprint\" proyek kamu. Ia mendefinisikan: masalah apa yang dipecahkan, siapa usernya, fitur apa yang dibangun, dan batasan scope.",
          "Dengan PRD, setiap sesi AI coding agent dimulai dengan konteks yang sama — tidak perlu menjelaskan ulang dari nol.",
          "ArroBuild menghasilkan PRD secara otomatis dari deskripsi ide kamu, lengkap dengan user stories, fitur, dan acceptance criteria.",
        ],
      },
      {
        title: "Setup AI Agent Pertama Kamu",
        content: [
          "1. Install Cursor (cursor.com) atau Claude Code (claude.ai/code) — keduanya adalah AI coding agent terpopuler.",
          "2. Buka ArroBuild, deskripsikan ide produk kamu, dan generate PRD gratis.",
          "3. Download file prd.md dan letakkan di root folder proyek kamu.",
          "4. Buka Cursor/Claude Code, dan mulai coding — AI akan membaca PRD sebagai panduan.",
        ],
      },
      {
        title: "Tips untuk Pemula",
        content: [
          "Mulai dengan ide sederhana — jangan langsung bikin \"super app\". Fokus ke satu masalah spesifik.",
          "Pilih framework yang familiar. Kalau belum pernah coding, Next.js adalah pilihan aman karena komunitasnya besar.",
          "Jangan takut salah — vibe coding itu eksperimen. Generate PRD, mulai coding, iterasi cepat.",
        ],
      },
    ],
  },
  {
    id: "intermediate",
    label: "Intermediate",
    tier: "Starter / Pro",
    icon: "🚀",
    color: "var(--blue-500, #3b82f6)",
    sections: [
      {
        title: "Menggunakan Bundle 5 File",
        content: [
          "Di tier Starter/Pro, ArroBuild menghasilkan 5 file fondasi: PRD, Context, Plan, Design System, dan Agents.",
          "Kelima file ini bekerja bersama sebagai \"operating system\" proyek kamu — setiap AI agent membaca file-file ini untuk memahami konteks penuh.",
        ],
      },
      {
        title: "Context.md — Master Reference",
        content: [
          "context.md adalah file terpenting. Ia berisi ringkasan proyek, tech stack, konvensi, dan referensi ke semua file lain.",
          "Letakkan context.md di root proyek. Konfigurasikan AI agent kamu untuk membaca file ini pertama kali di setiap sesi baru.",
          "Di Cursor: tambahkan ke .cursor/rules/. Di Claude Code: referensikan di CLAUDE.md.",
        ],
      },
      {
        title: "Design System Integration",
        content: [
          "design-system.md berisi warna, tipografi, spacing, dan component guidelines yang konsisten.",
          "Saat AI agent membangun UI, ia akan mengikuti design system ini — hasilnya konsisten di seluruh aplikasi.",
          "Pilih design preset (Apple, Linear, Stripe, Notion, Vercel) yang sesuai dengan vibe produk kamu.",
        ],
      },
      {
        title: "AI Agent Workflow",
        content: [
          "agents.md mendefinisikan role untuk setiap AI agent: PM, Architect, UI Designer, Code Writer, Reviewer.",
          "Workflow idealnya: Plan → Design → Implement → Review → Iterate.",
          "Gunakan plan.md sebagai roadmap — setiap task sudah dipecah per fase dengan estimasi waktu.",
        ],
      },
      {
        title: "Pilih Model AI yang Tepat",
        content: [
          "ArroBuild mendukung 5 model AI. Pilih sesuai kebutuhan:",
          "• Gemini 2.5 Pro — output panjang, reasoning kuat, harga kompetitif",
          "• GPT-4o — instruksi akurat, formatting rapi, cocok untuk PRD detail",
          "• Claude Sonnet 4 — nuansa bahasa terbaik, detail mendalam, ideal untuk dokumentasi",
          "• DeepSeek V3 — open-source, kualitas tinggi dengan biaya sangat rendah",
          "• Gemini 2.5 Flash — tercepat, cocok untuk iterasi cepat",
        ],
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    tier: "Unlimited",
    icon: "⚡",
    color: "var(--purple-500, #a855f7)",
    sections: [
      {
        title: "Production Hardening",
        content: [
          "production-hardening.md berisi checklist keamanan, monitoring, CI/CD, dan incident response.",
          "Sebelum launch, pastikan: rate limiting terpasang, error tracking aktif (Sentry), SSL/HTTPS dikonfigurasi, dan backup database ter-schedule.",
          "File ini menjadi panduan AI agent untuk menambahkan production-grade features sebelum go-live.",
        ],
      },
      {
        title: "Scaling dari 0 ke 10K Users",
        content: [
          "scale-performance.md memberikan strategi scaling bertahap: dari single server ke multi-region deployment.",
          "Prioritas: database indexing → caching (Redis) → CDN → horizontal scaling → queue system.",
          "Jangan over-engineer dari awal. Scale sesuai kebutuhan — file ini memberikan trigger kapan harus scale.",
        ],
      },
      {
        title: "Growth Hacking untuk Indie SaaS",
        content: [
          "growth-quality.md berisi strategi go-to-market, acquisition channel, dan quality metrics.",
          "Fokus awal: SEO + komunitas (Discord, Twitter/X, YouTube). Paid ads belakangan setelah product-market fit.",
          "Setup analytics dari hari pertama: conversion funnel, retention rate, dan NPS score.",
        ],
      },
      {
        title: "CI/CD dan Monitoring",
        content: [
          "Automated testing: unit test untuk logic, integration test untuk API, E2E test untuk critical flows.",
          "CI/CD pipeline: GitHub Actions → lint → test → build → deploy ke Vercel/Railway.",
          "Monitoring stack: Vercel Analytics (traffic), Sentry (errors), Uptime Robot (availability).",
        ],
      },
    ],
  },
];

export default function DocsPage() {
  const [activeLevel, setActiveLevel] = useState<Level>("pemula");
  const level = LEVELS.find((l) => l.id === activeLevel)!;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <Navbar variant="minimal" />

      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12">
          {/* Hero */}
          <div className="mb-10 md:mb-12 text-center max-w-2xl mx-auto">
            <span className="badge badge-info mb-4">Panduan</span>
            <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-medium tracking-[-0.3px] mb-3 text-white">
              Panduan Vibe Coding
            </h1>
            <p className="text-body-lg">
              Pelajari cara menggunakan AI coding agent secara efektif — dari
              pemula hingga production-ready.
            </p>
          </div>

          {/* Level Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 md:mb-12">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setActiveLevel(l.id)}
                className="card card-interactive px-4 py-4 sm:py-5 text-left sm:text-center transition-all"
                style={
                  activeLevel === l.id
                    ? { borderColor: l.color, background: "var(--bg-card)" }
                    : {}
                }
              >
                <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                  <span className="text-2xl sm:mb-2">{l.icon}</span>
                  <div className="flex-1 sm:flex-none text-left sm:text-center">
                    <div className="text-h3">{l.label}</div>
                    <div className="text-caption">{l.tier}</div>
                  </div>
                  {activeLevel === l.id && (
                    <span
                      className="sm:hidden w-2 h-2 rounded-full shrink-0"
                      style={{ background: l.color }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Sidebar TOC — desktop */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24">
                <p className="text-label mb-3">Dalam halaman ini</p>
                <nav className="space-y-1">
                  {level.sections.map((section, i) => (
                    <a
                      key={section.title}
                      href={`#section-${i}`}
                      className="block text-[13px] py-1.5 px-2 rounded-md transition-colors hover:bg-[var(--bg-surface)]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
                <div
                  className="mt-8 pt-6 border-t"
                  style={{ borderColor: "var(--bg-border)" }}
                >
                  <a
                    href="/#pricing"
                    className="text-[13px] block mb-2 transition-colors hover:text-[var(--text-primary)]"
                    style={{ color: "var(--green-text)" }}
                  >
                    Lihat harga →
                  </a>
                  <a
                    href="/login"
                    className="text-[13px] transition-colors hover:text-[var(--text-primary)]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Masuk untuk upgrade
                  </a>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-5 md:space-y-6">
              {level.sections.map((section, i) => (
                <article
                  key={section.title}
                  id={`section-${i}`}
                  className="card scroll-mt-28"
                >
                  <h2
                    className="text-h2 mb-4"
                    style={{ color: level.color }}
                  >
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.content.map((paragraph, j) => (
                      <p
                        key={j}
                        className="text-body-lg leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div
            className="mt-12 md:mt-16 card card-featured text-center py-10 px-6 md:px-10"
          >
            <h2 className="text-h2 mb-2">Siap mulai vibe coding?</h2>
            <p className="text-body-lg mb-6 max-w-md mx-auto">
              Generate PRD gratis atau upgrade untuk bundle lengkap sesuai level
              kamu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/generate"
                className="btn btn-primary btn-lg w-full sm:w-auto"
              >
                <SparklesIcon />
                Mulai generate
              </a>
              <a
                href="/#pricing"
                className="btn btn-secondary btn-lg w-full sm:w-auto"
              >
                Lihat harga
              </a>
            </div>
            <p className="text-caption mt-4">
              Free tier tanpa login ·{" "}
              <a href="/login" className="underline" style={{ color: "var(--green-text)" }}>
                Masuk
              </a>{" "}
              untuk upgrade
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
