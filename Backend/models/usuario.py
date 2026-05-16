from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class UsuarioBase(BaseModel):
    id_tenant: UUID
    nombre_completo: str
    canal_origen: Optional[str] = "web"  # web | api
    estado: Optional[str] = "activo"  # activo | inactivo | bloqueado
    email: Optional[str] = None
    password: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    pass


class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    canal_origen: Optional[str] = None
    estado: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class UsuarioOut(BaseModel):
    id_usuario: UUID
    id_tenant: UUID
    nombre_completo: str
    canal_origen: Optional[str] = None
    timestamp_registro: datetime
    estado: Optional[str] = None
    email: Optional[str] = None
    # password NO se incluye en la salida

    class Config:
        from_attributes = True
