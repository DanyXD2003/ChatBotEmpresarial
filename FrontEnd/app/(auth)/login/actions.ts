"use server";

import { redirect } from "next/navigation";
import { getDefaultRoute, getUserRole, sanitizeRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export type LoginFormState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  if (!hasSupabaseEnv()) {
    return {
      error:
        "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para habilitar el inicio de sesión.",
    };
  }

  const email = formData.get("email");
  const password = formData.get("password");
  const next = formData.get("next");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Completa el correo y la contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: "No se pudo iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = getUserRole(user);
  const targetPath = sanitizeRedirectPath(typeof next === "string" ? next : null, role);

  redirect(targetPath || getDefaultRoute(role));
}

export async function logoutAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
