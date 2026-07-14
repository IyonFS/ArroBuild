"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { MINI_TOOL_LIST } from "@/lib/config/mini-tools";
import {
  PORTFOLIO_SHOWCASE,
  TOOL_SHOWCASE_META,
  getAccent,
  tierLabel,
  type ShowcaseFilter,
  type ShowcaseToolMeta,
} from "./tool-meta";

const FILTERS: { id: ShowcaseFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "free", label: "Gratis" },
  { id: "base", label: "Base" },
  { id: "core", label: "Core" },
  { id: "prime", label: "Prime" },
];

function FeaturedCard({ tool }: { tool: ShowcaseToolMeta }) {
  const Icon = tool.icon;

  return (
    <Link
      href={tool.href}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "28px 28px 24px",
        borderRadius: 12,
        textDecoration: "none",
        background: "#1F2A44",
        border: "1px solid rgba(255,176,32,0.35)",
        transition: "border-color 150ms ease, background 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#FFB020";
        e.currentTarget.style.background = "#293656";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,176,32,0.35)";
        e.currentTarget.style.background = "#1F2A44";
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: 4,
            background: "#FFB020",
            color: "#0D1321",
          }}
        >
          Featured · Gratis
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            color: "rgba(240,243,250,0.35)",
          }}
        >
          Prompt Generator
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,176,32,0.12)",
            color: "#FFB020",
            border: "0.5px solid rgba(255,176,32,0.3)",
            flexShrink: 0,
          }}
        >
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
            fontSize: "clamp(20px, 2.5vw, 24px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#F0F3FA",
            lineHeight: 1.2,
          }}
        >
          {tool.name}
        </h2>
      </div>

      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 13,
          lineHeight: 1.65,
          color: "rgba(240,243,250,0.62)",
          maxWidth: 480,
        }}
      >
        {tool.description}
      </p>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          marginTop: 4,
          padding: "10px 16px",
          borderRadius: 8,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 13,
          fontWeight: 700,
          background: "#FFB020",
          color: "#0D1321",
        }}
      >
        Mulai generate
        <ArrowRight size={14} strokeWidth={2.25} />
      </span>
    </Link>
  );
}

function ToolCard({ tool, index }: { tool: ShowcaseToolMeta; index: number }) {
  const accent = getAccent(tool.accent);
  const Icon = tool.icon;
  const tierColor =
    tool.minTier === "PRO_MAX"
      ? "#FFB020"
      : tool.minTier === "PRO"
        ? "#38BDF8"
        : "rgba(240,243,250,0.55)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
    >
      <Link
        href={tool.href}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 168,
          padding: 20,
          borderRadius: 12,
          textDecoration: "none",
          background: "#1F2A44",
          border: "0.5px solid rgba(240,243,250,0.08)",
          transition: "border-color 150ms ease, background 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(240,243,250,0.18)";
          e.currentTarget.style.background = "#293656";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(240,243,250,0.08)";
          e.currentTarget.style.background = "#1F2A44";
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: accent.soft,
              color: accent.color,
              border: `0.5px solid ${accent.color}40`,
            }}
          >
            <Icon size={16} strokeWidth={1.75} />
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: 4,
              color: tierColor,
              border: `0.5px solid ${tierColor}40`,
              background: `${tierColor}14`,
            }}
          >
            {tierLabel(tool.minTier)}
          </span>
        </div>

        <h3
          style={{
            margin: "0 0 6px",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 14,
            fontWeight: 700,
            color: "#F0F3FA",
            letterSpacing: "0.01em",
          }}
        >
          {tool.name}
        </h3>
        <p
          style={{
            margin: "0 0 16px",
            flex: 1,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            lineHeight: 1.6,
            color: "rgba(240,243,250,0.62)",
          }}
        >
          {tool.tagline}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              color: "rgba(240,243,250,0.35)",
            }}
          >
            {tool.credits === "free" ? "Gratis" : `${tool.credits} kredit`}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              fontWeight: 600,
              color: "#38BDF8",
            }}
          >
            Buka <ArrowRight size={12} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

interface ToolsShowcaseProps {
  requiresLogin?: boolean;
  tierId?: string | null;
}

