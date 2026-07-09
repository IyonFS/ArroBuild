"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type IntakeMode = "cepat" | "dipandu";

interface QuotaInfo {
  usedThisMonth: number;
  freeRemaining: number;
  isPaidSession: boolean;
  estimatedCredits: number;
  creditBalance: number;
}

interface Props {
  onSelect: (mode: IntakeMode) => void;
}

export default function ModeSelectStep({ onSelect }: Props) {
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/interview")
      .then(async (res) => {
        if (res.status === 401) {
          if (!cancelled) setAuthRequired(true);
          return null;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Gagal memuat kuota wawancara");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data?.quota) setQuota(data.quota);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const paidBlocked =
    quota?.isPaidSession &&
    (quota.creditBalance ?? 0) < (quota.estimatedCredits || 8);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <div className="mb-10">
        <p
          className="text-xs uppercase tracking-[0.18em] mb-3"
          style={{
            color: "rgba(204,255,0,0.7)",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          }}
        >
          Step 0 · Mode
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{
            fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
            letterSpacing: "-0.03em",
            color: "var(--color-text-primary)",
          }}
        >
          Mau isi plan bagaimana?
        </h1>
        <p
          className="text-base max-w-xl"
          style={{
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            lineHeight: 1.6,
          }}
        >
          Mode Cepat mengisi form manual. Mode Dipandu AI mewawancara kamu singkat
          lalu mengisi Knowledge Model otomatis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("cepat")}
          className="text-left p-6 transition-all duration-200 group"
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            background: "rgba(255,255,255,0.02)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(204,255,0,0.45)";
            e.currentTarget.style.background = "rgba(204,255,0,0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center mb-4"
            style={{
              borderRadius: 10,
              background: "rgba(204,255,0,0.1)",
              color: "var(--color-lime)",
              fontSize: 18,
            }}
          >
            ▦
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Mode Cepat
          </h2>
          <p
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}
          >
            Isi tipe produk, cerita, stack, dan dokumen sendiri — paling cepat
            kalau idenya sudah jelas.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            if (authRequired) return;
            if (paidBlocked) return;
            onSelect("dipandu");
          }}
          disabled={authRequired || paidBlocked || loading}
          className="text-left p-6 transition-all duration-200 relative"
          style={{
            border: "1px solid rgba(204,255,0,0.35)",
            borderRadius: 16,
            background: "rgba(204,255,0,0.04)",
            opacity: authRequired || paidBlocked ? 0.55 : 1,
            cursor: authRequired || paidBlocked ? "not-allowed" : "pointer",
          }}
        >
          <span
            className="absolute top-4 right-4 text-[10px] uppercase tracking-wider px-2 py-0.5"
            style={{
              background: "rgba(204,255,0,0.15)",
              color: "var(--color-lime)",
              borderRadius: 999,
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}
          >
            AI
          </span>
          <div
            className="w-10 h-10 flex items-center justify-center mb-4"
            style={{
              borderRadius: 10,
              background: "rgba(204,255,0,0.12)",
              color: "var(--color-lime)",
              fontSize: 18,
            }}
          >
            ✦
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Mode Dipandu AI
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}
          >
            Ngobrol max 8 giliran. AI ekstrak tipe, target user, masalah, dan
            FEAT-ID otomatis.
          </p>

          {loading && (
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Memuat kuota...
            </p>
          )}

          {authRequired && (
            <p className="text-xs" style={{ color: "#FB923C" }}>
              Login dulu untuk memakai Mode Dipandu AI.{" "}
              <Link href="/login" className="underline">
                Masuk
              </Link>
            </p>
          )}

          {!loading && !authRequired && quota && (
            <div
              className="text-xs space-y-1"
              style={{
                color: "rgba(255,255,255,0.45)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              <p>
                Kuota gratis bulan ini:{" "}
                <span style={{ color: "var(--color-lime)" }}>
                  {quota.freeRemaining}/3
                </span>
              </p>
              {quota.isPaidSession ? (
                <p>
                  Sesi berikutnya ~{quota.estimatedCredits} kredit (saldo{" "}
                  {quota.creditBalance})
                </p>
              ) : (
                <p>Sesi ini gratis</p>
              )}
              {paidBlocked && (
                <p style={{ color: "#FB923C" }}>
                  Kredit kurang.{" "}
                  <Link href="/pricing" className="underline">
                    Upgrade / top-up
                  </Link>
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs mt-2" style={{ color: "#FB923C" }}>
              {error}
            </p>
          )}
        </button>
      </div>
    </div>
  );
}
