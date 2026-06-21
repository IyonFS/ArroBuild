import { NextRequest, NextResponse } from "next/server";

/** Legacy Supabase redirect URL — forward to the API callback handler. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  url.pathname = "/api/auth/callback";
  return NextResponse.redirect(url);
}
