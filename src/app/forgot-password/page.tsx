"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/layout/AppShell";
import { AUTH_NEXT_COOKIE } from "@/lib/auth-redirect";
import { translateAuthError, validateEmail } from "@/lib/auth-errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setLoading(true);

    document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent("/auth/reset-password")}; path=/; max-age=600; SameSite=Lax`;

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(translateAuthError(resetError.message));
      return;
    }

    setSent(true);
  }

  return (
    <AppShell tone="app" showFooter={false}>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/login"
          className="text-[13px] mb-8 inline-block"
          style={{ color: "var(--text-tertiary)" }}
        >
          ← Kembali ke masuk
        </Link>

        <h1 className="text-[1.375rem] font-medium text-white mb-2">Reset password</h1>
        <p className="text-[14px] mb-8" style={{ color: "var(--text-secondary)" }}>
          Kami kirim link reset ke email kamu.
        </p>

        {sent ? (
          <div
            className="app-panel px-4 py-4 text-[14px]"
            style={{ color: "var(--text-secondary)" }}
          >
            Jika email terdaftar, link reset sudah dikirim ke{" "}
            <span className="text-white">{email.trim()}</span>. Cek inbox dan folder spam.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div
                className="px-3 py-2.5 rounded-lg text-[13px] border"
                style={{
                  color: "var(--danger-text)",
                  background: "var(--danger-bg)",
                  borderColor: "var(--danger-border)",
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reset-email" className="text-label block mb-1.5">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@example.com"
                disabled={loading}
                className="input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Mengirim..." : "Kirim link reset"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
