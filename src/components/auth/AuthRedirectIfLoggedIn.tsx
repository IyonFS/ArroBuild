"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeAuthRedirect, getPostAuthRedirect } from "@/lib/auth-redirect";

export default function AuthRedirectIfLoggedIn() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const next = searchParams.get("next");
      const plan = searchParams.get("plan");
      router.replace(
        next ? sanitizeAuthRedirect(next) : getPostAuthRedirect(plan)
      );
    }).catch(() => {});
  }, [router, searchParams]);

  return null;
}
