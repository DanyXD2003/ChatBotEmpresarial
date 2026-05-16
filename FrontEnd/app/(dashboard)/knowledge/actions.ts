"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { revalidatePath } from "next/cache";

// Tipos del frontend para Intenciones
export interface IntencionFrontend {
  id: string;
  nombre: string;
  descripcion: string;
  timestamp_creacion: string;
}

// Tipos del frontend para Respuestas
export interface RespuestaFrontend {
  id: string;
  id_intencion: string | null;
  contenido: string;
  doc_origen: string | null;
  version: number | null;
  publicada: boolean;
  timestamp_creacion: string;
}

// Tipos del backend
interface BackendIntencion {
  id_intencion: string;
  id_tenant: string;
  nombre: string;
  descripcion: string | null;
  timestamp_creacion: string;
}

interface BackendRespuesta {
  id_respuesta: string;
  id_tenant: string;
  id_intencion: string | null;
  contenido: string;
  doc_origen: string | null;
  version: number | null;
  publicada: boolean | null;
  timestamp_creacion: string;
  id_creador: string | null;
}

// ---- Intenciones ----

export async function listIntenciones(): Promise<IntencionFrontend[]> {
  const data = await apiGet<BackendIntencion[]>("/intenciones/");
  return data.map((i) => ({
    id: i.id_intencion,
    nombre: i.nombre,
    descripcion: i.descripcion ?? "",
    timestamp_creacion: i.timestamp_creacion,
  }));
}

export async function createIntencion(data: { nombre: string; descripcion?: string }) {
  const result = await apiPost<BackendIntencion>("/intenciones/", data);
  revalidatePath("/knowledge");
  return {
    id: result.id_intencion,
    nombre: result.nombre,
    descripcion: result.descripcion ?? "",
    timestamp_creacion: result.timestamp_creacion,
  };
}

export async function updateIntencion(id: string, data: { nombre?: string; descripcion?: string }) {
  const result = await apiPut<BackendIntencion>(`/intenciones/${id}`, data);
  revalidatePath("/knowledge");
  return {
    id: result.id_intencion,
    nombre: result.nombre,
    descripcion: result.descripcion ?? "",
    timestamp_creacion: result.timestamp_creacion,
  };
}

export async function deleteIntencion(id: string) {
  await apiDelete(`/intenciones/${id}`);
  revalidatePath("/knowledge");
}

// ---- Respuestas ----

export async function listRespuestas(id_intencion?: string): Promise<RespuestaFrontend[]> {
  const data = await apiGet<BackendRespuesta[]>("/respuestas/", {
    id_intencion,
  });
  return data.map((r) => ({
    id: r.id_respuesta,
    id_intencion: r.id_intencion,
    contenido: r.contenido,
    doc_origen: r.doc_origen,
    version: r.version,
    publicada: r.publicada ?? false,
    timestamp_creacion: r.timestamp_creacion,
  }));
}

export async function createRespuesta(data: { id_intencion?: string; contenido: string; doc_origen?: string; publicada?: boolean }) {
  const result = await apiPost<BackendRespuesta>("/respuestas/", data);
  revalidatePath("/knowledge");
  return {
    id: result.id_respuesta,
    id_intencion: result.id_intencion,
    contenido: result.contenido,
    doc_origen: result.doc_origen,
    version: result.version,
    publicada: result.publicada ?? false,
    timestamp_creacion: result.timestamp_creacion,
  };
}

export async function updateRespuesta(id: string, data: { contenido?: string; publicada?: boolean; id_intencion?: string }) {
  const result = await apiPut<BackendRespuesta>(`/respuestas/${id}`, data);
  revalidatePath("/knowledge");
  return {
    id: result.id_respuesta,
    id_intencion: result.id_intencion,
    contenido: result.contenido,
    doc_origen: result.doc_origen,
    version: result.version,
    publicada: result.publicada ?? false,
    timestamp_creacion: result.timestamp_creacion,
  };
}

export async function deleteRespuesta(id: string) {
  await apiDelete(`/respuestas/${id}`);
  revalidatePath("/knowledge");
}
