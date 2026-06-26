"use client";

import { useState, useEffect } from "react";
import type { ProductType, ContextData } from "./types";

interface Props {
  productType: ProductType;
  value: ContextData;
  onChange: (v: ContextData) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Question {
  key: keyof ContextData;
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
  example?: string;
  chips?: string[];
}

// Questions per product type
const QUESTIONS: Record<ProductType, Question[]> = {
  saas: [
    {
      key: "targetUser",
      label: "① Siapa target user utama kamu?",
      placeholder: "Contoh: freelance designer yang perlu invoicing sederhana",
      type: "text",
      example: "Developer Indonesia yang baru mulai belajar vibe coding",
    },
    {
      key: "mainProblem",
      label: "② Masalah utama yang ingin dipecahkan?",
      placeholder: "Jelaskan pain point user secara spesifik",
      type: "textarea",
      example:
        "Developer kesulitan membuat dokumentasi proyek sebelum mulai coding — jadinya sering salah arah",
    },
    {
      key: "coreFeatures",
      label: "③ Fitur inti yang HARUS ada di v1?",
      placeholder: "List fitur core, pisahkan dengan koma atau enter",
      type: "textarea",
      example:
        "AI doc generator, project dashboard, template library, 1-click export ke .md",
    },
    {
      key: "pricingModel",
      label: "④ Model bisnis? (opsional)",
      placeholder: "Contoh: Freemium, Paid only, Trial 14 hari, One-time",
      type: "text",
    },
  ],
  marketplace: [
    {
      key: "buyerDesc",
      label: "① Siapa buyer-nya?",
      placeholder: "Deskripsikan buyer: siapa, kebutuhan utamanya",
      type: "text",
      example: "Startup & UMKM yang butuh desainer profesional",
    },
    {
      key: "sellerDesc",
      label: "② Siapa seller-nya?",
      placeholder: "Deskripsikan seller: siapa, apa yang mereka tawarkan",
      type: "text",
      example: "Freelance designer lokal yang mau dapat klien",
    },
    {
      key: "transactionType",
      label: "③ Apa yang ditransaksikan?",
      placeholder: "Produk fisik / digital / jasa / informasi",
      type: "text",
      chips: ["Produk fisik", "Produk digital", "Jasa", "Informasi / konten"],
    },
    {
      key: "mainProblem",
      label: "④ Masalah utama yang dipecahkan?",
      placeholder: "Problem untuk buyer dan seller — bisa dua paragraf",
      type: "textarea",
      example:
        "Buyer: susah cari designer lokal terpercaya. Seller: tidak ada platform khusus untuk jangkau klien",
    },
    {
      key: "pricingModel",
      label: "⑤ Monetisasi marketplace? (opsional)",
      placeholder: "Contoh: komisi 10%, subscription seller, listing berbayar",
      type: "text",
    },
  ],
  mobile: [
    {
      key: "platforms",
      label: "① Platform target?",
      placeholder: "iOS, Android, atau keduanya",
      type: "text",
      chips: ["iOS saja", "Android saja", "iOS & Android", "Cross-platform (Expo)"],
    },
    {
      key: "targetUser",
      label: "② Siapa target user utama?",
      placeholder: "Deskripsikan user dan konteks pemakaian",
      type: "text",
      example: "Mahasiswa yang butuh catatan kuliah terorganisir",
    },
    {
      key: "mainProblem",
      label: "③ Apa yang bisa dilakukan di app ini yang tidak bisa di web?",
      placeholder: "Mobile-specific value proposition",
      type: "textarea",
      example: "Scan langsung dari kamera, notifikasi real-time, offline mode",
    },
    {
      key: "nativeFeatures",
      label: "④ Ada fitur native device? (opsional)",
      placeholder: "Kamera, GPS, notifikasi push, sensor, NFC",
      type: "text",
    },
  ],
  api: [
    {
      key: "targetDev",
      label: "① Siapa developer yang akan pakai ini?",
      placeholder: "Contoh: backend developer Node.js yang butuh OCR as a service",
      type: "text",
      example: "Backend developer yang butuh ekstrak data dari dokumen scan",
    },
    {
      key: "mainProblem",
      label: "② Apa yang bisa dilakukan dengan API ini?",
      placeholder: "Jelaskan core capability API atau tool ini",
      type: "textarea",
      example: "Ekstrak structured data dari invoice, receipt, atau KTP secara otomatis",
    },
    {
      key: "inputOutput",
      label: "③ Input apa yang diterima, output apa yang dihasilkan?",
      placeholder: "Contoh: input PDF/gambar → output JSON dengan field yang diekstrak",
      type: "text",
    },
    {
      key: "deploymentTarget",
      label: "④ Deployment target? (opsional)",
      placeholder: "Self-hosted, cloud service, npm package, CLI",
      type: "text",
      chips: ["Self-hosted", "Cloud / SaaS", "npm package", "CLI tool"],
    },
  ],
  "ai-app": [
    {
      key: "aiUseCase",
      label: "① AI digunakan untuk apa di produk ini?",
      placeholder: "Core use case AI di app ini",
      type: "textarea",
      example: "Generate dokumentasi teknis dari deskripsi produk dalam bahasa alami",
    },
    {
      key: "targetUser",
      label: "② Siapa target user dan bagaimana mereka berinteraksi dengan AI?",
      placeholder: "User persona dan pola interaksinya dengan AI",
      type: "textarea",
      example:
        "Developer non-teknis yang berinteraksi via chat, tidak perlu tahu AI di baliknya",
    },
    {
      key: "aiModel",
      label: "③ Model AI yang direncanakan?",
      placeholder: "GPT-4, Claude, Gemini, Llama, atau custom model",
      type: "text",
      chips: ["GPT-4o", "Claude Sonnet", "Gemini 2.5", "Open source / Custom"],
    },
    {
      key: "aiPrivacy",
      label: "④ Ada data user yang diproses AI? Bagaimana privacynya? (opsional)",
      placeholder: "Apakah data dikirim ke API eksternal, on-device, atau self-hosted",
      type: "text",
    },
  ],
  ecommerce: [
    {
      key: "targetUser",
      label: "① Siapa target pembeli?",
      placeholder: "Deskripsikan customer utama toko ini",
      type: "text",
      example: "Ibu rumah tangga 25-40 tahun yang suka belanja produk lokal UMKM",
    },
    {
      key: "productType",
      label: "② Apa yang dijual?",
      placeholder: "Produk fisik, digital, atau keduanya",
      type: "text",
      chips: ["Produk fisik", "Produk digital", "Keduanya", "Subscription / member"],
    },
    {
      key: "mainProblem",
      label: "③ Masalah utama yang dipecahkan untuk pembeli?",
      placeholder: "Kenapa mereka pilih toko ini vs alternatif yang ada",
      type: "textarea",
    },
    {
      key: "salesChannel",
      label: "④ Channel penjualan? (opsional)",
      placeholder: "Apakah hanya website, atau juga marketplace (Tokopedia, dll)?",
      type: "text",
    },
  ],
  portfolio: [
    {
      key: "stackHighlight",
      label: "① Kamu seorang apa? Tech stack apa yang mau di-highlight?",
      placeholder: "Contoh: Full-stack developer, Next.js + TypeScript + Supabase",
      type: "text",
      example: "Full-stack developer spesialis AI tools, Next.js, TypeScript, Supabase",
    },
    {
      key: "audienceType",
      label: "② Siapa yang akan melihat portfolio ini?",
      placeholder: "Recruiter, klien potensial, komunitas developer",
      type: "text",
      chips: ["CTO / recruiter startup", "Klien freelance", "Komunitas developer", "Investor"],
    },
    {
      key: "coreFeatures",
      label: "③ Project atau skill apa yang paling ingin ditonjolkan?",
      placeholder: "List 2-4 project terbaik atau skill utama",
      type: "textarea",
    },
    {
      key: "caseStudy",
      label: "④ Ada case study spesifik yang ingin diceritakan? (opsional)",
      placeholder: "Project dengan impact nyata, angka, atau story menarik",
      type: "text",
    },
  ],
  internal: [
    {
      key: "teamSize",
      label: "① Tim mana yang akan pakai, dan berapa orang?",
      placeholder: "Contoh: Tim operations 8 orang, atau seluruh perusahaan 50 orang",
      type: "text",
      example: "Tim operations & finance, ~12 orang",
    },
    {
      key: "mainProblem",
      label: "② Proses manual apa yang ingin diotomasi atau dipermudah?",
      placeholder: "Pain point workflow sekarang yang bikin lambat atau error",
      type: "textarea",
      example:
        "Manual entry data dari spreadsheet ke sistem, tidak ada audit trail, kolaborasi via email",
    },
    {
      key: "coreFeatures",
      label: "③ Fitur inti yang dibutuhkan?",
      placeholder: "List fitur utama tool internal ini",
      type: "textarea",
    },
    {
      key: "integrations",
      label: "④ Integrasi dengan sistem yang sudah ada? (opsional)",
      placeholder: "Contoh: Google Workspace, Slack, Notion, sistem ERP",
      type: "text",
    },
  ],
  other: [
    {
      key: "targetUser",
      label: "① Siapa target user utama kamu?",
      placeholder: "Deskripsikan user yang akan memakai produk ini",
      type: "text",
    },
    {
      key: "mainProblem",
      label: "② Masalah utama yang ingin dipecahkan?",
      placeholder: "Jelaskan problem secara spesifik",
      type: "textarea",
    },
    {
      key: "coreFeatures",
      label: "③ Fitur atau kemampuan inti produk?",
      placeholder: "List fitur yang harus ada di versi pertama",
      type: "textarea",
    },
  ],
};

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  saas: "SaaS",
  marketplace: "Marketplace",
  mobile: "Mobile App",
  api: "API / Dev Tool",
  "ai-app": "AI-Powered App",
  ecommerce: "E-Commerce",
  portfolio: "Portfolio",
  internal: "Internal Tool",
  other: "Lainnya",
};

