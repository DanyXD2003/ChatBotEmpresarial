from .crud_base import CrudBaseService


class RespuestaService(CrudBaseService):
    """Servicio CRUD para la tabla 'respuesta'.

    Incluye soft-delete (deleted_at) y filtro para excluir borrados.
    """

    def __init__(self):
        super().__init__("respuesta", pk_field="id_respuesta")

    def list_all(
        self,
        tenant_id: str,
        publicada: bool | None = None,
        id_intencion: str | None = None,
        incluir_borrados: bool = False,
    ) -> list[dict]:
        """Lista respuestas con filtros opcionales.

        Por defecto excluye registros con soft-delete (deleted_at IS NOT NULL).
        """
        params = {}
        if publicada is not None:
            params["publicada"] = f"eq.{str(publicada).lower()}"
        if id_intencion:
            params["id_intencion"] = f"eq.{id_intencion}"
        if not incluir_borrados:
            params["deleted_at"] = "is.null"

        return super().list_all(tenant_id, query_params=params)

    def delete(self, tenant_id: str, record_id: str) -> bool:
        """Realiza soft-delete en lugar de borrado físico."""
        self.soft_delete(tenant_id, record_id)
        return True
