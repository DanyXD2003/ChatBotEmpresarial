from .crud_base import CrudBaseService


class AgenteService(CrudBaseService):
    """Servicio CRUD para la tabla 'agente'."""

    def __init__(self):
        super().__init__("agente", pk_field="id_agente")

    def list_all(
        self,
        tenant_id: str,
        disponible: bool | None = None,
        rol: str | None = None,
    ) -> list[dict]:
        """Lista agentes con filtros opcionales."""
        params = {}
        if disponible is not None:
            params["disponible"] = f"eq.{str(disponible).lower()}"
        if rol:
            params["rol"] = f"eq.{rol}"
        return super().list_all(tenant_id, query_params=params)
