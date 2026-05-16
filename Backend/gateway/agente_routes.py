from fastapi import APIRouter, Depends, HTTPException

from models.agente import AgenteCreate, AgenteOut, AgenteUpdate
from services.agente_service import AgenteService
from .auth_routes import get_current_user

router = APIRouter(prefix="/agentes", tags=["agentes"])
service = AgenteService()


@router.get("/", response_model=list[AgenteOut])
async def list_agentes(
    disponible: bool | None = None,
    rol: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    data = service.list_all(tenant_id, disponible=disponible, rol=rol)
    return data


@router.get("/{agente_id}", response_model=AgenteOut)
async def get_agente(agente_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.get_by_id(tenant_id, agente_id)
    if not item:
        raise HTTPException(status_code=404, detail="Agente no encontrado.")
    return item


@router.post("/", response_model=AgenteOut, status_code=201)
async def create_agente(body: AgenteCreate, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    return service.create(tenant_id, body.model_dump())


@router.put("/{agente_id}", response_model=AgenteOut)
async def update_agente(
    agente_id: str,
    body: AgenteUpdate,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    item = service.update(tenant_id, agente_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Agente no encontrado.")
    return item


@router.delete("/{agente_id}", status_code=204)
async def delete_agente(agente_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    service.delete(tenant_id, agente_id)
