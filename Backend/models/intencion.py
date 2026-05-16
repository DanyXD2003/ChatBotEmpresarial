from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class IntencionBase(BaseModel):
    id_tenant: UUID
    nombre: str
    descripcion: Optional[str] = None


class IntencionCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class IntencionUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


class IntencionOut(BaseModel):
    id_intencion: UUID
    id_tenant: UUID
    nombre: str
    descripcion: Optional[str] = None
    timestamp_creacion: datetime

    class Config:
        from_attributes = True
