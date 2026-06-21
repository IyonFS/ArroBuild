"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/marketing/icons";
import { PRICING_TIERS } from "@/lib/pricing";
import {
  AUTH_NEXT_COOKIE,
  getPostAuthRedirect,
} from "@/lib/auth-redirect";
import {
  translateAuthError,
  validateEmail,
  validatePassword,
} from "@/lib/auth-errors";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
  plan?: string | null;
  error?: string | null;
}

const COPY = {
  login: {
    title: "Masuk",
    subtitle: "Pakai email atau Google — project kamu tersimpan di dashboard.",
    submit: "Masuk",
    google: "Lanjutkan dengan Google",
    altPrompt: "Belum punya akun?",
    altLink: "Daftar gratis",
    altHref: "/signup",
  },
  signup: {
    title: "Buat akun",
    subtitle: "Daftar dengan email atau Google. Gratis untuk mulai.",
    submit: "Buat akun",
    google: "Daftar dengan Google",
    altPrompt: "Sudah punya akun?",
    altLink: "Masuk",
    altHref: "/login",
  },
};

export default function AuthForm({ mode, plan, error }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState<"form" | "google" | null>(null);
  const [authError, setAuthError] = useState(error ?? "");
  const [infoMsg, setInfoMsg] = useState("");
  const copy = COPY[mode];
  const selectedPlan = PRICING_TIERS.find((t) => t.id === plan);
  const isBusy = loading !== null;

  function setRedirectCookie() {
    const next = getPostAuthRedirect(plan);
    document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=600; SameSite=Lax`;
  }

  async function handleGoogleAuth() {
    setLoading("google");
    setAuthError("");
    setInfoMsg("");
    setRedirectCookie();

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (signInError) {
      setAuthError(translateAuthError(signInError.message));
      setLoading(null);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setInfoMsg("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setAuthError(emailErr);
      return;
    }

    const passwordErr = validatePassword(password);
    if (passwordErr) {
      setAuthError(passwordErr);
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setAuthError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading("form");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback`;

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });

        if (signUpError) {
          setAuthError(translateAuthError(signUpError.message));
          return;
        }

        if (data.session) {
          await fetch("/api/user/me");
          router.push(getPostAuthRedirect(plan));
          router.refresh();
          return;
        }

        setInfoMsg(
          "Link konfirmasi dikirim ke email kamu. Setelah dikonfirmasi, kamu bisa masuk."
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setAuthError(translateAuthError(signInError.message));
        return;
      }

      await fetch("/api/user/me");

      router.push(getPostAuthRedirect(plan));
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-8">
        <h1 className="text-[1.375rem] font-medium text-white mb-2">{copy.title}</h1>
        <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {copy.subtitle}
        </p>
      </div>

      {selectedPlan && selectedPlan.id !== "free" && (
        <div className="app-panel px-4 py-3 mb-5">
          <p className="text-label mb-1">Paket dipilih</p>
          <p className="text-[14px] font-medium text-white">
            {selectedPlan.name}{" "}
            <span style={{ color: "var(--text-tertiary)" }}>
              · {selectedPlan.price}
              {selectedPlan.period}
            </span>
          </p>
        </div>
      )}

      {infoMsg && (
        <div
          className="mb-4 px-3 py-2.5 rounded-lg text-[13px] border"
          style={{
            color: "var(--success-text)",
            background: "var(--success-bg)",
            borderColor: "var(--success-border)",
          }}
        >
          {infoMsg}
        </div>
      )}

      {(authError || error) && !infoMsg && (
        <div
          className="mb-4 px-3 py-2.5 rounded-lg text-[13px] border"
          style={{
            color: "var(--danger-text)",
            background: "var(--danger-bg)",
            borderColor: "var(--danger-border)",
          }}
        >
          {authError || error}
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="auth-email" className="text-label block mb-1.5">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setAuthError("");
            }}
            placeholder="kamu@example.com"
            disabled={isBusy}
            className="input"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label htmlFor="auth-password" className="text-label">
              Password
            </label>
            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="text-[12px] underline underline-offset-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                Lupa password?
              </Link>
            )}
          </div>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setAuthError("");
            }}
            placeholder={mode === "signup" ? "Min. 8 karakter" : "Password kamu"}
            disabled={isBusy}
            className="input"
            required
            minLength={8}
          />
        </div>

        {mode === "signup" && (
          <div>
            <label htmlFor="auth-confirm" className="text-label block mb-1.5">
              Konfirmasi password
            </label>
            <input
              id="auth-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setAuthError("");
              }}
              placeholder="Ulangi password"
              disabled={isBusy}
              className="input"
              required
              minLength={8}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="btn btn-primary w-full"
        >
          {loading === "form" ? "Memproses..." : copy.submit}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
        <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          atau
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isBusy}
        className="btn btn-secondary w-full"
      >
        <GoogleIcon />
        {loading === "google" ? "Mengalihkan..." : copy.google}
      </button>

      <p
        className="text-[13px] text-center leading-relaxed mt-6"
        style={{ color: "var(--text-tertiary)" }}
      >
        {copy.altPrompt}{" "}
        <Link
          href={plan ? `${copy.altHref}?plan=${plan}` : copy.altHref}
          className="underline underline-offset-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {copy.altLink}
        </Link>
      </p>

      <p
        className="text-[12px] text-center mt-8 pt-6 border-t border-[var(--bg-border)]"
        style={{ color: "var(--text-tertiary)" }}
      >
        Atau{" "}
        <Link href="/generate" className="underline underline-offset-2" style={{ color: "var(--text-secondary)" }}>
          generate PRD gratis
        </Link>{" "}
        tanpa akun.
      </p>
    </div>
  );
}
