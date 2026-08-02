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
      className="w-full flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="mb-10 text-center"
        >
          <h1
            className="font-bold text-[28px] sm:text-[32px] mb-3"
            style={{ color: "var(--lp-text-primary)", letterSpacing: "-0.03em", lineHeight: 1.1, fontFamily: "var(--font-unbounded), 'Unbounded', sans-serif" }}
          >
            {copy.title}
          </h1>
          <p
            className="font-mono text-[14px] leading-relaxed"
            style={{ color: "var(--lp-text-secondary)" }}
          >
            {copy.subtitle}
          </p>
          <p className="font-mono text-[13px] mt-4" style={{ color: "var(--lp-text-tertiary)" }}>
            {copy.altPrompt}{" "}
            <Link
              href={plan ? `${copy.altHref}?plan=${plan}` : copy.altHref}
              className="underline underline-offset-4 font-medium transition-colors"
              style={{ color: "var(--lp-text-primary)" }}
            >
              {copy.altLink}
            </Link>
          </p>
        </motion.div>
      </AnimatePresence>

      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-[1.5px] rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(to bottom right, rgba(255,176,32,0.8), rgba(255,176,32,0.1), transparent)",
            boxShadow: "0 8px 32px rgba(255,176,32,0.1)",
          }}
        >
          <div className="px-5 py-4 rounded-2xl flex items-center justify-between" style={{ background: "var(--app-bg-elevated)" }}>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--lp-amber)" }}>
                Paket Terpilih
              </p>
              <p className="font-unbounded text-[16px] font-bold" style={{ color: "var(--lp-text-primary)" }}>
                {selectedPlan.name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[15px] font-bold" style={{ color: "var(--lp-text-primary)" }}>
                {selectedPlan.price}
              </p>
              <p className="font-mono text-[11px]" style={{ color: "var(--lp-text-tertiary)" }}>
                {selectedPlan.period}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {infoMsg && (
        <div
          className="mb-6 px-4 py-3.5 rounded-xl font-mono text-[13px]"
          style={{
            color: "#4ADE80",
            background: "rgba(74,222,128,0.1)",
            border: "1px solid rgba(74,222,128,0.2)",
          }}
        >
          {infoMsg}
        </div>
      )}

      {(authError || error) && !infoMsg && (
        <div
          className="mb-6 px-4 py-3.5 rounded-xl font-mono text-[13px]"
          style={{
            color: "#F87171",
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.2)",
          }}
        >
          {authError || error}
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <label htmlFor="auth-email" className="font-mono text-[13px] font-medium block" style={{ color: "var(--lp-text-primary)" }}>
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
            className="w-full px-5 py-4 rounded-xl font-mono text-[14px] outline-none transition-all duration-300"
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
              color: "var(--lp-text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--lp-amber)";
              e.currentTarget.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,176,32,0.5), 0 0 20px rgba(255,176,32,0.2)";
              e.currentTarget.style.background = "rgba(255, 176, 32, 0.05)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.4)";
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="auth-password" className="font-mono text-[13px] font-medium" style={{ color: "var(--lp-text-primary)" }}>
              Password
            </label>
            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="font-mono text-[12px] transition-colors hover:text-[var(--lp-amber)]"
                style={{ color: "var(--lp-text-tertiary)" }}
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
            className="w-full px-5 py-4 rounded-xl font-mono text-[14px] outline-none transition-all duration-300"
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
              color: "var(--lp-text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--lp-amber)";
              e.currentTarget.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,176,32,0.5), 0 0 20px rgba(255,176,32,0.2)";
              e.currentTarget.style.background = "rgba(255, 176, 32, 0.05)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.4)";
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
            }}
            required
            minLength={8}
          />
        </div>

        {mode === "signup" && (
          <div className="space-y-2">
            <label htmlFor="auth-confirm" className="font-mono text-[13px] font-medium block" style={{ color: "var(--lp-text-primary)" }}>
              Konfirmasi Password
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
              className="w-full px-5 py-4 rounded-xl font-mono text-[14px] outline-none transition-all duration-300"
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
                color: "var(--lp-text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--lp-amber)";
                e.currentTarget.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,176,32,0.5), 0 0 20px rgba(255,176,32,0.2)";
                e.currentTarget.style.background = "rgba(255, 176, 32, 0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.4)";
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
              }}
              required
              minLength={8}
            />
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isBusy}
          className="group w-full py-4 mt-6 rounded-full font-mono text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden"
          style={{ 
            background: "var(--lp-amber)", 
            color: "#0D1321",
            boxShadow: "0 8px 24px rgba(255, 176, 32, 0.4)",
          }}
          whileHover={{ translateY: -4, scale: 1.02, boxShadow: "0 12px 32px rgba(255, 176, 32, 0.6)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {loading === "form" ? "Memproses..." : copy.submit}
          {loading !== "form" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </motion.button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px" style={{ background: "var(--app-border-default)" }} />
        <span className="font-mono text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--lp-text-tertiary)" }}>
          Atau
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--app-border-default)" }} />
      </div>

      <motion.button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-full font-mono text-[14px] font-semibold disabled:opacity-50"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          color: "var(--lp-text-primary)",
        }}
        whileHover={{ translateY: -4, scale: 1.02, background: "rgba(255,255,255,0.06)", borderColor: "rgba(255, 255, 255, 0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <GoogleIcon />
        {loading === "google" ? "Mengalihkan..." : copy.google}
      </motion.button>

      {mode === "signup" && (
        <p
          className="font-mono text-[12px] text-center leading-relaxed mt-8"
          style={{ color: "var(--lp-text-tertiary)" }}
        >
          Dengan mendaftar, kamu setuju dengan{" "}
          <Link href="/terms" className="underline underline-offset-2 transition-colors hover:text-[var(--lp-amber)]">
            Syarat & Ketentuan
          </Link>{" "}
          serta{" "}
          <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-[var(--lp-amber)]">
            Kebijakan Privasi
          </Link>
        </p>
      )}
    </motion.div>
  );
}
