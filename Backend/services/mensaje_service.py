from typing import Optional

import httpx

from .crud_base import CrudBaseService
from .supabase_client import get_supabase_client


class MensajeService(CrudBaseService):
    """Servicio CRUD para la tabla 'mensaje'.

    Solo permite listar, obtener por ID y crear (no update ni delete).
    """

    def __init__(self):
        super().__init__("mensaje", pk_field="id_mensaje")

    def list_by_conversacion(
        self,
        tenant_id: str,
        conversacion_id: str,
    ) -> list[dict]:
        """Lista los mensajes de una conversación específica.

        Primero verifica que la conversación pertenezca al tenant.
        """
        # Verificar que la conversación existe y pertenece al tenant
        cfg = get_supabase_client()
        conv_url = f"{cfg['url']}/rest/v1/conversacion?id_conversacion=eq.{conversacion_id}&id_tenant=eq.{tenant_id}"
        headers = cfg["headers"]

        with httpx.Client() as client:
            resp = client.get(conv_url, headers=headers)
            resp.raise_for_status()
            if not resp.json():
                return []

        # Obtener mensajes
        url = f"{cfg['url']}/rest/v1/mensaje?id_conversacion=eq.{conversacion_id}&order=timestamp_envio.asc"
        with httpx.Client() as client:
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            return resp.json()

    def create(self, tenant_id: str, payload: dict) -> dict:
        """Crea un mensaje en una conversación verificando el tenant."""
        conversacion_id = payload.get("id_conversacion")

        # Verificar que la conversación existe y pertenece al tenant
        cfg = get_supabase_client()
        conv_url = f"{cfg['url']}/rest/v1/conversacion?id_conversacion=eq.{conversacion_id}&id_tenant=eq.{tenant_id}"
        headers = cfg["headers"]

        with httpx.Client() as client:
            resp = client.get(conv_url, headers=headers)
            resp.raise_for_status()
            if not resp.json():
                raise ValueError("La conversación no existe o no pertenece al tenant.")

        return super().create(tenant_id, payload)
