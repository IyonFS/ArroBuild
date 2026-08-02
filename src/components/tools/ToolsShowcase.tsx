"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { MINI_TOOL_LIST } from "@/lib/config/mini-tools";
import {
  PORTFOLIO_SHOWCASE,
  TOOL_SHOWCASE_META,
  COMING_SOON_TOOLS,
  getAccent,
  tierLabel,
  type ShowcaseFilter,
  type ShowcaseToolMeta,
  type ComingSoonToolMeta,
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
      className="group"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "32px 32px 28px",
        borderRadius: 24,
        textDecoration: "none",
        background: "rgba(10, 15, 25, 0.6)",
        border: "1px solid rgba(255,176,32,0.35)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#FFB020";
        e.currentTarget.style.background = "rgba(255, 176, 32, 0.05)";
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255, 176, 32, 0.1), 0 0 40px rgba(255, 176, 32, 0.2)";
        const arrow = e.currentTarget.querySelector('.tool-arrow') as SVGElement;
        if (arrow) arrow.style.transform = "translateX(10px) scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,176,32,0.35)";
        e.currentTarget.style.background = "rgba(10, 15, 25, 0.6)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
        const arrow = e.currentTarget.querySelector('.tool-arrow') as SVGElement;
        if (arrow) arrow.style.transform = "translateX(0) scale(1)";
      }}
    >
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, rgba(255,176,32, 0.15) 0%, transparent 50%)`,
        opacity: 0,
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      }}
      className="card-highlight"
      />
      
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
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
          fontSize: 14,
          lineHeight: 1.7,
          color: "var(--lp-text-secondary)",
          maxWidth: 480,
          position: "relative",
          zIndex: 2,
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
          marginTop: 8,
          padding: "12px 24px",
          borderRadius: 999,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 14,
          fontWeight: 800,
          background: "#FFB020",
          color: "#0D1321",
          position: "relative",
          zIndex: 2,
        }}
      >
        Mulai generate
        <ArrowRight className="tool-arrow" size={16} strokeWidth={2.5} style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </span>
    </Link>
  );
}

function ToolCard({ tool, index }: { tool: ShowcaseToolMeta; index: number }) {
  const accent = getAccent(tool.accent);
  const Icon = tool.icon;
  const tierColor =
    tool.minTier === "PRIME"
      ? "#FFB020"
      : tool.minTier === "CORE"
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
        className="group"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 180,
          padding: 24,
          borderRadius: 20,
          textDecoration: "none",
          background: "rgba(10, 15, 25, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `rgba(${tool.minTier === "PRIME" ? "255, 176, 32" : tool.minTier === "CORE" ? "56, 189, 248" : "255, 255, 255"}, 0.4)`;
          e.currentTarget.style.background = `rgba(${tool.minTier === "PRIME" ? "255, 176, 32" : tool.minTier === "CORE" ? "56, 189, 248" : "255, 255, 255"}, 0.05)`;
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(${tool.minTier === "PRIME" ? "255, 176, 32" : tool.minTier === "CORE" ? "56, 189, 248" : "255, 255, 255"}, 0.1), 0 0 20px rgba(${tool.minTier === "PRIME" ? "255, 176, 32" : tool.minTier === "CORE" ? "56, 189, 248" : "255, 255, 255"}, 0.15)`;
          const arrow = e.currentTarget.querySelector('.tool-arrow') as SVGElement;
          if (arrow) arrow.style.transform = "translateX(6px) scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
          e.currentTarget.style.background = "rgba(10, 15, 25, 0.6)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
          const arrow = e.currentTarget.querySelector('.tool-arrow') as SVGElement;
          if (arrow) arrow.style.transform = "translateX(0) scale(1)";
        }}
      >
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, rgba(${tool.minTier === "PRIME" ? "255, 176, 32" : tool.minTier === "CORE" ? "56, 189, 248" : "255, 255, 255"}, 0.1) 0%, transparent 50%)`,
          opacity: 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
        className="card-highlight"
        />
        
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            position: "relative",
            zIndex: 2,
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
            margin: "0 0 8px",
            fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
            fontSize: 16,
            fontWeight: 800,
            color: "#F0F3FA",
            letterSpacing: "-0.01em",
            position: "relative",
            zIndex: 2,
          }}
        >
          {tool.name}
        </h3>
        <p
          style={{
            margin: "0 0 20px",
            flex: 1,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--lp-text-secondary)",
            position: "relative",
            zIndex: 2,
          }}
        >
          {tool.tagline}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              color: "rgba(240,243,250,0.4)",
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
              fontSize: 13,
              fontWeight: 700,
              color: tierColor,
            }}
          >
            Buka 
            <ArrowRight className="tool-arrow" size={14} style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function ComingSoonCard({ tool, index }: { tool: ComingSoonToolMeta; index: number }) {
  const accent = getAccent(tool.accent);
  const Icon = tool.icon;
  const tierColor =
    tool.tierLabel === "Prime"
      ? "#FFB020"
      : tool.tierLabel === "Core"
        ? "#38BDF8"
        : "rgba(240,243,250,0.55)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 168,
          padding: 20,
          borderRadius: 12,
          background: "rgba(31,42,68,0.5)",
          border: "0.5px dashed rgba(240,243,250,0.1)",
          cursor: "default",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Segera badge */}
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 4,
            background: "rgba(240,243,250,0.06)",
            border: "0.5px solid rgba(240,243,250,0.12)",
            color: "rgba(240,243,250,0.35)",
          }}
        >
          Segera
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
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
              background: `${accent.soft}`,
              color: `${accent.color}80`,
              border: `0.5px solid ${accent.color}20`,
              flexShrink: 0,
            }}
          >
            <Icon size={16} strokeWidth={1.75} />
          </span>
        </div>

        <h3
          style={{
            margin: "0 0 6px",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 14,
            fontWeight: 700,
            color: "rgba(240,243,250,0.45)",
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
            color: "rgba(240,243,250,0.3)",
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
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: 4,
              color: `${tierColor}80`,
              border: `0.5px solid ${tierColor}20`,
              background: `${tierColor}0a`,
            }}
          >
            {tool.tierLabel}
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              color: "rgba(240,243,250,0.2)",
            }}
          >
            {typeof tool.credits === "number" ? `${tool.credits} kredit` : tool.credits}
          </span>
        </div>
      </div>
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
    <div className="tools-app relative min-h-screen" style={{ background: "var(--lp-bg-base)", overflow: "hidden" }}>
      {/* Global Background Orbs & Grid */}
      <div style={{
        position: "fixed",
        top: "-10%",
        left: "-5%",
        width: 800,
        height: 800,
        background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 60%)",
        pointerEvents: "none",
        filter: "blur(60px)",
        zIndex: 0,
      }} />
      <div style={{
        position: "fixed",
        bottom: "-20%",
        right: "-10%",
        width: 1000,
        height: 1000,
        background: "radial-gradient(circle, rgba(255, 176, 32, 0.05) 0%, transparent 60%)",
        pointerEvents: "none",
        filter: "blur(80px)",
        zIndex: 0,
      }} />
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundSize: "40px 40px",
        backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px)",
        WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 30%, black, transparent)",
        maskImage: "radial-gradient(ellipse 100% 100% at 50% 30%, black, transparent)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Hero — blueprint sekali per halaman */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          padding: "80px 24px 60px",
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
                  margin: "0 0 20px",
                  fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                  fontSize: "clamp(36px, 5vw, 56px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "#F0F3FA",
                  maxWidth: 500,
                }}
              >
                Etalase Utilitas Cerdas.
              </h1>

              <p
                style={{
                  margin: "0 0 32px",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "var(--lp-text-secondary)",
                  maxWidth: 480,
                }}
              >
                Utilitas cepat dan cerdas di luar ekosistem utama. Lengkapi workflow Anda dengan scaffolding, copy, schema, dan prompt sekali klik tanpa repot.
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
          position: "relative",
          zIndex: 10,
          padding: "20px 24px 100px",
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

            <div style={{ 
              display: "flex", 
              flexWrap: "nowrap", 
              gap: 12, 
              overflowX: "auto", 
              paddingBottom: 8, 
              scrollSnapType: "x mandatory", 
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }} className="minimal-scrollbar">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 999,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: active
                        ? "1px solid rgba(255,176,32,0.6)"
                        : "1px solid rgba(255,255,255,0.1)",
                      background: active ? "rgba(255,176,32,0.15)" : "rgba(255,255,255,0.02)",
                      color: active ? "#FFB020" : "var(--lp-text-secondary)",
                      transition: "all 0.3s ease",
                      boxShadow: active ? "0 4px 14px rgba(255,176,32,0.2)" : "none",
                      scrollSnapAlign: "start",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      }
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

          {/* Coming Soon section */}
          {filter !== "free" && (() => {
            const comingSoon = COMING_SOON_TOOLS.filter((t) => t.filterKeys.includes(filter));
            if (comingSoon.length === 0) return null;
            return (
              <div style={{ marginTop: 40 }}>
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{
                      margin: "0 0 6px",
                      fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: "rgba(240,243,250,0.45)",
                    }}
                  >
                    Segera hadir
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 12,
                      color: "rgba(240,243,250,0.28)",
                    }}
                  >
                    {comingSoon.length} tool dalam pengembangan — belum bisa dipakai
                  </p>
                </div>
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  }}
                >
                  {comingSoon.map((tool, i) => (
                    <ComingSoonCard key={tool.id} tool={tool} index={i} />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>


      <style>{`
        .group:hover .card-highlight {
          opacity: 1 !important;
        }
        @media (min-width: 900px) {
          .tools-hero-grid {
            grid-template-columns: 1fr 1fr !important;
            align-items: center;
            gap: 60px !important;
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
