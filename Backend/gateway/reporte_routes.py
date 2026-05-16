from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from models.reporte import ReporteCreate, ReporteOut
from services.reporte_service import ReporteService
from .auth_routes import get_current_user

router = APIRouter(prefix="/reportes", tags=["reportes"])
service = ReporteService()


@router.get("/", response_model=list[ReporteOut])
async def list_reportes(
    tipo: str | None = None,
    fecha_inicio: date | None = None,
    fecha_fin: date | None = None,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    data = service.list_all(tenant_id, tipo=tipo, fecha_inicio=fecha_inicio, fecha_fin=fecha_fin)
    return data


@router.get("/{reporte_id}", response_model=ReporteOut)
async def get_reporte(reporte_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    item = service.get_by_id(tenant_id, reporte_id)
    if not item:
        raise HTTPException(status_code=404, detail="Reporte no encontrado.")
    return item


@router.post("/", response_model=ReporteOut, status_code=201)
async def create_reporte(body: ReporteCreate, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    return service.create(tenant_id, body.model_dump())


@router.put("/{reporte_id}", response_model=ReporteOut)
async def update_reporte(
    reporte_id: str,
    body: ReporteOut,
    current_user: dict = Depends(get_current_user),
):
    tenant_id = current_user["id_tenant"]
    payload = {k: v for k, v in body.model_dump().items() if v is not None}
    item = service.update(tenant_id, reporte_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Reporte no encontrado.")
    return item


@router.delete("/{reporte_id}", status_code=204)
async def delete_reporte(reporte_id: str, current_user: dict = Depends(get_current_user)):
    tenant_id = current_user["id_tenant"]
    service.delete(tenant_id, reporte_id)
