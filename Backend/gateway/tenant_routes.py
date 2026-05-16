from fastapi import APIRouter, Depends, HTTPException

from models.tenant import TenantCreate, TenantOut, TenantUpdate
from services.tenant_service import TenantService
from .auth_routes import get_current_user

router = APIRouter(prefix="/tenants", tags=["tenants"])
service = TenantService()


@router.get("/", response_model=list[TenantOut])
async def list_tenants(current_user: dict = Depends(get_current_user)):
    """Lista todos los tenants (solo admin)."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden listar tenants.")
    data = service.list_all()
    return data


@router.get("/{tenant_id}", response_model=TenantOut)
async def get_tenant(tenant_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden ver tenants.")
    item = service.get_by_id(tenant_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tenant no encontrado.")
    return item


@router.post("/", response_model=TenantOut, status_code=201)
async def create_tenant(body: TenantCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden crear tenants.")
    return service.create(body.model_dump())


@router.put("/{tenant_id}", response_model=TenantOut)
async def update_tenant(tenant_id: str, body: TenantUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden modificar tenants.")
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    item = service.update(tenant_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Tenant no encontrado.")
    return item


@router.delete("/{tenant_id}", status_code=204)
async def delete_tenant(tenant_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar tenants.")
    service.delete(tenant_id)
