from typing import Optional

import httpx

from .crud_base import CrudBaseService
from .supabase_client import get_supabase_client


class ConversacionService(CrudBaseService):
    """Servicio CRUD para la tabla 'conversacion'.

    Al obtener una conversación, incluye los mensajes anidados.
    """

    def __init__(self):
        super().__init__("conversacion", pk_field="id_conversacion")

    def list_all(
        self,
        tenant_id: str,
        estado: str | None = None,
        id_usuario: str | None = None,
    ) -> list[dict]:
        """Lista conversaciones con filtros opcionales."""
        params = {}
        if estado:
            params["estado"] = f"eq.{estado}"
        if id_usuario:
            params["id_usuario"] = f"eq.{id_usuario}"
        return super().list_all(tenant_id, query_params=params)

    def get_by_id(self, tenant_id: str, record_id: str) -> Optional[dict]:
        """Obtiene una conversación con sus mensajes anidados."""
        conversacion = super().get_by_id(tenant_id, record_id)
        if not conversacion:
            return None

        # Obtener mensajes de la conversación
        cfg = get_supabase_client()
        url = f"{cfg['url']}/rest/v1/mensaje?id_conversacion=eq.{record_id}&order=timestamp_envio.asc"
        headers = cfg["headers"]

        with httpx.Client() as client:
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            mensajes = resp.json()

        conversacion["mensajes"] = mensajes
        return conversacion

    def close(self, tenant_id: str, record_id: str) -> Optional[dict]:
        """Cierra una conversación (estado = 'cerrada' y timestamp_fin)."""
        from datetime import datetime, timezone

        return self.update(
            tenant_id,
            record_id,
            {
                "estado": "cerrada",
                "timestamp_fin": datetime.now(timezone.utc).isoformat(),
            },
        )

    def escalate(self, tenant_id: str, record_id: str) -> Optional[dict]:
        """Escala una conversación (estado = 'escalada')."""
        return self.update(tenant_id, record_id, {"estado": "escalada"})
