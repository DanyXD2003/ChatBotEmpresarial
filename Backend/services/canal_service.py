from .crud_base import CrudBaseService


class CanalService(CrudBaseService):
    """Servicio CRUD para la tabla 'canal'."""

    def __init__(self):
        super().__init__("canal", pk_field="id_canal")

    def list_all(
        self,
        tenant_id: str,
        tipo: str | None = None,
        activo: bool | None = None,
    ) -> list[dict]:
        """Lista canales con filtros opcionales."""
        params = {}
        if tipo:
            params["tipo"] = f"eq.{tipo}"
        if activo is not None:
            params["activo"] = f"eq.{str(activo).lower()}"
        return super().list_all(tenant_id, query_params=params)
