import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkIpRateLimit, isRedisConfigured } from "@/lib/rate-limit";
import { isLocalDevelopmentIp, isProtectedPath } from "@/lib/security/request-policy";

function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((c) => c.name.includes("auth-token") || c.name.includes("sb-"));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // IP rate limit hanya untuk API — halaman UI tidak ikut terhitung
  if (pathname.startsWith("/api/") && !isLocalDevelopmentIp(ip, process.env.NODE_ENV)) {
    const ipAllowed = await checkIpRateLimit(ip);
    if (!ipAllowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  }

  if (
    process.env.RATE_LIMIT_REQUIRED === "true" &&
    !isRedisConfigured()
  ) {
    return NextResponse.json(
      { error: "Rate limiting tidak tersedia" },
      { status: 503 }
    );
  }

  const sessionResponse = isProtectedPath(pathname) || hasAuthCookie(request)
    ? await updateSession(request)
    : NextResponse.next({ request });

  if (isProtectedPath(pathname)) {
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.includes("auth-token") || c.name.includes("sb-"));
    // updateSession handles redirect for protected routes via supabase middleware
    if (!hasSession && pathname.startsWith("/api/")) {
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
