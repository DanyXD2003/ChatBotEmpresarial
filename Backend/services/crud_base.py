import uuid
from typing import Any, Optional

import httpx

from .supabase_client import get_supabase_client


class CrudBaseService:
    """Servicio CRUD genérico para interactuar con la REST API de Supabase.

    Proporciona operaciones básicas: listar, obtener por ID, crear,
    actualizar y eliminar (físico o lógico) para cualquier tabla.
    """

    def __init__(self, table_name: str, tenant_field: str = "id_tenant", pk_field: str = "id"):
        self.table_name = table_name
        self.tenant_field = tenant_field
        self.pk_field = pk_field

    # ── Helpers ──────────────────────────────────────────────

    def _client(self) -> dict:
        return get_supabase_client()

    def _base_url(self) -> str:
        cfg = self._client()
        return f"{cfg['url']}/rest/v1/{self.table_name}"

    def _headers(self, extra: Optional[dict] = None) -> dict:
        cfg = self._client()
        h = dict(cfg["headers"])
        if extra:
            h.update(extra)
        return h

    def _tenant_filter(self, tenant_id: str) -> str:
        return f"{self.tenant_field}=eq.{tenant_id}"

    # ── Operaciones CRUD ─────────────────────────────────────

    def list_all(
        self,
        tenant_id: str,
        query_params: Optional[dict] = None,
    ) -> list[dict]:
        """Lista todos los registros de la tabla filtrados por tenant."""
        url = self._base_url()
        params = {self.tenant_field: f"eq.{tenant_id}"}

        if query_params:
            # Filtros adicionales: ej. {"estado": "eq.activa", "order": "timestamp_creacion.desc"}
            for k, v in query_params.items():
                params[k] = v

        headers = self._headers()

        with httpx.Client() as client:
            resp = client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            return resp.json()

    def get_by_id(self, tenant_id: str, record_id: str) -> Optional[dict]:
        """Obtiene un registro por ID, validando que pertenezca al tenant."""
        url = f"{self._base_url()}?{self.pk_field}=eq.{record_id}&{self._tenant_filter(tenant_id)}"
        headers = self._headers()

        with httpx.Client() as client:
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data[0] if data else None

    def create(self, tenant_id: str, payload: dict) -> dict:
        """Crea un nuevo registro."""
        url = self._base_url()
        headers = self._headers()

        body = {**payload, self.tenant_field: tenant_id}

        with httpx.Client() as client:
            resp = client.post(url, headers=headers, json=body)
            resp.raise_for_status()
            data = resp.json()
            # Supabase puede devolver una lista o un objeto
            if isinstance(data, list):
                return data[0] if data else {}
            return data

    def update(self, tenant_id: str, record_id: str, payload: dict) -> Optional[dict]:
        """Actualiza un registro existente."""
        url = f"{self._base_url()}?{self.pk_field}=eq.{record_id}&{self._tenant_filter(tenant_id)}"
        headers = self._headers()

        with httpx.Client() as client:
            resp = client.patch(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            if isinstance(data, list):
                return data[0] if data else {}
            return data

    def delete(self, tenant_id: str, record_id: str) -> bool:
        """Elimina (físicamente) un registro."""
        url = f"{self._base_url()}?{self.pk_field}=eq.{record_id}&{self._tenant_filter(tenant_id)}"
        headers = self._headers({"Prefer": "return=minimal"})

        with httpx.Client() as client:
            resp = client.delete(url, headers=headers)
            resp.raise_for_status()
            return True

    def soft_delete(self, tenant_id: str, record_id: str) -> Optional[dict]:
        """Marca deleted_at en lugar de borrar físicamente (soft-delete)."""
        from datetime import datetime, timezone

        return self.update(
            tenant_id,
            record_id,
            {"deleted_at": datetime.now(timezone.utc).isoformat()},
        )
