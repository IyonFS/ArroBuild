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

const BodySchema = z.object({
  tierId: z.enum(PAID_TIER_IDS as [string, ...string[]]),
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

  try {
    const { snapToken, orderId, redirectUrl } = await PaymentService.createPaymentSnap({
      userId: profile.id,
      email: profile.email,
      name: profile.name,
      tierSlug: tier.id,
      amount: tier.priceAmount,
      subscriptionTier: tierIdToSubscriptionTier(tier.id),
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
