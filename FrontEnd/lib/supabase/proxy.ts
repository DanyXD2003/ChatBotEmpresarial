import { NextResponse, type NextRequest } from "next/server";
import { canAccessPath, getDefaultRoute, isProtectedRoute, normalizeRole } from "@/lib/auth";

/**
 * Decodifica la cabecera y el payload de un JWT sin verificar la firma.
 * Esto es suficiente para el middleware de rutas del frontend; la
 * verificación real se hace en el backend.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // El payload es la segunda parte (index 1)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));

    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;

    return decoded;
  } catch {
    return null;
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextPath !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === "/login";

  // Leer el JWT custom de la cookie
  const authToken = request.cookies.get("auth_token")?.value;

  if (!authToken) {
    return isProtectedRoute(pathname) ? redirectToLogin(request) : NextResponse.next({ request });
  }

  // Decodificar el JWT para extraer claims
  const claims = decodeJwtPayload(authToken);

  if (!claims) {
    // Token inválido o expirado
    const response = NextResponse.next({ request });
    response.cookies.delete("auth_token");
    return isProtectedRoute(pathname) ? redirectToLogin(request) : response;
  }

  const role = normalizeRole(claims.role);

  if (isLoginRoute) {
    return NextResponse.redirect(new URL(getDefaultRoute(role), request.url));
  }

  if (isProtectedRoute(pathname) && !canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL(getDefaultRoute(role), request.url));
  }

  return NextResponse.next({ request });
}
