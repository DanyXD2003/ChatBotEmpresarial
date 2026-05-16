import os

import httpx
from dotenv import load_dotenv

load_dotenv()


def _get_supabase_url() -> str:
    return os.environ.get("SUPABASE_URL", "").rstrip("/")


def _get_service_role_key() -> str:
    return os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def _headers() -> dict:
    key = _get_service_role_key()
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def login_with_email(email: str, password: str) -> dict:
    """Autentica un usuario consultando la tabla 'usuario' vía REST API de Supabase.

    Returns:
        dict con los datos del usuario (id_usuario, id_tenant, email,
        nombre_completo, estado, etc.)

    Raises:
        RuntimeError si faltan variables de entorno.
        ValueError si las credenciales son inválidas o el usuario está inactivo.
    """
    supabase_url = _get_supabase_url()
    service_key = _get_service_role_key()

    if not supabase_url or not service_key:
        raise RuntimeError(
            "Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno."
        )

    # 1. Consultar usuario por email
    url = f"{supabase_url}/rest/v1/usuario?email=eq.{email}&select=*"
    headers = _headers()

    with httpx.Client() as client:
        response = client.get(url, headers=headers)

        if response.status_code == 404:
            # Tabla o endpoint no encontrado
            raise RuntimeError(
                "No se pudo consultar la tabla 'usuario'. Verifica SUPABASE_URL."
            )

        if response.status_code >= 400:
            raise RuntimeError(
                f"Error al consultar Supabase: HTTP {response.status_code}"
            )

        usuarios = response.json()

    # 2. Validar que exista un único usuario
    if not usuarios or len(usuarios) == 0:
        raise ValueError("Credenciales inválidas. Verifica tu correo y contraseña.")

    usuario = usuarios[0]

    # 3. Validar estado
    estado = (usuario.get("estado") or "").lower()
    if estado != "activo":
        raise ValueError(
            "Tu cuenta no está activa. Contacta al administrador."
        )

    # 4. Validar contraseña (texto plano)
    password_bd = usuario.get("password") or ""
    if password != password_bd:
        raise ValueError("Credenciales inválidas. Verifica tu correo y contraseña.")

    return usuario
