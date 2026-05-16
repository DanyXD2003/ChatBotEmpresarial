from fastapi import APIRouter, Depends, HTTPException

from models.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from services.usuario_service import UsuarioService
from .auth_routes import get_current_user

router = APIRouter(prefix="/usuarios", tags=["usuarios"])
service = UsuarioService()


@router.get("/", response_model=list[UsuarioOut])
async def list_usuarios(
    estado: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    data = service.list_all(tenant_id, estado=estado)
    return data


@router.get("/{usuario_id}", response_model=UsuarioOut)
async def get_usuario(usuario_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.get_by_id(tenant_id, usuario_id)
    if not item:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return item


@router.post("/", response_model=UsuarioOut, status_code=201)
async def create_usuario(body: UsuarioCreate, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    return service.create(tenant_id, body.model_dump())


@router.put("/{usuario_id}", response_model=UsuarioOut)
async def update_usuario(
    usuario_id: str,
    body: UsuarioUpdate,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    item = service.update(tenant_id, usuario_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return item


@router.delete("/{usuario_id}", status_code=204)
async def delete_usuario(usuario_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    service.delete(tenant_id, usuario_id)
