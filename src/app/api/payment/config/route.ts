import { NextResponse } from "next/server";
import {
  getMidtransConfigHint,
  getMidtransMode,
  isMidtransConfigured,
  isClientKeyValid,
  getMidtransClientKey,
} from "@/lib/midtrans";

export async function GET() {
  const hint = getMidtransConfigHint();
  return NextResponse.json({
    configured: isMidtransConfigured(),
    clientKeyValid: isClientKeyValid(),
    mode: getMidtransMode(),
    clientKey: isClientKeyValid() ? getMidtransClientKey() : null,
    hint: getMidtransConfigHint(),
  });
}