const OPTIONAL_EXTRAS: { key: keyof ContextData; label: string; placeholder: string }[] = [
  { key: "productName", label: "Nama produk (jika sudah ada)", placeholder: "Contoh: Buildify, NoteAI" },
  { key: "referenceProducts", label: "Referensi produk sejenis yang disukai", placeholder: "Contoh: Linear untuk tracking, Notion untuk docs" },
  { key: "antiFeatures", label: "Hal yang TIDAK ingin ada di produk ini", placeholder: "Feature yang sengaja dihindari atau out of scope" },
  { key: "launchTimeline", label: "Target peluncuran", placeholder: "Minggu ini / Bulan ini / Tidak mendesak" },
];

function QualityBar({ value }: { value: ContextData }) {
  const fields = Object.values(value).filter(
    (v) => v && String(v).trim().length > 3
  ).length;
  const score = Math.min(fields, 5);
  const label = score <= 1 ? "Poor" : score <= 2 ? "Fair" : score <= 3 ? "Good" : "Great";
  const color =
    score <= 1
      ? "#EF4444"
      : score <= 2
      ? "#F59E0B"
      : score <= 3
      ? "#22C55E"
      : "#CCFF00";
  const pct = (score / 5) * 100;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: "var(--color-bg-elevated)",
        border: "0.5px solid var(--color-border-default)",
      }}
    >
      <p className="font-mono text-xs flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
        Kelengkapan konteks:
      </p>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--color-border-default)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-mono text-xs font-bold flex-shrink-0" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

