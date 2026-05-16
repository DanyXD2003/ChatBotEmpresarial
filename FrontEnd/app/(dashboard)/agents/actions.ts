"use server";

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { revalidatePath } from "next/cache";

// Tipos que usamos en el frontend
export interface AgentFrontend {
  id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "agente";
  status: "online" | "away" | "offline";
  conversationsToday: number;
}

// Tipos del backend
interface AgentBackend {
  id_agente: string;
  id_tenant: string;
  nombre: string;
  email: string;
  rol: string | null;
  disponible: boolean | null;
  id_usuario: string | null;
}

function mapBackendToFrontend(agent: AgentBackend): AgentFrontend {
  let status: AgentFrontend["status"] = "offline";
  if (agent.disponible === true) status = "online";
  else if (agent.disponible === false) status = "offline";
  else status = "away";

  return {
    id: agent.id_agente,
    name: agent.nombre,
    email: agent.email,
    role: (agent.rol as AgentFrontend["role"]) ?? "agente",
    status,
    conversationsToday: 0,
  };
}

export async function listAgents(rol?: string, disponible?: boolean): Promise<AgentFrontend[]> {
  const data = await apiGet<AgentBackend[]>("/agentes/", {
    rol,
    disponible: disponible !== undefined ? disponible : undefined,
  });
  return data.map(mapBackendToFrontend);
}

export async function createAgent(data: { nombre: string; email: string; rol: string }) {
  const result = await apiPost<AgentBackend>("/agentes/", data);
  revalidatePath("/agents");
  return mapBackendToFrontend(result);
}

export async function updateAgent(id: string, data: { nombre?: string; email?: string; rol?: string; disponible?: boolean | null }) {
  const result = await apiPut<AgentBackend>(`/agentes/${id}`, data);
  revalidatePath("/agents");
  return mapBackendToFrontend(result);
}

export async function deleteAgent(id: string) {
  await apiDelete(`/agentes/${id}`);
  revalidatePath("/agents");
}
