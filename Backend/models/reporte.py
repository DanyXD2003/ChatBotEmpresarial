from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ReporteBase(BaseModel):
    id_tenant: UUID
    tipo: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    data: Optional[dict] = None


class ReporteCreate(ReporteBase):
    pass


class ReporteOut(BaseModel):
    id_reporte: UUID
    id_tenant: UUID
    tipo: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    data: Optional[dict] = None
    timestamp_creacion: datetime

    class Config:
        from_attributes = True
