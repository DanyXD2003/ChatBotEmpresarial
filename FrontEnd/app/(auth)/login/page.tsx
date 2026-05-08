import { Bot } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { hasSupabaseEnv } from "@/lib/supabase/config";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const nextPath = typeof params.next === "string" ? params.next : undefined;
  const configWarning = hasSupabaseEnv()
    ? null
    : "Faltan las variables de entorno de Supabase. Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Bot className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ChatDesk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plataforma de ChatBots empresariales
          </p>
        </div>

        <LoginForm nextPath={nextPath} configWarning={configWarning} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          El rol se toma de `app_metadata.role` o `user_metadata.role` del usuario autenticado.
        </p>
      </div>
    </div>
  );
}
