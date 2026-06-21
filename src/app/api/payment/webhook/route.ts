import { NextResponse } from "next/server";
import {
  isSuccessfulTransactionStatus,
  verifyWebhookSignature,
} from "@/lib/midtrans";
import { activateSubscriptionForOrder } from "@/lib/payment/activate-subscription";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = payload.order_id as string | undefined;
  const transactionStatus = payload.transaction_status as string | undefined;
  const statusCode = payload.status_code as string | undefined;
  const grossAmount = payload.gross_amount as string | undefined;
  const signatureKey = payload.signature_key as string | undefined;

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  if (signatureKey && statusCode && grossAmount) {
    const valid = verifyWebhookSignature({
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
    });
    if (!valid) {
      console.error("Midtrans webhook signature mismatch:", orderId);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (isSuccessfulTransactionStatus(transactionStatus ?? "")) {
    await activateSubscriptionForOrder(orderId);
  } else if (
    transactionStatus === "deny" ||
    transactionStatus === "cancel" ||
    transactionStatus === "expire"
  ) {
    await prisma.payment.update({
      where: { orderId },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ ok: true });
}
