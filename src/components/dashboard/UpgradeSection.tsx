"use client";

import UpgradePlanPicker from "@/components/dashboard/UpgradePlanPicker";
import type { UserPlanStatus } from "@/components/generate/types";

interface UpgradeSectionProps {
  currentTier: UserPlanStatus;
  highlightPlan?: string | null;
  onPaymentSuccess: () => void;
}

/** Compact upgrade teaser on dashboard overview — full flow at /dashboard/upgrade */
export default function UpgradeSection(props: UpgradeSectionProps) {
  return <UpgradePlanPicker {...props} variant="compact" />;
}
