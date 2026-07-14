import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/payment.service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 120;

function authorize(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const refreshed = await PaymentService.processMonthlyCreditRenewals();
    logger.info("cron_monthly_credit_renewal", { refreshed });
    return NextResponse.json({ ok: true, refreshed });
  } catch (error) {
    logger.error("cron_monthly_credit_renewal_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Gagal memproses renewal kredit" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
