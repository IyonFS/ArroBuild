"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useHydrated } from "./use-hydrated";

export interface SupabaseUserSummary {
  email: string;
  name?: string;
  avatarUrl?: string;
}

export function useSupabaseUser() {
  const [user, setUser] = useState<SupabaseUserSummary | null>(null);
  const mounted = useHydrated();

  useEffect(() => {
    try {
      const supabase = createClient();

      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user;
        if (u) {
          const meta = u.user_metadata ?? {};
          setUser({
            email: u.email ?? "",
            name:
              (meta.full_name as string | undefined) ??
              (meta.name as string | undefined),
            avatarUrl: meta.avatar_url as string | undefined,
          });
        }
      }).catch(() => {});

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user;
        if (!u) {
          setUser(null);
          return;
        }
        const meta = u.user_metadata ?? {};
        setUser({
          email: u.email ?? "",
          name:
            (meta.full_name as string | undefined) ??
            (meta.name as string | undefined),
          avatarUrl: meta.avatar_url as string | undefined,
        });
      });

      return () => subscription.unsubscribe();
    } catch {
      return undefined;
    }
  }, []);

  return { user, isLoggedIn: Boolean(user), mounted };
}
