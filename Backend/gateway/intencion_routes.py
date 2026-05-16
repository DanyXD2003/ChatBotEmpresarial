from fastapi import APIRouter, Depends, HTTPException

from models.intencion import IntencionCreate, IntencionOut, IntencionUpdate
from services.intencion_service import IntencionService
from .auth_routes import get_current_user

router = APIRouter(prefix="/intenciones", tags=["intenciones"])
service = IntencionService()


@router.get("/", response_model=list[IntencionOut])
async def list_intenciones(current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    data = service.list_all(tenant_id)
    return data


@router.get("/{intencion_id}", response_model=IntencionOut)
async def get_intencion(intencion_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.get_by_id(tenant_id, intencion_id)
    if not item:
        raise HTTPException(status_code=404, detail="Intención no encontrada.")
    return item


@router.post("/", response_model=IntencionOut, status_code=201)
async def create_intencion(body: IntencionCreate, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    return service.create(tenant_id, body.model_dump())


@router.put("/{intencion_id}", response_model=IntencionOut)
async def update_intencion(
    intencion_id: str,
    body: IntencionUpdate,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    item = service.update(tenant_id, intencion_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Intención no encontrada.")
    return item


@router.delete("/{intencion_id}", status_code=204)
async def delete_intencion(intencion_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    service.delete(tenant_id, intencion_id)
