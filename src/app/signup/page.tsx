"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import AuthLayout from "@/components/layout/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";

function SignupContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  return (
    <AuthLayout>
      <AuthForm mode="signup" plan={plan} />
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <AppShell tone="app" showFooter={false}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-body">Memuat...</p>
          </div>
        }
      >
        <SignupContent />
      </Suspense>
    </AppShell>
  );
}
