import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getRoleLabel, getInitials, normalizeRole, type AppRole } from "@/lib/auth";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;
    return decoded;
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) {
    redirect("/login");
  }

  const claims = decodeJwtPayload(authToken);

  if (!claims) {
    redirect("/login");
  }

  const role = normalizeRole(claims.role) as AppRole;
  const email = (claims.email as string) ?? "";
  const nombreCompleto = (claims.nombre_completo as string) ?? email.split("@")[0] ?? "Usuario";
  const initials = getInitials(nombreCompleto);

  const appUser = {
    email,
    name: nombreCompleto,
    initials,
    role,
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={appUser} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
