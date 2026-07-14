"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DashboardProject } from "@/components/dashboard/ProjectList";
import type { UserPlanStatus } from "@/components/generate/types";

export interface DashboardMeData {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    subscriptionTier: string;
    subscriptionStatus: string;
    creditBalance?: number;
  };
  tier: UserPlanStatus;
  plan?: UserPlanStatus;
  projectCount: number;
  projectLimit: number;
  monthlyProjectCount?: number;
  monthlyProjectLimit?: number;
  monthlyProjectRemaining?: number;
  dailyProjectCount?: number;
  dailyProjectLimit?: number;
  dailyProjectRemaining?: number;
  creditPool?: number;
  canForkProject?: boolean;
  projects: DashboardProject[];
}

export function useDashboardMe(loginNext = "/dashboard") {
  const router = useRouter();
  const mountedRef = useRef(true);
  const [data, setData] = useState<DashboardMeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadProfileRef = useRef<
    (retryAfterRefresh?: boolean) => Promise<boolean>
  >(() => Promise.resolve(false));

  const loadProfile = useCallback(
    async (retryAfterRefresh = false): Promise<boolean> => {
      if (!mountedRef.current) return false;
      setLoadError(null);

      const res = await fetch("/api/user/me", { credentials: "include", cache: "no-store" });
      const json = (await res.json()) as DashboardMeData & {
        user?: DashboardMeData["user"] | null;
        error?: string;
      };

      if (!mountedRef.current) return false;

      if (json.user) {
        setData(json as DashboardMeData);
        return true;
      }

      if (res.status === 401 || res.status === 403) {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();

        if (!mountedRef.current) return false;

        if (authData.user && !retryAfterRefresh) {
          await supabase.auth.refreshSession();
          return loadProfileRef.current(true);
        }

        if (!authData.user) {
          router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
          return false;
        }
      }

      if (!res.ok) {
        if (mountedRef.current) {
          setLoadError(
            json.error ??
              (res.status === 429
                ? "Terlalu banyak permintaan. Tunggu sebentar lalu muat ulang."
                : "Gagal memuat profil. Coba muat ulang halaman.")
          );
        }
        return false;
      }

      router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
      return false;
    },
    [loginNext, router]
  );

  useEffect(() => {
    loadProfileRef.current = loadProfile;
  }, [loadProfile]);

  useEffect(() => {
    queueMicrotask(() => {
      loadProfile()
        .catch(() => {
          if (mountedRef.current) {
            setLoadError("Gagal memuat profil. Periksa koneksi lalu coba lagi.");
          }
        })
        .finally(() => {
          if (mountedRef.current) setLoading(false);
        });
    });
  }, [loadProfile]);

  return { data, loading, loadError, loadProfile, setLoading };
}
