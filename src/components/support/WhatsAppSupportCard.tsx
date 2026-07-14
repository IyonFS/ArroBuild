"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseApiErrorMessage } from "@/lib/parse-api-error";
import type { UserPlanStatus } from "@/components/generate/types";

export interface WhatsappQuotaDisplay {
  limit: number;
  used: number;
  remaining: number;
  available: boolean;
  priority: "normal" | "priority";
}

interface Props {
  tier: UserPlanStatus;
  quota: WhatsappQuotaDisplay | null;
  userEmail?: string;
  projectId?: string;
  projectLabel?: string;
  variant?: "card" | "embedded";
  onSuccess?: (quota: WhatsappQuotaDisplay | null) => void;
}

const TOPICS = [
  "Bantuan generate / kredit",
  "Revisi dokumen & workspace",
  "Upgrade paket & pembayaran",
  "Bug atau error teknis",
];

async function readApiJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(parseApiErrorMessage(res.status, text));
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(parseApiErrorMessage(res.status, text));
  }
}

export default function WhatsAppSupportCard({
  tier,
  quota: initialQuota,
  userEmail,
  projectId,
  projectLabel,
  variant = "card",
  onSuccess,
}: Props) {
  const [quota, setQuota] = useState(initialQuota);
  const [title, setTitle] = useState(projectLabel ? `Bantuan: ${projectLabel}` : "");
  const [message, setMessage] = useState(() => {
    if (projectId && projectLabel) {
      return `Halo, saya user ArroBuild${userEmail ? ` (${userEmail})` : ""}. Butuh bantuan untuk project "${projectLabel}" (ID: ${projectId}).`;
    }
    return "";
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);

  useEffect(() => {
    setQuota(initialQuota);
  }, [initialQuota]);

  const hasAccess = tier === "pro" || tier === "pro_max";
  const atLimit = quota != null && quota.limit > 0 && !quota.available;

  const submit = async () => {
    if (!message.trim() || message.trim().length < 10) {
      setError("Pesan minimal 10 karakter.");
      return;
    }
    setBusy(true);
    setError(null);
    setWaLink(null);
    try {
      const res = await fetch("/api/whatsapp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          message: message.trim(),
          projectId,
        }),
      });
      const data = await readApiJson(res);
      if (!res.ok) {
        throw new Error(
          (typeof data.error === "string" ? data.error : null) ||
            "Gagal mengirim permintaan chat"
        );
      }

      const nextQuota = data.quota as WhatsappQuotaDisplay | null;
      if (nextQuota) {
        setQuota(nextQuota);
        onSuccess?.(nextQuota);
      }

      const link = typeof data.whatsappLink === "string" ? data.whatsappLink : null;
      if (link) {
        setWaLink(link);
        window.open(link, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  };

  const shellClass =
    variant === "card"
      ? "rounded-2xl px-5 py-5"
      : "rounded-xl px-4 py-4";

  return (
    <section
      className={shellClass}
      style={{
        background: "var(--color-bg-elevated)",
        border: "0.5px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-xl inline-flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}
            aria-hidden
          >
            WA
          </span>
          <div>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Chat Founder via WhatsApp
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Dukungan langsung untuk Core & Prime
            </p>
          </div>
        </div>
        {quota && quota.limit > 0 && (
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded flex-shrink-0"
            style={{
              background: atLimit ? "rgba(239,68,68,0.12)" : "rgba(37,211,102,0.12)",
              color: atLimit ? "#F87171" : "#25D366",
            }}
          >
            {quota.used}/{quota.limit} bulan ini
          </span>
        )}
      </div>

      {!hasAccess ? (
        <div
          className="rounded-xl px-4 py-4 text-sm"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <p className="mb-3">
            Chat WhatsApp founder tersedia mulai paket <strong>Pro</strong> (2×/bulan) dan{" "}
            <strong>Prime</strong> (5×/bulan, prioritas).
          </p>
          <Link
            href="/dashboard/upgrade"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--color-lime)" }}
          >
            Upgrade paket →
          </Link>
        </div>
      ) : atLimit ? (
        <div
          className="rounded-xl px-4 py-4 text-sm"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "0.5px solid rgba(239,68,68,0.2)",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          Kuota chat WhatsApp bulan ini sudah habis ({quota?.limit}/bulan). Coba lagi bulan
          depan atau hubungi via email support.
        </div>
      ) : (
        <div className="space-y-3">
          {quota && (
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Sisa <strong style={{ color: "#25D366" }}>{quota.remaining}</strong> permintaan
              {quota.priority === "priority" ? " · prioritas Prime" : ""}
            </p>
          )}

          <div>
            <label
              className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Topik (opsional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mis. Bantuan revisi PRD"
              maxLength={120}
              className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-xl outline-none"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          <div>
            <label
              className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Pesan ke founder
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Jelaskan singkat masalah atau pertanyaan kamu (min. 10 karakter)..."
              maxLength={2000}
              className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-xl outline-none resize-none"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--color-text-primary)",
                lineHeight: 1.55,
              }}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTitle(t)}
                  className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
                  style={{
                    background:
                      title === t ? "rgba(37,211,102,0.15)" : "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: title === t ? "#25D366" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs" style={{ color: "#EF4444" }}>
              {error}
            </p>
          )}

          {waLink && (
            <p className="text-xs" style={{ color: "#25D366" }}>
              WhatsApp dibuka di tab baru.{" "}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="underline">
                Buka lagi
              </a>
            </p>
          )}

          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || message.trim().length < 10}
            className="w-full py-3 text-sm font-bold disabled:opacity-40 transition-opacity"
            style={{
              borderRadius: 12,
              background: "#25D366",
              color: "#0A0A0A",
            }}
          >
            {busy ? "Mencatat permintaan..." : "Kirim & buka WhatsApp"}
          </button>

          <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
            Setiap permintaan dihitung 1× kuota bulanan. Setelah klik, WhatsApp akan terbuka dengan
            pesan siap kirim.
          </p>
        </div>
      )}
    </section>
  );
}
