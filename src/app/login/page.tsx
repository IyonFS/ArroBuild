"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import AuthLayout from "@/components/layout/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";

function LoginContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const error =
    searchParams.get("error") === "auth_callback_failed"
      ? "Login gagal. Coba lagi, atau pastikan redirect URL Supabase sudah benar."
      : null;

  return (
    <AuthLayout>
      <AuthForm mode="login" plan={plan} error={error} />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <AppShell tone="app" showFooter={false}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-body">Memuat...</p>
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </AppShell>
  );
}
