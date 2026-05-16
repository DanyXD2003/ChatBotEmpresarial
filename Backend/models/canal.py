from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CanalBase(BaseModel):
    id_tenant: UUID
    nombre: Optional[str] = None
    tipo: str = "web"  # web | api
    webhook_url: Optional[str] = None
    activo: Optional[bool] = True


class CanalCreate(CanalBase):
    pass


class CanalUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    webhook_url: Optional[str] = None
    activo: Optional[bool] = None


class CanalOut(BaseModel):
    id_canal: UUID
    id_tenant: UUID
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    webhook_url: Optional[str] = None
    activo: Optional[bool] = None

    class Config:
        from_attributes = True