export default function ToolsShowcase({
  requiresLogin = false,
  tierId = null,
}: ToolsShowcaseProps) {
  const [filter, setFilter] = useState<ShowcaseFilter>("all");

  const shelfTools: ShowcaseToolMeta[] = useMemo(
    () =>
      MINI_TOOL_LIST.map((t) => {
        const meta = TOOL_SHOWCASE_META[t.id];
        return {
          ...meta,
          name: t.name,
          description: t.description,
          tagline: meta.tagline,
          credits: t.credits,
          minTier: t.minTier,
        };
      }),
    []
  );

  const filtered = useMemo(() => {
    if (filter === "all") return shelfTools;
    if (filter === "free") return [];
    return shelfTools.filter((t) => t.filterKeys.includes(filter));
  }, [filter, shelfTools]);

  const showFeatured = filter === "all" || filter === "free";

  return (
    <div className="tools-app relative min-h-screen" style={{ background: "#0D1321" }}>
      {/* Hero — blueprint sekali per halaman */}
      <section
        style={{
          borderBottom: "0.5px solid rgba(240,243,250,0.08)",
          background: "#131A2C",
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          padding: "48px 24px 56px",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gap: 32,
              gridTemplateColumns: "1fr",
            }}
            className="tools-hero-grid"
          >
            <div>
              <span
                style={{
                  display: "inline-flex",
                  marginBottom: 16,
                  padding: "5px 10px",
                  borderRadius: 4,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#38BDF8",
                  background: "rgba(56,189,248,0.1)",
                  border: "0.5px solid rgba(56,189,248,0.3)",
                }}
              >
                Mini Tools
              </span>

              <h1
                style={{
                  margin: "0 0 14px",
                  fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  color: "#F0F3FA",
                  maxWidth: 420,
                }}
              >
                Tools kecil buat kerjaan harian.
              </h1>

              <p
                style={{
                  margin: "0 0 16px",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "rgba(240,243,250,0.62)",
                  maxWidth: 480,
                }}
              >
                Utilitas cepat di luar generate dokumen utama — scaffolding, copy, schema, dan
                prompt. Pilih tool, isi singkat, langsung pakai.
              </p>

              {tierId && (
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 12,
                    color: "rgba(240,243,250,0.35)",
                  }}
                >
                  Paket aktif:{" "}
                  <span style={{ color: "#38BDF8" }}>{tierId}</span>
                </p>
              )}

              {requiresLogin && (
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "0.5px solid rgba(56,189,248,0.28)",
                    background: "rgba(56,189,248,0.06)",
                  }}
                >
                  <Lock size={14} style={{ color: "#38BDF8", flexShrink: 0 }} />
                  <p
                    style={{
                      margin: 0,
                      flex: 1,
                      minWidth: 180,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 12,
                      color: "rgba(240,243,250,0.62)",
                    }}
                  >
                    Beberapa tool memakai kredit — login untuk menjalankan.
                  </p>
                  <Link
                    href="/login"
                    style={{
                      padding: "8px 14px",
                      borderRadius: 6,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      background: "#FFB020",
                      color: "#0D1321",
                      textDecoration: "none",
                    }}
                  >
                    Masuk
                  </Link>
                </div>
              )}
            </div>

            {showFeatured ? (
              <FeaturedCard tool={PORTFOLIO_SHOWCASE} />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 160,
                  padding: 24,
                  borderRadius: 12,
                  border: "0.5px dashed rgba(240,243,250,0.14)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 13,
                  color: "rgba(240,243,250,0.35)",
                }}
              >
                Filter “Gratis” untuk melihat Portfolio Generator.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Shelf — surface tone, bukan blueprint lagi */}
      <section
        style={{
          background: "#161D2E",
          padding: "48px 24px 72px",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginBottom: 28,
            }}
            className="tools-shelf-head"
          >
            <div>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#F0F3FA",
                }}
              >
                Semua tool
              </h2>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  color: "rgba(240,243,250,0.35)",
                }}
              >
                {filter === "free"
                  ? "Portfolio Generator gratis ada di atas."
                  : `${filtered.length} utilitas · potong dari pool kredit`}
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: active
                        ? "0.5px solid rgba(255,176,32,0.45)"
                        : "0.5px solid rgba(240,243,250,0.12)",
                      background: active ? "rgba(255,176,32,0.1)" : "transparent",
                      color: active ? "#FFB020" : "rgba(240,243,250,0.45)",
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {filter === "free" ? (
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 13,
                color: "rgba(240,243,250,0.45)",
                maxWidth: 480,
              }}
            >
              Portfolio Generator adalah tool gratis di hero. Tool lain memakai kredit sesuai paket.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              }}
            >
              {filtered.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (min-width: 900px) {
          .tools-hero-grid {
            grid-template-columns: 1fr 1fr !important;
            align-items: start;
            gap: 40px !important;
          }
          .tools-shelf-head {
            flex-direction: row !important;
            align-items: flex-end !important;
            justify-content: space-between !important;
          }
        }
      `}</style>
    </div>
  );
}
