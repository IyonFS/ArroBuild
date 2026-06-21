import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  getTransactionStatus,
  isSuccessfulTransactionStatus,
} from "@/lib/midtrans";
import { activateSubscriptionForOrder } from "@/lib/payment/activate-subscription";

const BodySchema = z.object({
  orderId: z.string().min(1),
});

/** Verify payment with Midtrans API — used after Snap onSuccess (localhost has no webhook). */
export async function POST(req: Request) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "orderId wajib" }, { status: 422 });
  }

  const { orderId } = parsed.data;

  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment || payment.userId !== profile.id) {
    return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
  }

  if (payment.status === "PAID") {
    return NextResponse.json({ ok: true, status: "paid" });
  }

  const tx = await getTransactionStatus(orderId);
  if (!tx) {
    return NextResponse.json(
      { error: "Status transaksi belum tersedia. Coba lagi dalam beberapa detik." },
      { status: 202 }
    );
  }

  if (!isSuccessfulTransactionStatus(tx.transaction_status)) {
    return NextResponse.json({
      ok: false,
      status: tx.transaction_status,
      message: "Pembayaran belum selesai atau masih pending.",
    });
  }

  await activateSubscriptionForOrder(orderId);

  return NextResponse.json({ ok: true, status: "paid", tier: payment.tier });
}
