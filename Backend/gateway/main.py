from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware


from .auth_routes import router as auth_router
from .agente_routes import router as agente_router
from .canal_routes import router as canal_router
from .tenant_routes import router as tenant_router
from .usuario_routes import router as usuario_router
from .conversacion_routes import router as conversacion_router
from .intencion_routes import router as intencion_router
from .mensaje_routes import router as mensaje_router
from .reporte_routes import router as reporte_router
from .respuesta_routes import router as respuesta_router

app = FastAPI(
    title="ChatDesk API",
    description="API del ChatBot Empresarial",
    version="1.0.0",
)

# ─── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Endpoints de diagnóstico (sin auth) ───────────────────────────────────
@app.get("/health", include_in_schema=True)
async def health_check():
    return {"status": "ok", "message": "Backend funcionando correctamente"}


@app.get("/auth/debug-header", include_in_schema=True)
async def debug_header(request: Request):
    """Endpoint para diagnosticar qué headers recibe el backend."""
    headers = dict(request.headers)
    if "authorization" in headers:
        auth = headers["authorization"]
        headers["authorization"] = auth[:20] + "..." if len(auth) > 20 else auth
    return {
        "headers_recibidos": headers,
        "method": request.method,
        "url": str(request.url),
    }


# ─── Registrar routers ────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(agente_router)
app.include_router(canal_router)
app.include_router(tenant_router)
app.include_router(usuario_router)
app.include_router(conversacion_router)
app.include_router(intencion_router)
app.include_router(mensaje_router)
app.include_router(reporte_router)
app.include_router(respuesta_router)