export default function ContextStep({
  productType,
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const questions = QUESTIONS[productType] ?? QUESTIONS.other;
  const [showOptional, setShowOptional] = useState(false);
  const [revealedCount, setRevealedCount] = useState(1);

  // Progressive reveal: reveal next question when current is filled
  useEffect(() => {
    const answered = questions.filter((q) => {
      const v = value[q.key];
      return v && String(v).trim().length > 0;
    }).length;
    // reveal up to answered + 1, minimum 1
    setRevealedCount(Math.max(1, Math.min(answered + 1, questions.length)));
  }, [value, questions]);

  const update = (key: keyof ContextData, val: string) => {
    onChange({ ...value, [key]: val });
  };

  const isValid = questions.some((q) => {
    const v = value[q.key];
    return v && String(v).trim().length > 0;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(204,255,0,0.08)",
              color: "var(--color-lime)",
              border: "0.5px solid rgba(204,255,0,0.25)",
            }}
          >
            Step 2 of 4 — Cerita Produk
          </span>
          <button
            onClick={onBack}
            className="font-mono text-xs flex items-center gap-1 transition-colors"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <span>{PRODUCT_TYPE_LABELS[productType]}</span>
            <span
              className="text-[10px] ml-1 underline underline-offset-2"
              style={{ color: "var(--color-lime)" }}
            >
              [ubah]
            </span>
          </button>
        </div>
        <h2
          className="font-unbounded font-bold text-xl sm:text-2xl mb-2"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
        >
          Ceritakan proyekmu
        </h2>
        <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Makin spesifik, output AI makin relevan.{" "}
          <span style={{ color: "var(--color-text-tertiary)" }}>
            Isi minimal satu field.
          </span>
        </p>
      </div>

      {/* Questions — progressive reveal */}
      <div className="flex flex-col gap-6 mb-6">
        {questions.slice(0, revealedCount).map((q, idx) => {
          const currentVal = (value[q.key] as string) ?? "";
          const isRevealed = idx < revealedCount;

          return (
            <div
              key={q.key}
              className="transition-all duration-300"
              style={{
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <label
                className="block font-mono font-semibold text-sm mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                {q.label}
              </label>

              {/* Chips */}
              {q.chips && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {q.chips.map((chip) => {
                    const active = currentVal === chip;
                    return (
                      <button
                        key={chip}
                        onClick={() => update(q.key, active ? "" : chip)}
                        className="font-mono text-[11px] px-2.5 py-1 rounded-lg transition-all"
                        style={{
                          background: active
                            ? "rgba(204,255,0,0.1)"
                            : "var(--color-bg-surface)",
                          border: active
                            ? "0.5px solid rgba(204,255,0,0.4)"
                            : "0.5px solid var(--color-border-default)",
                          color: active
                            ? "var(--color-lime)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "textarea" ? (
                <textarea
                  rows={3}
                  placeholder={q.placeholder}
                  value={currentVal}
                  onChange={(e) => update(q.key, e.target.value)}
                  className="w-full rounded-xl font-mono text-sm resize-none transition-all focus:outline-none"
                  style={{
                    background: "var(--color-bg-elevated)",
                    border: "0.5px solid var(--color-border-default)",
                    color: "var(--color-text-primary)",
                    padding: "12px 14px",
                    lineHeight: 1.7,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(204,255,0,0.5)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(204,255,0,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-border-default)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder={q.placeholder}
                  value={currentVal}
                  onChange={(e) => update(q.key, e.target.value)}
                  className="w-full rounded-xl font-mono text-sm transition-all focus:outline-none"
                  style={{
                    background: "var(--color-bg-elevated)",
                    border: "0.5px solid var(--color-border-default)",
                    color: "var(--color-text-primary)",
                    padding: "12px 14px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(204,255,0,0.5)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(204,255,0,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-border-default)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              )}

              {/* Example that can be clicked */}
              {q.example && (
                <button
                  onClick={() => update(q.key, q.example!)}
                  className="flex items-start gap-2 mt-2 text-left w-full group"
                >
                  <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "var(--color-lime)" }}>
                    💡
                  </span>
                  <span
                    className="font-mono text-[11px] group-hover:underline underline-offset-2 transition-colors"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Contoh:{" "}
                    <em style={{ color: "var(--color-text-secondary)" }}>
                      &ldquo;{q.example}&rdquo;
                    </em>{" "}
                    <span
                      className="font-bold"
                      style={{ color: "var(--color-lime)" }}
                    >
                      [pakai ini]
                    </span>
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional extras accordion */}
      <div className="mb-6">
        <button
          onClick={() => setShowOptional(!showOptional)}
          className="font-mono text-xs flex items-center gap-2 transition-colors mb-3"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <span
            style={{
              transform: showOptional ? "rotate(90deg)" : "none",
              display: "inline-block",
              transition: "transform 0.2s",
            }}
          >
            ▶
          </span>
          {showOptional ? "Sembunyikan konteks opsional" : "▼ Tambah konteks opsional"}
        </button>

        {showOptional && (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: "0.5px solid var(--color-border-default)",
            }}
          >
            {OPTIONAL_EXTRAS.map((extra, i) => (
              <div
                key={extra.key}
                className="px-4 py-3"
                style={{
                  borderBottom:
                    i < OPTIONAL_EXTRAS.length - 1
                      ? "0.5px solid var(--color-border-default)"
                      : "none",
                }}
              >
                <label
                  className="block font-mono text-[11px] font-semibold mb-1.5"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {extra.label}
                </label>
                <input
                  type="text"
                  placeholder={extra.placeholder}
                  value={(value[extra.key] as string) ?? ""}
                  onChange={(e) => update(extra.key, e.target.value)}
                  className="w-full rounded-lg font-mono text-xs transition-all focus:outline-none"
                  style={{
                    background: "var(--color-bg-surface)",
                    border: "0.5px solid var(--color-border-default)",
                    color: "var(--color-text-primary)",
                    padding: "8px 12px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(204,255,0,0.5)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border-default)";
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quality bar */}
      <div className="mb-6">
        <QualityBar value={value} />
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl font-mono text-sm transition-all"
          style={{
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-secondary)",
            border: "0.5px solid var(--color-border-default)",
          }}
        >
          ← Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 py-3 rounded-xl font-mono font-bold text-sm transition-all"
          style={{
            background: isValid ? "var(--color-lime)" : "var(--color-bg-elevated)",
            color: isValid ? "#0A0A0A" : "var(--color-text-disabled)",
            border: isValid ? "none" : "0.5px solid var(--color-border-default)",
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          {isValid ? "Lanjut →" : "Ceritakan sedikit saja dulu"}
        </button>
      </div>
    </div>
  );
}
