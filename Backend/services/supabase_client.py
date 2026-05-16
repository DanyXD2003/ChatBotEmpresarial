import os
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()


def _get_supabase_url() -> str:
    return os.environ.get("SUPABASE_URL", "").rstrip("/")


def _get_service_role_key() -> str:
    return os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def get_supabase_client() -> dict:
    """Retorna las credenciales y headers comunes para llamar a la REST API de Supabase."""
    url = _get_supabase_url()
    key = _get_service_role_key()

    if not url or not key:
        raise RuntimeError(
            "Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno."
        )

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    return {"url": url, "headers": headers}
