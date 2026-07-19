"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, Link2, ArrowRight, Image as ImageIcon, X } from "lucide-react";
import type { ArroDesignInputType, ArroDesignFormState } from "./types";

interface InputStepProps {
  state: ArroDesignFormState;
  onChange: (patch: Partial<ArroDesignFormState>) => void;
  onNext: () => void;
}

export default function InputStep({ state, onChange, onNext }: InputStepProps) {
  const [urlError, setUrlError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canNext =
    state.inputType === "url"
      ? state.referenceUrl.trim().length > 5
      : state.imageDataUrl.length > 0;

  const handleUrlChange = (val: string) => {
    onChange({ referenceUrl: val });
    setUrlError("");
  };

  const validateAndNext = () => {
    if (state.inputType === "url") {
      try {
        new URL(state.referenceUrl.trim());
      } catch {
        setUrlError("URL tidak valid. Contoh: https://example.com");
        return;
      }
    }
    onNext();
  };

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUrlError("File harus berupa gambar (PNG, JPG, WebP).");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setUrlError("Gambar terlalu besar (maks 8 MB).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange({ imageDataUrl: result, imageFileName: file.name });
        setUrlError("");
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const modeBtn = (type: ArroDesignInputType, label: string, icon: React.ReactNode) => {
    const active = state.inputType === type;
    return (
      <button
        type="button"
        id={`arrodesign-mode-${type}`}
        onClick={() => onChange({ inputType: type, urlError: undefined } as Partial<ArroDesignFormState & { urlError?: string }>)}
        style={{
          flex: 1,
          padding: "14px 16px",
          borderRadius: 10,
          border: active
            ? "1px solid rgba(157,78,221,0.6)"
            : "0.5px solid rgba(240,243,250,0.12)",
          background: active ? "rgba(157,78,221,0.12)" : "rgba(240,243,250,0.03)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          transition: "all 150ms ease",
        }}
      >
        <span style={{ color: active ? "#9D4EDD" : "rgba(240,243,250,0.45)" }}>{icon}</span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 13,
            fontWeight: active ? 700 : 500,
            color: active ? "#F0F3FA" : "rgba(240,243,250,0.55)",
          }}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Mode toggle */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            color: "rgba(240,243,250,0.45)",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Tipe Input Referensi
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          {modeBtn("url", "Paste URL Situs", <Link2 size={20} />)}
          {modeBtn("image", "Upload Screenshot", <ImageIcon size={20} />)}
        </div>
      </div>

      {/* URL input */}
      {state.inputType === "url" && (
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="arrodesign-url"
            style={{
              display: "block",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(240,243,250,0.6)",
              marginBottom: 8,
            }}
          >
            URL Situs Referensi
          </label>
          <input
            id="arrodesign-url"
            type="url"
            value={state.referenceUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://linear.app atau https://vercel.com/design"
            onKeyDown={(e) => e.key === "Enter" && validateAndNext()}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 13,
              background: "rgba(240,243,250,0.04)",
              border: urlError
                ? "0.5px solid rgba(239,68,68,0.5)"
                : "0.5px solid rgba(240,243,250,0.14)",
              color: "#F0F3FA",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {urlError && (
            <p
              style={{
                marginTop: 6,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                color: "#EF4444",
              }}
            >
              {urlError}
            </p>
          )}
          <p
            style={{
              marginTop: 8,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              color: "rgba(240,243,250,0.3)",
              lineHeight: 1.6,
            }}
          >
            ArroDesign akan mengambil konten halaman + konteks eksternal. Pastikan URL dapat
            diakses publik.
          </p>
        </div>
      )}

      {/* Image upload */}
      {state.inputType === "image" && (
        <div style={{ marginBottom: 20 }}>
          {state.imageDataUrl ? (
            // Preview gambar yang sudah diupload
            <div
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                border: "0.5px solid rgba(157,78,221,0.3)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.imageDataUrl}
                alt="Referensi"
                style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "8px 12px",
                  background: "rgba(13,19,33,0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: "rgba(240,243,250,0.6)",
                  }}
                >
                  {state.imageFileName}
                </span>
                <button
                  type="button"
                  id="arrodesign-clear-image"
                  onClick={() => onChange({ imageDataUrl: "", imageFileName: "" })}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(240,243,250,0.45)",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            // Drop zone
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "40px 24px",
                borderRadius: 10,
                border: dragOver
                  ? "1px dashed rgba(157,78,221,0.7)"
                  : "1px dashed rgba(240,243,250,0.18)",
                background: dragOver ? "rgba(157,78,221,0.06)" : "rgba(240,243,250,0.02)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 150ms ease",
              }}
            >
              <Upload
                size={28}
                style={{
                  color: dragOver ? "#9D4EDD" : "rgba(240,243,250,0.3)",
                  marginBottom: 12,
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 13,
                  color: "rgba(240,243,250,0.55)",
                  marginBottom: 6,
                }}
              >
                Drag & drop screenshot, atau{" "}
                <span style={{ color: "#9D4EDD", textDecoration: "underline" }}>
                  klik untuk pilih file
                </span>
              </p>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  color: "rgba(240,243,250,0.28)",
                }}
              >
                PNG, JPG, WebP — maks 8 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="arrodesign-file-input"
              />
            </div>
          )}

          {urlError && (
            <p
              style={{
                marginTop: 8,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                color: "#EF4444",
              }}
            >
              {urlError}
            </p>
          )}
        </div>
      )}

      {/* Next button */}
      <button
        type="button"
        id="arrodesign-next-input"
        onClick={validateAndNext}
        disabled={!canNext}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: 8,
          border: "none",
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 14,
          fontWeight: 700,
          cursor: canNext ? "pointer" : "not-allowed",
          background: canNext ? "#9D4EDD" : "rgba(240,243,250,0.08)",
          color: canNext ? "#fff" : "rgba(240,243,250,0.28)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 150ms ease",
        }}
      >
        Lanjut — Isi Konteks
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
