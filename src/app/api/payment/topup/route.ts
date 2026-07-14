import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import {
  getMidtransConfigHint,
  getMidtransMode,
  isMidtransConfigured,
  tierIdToSubscriptionTier,
} from "@/lib/midtrans";
import { PaymentService } from "@/lib/services/payment.service";
import { CREDIT_TOPUP_PACKS } from "@/lib/config/tiers";

const BodySchema = z.object({
  packId: z.enum(CREDIT_TOPUP_PACKS.map((p) => p.id) as [string, ...string[]]),
});

export async function POST(req: Request) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  if (!profile.tierId) {
    return NextResponse.json(
      { error: "Paket berlangganan aktif diperlukan untuk top-up kredit." },
      { status: 402 }
    );
  }

  if (!isMidtransConfigured()) {
    return NextResponse.json(
      { error: getMidtransConfigHint() ?? "Pembayaran belum dikonfigurasi." },
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
    return NextResponse.json({ error: "Paket top-up tidak valid" }, { status: 422 });
  }

  const subscriptionTier = tierIdToSubscriptionTier(
    profile.tierId === "PRO_MAX"
      ? "pro_max"
      : profile.tierId === "PRO"
        ? "pro"
        : "starter"
  );

  try {
    const result = await PaymentService.createTopupSnap({
      userId: profile.id,
      email: profile.email,
      name: profile.name,
      packId: parsed.data.packId,
      subscriptionTier,
    });

    return NextResponse.json({
      snapToken: result.snapToken,
      orderId: result.orderId,
      redirectUrl: result.redirectUrl,
      credits: result.credits,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
      isProduction: getMidtransMode() === "production",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat pembayaran top-up";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ packs: CREDIT_TOPUP_PACKS });
}
