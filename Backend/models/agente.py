from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AgenteBase(BaseModel):
    id_tenant: UUID
    nombre: str
    email: str
    rol: str = "agente"  # agente | supervisor | admin
    disponible: Optional[bool] = True
    id_usuario: Optional[UUID] = None


class AgenteCreate(AgenteBase):
    pass


class AgenteUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    rol: Optional[str] = None
    disponible: Optional[bool] = None
    id_usuario: Optional[UUID] = None


class AgenteOut(BaseModel):
    id_agente: UUID
    id_tenant: UUID
    nombre: str
    email: str
    rol: Optional[str] = None
    disponible: Optional[bool] = None
    id_usuario: Optional[UUID] = None

    class Config:
        from_attributes = True
