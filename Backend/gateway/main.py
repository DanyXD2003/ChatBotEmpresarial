from fastapi import FastAPI, Header, HTTPException, Depends
from jose import jwt, JWTError

app = FastAPI()


def obtener_tenant(authorization: str = Header(...)) -> str:
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, key="", options={"verify_signature": False})
    except (JWTError, IndexError):
        raise HTTPException(status_code=401, detail="Token inválido")

    tenant_id = payload.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Sin tenant_id en el token")
    return tenant_id


@app.post("/messages")
async def recibir_mensaje(body: dict, tenant_id: str = Depends(obtener_tenant)):
    # tenant_id viene del JWT — NUNCA del body
    return {"status": "ok", "tenant": tenant_id}
