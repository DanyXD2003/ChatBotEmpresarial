from fastapi import APIRouter, Depends, HTTPException

from models.canal import CanalCreate, CanalOut, CanalUpdate
from services.canal_service import CanalService
from .auth_routes import get_current_user

router = APIRouter(prefix="/canales", tags=["canales"])
service = CanalService()


@router.get("/", response_model=list[CanalOut])
async def list_canales(
    tipo: str | None = None,
    activo: bool | None = None,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    data = service.list_all(tenant_id, tipo=tipo, activo=activo)
    return data


@router.get("/{canal_id}", response_model=CanalOut)
async def get_canal(canal_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.get_by_id(tenant_id, canal_id)
    if not item:
        raise HTTPException(status_code=404, detail="Canal no encontrado.")
    return item


@router.post("/", response_model=CanalOut, status_code=201)
async def create_canal(body: CanalCreate, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    return service.create(tenant_id, body.model_dump())


@router.put("/{canal_id}", response_model=CanalOut)
async def update_canal(
    canal_id: str,
    body: CanalUpdate,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    item = service.update(tenant_id, canal_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Canal no encontrado.")
    return item


@router.delete("/{canal_id}", status_code=204)
async def delete_canal(canal_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    service.delete(tenant_id, canal_id)
