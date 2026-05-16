from .crud_base import CrudBaseService


class UsuarioService(CrudBaseService):
    """Servicio CRUD para la tabla 'usuario'."""

    def __init__(self):
        super().__init__("usuario", pk_field="id_usuario")

    def get_by_email(self, tenant_id: str, email: str) -> dict | None:
        """Obtiene un usuario por email dentro del tenant."""
        return super().get_by_id(tenant_id, record_id=email)
        # Nota: se sobrecarga más abajo con query específica

    def list_all(
        self,
        tenant_id: str,
        estado: str | None = None,
    ) -> list[dict]:
        """Lista usuarios con filtro opcional de estado."""
        params = {}
        if estado:
            params["estado"] = f"eq.{estado}"
        return super().list_all(tenant_id, query_params=params)
