"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { revalidatePath } from "next/cache";

// ---- Tipos Frontend ----
export interface ReporteFrontend {
  id: string;
  tipo: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  data: Record<string, unknown> | null;
  timestamp_creacion: string;
}

// ---- Tipos Backend ----
interface BackendReporte {
  id_reporte: string;
  id_tenant: string;
  tipo: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  data: Record<string, unknown> | null;
  timestamp_creacion: string;
}

function mapBackendToFrontend(r: BackendReporte): ReporteFrontend {
  return {
    id: r.id_reporte,
    tipo: r.tipo,
    fecha_inicio: r.fecha_inicio,
    fecha_fin: r.fecha_fin,
    data: r.data,
    timestamp_creacion: r.timestamp_creacion,
  };
}

// ---- Server Actions ----

export async function listReportes(
  tipo?: string,
  fecha_inicio?: string,
  fecha_fin?: string
): Promise<ReporteFrontend[]> {
  const data = await apiGet<BackendReporte[]>("/reportes/", {
    tipo,
    fecha_inicio,
    fecha_fin,
  });
  return data.map(mapBackendToFrontend);
}

export async function createReporte(data: {
  tipo: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  data?: Record<string, unknown>;
}) {
  const result = await apiPost<BackendReporte>("/reportes/", data);
  revalidatePath("/reports");
  return mapBackendToFrontend(result);
}

export async function updateReporte(
  id: string,
  data: { tipo?: string; data?: Record<string, unknown> }
) {
  const result = await apiPut<BackendReporte>(`/reportes/${id}`, data);
  revalidatePath("/reports");
  return mapBackendToFrontend(result);
}

export async function deleteReporte(id: string) {
  await apiDelete(`/reportes/${id}`);
  revalidatePath("/reports");
}
