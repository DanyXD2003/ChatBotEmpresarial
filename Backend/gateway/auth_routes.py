from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel


from services.auth_service import login_with_email

router = APIRouter(prefix="/auth", tags=["auth"])

# Esquema de seguridad OAuth2 Bearer para que Swagger UI
# muestre el botón "Authorize" y envíe el header automáticamente
oauth2_scheme = HTTPBearer(auto_error=True)



class LoginRequest(BaseModel):
    email: str
    password: str


def _get_jwt_secret() -> str:
    import os

    secret = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not secret:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY no está configurada.")
    return secret


@router.post("/login")
async def login(body: LoginRequest):
    try:
        usuario = login_with_email(body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    secret = _get_jwt_secret()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario["id_usuario"]),
        "id_usuario": str(usuario["id_usuario"]),
        "id_tenant": str(usuario["id_tenant"]),
        "email": usuario.get("email", ""),
        "nombre_completo": usuario.get("nombre_completo", ""),
        "role": usuario.get("role", "agente"),
        "iat": now,
        "exp": now + timedelta(hours=8),
    }

    access_token = jwt.encode(payload, secret, algorithm="HS256")
    role = usuario.get("role", "agente")

    return {
        "access_token": access_token,
        "user": {
            "id_usuario": usuario["id_usuario"],
            "id_tenant": usuario["id_tenant"],
            "email": usuario.get("email", ""),
            "nombre_completo": usuario.get("nombre_completo", ""),
            "role": role,
        },
    }


def obtener_tenant(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> str:
    """Extrae el tenant_id del token JWT."""
    try:
        secret = _get_jwt_secret()
        payload = jwt.decode(credentials.credentials, secret, algorithms=["HS256"])
    except (JWTError, RuntimeError):
        raise HTTPException(status_code=401, detail="Token inválido")

    tenant_id = payload.get("id_tenant")
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Sin tenant_id en el token")
    return tenant_id


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> dict:
    """Extrae el payload completo del JWT para obtener datos del usuario autenticado."""
    try:
        secret = _get_jwt_secret()
        payload = jwt.decode(credentials.credentials, secret, algorithms=["HS256"])
    except (JWTError, RuntimeError):
        raise HTTPException(status_code=401, detail="Token inválido")

    return payload


