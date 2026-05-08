import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { toAppUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={toAppUser(user)} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
