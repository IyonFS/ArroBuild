import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkIpRateLimit } from "@/lib/rate-limit";

const PROTECTED_PREFIXES = [
  "/generate",
  "/dashboard",
  "/project",
  "/api/generate",
  "/api/export",
  "/api/interview",
  "/api/project",
  "/api/payment",
  "/api/user",
  "/api/whatsapp",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isLocalDevRequest(ip: string): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  return (
    ip === "unknown" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  );
}

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
  if (pathname.startsWith("/api/") && !isLocalDevRequest(ip)) {
    const ipAllowed = await checkIpRateLimit(ip);
    if (!ipAllowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  }

  if (
    process.env.RATE_LIMIT_REQUIRED === "true" &&
    !process.env.UPSTASH_REDIS_REST_URL
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
