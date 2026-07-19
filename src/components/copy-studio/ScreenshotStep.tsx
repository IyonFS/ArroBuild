"use client";

import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { ScreenshotSection } from "./types";

interface Props {
  screenshots: ScreenshotSection[];
  productName: string;
  targetUser: string;
  mainValue: string;
  onChange: (screenshots: ScreenshotSection[]) => void;
  onFieldChange: (patch: {
    productName?: string;
    targetUser?: string;
    mainValue?: string;
  }) => void;
  onBack: () => void;
  onNext: () => void;
}

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: 13,
  background: "var(--color-bg-base, #131A2C)",
  border: "0.5px solid var(--color-border-default)",
  color: "var(--color-text-primary)",
} as const;

const MAX_IMAGES = 10;
const MAX_BYTES = 1_800_000;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal baca file"));
    reader.readAsDataURL(file);
  });
}

export default function ScreenshotStep({
  screenshots,
  productName,
  targetUser,
  mainValue,
  onChange,
  onFieldChange,
  onBack,
  onNext,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next = [...screenshots];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_IMAGES) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_BYTES) {
        alert(`"${file.name}" terlalu besar (max ~1.8MB per gambar).`);
        continue;
      }
      const dataUrl = await readAsDataUrl(file);
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: `Section ${next.length + 1}`,
        dataUrl,
        fileName: file.name,
      });
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const updateLabel = (id: string, label: string) => {
    onChange(screenshots.map((s) => (s.id === id ? { ...s, label } : s)));
  };

  const remove = (id: string) => {
    onChange(screenshots.filter((s) => s.id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2
        className="mb-2 font-unbounded text-xl font-bold sm:text-[22px]"
        style={{ color: "var(--color-text-primary)" }}
      >
        Upload screenshot per section
      </h2>
      <p
        className="mb-6 max-w-lg font-mono text-[13.5px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Satu gambar per section. Teks yang buram/terpotong akan ditandai{" "}
        <span style={{ color: "var(--app-amber)" }}>[PERLU DIKONFIRMASI]</span> — bukan ditebak
        diam-diam. Kredit: 12 × jumlah section.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <button
        type="button"
        className="mb-6 flex w-full flex-col items-center justify-center gap-2 rounded-xl px-4 py-10 transition-colors"
        style={{
          background: "var(--color-bg-elevated)",
          border: "1px dashed rgba(56,189,248,0.35)",
          color: "var(--app-sky)",
        }}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus size={28} strokeWidth={1.5} />
        <span className="font-mono text-sm font-semibold">Tambah gambar</span>
        <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          PNG / JPG / WebP · max {MAX_IMAGES} section
        </span>
      </button>

      {screenshots.length > 0 && (
        <ul className="mb-6 flex flex-col gap-3">
          {screenshots.map((s, i) => (
            <li
              key={s.id}
              className="flex gap-3 rounded-xl p-3"
              style={{
                background: "var(--color-bg-elevated)",
                border: "0.5px solid var(--color-border-default)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.dataUrl}
                alt={s.label}
                className="h-20 w-28 flex-shrink-0 rounded-lg object-cover"
                style={{ border: "0.5px solid rgba(240,243,250,0.1)" }}
              />
              <div className="min-w-0 flex-1">
                <label className="flex flex-col gap-1">
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Label section {i + 1}
                  </span>
                  <input
                    value={s.label}
                    onChange={(e) => updateLabel(s.id, e.target.value)}
                    style={{ ...fieldStyle, padding: "8px 10px" }}
                  />
                </label>
                <p
                  className="mt-1 truncate font-mono text-[11px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {s.fileName}
                </p>
              </div>
              <button
                type="button"
                className="self-start rounded-lg p-2"
                style={{ color: "rgba(239,68,68,0.85)" }}
                onClick={() => remove(s.id)}
                aria-label="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        className="mb-8 rounded-xl p-5"
        style={{
          background: "var(--color-bg-elevated)",
          border: "0.5px solid var(--color-border-default)",
        }}
      >
        <h3
          className="mb-3 font-unbounded text-sm font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Konteks produk (opsional)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={productName}
            onChange={(e) => onFieldChange({ productName: e.target.value })}
            placeholder="Nama produk"
            style={fieldStyle}
          />
          <input
            value={targetUser}
            onChange={(e) => onFieldChange({ targetUser: e.target.value })}
            placeholder="Target user"
            style={fieldStyle}
          />
          <textarea
            value={mainValue}
            onChange={(e) => onFieldChange({ mainValue: e.target.value })}
            placeholder="Value utama"
            rows={2}
            className="sm:col-span-2"
            style={fieldStyle}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Kembali
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={screenshots.length === 0}
          onClick={onNext}
        >
          Lanjut →
        </button>
      </div>
    </div>
  );
}
