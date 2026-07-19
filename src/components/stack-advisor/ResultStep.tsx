"use client";

import { useRouter } from "next/navigation";
import type { EnrichedPackage } from "./types";
import type { AdvisorParsedResult } from "@/lib/config/stack-advisor-prompt";
import { STACK_KB_VERSION } from "@/lib/config/stack-advisor-kb";
import type { Design, Presets } from "@/components/generate/types";

interface Props {
  parsed: AdvisorParsedResult | null;
  enriched: EnrichedPackage[];
  selectedPackageId: string | null;
  productType: string;
  onSelect: (id: string) => void;
  onReset: () => void;
  onRetry: () => void;
}

function formatIdr(n: number) {
  return `Rp${n.toLocaleString("id-ID")}`;
}

function toPresets(pkg: EnrichedPackage["pkg"]): Presets {
  return {
    framework: pkg.framework,
    backendFramework: pkg.backendFramework,
    design: pkg.designDefault as Design,
    agentTool: "cursor",
    database: pkg.database,
    deployment: pkg.deployment,
    programmingLanguage: pkg.programmingLanguage,
    stackBundle: pkg.stackBundle,
    animationLibrary: pkg.framework === "expo" ? "lottie" : "framer-motion",
  };
}

export default function ResultStep({
  parsed,
  enriched,
  selectedPackageId,
  productType,
  onSelect,
  onReset,
  onRetry,
}: Props) {
  const router = useRouter();

  if (parsed?.status === "need_more_info") {
    return (
      <div className="mx-auto max-w-2xl">
        <div
          className="mb-6 rounded-xl px-5 py-4"
          style={{
            background: "rgba(255,176,32,0.08)",
            border: "0.5px solid rgba(255,176,32,0.35)",
          }}
        >
          <p
            className="font-mono text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--app-amber)" }}
          >
            Perlu klarifikasi
          </p>
          <h2
            className="mt-1 font-unbounded text-lg font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Brief masih terlalu vague
          </h2>
          <p
            className="mt-2 font-mono text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Kami tidak memaksakan rekomendasi generik. Jawab dulu pertanyaan ini, lalu coba lagi.
          </p>
        </div>
        <ul className="mb-8 flex flex-col gap-2">
          {(parsed.questions.length ? parsed.questions : ["Apa tipe produknya?", "Prioritas: cepat, hemat, atau skala?"]).map(
            (q) => (
              <li
                key={q}
                className="rounded-xl px-4 py-3 font-mono text-sm"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "0.5px solid var(--color-border-default)",
                  color: "var(--color-text-primary)",
                }}
              >
                {q}
              </li>
            )
          )}
        </ul>
        <div className="flex justify-between">
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            Ulang dari awal
          </button>
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Lengkapi brief →
          </button>
        </div>
      </div>
    );
  }

  const selected = enriched.find((e) => e.pick.packageId === selectedPackageId) ?? enriched[0];

  const sendToGenerate = () => {
    if (!selected) return;
    const presets = toPresets(selected.pkg);
    sessionStorage.setItem("arrobuild_fork_presets", JSON.stringify(presets));
    sessionStorage.setItem(
      "arrobuild_fork_idea",
      JSON.stringify({
        type: productType || selected.pkg.productTypes[0] || "saas",
        data: {},
      })
    );
    sessionStorage.setItem("arrobuild_fork_step", "stack");
    router.push("/generate");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className="mb-6 rounded-xl px-5 py-4"
        style={{
          background: "rgba(56,189,248,0.06)",
          border: "0.5px solid rgba(56,189,248,0.25)",
        }}
      >
        <p
          className="font-mono text-[10px] font-bold uppercase tracking-wider"
          style={{ color: "var(--app-sky)" }}
        >
          Rekomendasi siap · KB {STACK_KB_VERSION}
        </p>
        <h2
          className="mt-1 font-unbounded text-lg font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {parsed && "summary" in parsed ? parsed.summary : "Paket dari knowledge base"}
        </h2>
        <p className="mt-1 font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Tiap paket bisa ditelusuri ke entry curated — preview dulu, baru kirim ke Generate.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        {enriched.map((item, idx) => {
          const active = (selectedPackageId ?? enriched[0]?.pick.packageId) === item.pick.packageId;
          return (
            <button
              key={item.pkg.id}
              type="button"
              onClick={() => onSelect(item.pkg.id)}
              className="w-full rounded-2xl p-5 text-left transition-all"
              style={{
                background: "var(--color-bg-elevated)",
                border: active
                  ? "1.5px solid rgba(255,176,32,0.65)"
                  : "0.5px solid var(--color-border-default)",
              }}
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span
                    className="font-mono text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--app-sky)" }}
                  >
                    Paket {idx + 1}
                  </span>
                  <h3
                    className="font-unbounded text-base font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {item.pkg.name}
                  </h3>
                </div>
                <span className="font-mono text-[12px]" style={{ color: "var(--app-amber)" }}>
                  {formatIdr(item.pkg.monthlyCost.minIdr)}–{formatIdr(item.pkg.monthlyCost.maxIdr)}
                  /bln
                </span>
              </div>
              <p
                className="mb-3 font-mono text-[13px] leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {item.pkg.tagline}
              </p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {[
                  item.pkg.framework,
                  item.pkg.database,
                  item.pkg.deployment,
                  item.pkg.aiProviderLabel.slice(0, 28),
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md px-2 py-1 font-mono text-[11px]"
                    style={{
                      background: "rgba(240,243,250,0.05)",
                      border: "0.5px solid rgba(240,243,250,0.1)",
                      color: "rgba(240,243,250,0.55)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="space-y-1">
                {item.pick.whyPicked.map((w) => (
                  <p
                    key={w}
                    className="font-mono text-[12px] leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    → {w}
                  </p>
                ))}
              </div>
              {item.pick.watchOuts.length > 0 && (
                <p
                  className="mt-3 font-mono text-[11px] leading-relaxed"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Watch-out: {item.pick.watchOuts.join(" · ")}
                </p>
              )}
              <p
                className="mt-2 font-mono text-[10px]"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                KB id: {item.pkg.id}
              </p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="mb-6 rounded-xl px-5 py-4"
          style={{
            background: "rgba(255,176,32,0.06)",
            border: "0.5px solid rgba(255,176,32,0.25)",
          }}
        >
          <p
            className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--app-amber)" }}
          >
            Preview handoff ke Generate
          </p>
          <p className="font-mono text-sm" style={{ color: "var(--color-text-primary)" }}>
            {selected.pkg.name} → Step 3 (framework {selected.pkg.framework}
            {selected.pkg.backendFramework ? ` + ${selected.pkg.backendFramework}` : ""},{" "}
            {selected.pkg.database}, {selected.pkg.deployment})
          </p>
          <p
            className="mt-1 font-mono text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Provider AI & biaya tetap di Stack Advisor — Step 3 menerima preset teknis saja.
            Kamu harus approve dulu sebelum pindah.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-ghost" onClick={onReset}>
          Buat ulang
        </button>
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Coba prioritas beda
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selected}
          onClick={sendToGenerate}
        >
          Kirim ke Generate Flow →
        </button>
      </div>
    </div>
  );
}
