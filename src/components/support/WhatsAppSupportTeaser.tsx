"use client";

import Link from "next/link";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import type { UserPlanStatus } from "@/components/generate/types";
import type { WhatsappQuotaDisplay } from "./WhatsAppSupportCard";

interface Props {
  tier: UserPlanStatus;
  quota: WhatsappQuotaDisplay | null;
}

export default function WhatsAppSupportTeaser({ tier, quota }: Props) {
  const hasAccess = tier === "core" || tier === "prime";

  if (!hasAccess) {
    return (
      <Link
        href="/dashboard/upgrade"
        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-8 transition-colors hover:bg-[var(--app-bg-hover)]"
        style={{
          background: "var(--app-bg-elevated)",
          border: "0.5px solid var(--app-border-default)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-9 h-9 rounded-lg inline-flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}
          >
            <WhatsAppIcon size={18} />
          </span>
          <p className="font-mono text-[13px] truncate" style={{ color: "var(--app-text-secondary)" }}>
            Chat founder via WhatsApp — tersedia di paket Core
          </p>
        </div>
        <span className="font-mono text-[12px] font-semibold flex-shrink-0" style={{ color: "var(--app-amber)" }}>
          Upgrade →
        </span>
      </Link>
    );
  }

  const remaining = quota?.remaining ?? quota?.limit ?? 0;
  const limit = quota?.limit ?? 0;

  return (
    <Link
      href="/dashboard/support"
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-8 transition-colors hover:bg-[rgba(37,211,102,0.08)]"
      style={{
        background: "rgba(37,211,102,0.05)",
        border: "0.5px solid rgba(37,211,102,0.22)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="w-9 h-9 rounded-lg inline-flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(37,211,102,0.15)", color: "#25D366" }}
        >
          <WhatsAppIcon size={18} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[13px] font-semibold truncate" style={{ color: "var(--app-text-primary)" }}>
            Butuh bantuan founder?
          </p>
          <p className="font-mono text-[12px] truncate" style={{ color: "var(--app-text-secondary)", opacity: 0.7 }}>
            Chat WhatsApp · {remaining} dari {limit} tersisa bulan ini
          </p>
        </div>
      </div>
      <span className="font-mono text-[12px] font-semibold flex-shrink-0" style={{ color: "#25D366" }}>
        Buka →
      </span>
    </Link>
  );
}
