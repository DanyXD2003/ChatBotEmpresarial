from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class MensajeBase(BaseModel):
    id_conversacion: UUID
    contenido: str
    tipo: str  # usuario | bot | agente
    id_intencion: Optional[UUID] = None
    score_confianza: Optional[float] = None


class MensajeCreate(MensajeBase):
    pass


class MensajeOut(BaseModel):
    id_mensaje: UUID
    id_conversacion: UUID
    contenido: str
    tipo: Optional[str] = None
    timestamp_envio: datetime
    id_intencion: Optional[UUID] = None
    score_confianza: Optional[float] = None

    class Config:
        from_attributes = True
