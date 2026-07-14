"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

interface Metrics {
  generatedAt: string;
  users: { total: number; activeSubscriptions: number };
  revenue: {
    allTimeIdr: number;
    thisMonthIdr: number;
    byTier: Array<{ tier: string; totalIdr: number; count: number }>;
  };
  credits: { consumedThisMonth: number; estimatedAiCostIdr: number };
  margin: { grossMarginMonthIdr: number; marginPct: number; note: string };
}

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function AdminMetricsPage() {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Gagal memuat metrik"));
  }, []);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="text-sm font-mono text-[var(--color-lime)] mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="font-unbounded font-bold text-2xl text-white mb-2">
          Founder — Margin & Revenue
        </h1>
        <p className="text-xs font-mono mb-8" style={{ color: "var(--text-tertiary)" }}>
          Internal only · set FOUNDER_USER_ID atau FOUNDER_EMAIL di env
        </p>

        {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

        {data && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="app-panel p-4">
              <p className="text-xs font-mono text-[var(--text-tertiary)]">Pendapatan bulan ini</p>
              <p className="text-xl font-medium text-white mt-1">{idr(data.revenue.thisMonthIdr)}</p>
            </div>
            <div className="app-panel p-4">
              <p className="text-xs font-mono text-[var(--text-tertiary)]">Margin kasar bulan ini</p>
              <p className="text-xl font-medium text-white mt-1">
                {idr(data.margin.grossMarginMonthIdr)}{" "}
                <span className="text-sm text-[var(--color-lime)]">({data.margin.marginPct}%)</span>
              </p>
            </div>
            <div className="app-panel p-4">
              <p className="text-xs font-mono text-[var(--text-tertiary)]">Kredit terpakai (bulan ini)</p>
              <p className="text-xl font-medium text-white mt-1">
                {data.credits.consumedThisMonth.toLocaleString("id-ID")}
              </p>
              <p className="text-xs font-mono mt-1" style={{ color: "var(--text-tertiary)" }}>
                Est. biaya AI: {idr(data.credits.estimatedAiCostIdr)}
              </p>
            </div>
            <div className="app-panel p-4">
              <p className="text-xs font-mono text-[var(--text-tertiary)]">User / langganan aktif</p>
              <p className="text-xl font-medium text-white mt-1">
                {data.users.total} / {data.users.activeSubscriptions}
              </p>
            </div>
            <div className="app-panel p-4 sm:col-span-2">
              <p className="text-xs font-mono text-[var(--text-tertiary)] mb-3">Revenue per tier (all time)</p>
              <ul className="space-y-2">
                {data.revenue.byTier.map((row) => (
                  <li
                    key={row.tier}
                    className="flex justify-between text-sm font-mono"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>{row.tier}</span>
                    <span>
                      {idr(row.totalIdr)} · {row.count} trx
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] font-mono mt-4" style={{ color: "var(--text-tertiary)" }}>
                {data.margin.note}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
