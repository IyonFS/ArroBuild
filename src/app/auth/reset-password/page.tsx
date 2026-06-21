"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/layout/AppShell";
import { translateAuthError, validatePassword } from "@/lib/auth-errors";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const passwordErr = validatePassword(password);
    if (passwordErr) {
      setError(passwordErr);
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(translateAuthError(updateError.message));
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  if (checking) {
    return (
      <AppShell tone="app" showFooter={false}>
        <div className="max-w-md mx-auto px-4 py-20 text-center text-body">Memuat...</div>
      </AppShell>
    );
  }

  if (!hasSession) {
    return (
      <AppShell tone="app" showFooter={false}>
        <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-[1.375rem] font-medium text-white mb-2">Link tidak valid</h1>
          <p className="text-[14px] mb-6" style={{ color: "var(--text-secondary)" }}>
            Link reset sudah kadaluarsa atau sudah dipakai. Minta link baru.
          </p>
          <Link href="/forgot-password" className="btn btn-primary btn-sm">
            Minta link reset
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell tone="app" showFooter={false}>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-[1.375rem] font-medium text-white mb-2">Password baru</h1>
        <p className="text-[14px] mb-8" style={{ color: "var(--text-secondary)" }}>
          Masukkan password baru untuk akun kamu.
        </p>

        {done ? (
          <div
            className="app-panel px-4 py-4 text-[14px]"
            style={{ color: "var(--success-text)" }}
          >
            Password berhasil diubah. Mengalihkan ke dashboard...
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
              <label htmlFor="new-password" className="text-label block mb-1.5">
                Password baru
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 karakter"
                disabled={loading}
                className="input"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="text-label block mb-1.5">
                Konfirmasi password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                disabled={loading}
                className="input"
                required
                minLength={8}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Menyimpan..." : "Simpan password"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
