"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, Sparkles } from "lucide-react";

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
    <div className="w-full max-w-[720px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-10">
        <p
          className="font-mono text-[11px] font-bold tracking-widest uppercase mb-3"
          style={{ color: "var(--app-sky)" }}
        >
          Step 0 · Mode
        </p>
        <h1
          className="font-unbounded font-extrabold text-[clamp(26px,3vw,32px)] mb-3"
          style={{ color: "var(--app-text-primary)", letterSpacing: "-0.02em" }}
        >
          Mau isi plan bagaimana?
        </h1>
        <p
          className="font-mono text-[14px] leading-relaxed max-w-[480px]"
          style={{ color: "var(--app-text-secondary)" }}
        >
          Mode Cepat mengisi form manual. Mode Dipandu AI mewawancara kamu singkat
          lalu mengisi Knowledge Model otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        <motion.button
          type="button"
          onClick={() => onSelect("cepat")}
          className="w-full min-w-0 text-left p-6 rounded-xl transition-colors generate-mode-card"
          style={{
            background: "var(--app-bg-elevated)",
            border: "1px solid var(--app-border-strong)",
          }}
          whileHover={{ y: -2, borderColor: "rgba(56,189,248,0.45)" }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
            style={{ background: "rgba(56,189,248,0.1)", color: "var(--app-sky)" }}
          >
            <LayoutGrid size={20} strokeWidth={1.75} />
          </div>
          <h2 className="font-unbounded font-bold text-[15px] mb-2" style={{ color: "var(--app-text-primary)" }}>
            Mode Cepat
          </h2>
          <p className="font-mono text-[13px] leading-relaxed" style={{ color: "var(--app-text-secondary)" }}>
            Isi tipe produk, cerita, stack, dan dokumen sendiri — paling cepat
            kalau idenya sudah jelas.
          </p>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => {
            if (authRequired || paidBlocked) return;
            onSelect("dipandu");
          }}
          disabled={authRequired || paidBlocked || loading}
          className="w-full min-w-0 text-left p-6 rounded-xl relative generate-mode-card"
          style={{
            background: "rgba(255,176,32,0.04)",
            border: "1px solid rgba(255,176,32,0.3)",
            opacity: authRequired || paidBlocked ? 0.55 : 1,
            cursor: authRequired || paidBlocked ? "not-allowed" : "pointer",
          }}
          whileHover={authRequired || paidBlocked ? undefined : { y: -2 }}
          transition={{ duration: 0.15 }}
        >
          <span
            className="absolute top-4 right-4 font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(255,176,32,0.15)",
              color: "var(--app-amber)",
              border: "1px solid rgba(255,176,32,0.3)",
            }}
          >
            AI
          </span>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
            style={{ background: "rgba(255,176,32,0.12)", color: "var(--app-amber)" }}
          >
            <Sparkles size={20} strokeWidth={1.75} />
          </div>
          <h2 className="font-unbounded font-bold text-[15px] mb-2" style={{ color: "var(--app-text-primary)" }}>
            Mode Dipandu AI
          </h2>
          <p className="font-mono text-[13px] leading-relaxed mb-4" style={{ color: "var(--app-text-secondary)" }}>
            Ngobrol max 8 giliran. AI ekstrak tipe, target user, masalah, dan
            FEAT-ID otomatis.
          </p>

          {loading && (
            <p className="font-mono text-[11px]" style={{ color: "var(--app-text-tertiary)" }}>
              Memuat kuota...
            </p>
          )}

          {authRequired && (
            <p className="font-mono text-[11px]" style={{ color: "#FB923C" }}>
              Login dulu untuk memakai Mode Dipandu AI.{" "}
              <Link href="/login" className="underline" style={{ color: "var(--app-sky)" }}>
                Masuk
              </Link>
            </p>
          )}

          {!loading && !authRequired && quota && (
            <div className="font-mono text-[11px] flex flex-col gap-1" style={{ color: "var(--app-text-tertiary)" }}>
              <p>
                Kuota gratis bulan ini:{" "}
                <span style={{ color: "var(--app-amber)" }}>{quota.freeRemaining}/3</span>
              </p>
              {quota.isPaidSession ? (
                <p>
                  Sesi berikutnya ~{quota.estimatedCredits} kredit (saldo {quota.creditBalance})
                </p>
              ) : (
                <p>Sesi ini gratis</p>
              )}
              {paidBlocked && (
                <p style={{ color: "#FB923C" }}>
                  Kredit kurang.{" "}
                  <Link href="/dashboard/upgrade" className="underline">
                    Upgrade / top-up
                  </Link>
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="font-mono text-[11px] mt-2" style={{ color: "#FB923C" }}>
              {error}
            </p>
          )}
        </motion.button>
      </div>
    </div>
  );
}
