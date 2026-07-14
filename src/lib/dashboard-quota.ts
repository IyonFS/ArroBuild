/** Derive quota display from tier limits + usage (always consistent after upgrade). */
export function deriveQuotaDisplay(data: {
  monthlyProjectCount?: number;
  monthlyProjectLimit?: number;
  monthlyProjectRemaining?: number;
  projectLimit?: number;
  dailyProjectCount?: number;
  dailyProjectLimit?: number;
  dailyProjectRemaining?: number;
}) {
  const monthlyUsed = data.monthlyProjectCount ?? 0;
  const monthlyLimit = data.monthlyProjectLimit ?? data.projectLimit ?? 0;
  const dailyUsed = data.dailyProjectCount ?? 0;
  const dailyLimit = data.dailyProjectLimit ?? 0;

  const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
  const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);

  return {
    monthlyUsed,
    monthlyLimit,
    monthlyRemaining,
    dailyUsed,
    dailyLimit,
    dailyRemaining,
  };
}
