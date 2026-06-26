"use client";

import { useState, useRef, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface EmailCaptureModalProps {
  projectId: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function EmailCaptureModal({
  projectId,
  onConfirm,
  onClose,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/project/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), emailOptIn }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Gagal menyimpan email.");
      }

      trackEvent("email_captured", { optIn: emailOptIn });
      onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      id="email-capture-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal card */}
      <div
        id="email-capture-modal"
        className="card animate-fade-in-up w-full"
        style={{
          maxWidth: "420px",
          padding: "2rem",
          position: "relative",
          border: "0.5px solid var(--color-border-default)",
        }}
      >
        {/* Close button */}
        <button
          id="email-modal-close"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            color: "var(--text-tertiary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            lineHeight: 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl mb-5"
          style={{ background: "rgba(204,255,0,0.08)", border: "0.5px solid rgba(204,255,0,0.25)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-lime)" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-h2 mb-1">Download gratis</h2>
        <p className="text-body mb-6" style={{ color: "var(--text-secondary)" }}>
          Masukkan email kamu untuk download zip. Tidak ada spam, kami serius.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email-input"
              className="text-small block mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Alamat email
            </label>
            <input
              ref={inputRef}
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="kamu@example.com"
              required
              className="input w-full"
              style={
                error
                  ? { borderColor: "var(--red-text, #f87171)", outline: "none" }
                  : undefined
              }
            />
            {error && (
              <p
                className="text-small mt-1.5"
                style={{ color: "var(--red-text, #f87171)" }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Opt-in checkbox */}
          <label
            id="email-optin-label"
            className="flex items-start gap-3 mb-6 cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            <div
              className="relative flex-shrink-0 mt-0.5"
              style={{ width: "18px", height: "18px" }}
            >
              <input
                id="email-optin"
                type="checkbox"
                checked={emailOptIn}
                onChange={(e) => setEmailOptIn(e.target.checked)}
                className="sr-only"
              />
              <div
                className="w-full h-full rounded flex items-center justify-center transition-colors"
                style={{
                  background: emailOptIn ? "var(--color-lime)" : "transparent",
                  border: emailOptIn
                    ? "1px solid var(--color-lime)"
                    : "0.5px solid var(--color-border-default)",
                }}
                onClick={() => setEmailOptIn(!emailOptIn)}
              >
                {emailOptIn && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#0A0A0A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-small leading-snug">
              Beritahu saya saat ada fitur baru atau update penting
            </span>
          </label>

          {/* CTA */}
          <button
            id="email-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
            style={{ justifyContent: "center" }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Gratis
              </>
            )}
          </button>
        </form>

        {/* Privacy note */}
        <p
          className="text-center mt-4 text-small"
          style={{ color: "var(--text-tertiary)" }}
        >
          Tidak ada kartu kredit. Tidak akan pernah spam.
        </p>
      </div>
    </div>
  );
}
