from fastapi import APIRouter, Depends, HTTPException

from models.mensaje import MensajeCreate, MensajeOut
from services.mensaje_service import MensajeService
from .auth_routes import get_current_user

router = APIRouter(prefix="/mensajes", tags=["mensajes"])
service = MensajeService()


@router.get("/", response_model=list[MensajeOut])
async def list_mensajes(
    conversacion_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Lista los mensajes de una conversación específica."""
    tenant_id = current_user["id_tenant"]
    data = service.list_by_conversacion(tenant_id, conversacion_id)
    return data


@router.get("/{mensaje_id}", response_model=MensajeOut)
async def get_mensaje(mensaje_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.get_by_id(tenant_id, mensaje_id)
    if not item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado.")
    return item


@router.post("/", response_model=MensajeOut, status_code=201)
async def create_mensaje(body: MensajeCreate, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    try:
        return service.create(tenant_id, body.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
