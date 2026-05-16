"use server";

import { apiGet, apiPost } from "@/lib/api";
import { revalidatePath } from "next/cache";

// Tipos del frontend
export interface MessageFrontend {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
}

export interface ConversationFrontend {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: MessageFrontend[];
}

// Tipos del backend
interface BackendMensaje {
  id_mensaje: string;
  id_conversacion: string;
  contenido: string;
  tipo: string | null;
  timestamp_envio: string;
  id_intencion: string | null;
  score_confianza: number | null;
}

interface BackendConversacion {
  id_conversacion: string;
  id_tenant: string;
  id_usuario: string;
  id_canal: string;
  timestamp_inicio: string;
  timestamp_fin: string | null;
  estado: string | null;
  contexto_sesion: Record<string, unknown> | null;
  id_agente_asignado: string | null;
}

function formatTimestamp(isoStr: string): string {
  const now = new Date();
  const date = new Date(isoStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export async function listConversations(estado?: string, id_usuario?: string): Promise<ConversationFrontend[]> {
  const data = await apiGet<BackendConversacion[]>("/conversaciones/", {
    estado,
    id_usuario,
  });

  const conversations: ConversationFrontend[] = await Promise.all(
    data.map(async (conv) => {
      let messages: BackendMensaje[] = [];
      try {
        messages = await apiGet<BackendMensaje[]>("/mensajes/", {
          conversacion_id: conv.id_conversacion,
        });
      } catch {
        // no messages yet
      }

      const msgs = messages.map((m) => ({
        id: m.id_mensaje,
        sender: (m.tipo === "bot" ? "bot" : "user") as "user" | "bot",
        content: m.contenido,
        timestamp: formatTimestamp(m.timestamp_envio),
      }));

      const lastMsg = msgs[msgs.length - 1];

      return {
        id: conv.id_conversacion,
        userName: `Usuario ${conv.id_usuario.slice(0, 8)}`,
        userAvatar: conv.id_usuario.slice(0, 2).toUpperCase(),
        lastMessage: lastMsg?.content ?? "Sin mensajes",
        timestamp: lastMsg?.timestamp ?? formatTimestamp(conv.timestamp_inicio),
        unread: conv.estado === "activa",
        messages: msgs,
      };
    })
  );

  return conversations;
}

export async function getConversationMessages(conversacionId: string): Promise<MessageFrontend[]> {
  const messages = await apiGet<BackendMensaje[]>("/mensajes/", {
    conversacion_id: conversacionId,
  });

  return messages.map((m) => ({
    id: m.id_mensaje,
    sender: (m.tipo === "bot" ? "bot" : "user") as "user" | "bot",
    content: m.contenido,
    timestamp: formatTimestamp(m.timestamp_envio),
  }));
}

export async function sendMessage(conversacionId: string, content: string) {
  const result = await apiPost<BackendMensaje>("/mensajes/", {
    id_conversacion: conversacionId,
    contenido: content,
    tipo: "usuario",
  });
  revalidatePath("/chat");
  return {
    id: result.id_mensaje,
    sender: "user" as const,
    content: result.contenido,
    timestamp: formatTimestamp(result.timestamp_envio),
  };
}

export async function createConversation(id_usuario: string, id_canal: string) {
  const result = await apiPost<BackendConversacion>("/conversaciones/", {
    id_tenant: "",
    id_usuario,
    id_canal,
    estado: "activa",
  });
  revalidatePath("/chat");
  return result;
}
