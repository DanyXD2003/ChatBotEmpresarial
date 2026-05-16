from .crud_base import CrudBaseService


class IntencionService(CrudBaseService):
    """Servicio CRUD para la tabla 'intencion'."""

    def __init__(self):
        super().__init__("intencion", pk_field="id_intencion")
