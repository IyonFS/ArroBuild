import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { syncDbUser } from "@/lib/auth";
import {
  AUTH_NEXT_COOKIE,
  sanitizeAuthRedirect,
} from "@/lib/auth-redirect";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = await cookies();

  const nextFromCookie = cookieStore.get(AUTH_NEXT_COOKIE)?.value;
  const nextFromQuery = searchParams.get("next");
  const destination = sanitizeAuthRedirect(nextFromCookie ?? nextFromQuery);

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  let response = NextResponse.redirect(`${origin}${destination}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.redirect(`${origin}${destination}`);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    const fail = NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    fail.cookies.delete(AUTH_NEXT_COOKIE);
    return fail;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await syncDbUser(user);
    } catch (err) {
      console.error("syncDbUser failed:", err);
    }
  }

  response.cookies.delete(AUTH_NEXT_COOKIE);
  return response;
}
