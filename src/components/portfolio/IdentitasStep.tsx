"use client";

import { useState } from "react";
import type { IdentitasData, Profesi } from "./types";
import { PROFESI_DEMO } from "./types";

interface Props {
  value: IdentitasData;
  onChange: (v: IdentitasData) => void;
  onApplyDemo: (demo: Partial<import("./types").PortfolioFormState>) => void;
  onNext: () => void;
}

const PROFESI_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Teknologi",
    items: [
      "Frontend Developer",
      "Backend Developer",
      "Fullstack Developer",
      "Mobile Developer",
      "UI/UX Designer",
      "AI Engineer",
      "Data Scientist",
      "DevOps / Cloud Engineer",
    ],
  },
  {
    label: "Desain & Kreatif",
    items: ["Graphic Designer", "Ilustrator", "Motion Designer", "Fotografer", "Video Editor", "3D Artist"],
  },
  {
    label: "Konten & Marketing",
    items: ["Content Writer", "Social Media Specialist", "Digital Marketer", "Copywriter"],
  },
  {
    label: "Bisnis",
    items: ["Product Manager", "Project Manager", "Business Analyst", "Founder / Indie Hacker"],
  },
];

const DEMO_PROFESI = Object.keys(PROFESI_DEMO);

function inputStyle(focused: boolean) {
  return {
    background: "var(--color-bg-elevated)",
    border: focused ? "0.5px solid rgba(204,255,0,0.5)" : "0.5px solid var(--color-border-default)",
    boxShadow: focused ? "0 0 0 3px rgba(204,255,0,0.06)" : "none",
    color: "var(--color-text-primary)",
    padding: "12px 14px",
    borderRadius: 12,
    width: "100%",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    outline: "none",
  } as React.CSSProperties;
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5">
        <span className="font-mono font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
          {label}
        </span>
        {required && (
          <span className="font-mono text-[10px] font-bold" style={{ color: "var(--color-lime)" }}>
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default function IdentitasStep({ value, onChange, onApplyDemo, onNext }: Props) {
  const [focused, setFocused] = useState<string>("");
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const set = (key: keyof IdentitasData, val: string) =>
    onChange({ ...value, [key]: val });

  const setSosial = (key: keyof IdentitasData["sosial"], val: string) =>
    onChange({ ...value, sosial: { ...value.sosial, [key]: val } });

  const applyDemo = (profesi: string) => {
    const demo = PROFESI_DEMO[profesi];
    if (!demo) return;
    onApplyDemo(demo);
    setShowDemoMenu(false);
  };

  const canNext =
    value.nama.trim() &&
    (value.profesi && value.profesi !== "lainnya"
      ? true
      : !!value.profesiCustom?.trim()) &&
    value.tagline.trim();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <span
          className="font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-4 inline-block"
          style={{ background: "rgba(204,255,0,0.08)", color: "var(--color-lime)", border: "0.5px solid rgba(204,255,0,0.25)" }}
        >
          Step 1 of 3 — Identitas
        </span>
        <h2
          className="font-unbounded font-bold text-xl sm:text-2xl mb-2"
          style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
        >
          Siapa kamu?
        </h2>
        <p className="font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Informasi dasar yang akan muncul di hero section portfoliomu.
        </p>
      </div>

      {/* Demo data tip */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl mb-6"
        style={{ background: "rgba(204,255,0,0.04)", border: "0.5px solid rgba(204,255,0,0.15)" }}
      >
        <p className="font-mono text-xs" style={{ color: "var(--color-text-secondary)" }}>
          💡 Belum tahu mau isi apa?
        </p>
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu((v) => !v)}
            className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: "rgba(204,255,0,0.1)", color: "var(--color-lime)", border: "0.5px solid rgba(204,255,0,0.3)" }}
          >
            Coba data demo →
          </button>
          {showDemoMenu && (
            <div
              className="absolute right-0 top-9 z-50 w-52 rounded-xl overflow-hidden"
              style={{ background: "var(--color-bg-elevated)", border: "0.5px solid var(--color-border-strong)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
            >
              {DEMO_PROFESI.map((p) => (
                <button
                  key={p}
                  onClick={() => applyDemo(p)}
                  className="w-full text-left px-4 py-2.5 font-mono text-xs transition-all"
                  style={{ color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-default)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-hover)"; e.currentTarget.style.color = "var(--color-lime)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-5 mb-8">
        {/* Nama */}
        <Field label="Nama / Brand" required>
          <input
            type="text"
            placeholder="Misal: Andi Pratama atau Studio Kreatif"
            value={value.nama}
            onChange={(e) => set("nama", e.target.value)}
            style={inputStyle(focused === "nama")}
            onFocus={() => setFocused("nama")}
            onBlur={() => setFocused("")}
          />
        </Field>

        {/* Profesi */}
        <Field label="Profesi" required>
          <select
            value={value.profesi}
            onChange={(e) => set("profesi", e.target.value)}
            style={{ ...inputStyle(focused === "profesi"), appearance: "none" as const }}
            onFocus={() => setFocused("profesi")}
            onBlur={() => setFocused("")}
          >
            <option value="">— Pilih profesi —</option>
            {PROFESI_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="lainnya">Lainnya (isi sendiri)</option>
          </select>
        </Field>

        {/* Custom profesi */}
        {value.profesi === "lainnya" && (
          <Field label="Profesi kamu (tulis sendiri)" required>
            <input
              type="text"
              placeholder="Misal: Veterinarian, Educator, Chef"
              value={value.profesiCustom || ""}
              onChange={(e) => onChange({ ...value, profesiCustom: e.target.value })}
              style={inputStyle(focused === "profesiCustom")}
              onFocus={() => setFocused("profesiCustom")}
              onBlur={() => setFocused("")}
            />
          </Field>
        )}

        {/* Tagline */}
        <Field
          label="Tagline"
          required
          hint="Kalimat singkat nilai utamamu — maks 10 kata. Ini yang pertama kali dibaca visitor."
        >
          <input
            type="text"
            placeholder="Misal: Designer yang percaya data harus bisa berbicara sendiri"
            value={value.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            style={inputStyle(focused === "tagline")}
            onFocus={() => setFocused("tagline")}
            onBlur={() => setFocused("")}
          />
        </Field>

        {/* Bio */}
        <Field
          label="Bio singkat"
          hint="2–3 kalimat tentang dirimu dan apa yang kamu kerjakan. Boleh kosong — AI akan membuat bio generik."
        >
          <textarea
            rows={3}
            placeholder="Saya seorang frontend developer dengan 2 tahun pengalaman membangun web app modern..."
            value={value.bio}
            onChange={(e) => set("bio", e.target.value)}
            style={{ ...inputStyle(focused === "bio"), lineHeight: 1.7, resize: "none" }}
            onFocus={() => setFocused("bio")}
            onBlur={() => setFocused("")}
          />
        </Field>

        {/* Kota & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Kota / Lokasi">
            <input
              type="text"
              placeholder="Jakarta, Indonesia"
              value={value.kota || ""}
              onChange={(e) => set("kota", e.target.value)}
              style={inputStyle(focused === "kota")}
              onFocus={() => setFocused("kota")}
              onBlur={() => setFocused("")}
            />
          </Field>
          <Field label="Email" hint="Untuk ditampilkan di section kontak">
            <input
              type="email"
              placeholder="kamu@example.com"
              value={value.email || ""}
              onChange={(e) => set("email", e.target.value)}
              style={inputStyle(focused === "email")}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused("")}
            />
          </Field>
        </div>

        {/* Sosial links */}
        <div>
          <p className="font-mono font-semibold text-sm mb-3" style={{ color: "var(--color-text-primary)" }}>
            Link Sosial <span className="font-normal text-xs" style={{ color: "var(--color-text-tertiary)" }}>(opsional)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                { key: "github", placeholder: "github.com/username", label: "GitHub" },
                { key: "linkedin", placeholder: "linkedin.com/in/username", label: "LinkedIn" },
                { key: "instagram", placeholder: "instagram.com/username", label: "Instagram" },
                { key: "whatsapp", placeholder: "wa.me/628xxx atau t.me/username", label: "WhatsApp / Telegram" },
              ] as const
            ).map(({ key, placeholder, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {label}
                </span>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={value.sosial[key] || ""}
                  onChange={(e) => setSosial(key, e.target.value)}
                  style={{ ...inputStyle(focused === key), fontSize: 12 }}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused("")}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={!canNext}
        className="w-full py-3 rounded-xl font-mono font-bold text-sm transition-all"
        style={{
          background: canNext ? "var(--color-lime)" : "var(--color-bg-elevated)",
          color: canNext ? "#0A0A0A" : "var(--color-text-disabled, rgba(255,255,255,0.2))",
          border: canNext ? "none" : "0.5px solid var(--color-border-default)",
          cursor: canNext ? "pointer" : "not-allowed",
        }}
      >
        {!value.nama.trim() ? "Masukkan namamu dulu" : !value.profesi ? "Pilih profesimu" : !value.tagline.trim() ? "Tulis tagline-mu" : "Lanjut ke Konten →"}
      </button>
    </div>
  );
}
