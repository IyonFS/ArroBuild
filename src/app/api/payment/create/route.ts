import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import {
  getMidtransConfigHint,
  getMidtransMode,
  isMidtransConfigured,
  isClientKeyValid,
  tierIdToSubscriptionTier,
} from "@/lib/midtrans";
import { getPaidTier, PAID_TIER_IDS } from "@/lib/pricing";
import { PaymentService } from "@/lib/services/payment.service";
import { assertTierHasCapacity } from "@/lib/services/capacity.service";
import {
  tierIdFromPricingSlug,
  resolveSubscriptionPrice,
  pricingSlugFromTierId,
  type BillingMonths,
} from "@/lib/config/tiers";
import { resolveTierId } from "@/lib/services/tier.service";
import { canPurchaseTier } from "@/lib/upgrade-plans";
import type { UserPlanStatus } from "@/components/generate/types";

const BodySchema = z.object({
  tierId: z.enum(PAID_TIER_IDS as [string, ...string[]]),
  billingMonths: z.union([z.literal(1), z.literal(3), z.literal(4)]).optional(),
});

export async function POST(req: Request) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  if (!isMidtransConfigured()) {
    const hint = getMidtransConfigHint();
    return NextResponse.json(
      { error: hint ?? "Pembayaran belum dikonfigurasi dengan benar." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Paket tidak valid" }, { status: 422 });
  }

  const tier = getPaidTier(parsed.data.tierId);
  if (!tier) {
    return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  const currentTierId = await resolveTierId(profile.id);
  const currentPlan: UserPlanStatus = currentTierId
    ? (pricingSlugFromTierId(currentTierId) as UserPlanStatus)
    : "none";

  if (!canPurchaseTier(tier.id, currentPlan)) {
    return NextResponse.json(
      {
        error:
          currentPlan === tier.id
            ? "Paket ini sudah aktif. Pilih paket yang lebih tinggi untuk upgrade."
            : "Paket ini lebih rendah dari langganan kamu saat ini.",
        code: "TIER_NOT_UPGRADE",
      },
      { status: 422 }
    );
  }

  const tierId = tierIdFromPricingSlug(tier.id);
  if (!tierId) {
    return NextResponse.json({ error: "Paket tidak valid" }, { status: 422 });
  }

  try {
    await assertTierHasCapacity(tierId);
  } catch (err) {
    const capacity = (err as { capacity?: unknown }).capacity;
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Slot paket penuh. Masuk waitlist dulu.",
        code: "TIER_FULL",
        capacity,
      },
      { status: 409 }
    );
  }

  const billingMonths: BillingMonths = parsed.data.billingMonths ?? 1;
  if (billingMonths > 1 && parsed.data.tierId === "base") {
    return NextResponse.json(
      { error: "Paket multi-bulan hanya untuk Core dan Prime." },
      { status: 422 }
    );
  }

  const price = resolveSubscriptionPrice(tierId, billingMonths);
  if (!price) {
    return NextResponse.json({ error: "Kombinasi paket tidak valid." }, { status: 422 });
  }

  try {
    const { snapToken, orderId, redirectUrl } = await PaymentService.createPaymentSnap({
      userId: profile.id,
      email: profile.email,
      name: profile.name,
      tierSlug: tier.id,
      amount: price.priceIdr,
      subscriptionTier: tierIdToSubscriptionTier(tier.id),
      billingMonths,
    });

    return NextResponse.json({
      snapToken,
      orderId,
      redirectUrl,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
      isProduction: getMidtransMode() === "production",
      useRedirect: !isClientKeyValid(),
    });
  } catch (err) {
    console.error("Payment create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal membuat pembayaran" },
      { status: 500 }
    );
  }
}
