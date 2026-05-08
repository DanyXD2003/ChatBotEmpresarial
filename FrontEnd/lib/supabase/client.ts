import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/config";

export function createClient() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en las variables de entorno."
    );
  }

  return createBrowserClient(env.url, env.publishableKey);
}
