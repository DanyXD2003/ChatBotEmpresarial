"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { revalidatePath } from "next/cache";

// ---- Tipos Frontend ----
export interface CanalFrontend {
  id: string;
  nombre: string | null;
  tipo: string | null;
  webhook_url: string | null;
  activo: boolean | null;
}

// ---- Tipos Backend ----
interface BackendCanal {
  id_canal: string;
  id_tenant: string;
  nombre: string | null;
  tipo: string | null;
  webhook_url: string | null;
  activo: boolean | null;
}

function mapBackendToFrontend(c: BackendCanal): CanalFrontend {
  return {
    id: c.id_canal,
    nombre: c.nombre,
    tipo: c.tipo,
    webhook_url: c.webhook_url,
    activo: c.activo,
  };
}

// ---- Server Actions ----

export async function listCanales(tipo?: string, activo?: boolean): Promise<CanalFrontend[]> {
  const data = await apiGet<BackendCanal[]>("/canales/", { tipo, activo });
  return data.map(mapBackendToFrontend);
}

export async function createCanal(data: { nombre?: string; tipo: string; webhook_url?: string; activo?: boolean }) {
  const result = await apiPost<BackendCanal>("/canales/", data);
  revalidatePath("/canales");
  return mapBackendToFrontend(result);
}

export async function updateCanal(id: string, data: { nombre?: string; tipo?: string; webhook_url?: string; activo?: boolean }) {
  const result = await apiPut<BackendCanal>(`/canales/${id}`, data);
  revalidatePath("/canales");
  return mapBackendToFrontend(result);
}

export async function deleteCanal(id: string) {
  await apiDelete(`/canales/${id}`);
  revalidatePath("/canales");
}
