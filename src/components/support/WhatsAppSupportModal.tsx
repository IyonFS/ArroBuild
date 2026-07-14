"use client";

import { useEffect } from "react";
import WhatsAppSupportCard, {
  type WhatsappQuotaDisplay,
} from "./WhatsAppSupportCard";
import type { UserPlanStatus } from "@/components/generate/types";

interface Props {
  open: boolean;
  onClose: () => void;
  tier: UserPlanStatus;
  quota: WhatsappQuotaDisplay | null;
  userEmail?: string;
  projectId?: string;
  projectLabel?: string;
  onQuotaChange?: (quota: WhatsappQuotaDisplay | null) => void;
}

export default function WhatsAppSupportModal({
  open,
  onClose,
  tier,
  quota,
  userEmail,
  projectId,
  projectLabel,
  onQuotaChange,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.72)" }}
        onClick={onClose}
        aria-label="Tutup"
      />
      <div
        className="relative w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto"
        style={{
          borderRadius: "16px 16px 0 0",
          background: "#111",
          border: "0.5px solid rgba(255,255,255,0.12)",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p id="wa-modal-title" className="text-sm font-semibold text-white">
            Hubungi founder
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.6)",
            }}
            aria-label="Tutup"
          >
            ×
          </button>
        </div>
        <div className="px-4 pb-5">
          <WhatsAppSupportCard
            variant="embedded"
            tier={tier}
            quota={quota}
            userEmail={userEmail}
            projectId={projectId}
            projectLabel={projectLabel}
            onSuccess={onQuotaChange}
          />
        </div>
      </div>
    </div>
  );
}
