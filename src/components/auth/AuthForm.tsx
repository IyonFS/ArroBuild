"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
    title: "Masuk ke ArroBuild",
    subtitle: "Lanjut generate atau lihat project yang udah kamu compile.",
    submit: "Masuk",
    google: "Lanjut dengan Google",
    altPrompt: "Belum punya akun?",
    altLink: "Daftar",
    altHref: "/signup",
  },
  signup: {
    title: "Buat akun baru",
    subtitle: "Learn Hub & Mini Tools tetap gratis. Akun untuk simpan project dan generate dokumen.",
    submit: "Buat akun",
    google: "Lanjut dengan Google",
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
          options: { emailRedirectTo: redirectTo },
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
    <motion.div
      className="auth-app w-full blueprint-panel rounded-xl overflow-hidden"
      style={{
        background: "var(--app-bg-elevated)",
        border: "0.5px solid var(--app-border-default)",
        clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="px-6 py-7 sm:px-7 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <h1
              className="font-unbounded font-extrabold text-[22px] mb-2"
              style={{ color: "var(--app-text-primary)", letterSpacing: "-0.02em" }}
            >
              {copy.title}
            </h1>
            <p
              className="font-mono text-[13px] leading-relaxed mb-5"
              style={{ color: "var(--app-text-secondary)" }}
            >
              {copy.subtitle}
            </p>
            <p className="font-mono text-[12px] mb-6" style={{ color: "var(--app-text-tertiary)" }}>
              {copy.altPrompt}{" "}
              <Link
                href={plan ? `${copy.altHref}?plan=${plan}` : copy.altHref}
                className="underline underline-offset-2"
                style={{ color: "var(--app-sky)" }}
              >
                {copy.altLink}
              </Link>
            </p>
          </motion.div>
        </AnimatePresence>

        {selectedPlan && (
          <div
            className="px-4 py-3 mb-5 rounded-lg"
            style={{
              background: "var(--app-bg-hover)",
              border: "0.5px solid var(--app-border-default)",
            }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--app-text-tertiary)" }}>
              Paket dipilih
            </p>
            <p className="font-mono text-[14px] font-semibold" style={{ color: "var(--app-text-primary)" }}>
              {selectedPlan.name}{" "}
              <span style={{ color: "var(--app-text-tertiary)" }}>
                · {selectedPlan.price}
                {selectedPlan.period}
              </span>
            </p>
          </div>
        )}

        {infoMsg && (
          <div
            className="mb-4 px-3 py-2.5 rounded-lg font-mono text-[13px]"
            style={{
              color: "#22C55E",
              background: "rgba(34,197,94,0.1)",
              border: "0.5px solid rgba(34,197,94,0.25)",
            }}
          >
            {infoMsg}
          </div>
        )}

        {(authError || error) && !infoMsg && (
          <div
            className="mb-4 px-3 py-2.5 rounded-lg font-mono text-[13px]"
            style={{
              color: "#EF4444",
              background: "rgba(239,68,68,0.1)",
              border: "0.5px solid rgba(239,68,68,0.25)",
            }}
          >
            {authError || error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="auth-email" className="font-mono text-[12px] font-semibold block mb-1.5" style={{ color: "var(--app-text-secondary)" }}>
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
              disabled={isBusy}
              className="w-full px-4 py-3 rounded-lg font-mono text-[13px] outline-none transition-shadow"
              style={{
                background: "var(--app-bg-base)",
                border: "0.5px solid var(--app-border-default)",
                color: "var(--app-text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--app-amber)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,176,32,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--app-border-default)";
                e.currentTarget.style.boxShadow = "none";
              }}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label htmlFor="auth-password" className="font-mono text-[12px] font-semibold" style={{ color: "var(--app-text-secondary)" }}>
                Password
              </label>
              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="font-mono text-[11px] underline underline-offset-2"
                  style={{ color: "var(--app-text-tertiary)" }}
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
              placeholder={mode === "signup" ? "Min. 8 karakter" : undefined}
              disabled={isBusy}
              className="w-full px-4 py-3 rounded-lg font-mono text-[13px] outline-none transition-shadow"
              style={{
                background: "var(--app-bg-base)",
                border: "0.5px solid var(--app-border-default)",
                color: "var(--app-text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--app-amber)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,176,32,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--app-border-default)";
                e.currentTarget.style.boxShadow = "none";
              }}
              required
              minLength={8}
            />
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="auth-confirm" className="font-mono text-[12px] font-semibold block mb-1.5" style={{ color: "var(--app-text-secondary)" }}>
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
                disabled={isBusy}
                className="w-full px-4 py-3 rounded-lg font-mono text-[13px] outline-none transition-shadow"
                style={{
                  background: "var(--app-bg-base)",
                  border: "0.5px solid var(--app-border-default)",
                  color: "var(--app-text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--app-amber)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,176,32,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--app-border-default)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                required
                minLength={8}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full py-3.5 rounded-lg font-mono text-[14px] font-bold transition-opacity disabled:opacity-50"
            style={{ background: "var(--app-amber)", color: "#0D1321" }}
          >
            {loading === "form" ? "Memproses..." : copy.submit}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "var(--app-border-default)" }} />
          <span className="font-mono text-[11px]" style={{ color: "var(--app-text-tertiary)" }}>
            atau
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--app-border-default)" }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isBusy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-mono text-[13px] font-semibold transition-colors disabled:opacity-50"
          style={{
            background: "transparent",
            border: "0.5px solid var(--app-border-default)",
            color: "var(--app-text-primary)",
          }}
        >
          <GoogleIcon />
          {loading === "google" ? "Mengalihkan..." : copy.google}
        </button>

        {mode === "signup" && (
          <p
            className="font-mono text-[12px] text-center leading-relaxed mt-6"
            style={{ color: "var(--app-text-tertiary)" }}
          >
            Dengan daftar, kamu setuju{" "}
            <Link href="/terms" className="underline underline-offset-2" style={{ color: "var(--app-amber)" }}>
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link href="/privacy" className="underline underline-offset-2" style={{ color: "var(--app-amber)" }}>
              Kebijakan Privasi
            </Link>
          </p>
        )}
      </div>
    </motion.div>
  );
}
