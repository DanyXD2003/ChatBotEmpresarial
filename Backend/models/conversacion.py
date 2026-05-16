from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ConversacionBase(BaseModel):
    id_tenant: UUID
    id_usuario: UUID
    id_canal: UUID
    estado: Optional[str] = "activa"  # activa | cerrada | escalada
    contexto_sesion: Optional[dict] = None
    id_agente_asignado: Optional[UUID] = None


class ConversacionCreate(ConversacionBase):
    pass


class ConversacionUpdate(BaseModel):
    estado: Optional[str] = None
    contexto_sesion: Optional[dict] = None
    id_agente_asignado: Optional[UUID] = None


class ConversacionOut(BaseModel):
    id_conversacion: UUID
    id_tenant: UUID
    id_usuario: UUID
    id_canal: UUID
    timestamp_inicio: datetime
    timestamp_fin: Optional[datetime] = None
    estado: Optional[str] = None
    contexto_sesion: Optional[dict] = None
    id_agente_asignado: Optional[UUID] = None

    class Config:
        from_attributes = True
