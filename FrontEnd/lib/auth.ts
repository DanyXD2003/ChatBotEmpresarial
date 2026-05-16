import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "supervisor" | "agente";

export type AppUser = {
  email: string;
  name: string;
  initials: string;
  role: AppRole;
};

const protectedRoutes = ["/chat", "/knowledge", "/reports", "/agents", "/canales", "/usuarios"] as const;

const roleRouteAccess: Record<AppRole, string[]> = {
  admin: [...protectedRoutes],
  supervisor: ["/chat", "/knowledge", "/reports", "/canales", "/usuarios"],
  agente: ["/chat", "/knowledge"],
};

const defaultRouteByRole: Record<AppRole, string> = {
  admin: "/agents",
  supervisor: "/reports",
  agente: "/chat",
};

function getRoleCandidate(value: unknown): string | null {
  return typeof value === "string" ? value.toLowerCase() : null;
}

export function normalizeRole(value: unknown): AppRole {
  const candidate = getRoleCandidate(value);

  if (candidate === "admin" || candidate === "supervisor" || candidate === "agente") {
    return candidate;
  }

  return "agente";
}

export function getUserRole(user: Pick<User, "app_metadata" | "user_metadata"> | null | undefined): AppRole {
  if (!user) {
    return "agente";
  }

  return normalizeRole(
    user.app_metadata?.role ??
      user.user_metadata?.role ??
      user.app_metadata?.user_role ??
      user.user_metadata?.user_role
  );
}

export function getRoleLabel(role: AppRole): string {
  const labels: Record<AppRole, string> = {
    admin: "Administrador",
    supervisor: "Supervisor",
    agente: "Agente",
  };

  return labels[role];
}

export function getDefaultRoute(role: AppRole): string {
  return defaultRouteByRole[role];
}

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  return roleRouteAccess[role].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function sanitizeRedirectPath(pathname: string | null | undefined, role: AppRole): string {
  if (!pathname || !pathname.startsWith("/")) {
    return getDefaultRoute(role);
  }

  return canAccessPath(role, pathname) ? pathname : getDefaultRoute(role);
}

export function getUserDisplayName(user: User): string {
  const metadataName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.user_metadata?.display_name;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  return user.email?.split("@")[0] ?? "Usuario";
}

export function getInitials(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "US";
}

export function toAppUser(user: User): AppUser {
  const name = getUserDisplayName(user);

  return {
    email: user.email ?? "",
    name,
    initials: getInitials(name),
    role: getUserRole(user),
  };
}
