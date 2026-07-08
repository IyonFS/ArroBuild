"use client";

import React from "react";
import type { ContextData, Feature } from "./types";

interface Props {
  data: ContextData;
  features: Feature[];
}

export default function LiveJsonPreview({ data, features }: Props) {
  // Build a minimal representation of the Knowledge Model
  const preview = {
    knowledge_model: {
      version: "2.0",
      context: data,
      features: features.map(f => ({
        id: f.id,
        title: f.title,
        priority: f.priority
      }))
    }
  };

  return (
    <div 
      className="hidden lg:flex flex-col w-full h-full rounded-2xl overflow-hidden border"
      style={{ background: "#0A0A0A", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        <span className="ml-2 font-mono text-[10px] tracking-wider uppercase text-white/40">
          knowledge_model.json (Live Preview)
        </span>
      </div>
      <div className="flex-grow p-4 overflow-auto">
        <pre 
          className="font-mono text-[11px] leading-relaxed"
          style={{ color: "rgba(204,255,0,0.8)" }}
        >
          {JSON.stringify(preview, null, 2)}
        </pre>
      </div>
    </div>
  );
}
