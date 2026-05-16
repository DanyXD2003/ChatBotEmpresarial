from typing import Optional

import httpx

from .crud_base import CrudBaseService
from .supabase_client import get_supabase_client


class TenantService(CrudBaseService):
    """Servicio CRUD para la tabla 'tenant'.

    Nota: tenant no tiene un tenant padre, por lo que las operaciones
    list_all y get_by_id no filtran por tenant_id. Solo usuarios con
    rol 'admin' pueden acceder a estos endpoints.
    """

    def __init__(self):
        super().__init__("tenant", tenant_field="id_tenant")

    def list_all(self) -> list[dict]:
        """Lista todos los tenants (sin filtro de tenant)."""
        url = self._base_url()
        headers = self._headers()

        with httpx.Client() as client:
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            return resp.json()

    def get_by_id(self, record_id: str) -> Optional[dict]:
        """Obtiene un tenant por ID (sin filtro de tenant)."""
        url = f"{self._base_url()}?id=eq.{record_id}"
        headers = self._headers()

        with httpx.Client() as client:
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data[0] if data else None

    def create(self, payload: dict) -> dict:
        """Crea un nuevo tenant."""
        url = self._base_url()
        headers = self._headers()

        with httpx.Client() as client:
            resp = client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data[0] if isinstance(data, list) else data

    def update(self, record_id: str, payload: dict) -> Optional[dict]:
        """Actualiza un tenant."""
        url = f"{self._base_url()}?id=eq.{record_id}"
        headers = self._headers()

        with httpx.Client() as client:
            resp = client.patch(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data[0] if isinstance(data, list) else data

    def delete(self, record_id: str) -> bool:
        """Elimina un tenant."""
        url = f"{self._base_url()}?id=eq.{record_id}"
        headers = self._headers({"Prefer": "return=minimal"})

        with httpx.Client() as client:
            resp = client.delete(url, headers=headers)
            resp.raise_for_status()
            return True
