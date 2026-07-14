"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { ContextData, Feature } from "./types";

interface ChecklistItem {
  key: string;
  label: string;
  filled: boolean;
}

interface Props {
  data: ContextData;
  features: Feature[];
  items?: ChecklistItem[];
}

function buildDefaultItems(data: ContextData, features: Feature[]): ChecklistItem[] {
  const fields: { key: keyof ContextData; label: string }[] = [
    { key: "targetUser", label: "Target user" },
    { key: "mainProblem", label: "Masalah utama" },
    { key: "coreFeatures", label: "Fitur inti" },
    { key: "buyerDesc", label: "Buyer" },
    { key: "sellerDesc", label: "Seller" },
    { key: "aiUseCase", label: "Use case AI" },
  ];

  const fromData = fields
    .filter((f) => data[f.key] && String(data[f.key]).trim().length > 0)
    .map((f) => ({ key: f.key, label: f.label, filled: true }));

  const unfilled = fields
    .filter((f) => !data[f.key] || String(data[f.key]).trim().length === 0)
    .slice(0, Math.max(0, 4 - fromData.length))
    .map((f) => ({ key: f.key, label: f.label, filled: false }));

  const featureItem: ChecklistItem = {
    key: "features",
    label: "Fitur terstruktur",
    filled: features.length > 0,
  };

  return [...fromData, ...unfilled, featureItem].slice(0, 6);
}

export default function LiveJsonPreview({ data, features, items }: Props) {
  const [showJson, setShowJson] = useState(false);
  const checklist = items ?? buildDefaultItems(data, features);

  const preview = {
    knowledge_model: {
      version: "2.0",
      context: data,
      features: features.map((f) => ({ id: f.id, title: f.title, priority: f.priority })),
    },
  };

  return (
    <div className="w-full">
      <div className="blueprint-panel rounded-none overflow-hidden">
        <div
          className="flex items-center justify-between gap-2 px-4 py-3 border-b"
          style={{ borderColor: "rgba(255,176,32,0.2)", background: "rgba(0,0,0,0.15)" }}
        >
          <span className="font-mono text-[11px] font-bold tracking-wider uppercase" style={{ color: "var(--app-amber)" }}>
            KNOWLEDGE_MODEL.JSON
          </span>
          <button
            type="button"
            onClick={() => setShowJson((v) => !v)}
            className="font-mono text-[11px] px-2 py-1 rounded transition-colors"
            style={{ color: "var(--app-sky)", border: "1px solid rgba(56,189,248,0.3)" }}
          >
            {showJson ? "Lihat checklist" : "Lihat JSON"}
          </button>
        </div>

        <div className="p-4 min-h-[200px]">
          <AnimatePresence mode="wait">
            {showJson ? (
              <motion.pre
                key="json"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[11px] leading-relaxed overflow-auto max-h-[360px]"
                style={{ color: "rgba(56,189,248,0.85)" }}
              >
                {JSON.stringify(preview, null, 2)}
              </motion.pre>
            ) : (
              <motion.ul
                key="checklist"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {checklist.map((item) => (
                  <li key={item.key} className="flex items-start gap-3 font-mono text-[13px]">
                    <motion.span
                      key={item.filled ? `${item.key}-done` : `${item.key}-empty`}
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        border: item.filled ? "none" : "1.5px solid var(--app-border-strong)",
                        background: item.filled ? "var(--app-amber)" : "transparent",
                        color: "#0D1321",
                      }}
                      initial={{ scale: 0.85, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 18 }}
                    >
                      {item.filled && <Check size={12} strokeWidth={2.5} />}
                    </motion.span>
                    <span style={{ color: item.filled ? "var(--app-text-primary)" : "var(--app-text-tertiary)" }}>
                      {item.label}
                      <span className="block text-[11px] mt-0.5" style={{ opacity: 0.7 }}>
                        {item.filled ? "terisi" : "belum diisi"}
                      </span>
                    </span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
