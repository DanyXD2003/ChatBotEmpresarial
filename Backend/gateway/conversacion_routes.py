from fastapi import APIRouter, Depends, HTTPException

from models.conversacion import ConversacionCreate, ConversacionOut, ConversacionUpdate
from services.conversacion_service import ConversacionService
from .auth_routes import get_current_user

router = APIRouter(prefix="/conversaciones", tags=["conversaciones"])
service = ConversacionService()


@router.get("/", response_model=list[ConversacionOut])
async def list_conversaciones(
    estado: str | None = None,
    id_usuario: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    data = service.list_all(tenant_id, estado=estado, id_usuario=id_usuario)
    return data


@router.get("/{conversacion_id}", response_model=ConversacionOut)
async def get_conversacion(conversacion_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.get_by_id(tenant_id, conversacion_id)
    if not item:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")
    return item


@router.post("/", response_model=ConversacionOut, status_code=201)
async def create_conversacion(body: ConversacionCreate, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    return service.create(tenant_id, body.model_dump())


@router.put("/{conversacion_id}", response_model=ConversacionOut)
async def update_conversacion(
    conversacion_id: str,
    body: ConversacionUpdate,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    item = service.update(tenant_id, conversacion_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")
    return item


@router.delete("/{conversacion_id}", status_code=204)
async def delete_conversacion(conversacion_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    service.delete(tenant_id, conversacion_id)


@router.post("/{conversacion_id}/close", response_model=ConversacionOut)
async def close_conversacion(conversacion_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.close(tenant_id, conversacion_id)
    if not item:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")
    return item


@router.post("/{conversacion_id}/escalate", response_model=ConversacionOut)
async def escalate_conversacion(conversacion_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.escalate(tenant_id, conversacion_id)
    if not item:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")
    return item
