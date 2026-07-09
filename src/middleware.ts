import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkIpRateLimit } from "@/lib/rate-limit";

const PROTECTED_PREFIXES = ["/generate", "/api/generate", "/api/export", "/api/payment/create"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const ipAllowed = await checkIpRateLimit(ip);
  if (!ipAllowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const sessionResponse = await updateSession(request);

  if (isProtectedPath(request.nextUrl.pathname)) {
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.includes("auth-token") || c.name.includes("sb-"));
    // updateSession handles redirect for protected routes via supabase middleware
    if (!hasSession && request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
    }
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
