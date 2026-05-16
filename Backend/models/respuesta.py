from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RespuestaBase(BaseModel):
    id_tenant: UUID
    id_intencion: Optional[UUID] = None
    contenido: str
    doc_origen: Optional[str] = None
    version: Optional[int] = 1
    publicada: Optional[bool] = False
    id_creador: Optional[UUID] = None


class RespuestaCreate(BaseModel):
    id_intencion: Optional[str] = None
    contenido: str
    doc_origen: Optional[str] = None
    version: Optional[int] = 1
    publicada: Optional[bool] = False
    id_creador: Optional[str] = None


class RespuestaUpdate(BaseModel):
    id_intencion: Optional[str] = None
    contenido: Optional[str] = None
    doc_origen: Optional[str] = None
    version: Optional[int] = None
    publicada: Optional[bool] = None
    id_creador: Optional[str] = None


class RespuestaOut(BaseModel):
    id_respuesta: UUID
    id_tenant: UUID
    id_intencion: Optional[UUID] = None
    contenido: str
    doc_origen: Optional[str] = None
    version: Optional[int] = None
    publicada: Optional[bool] = None
    timestamp_creacion: datetime
    id_creador: Optional[UUID] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
