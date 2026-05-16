"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { revalidatePath } from "next/cache";

// ---- Tipos Frontend ----
export interface UsuarioFrontend {
  id: string;
  nombre_completo: string;
  email: string | null;
  estado: string | null;
  canal_origen: string | null;
  timestamp_registro: string;
}

// ---- Tipos Backend ----
interface BackendUsuario {
  id_usuario: string;
  id_tenant: string;
  nombre_completo: string;
  email: string | null;
  estado: string | null;
  canal_origen: string | null;
  timestamp_registro: string;
}

function mapBackendToFrontend(u: BackendUsuario): UsuarioFrontend {
  return {
    id: u.id_usuario,
    nombre_completo: u.nombre_completo,
    email: u.email,
    estado: u.estado,
    canal_origen: u.canal_origen,
    timestamp_registro: u.timestamp_registro,
  };
}

// ---- Server Actions ----

export async function listUsuarios(estado?: string): Promise<UsuarioFrontend[]> {
  const data = await apiGet<BackendUsuario[]>("/usuarios/", { estado });
  return data.map(mapBackendToFrontend);
}

export async function createUsuario(data: { nombre_completo: string; email?: string; password?: string; estado?: string; canal_origen?: string }) {
  const result = await apiPost<BackendUsuario>("/usuarios/", data);
  revalidatePath("/usuarios");
  return mapBackendToFrontend(result);
}

export async function updateUsuario(id: string, data: { nombre_completo?: string; email?: string; estado?: string; canal_origen?: string }) {
  const result = await apiPut<BackendUsuario>(`/usuarios/${id}`, data);
  revalidatePath("/usuarios");
  return mapBackendToFrontend(result);
}

export async function deleteUsuario(id: string) {
  await apiDelete(`/usuarios/${id}`);
  revalidatePath("/usuarios");
}
