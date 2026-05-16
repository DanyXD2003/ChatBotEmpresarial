from datetime import date
from typing import Optional

from .crud_base import CrudBaseService


class ReporteService(CrudBaseService):
    """Servicio CRUD para la tabla 'reporte'.

    Incluye filtros por rango de fechas (fecha_inicio, fecha_fin).
    """

    def __init__(self):
        super().__init__("reporte", pk_field="id_reporte")

    def list_all(
        self,
        tenant_id: str,
        tipo: str | None = None,
        fecha_inicio: date | None = None,
        fecha_fin: date | None = None,
    ) -> list[dict]:
        """Lista reportes con filtros opcionales por tipo y rango de fechas."""
        params = {}

        if tipo:
            params["tipo"] = f"eq.{tipo}"

        if fecha_inicio:
            params["fecha_inicio"] = f"gte.{fecha_inicio.isoformat()}"

        if fecha_fin:
            params["fecha_fin"] = f"lte.{fecha_fin.isoformat()}"

        return super().list_all(tenant_id, query_params=params)
