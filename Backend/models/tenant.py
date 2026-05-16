from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TenantBase(BaseModel):
    nombre_empresa: str
    plan: Optional[str] = "free"  # free | pro | enterprise
    stripe_customer_id: Optional[str] = None
    activo: Optional[bool] = True
    config_bot: Optional[dict] = None


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    nombre_empresa: Optional[str] = None
    plan: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    activo: Optional[bool] = None
    config_bot: Optional[dict] = None


class TenantOut(TenantBase):
    id_tenant: UUID
    timestamp_registro: datetime

    class Config:
        from_attributes = True
