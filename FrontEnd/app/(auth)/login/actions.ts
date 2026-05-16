"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDefaultRoute, sanitizeRedirectPath, type AppRole } from "@/lib/auth";

export type LoginFormState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = formData.get("next");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Completa el correo y la contraseña." };
  }

  // 1. Autenticar contra el backend (FastAPI)
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

  let authResponse: Response;
  try {
    authResponse = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return {
      error: "No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.",
    };
  }

  if (!authResponse.ok) {
    // Intentar obtener el mensaje de error real del backend
    let detail = "No se pudo iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.";
    try {
      const errorBody = await authResponse.json();
      if (errorBody?.detail) {
        detail = errorBody.detail;
      }
    } catch {
      // Si no se puede parsear el body, usar el mensaje genérico
    }

    return { error: detail };
  }

  const data = await authResponse.json();
  const { access_token, user } = data;

  // 2. Guardar el JWT en una cookie (expira en 8h, igual que el token)
  const cookieStore = await cookies();
  cookieStore.set("auth_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  // 3. Redirigir según el rol del usuario
  const role = (user?.role ?? "agente") as AppRole;
  const targetPath = sanitizeRedirectPath(typeof next === "string" ? next : null, role);

  redirect(targetPath || getDefaultRoute(role));
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");

  redirect("/login");
}
