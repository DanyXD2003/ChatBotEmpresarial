from fastapi import APIRouter, Depends, HTTPException

from models.respuesta import RespuestaCreate, RespuestaOut, RespuestaUpdate
from services.respuesta_service import RespuestaService
from .auth_routes import get_current_user

router = APIRouter(prefix="/respuestas", tags=["respuestas"])
service = RespuestaService()


@router.get("/", response_model=list[RespuestaOut])
async def list_respuestas(
    publicada: bool | None = None,
    id_intencion: str | None = None,
    incluir_borrados: bool = False,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    data = service.list_all(tenant_id, publicada=publicada, id_intencion=id_intencion, incluir_borrados=incluir_borrados)
    return data


@router.get("/{respuesta_id}", response_model=RespuestaOut)
async def get_respuesta(respuesta_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.get_by_id(tenant_id, respuesta_id)
    if not item:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada.")
    return item


@router.post("/", response_model=RespuestaOut, status_code=201)
async def create_respuesta(body: RespuestaCreate, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    return service.create(tenant_id, body.model_dump())


@router.put("/{respuesta_id}", response_model=RespuestaOut)
async def update_respuesta(
    respuesta_id: str,
    body: RespuestaUpdate,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    item = service.update(tenant_id, respuesta_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada.")
    return item


@router.delete("/{respuesta_id}", status_code=204)
async def delete_respuesta(respuesta_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    service.delete(tenant_id, respuesta_id)
