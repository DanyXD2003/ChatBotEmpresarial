import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessPath, getDefaultRoute, isProtectedRoute, normalizeRole } from "@/lib/auth";
import { getSupabaseEnv } from "@/lib/supabase/config";

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextPath !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();

  if (!env) {
    if (isProtectedRoute(request.nextUrl.pathname)) {
      return redirectToLogin(request);
    }

    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === "/login";

  if (!claims) {
    return isProtectedRoute(pathname) ? redirectToLogin(request) : response;
  }

  const role = normalizeRole(
    claims.app_metadata?.role ??
      claims.user_metadata?.role ??
      claims.app_metadata?.user_role ??
      claims.user_metadata?.user_role
  );

  if (isLoginRoute) {
    return NextResponse.redirect(new URL(getDefaultRoute(role), request.url));
  }

  if (isProtectedRoute(pathname) && !canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL(getDefaultRoute(role), request.url));
  }

  return response;
}
