# DERCAS — Estado de Avance
> Última actualización: 7 de mayo de 2026 | Semana actual: **5 de 6**

---

## Resumen ejecutivo

| Semana | Foco | Estado real |
|---|---|---|
| 1 | Setup + Prototipo | ✅ Completado |
| 2 | Auth + Tenants + RBAC | 🟡 Parcial (solo frontend) |
| 3 | Pipeline RAG + Chat funcional | ❌ No iniciado |
| 4 | Escalamiento + Notificaciones + Onboarding | ❌ No iniciado |
| 5 | Reportes + Historial + Pulido UI | ❌ No iniciado |
| 6 | Estabilización + Deploy + Demo final | ❌ No iniciado |

**Estado general:** El sistema es un prototipo de frontend con autenticación real parcial. Todas las funcionalidades de negocio (chat, documentos, reportes, agentes) usan datos mock que se pierden al recargar la página. No existe backend, ni base de datos activa, ni pipeline RAG.

---

## Semana 1 — Setup + Prototipo ✅ COMPLETADO

### LÍDER — Daniel ✅
- [x] Repositorio GitHub creado con ramas `main` y `develop`
- [x] Cuentas en Supabase y Vercel configuradas, API keys en `.env`
- [x] Convenciones de commits definidas (`feat:`, `fix:`, `chore:`)
- [ ] Tablero Kanban en Notion — *no verificado*
- [ ] Accesos distribuidos a todos los integrantes — *no verificado*

### DEV — Edwin ✅
- [x] Next.js 16 inicializado con App Router y Tailwind
- [x] Estructura de carpetas: `/(auth)/login`, `/(dashboard)/chat`, `/knowledge`, `/reports`, `/agents`
- [x] Layout base con sidebar de navegación colapsable
- [x] Pantalla `/chat`: lista de conversaciones + ventana de chat (datos mock)
- [x] Pantalla `/knowledge`: tabla de documentos con botón "Subir documento" (sin lógica)
- [x] Pantalla `/reports`: tarjetas con KPIs hardcodeados
- [x] Pantalla `/agents`: tabla de agentes con CRUD en estado local
- [x] Deploy en Vercel con CD automático

### DBA — Marlon ✅ Completado
- [x] Proyecto en Supabase creado
- [x] Schema creado con todas las tablas: `tenant`, `agente`, `usuario`, `conversacion`, `mensaje`, `canal`, `intencion`, `respuesta`, `reporte`
- [ ] `CREATE EXTENSION IF NOT EXISTS vector` — *no confirmado*
- [ ] FKs verificados con queries de prueba — *no confirmado*
- [ ] Schema documentado en Notion — *no confirmado*

### ANALISTA — Gerson ❌ No iniciado
- [ ] Entorno Python funcionando — **NO**
- [ ] Prueba básica de embeddings con OpenAI — **NO**

### QA — Melany ❌ No iniciado
- [ ] Checklist por UC en Notion — **NO**
- [ ] Revisión del prototipo en Vercel — **NO**

---

## Semana 2 — Auth + Tenants + RBAC 🟡 PARCIAL

### LÍDER — Daniel 🟡 Parcial
- [ ] Proyecto FastAPI en `/backend` con estructura `/gateway`, `/services`, `/models` — **NO existe**
- [ ] `POST /messages` con validación JWT y extracción de `tenant_id` — **NO**
- [ ] Middleware de rate limiting con `slowapi` — **NO**
- [ ] Variable `API_GATEWAY_URL` en Vercel — **NO**
- [ ] Deploy del API Gateway en Railway — **NO**
- [ ] Contrato de API definido con Dev — **NO**

### DEV — Edwin ✅ Completado
- [x] SDK Supabase instalado (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Cliente Supabase en `lib/supabase/` (client + server + proxy)
- [x] `/login` con `supabase.auth.signInWithPassword()` real
- [x] Middleware (`proxy.ts`) que protege rutas `/dashboard/*` y redirige si no hay sesión
- [x] Rol leído del JWT y guardado en contexto para RBAC
- [x] RBAC en sidebar: Admin ve todo, Supervisor sin acceso a `/agents`, Agente solo `/chat` y `/knowledge`
- [ ] API Route `/api/chat/route.ts` que manda JWT al API Gateway — **NO** (no hay gateway todavía)

### DBA — Marlon 🟡 Parcial
- [x] Migration 003: tabla `intencion` — creada
- [x] Migration 004: tabla `respuesta` — creada (confirmar si tiene `embedding VECTOR(1536)` e índice `ivfflat`)
- [x] Migration 005: tablas `canal` y `reporte` — creadas
- [ ] RLS en todas las tablas — *no confirmado*
- [ ] Tests SQL con dos tenants de prueba — *no confirmado*

### ANALISTA — Gerson ❌ No iniciado
- [ ] `ingestion_service.py` con procesamiento de PDF — **NO**
- [ ] Chunks con embeddings insertados en pgvector — **NO**
- [ ] Endpoint FastAPI `POST /ingest` — **NO**

### QA — Melany ❓
- [ ] 3 cuentas de prueba en Supabase Auth (admin, supervisor, agente) — *no verificado*
- [ ] Pruebas de login por rol y verificación de sidebar — *no verificado*
- [ ] Prueba de acceso sin sesión y redirección — *no verificado*

---

## Semana 3 — Pipeline RAG + Chat funcional ❌ NO INICIADO

### LÍDER — Daniel ❌
- [ ] `POST /messages` con `StreamingResponse` al Query Service
- [ ] Manejo de errores 500 en el gateway
- [ ] Logging de requests (timestamp, tenant_id, latencia, status)
- [ ] Verificación de `tenant_id` NUNCA desde el body
- [ ] Conectar `/ingest` al gateway como `POST /knowledge/upload`
- [ ] Prueba del flujo completo: PDF → pregunta → respuesta

### DEV — Edwin ❌
- [ ] Streaming en chat con `getReader()` y `TextDecoder`
- [ ] Efecto de escritura en tiempo real
- [ ] Botón "Subir documento" con `POST /api/knowledge/upload` real vía `FormData`
- [ ] Estados de procesamiento: `Procesando...` → `Listo` → `Error`
- [ ] Indicador de carga mientras espera respuesta del bot

### DBA — Marlon ❌
- [ ] Cuenta Upstash creada
- [ ] Base de datos Redis en Upstash
- [ ] `set_session(conv_id, historial)` con TTL=1800
- [ ] `get_session(conv_id)` para recuperar historial
- [ ] Variables de entorno de Upstash configuradas
- [ ] Prueba de expiración del TTL

### ANALISTA — Gerson ❌
- [ ] `query_service.py` con función `responder_pregunta(pregunta, id_tenant, conv_id)`
- [ ] Paso 1: vectorizar pregunta con `text-embedding-3-small`
- [ ] Paso 2: query de similitud coseno en pgvector (top-5 chunks por `id_tenant`)
- [ ] Paso 3: construir prompt con instrucción anti-alucinación + chunks + historial
- [ ] Paso 4: streaming del LLM con `StreamingResponse`
- [ ] Prueba de alucinación: pregunta fuera del doc → "No tengo esa información"

### QA — Melany ❌
- [ ] Set de 10 preguntas (7 en doc, 3 fuera)
- [ ] Verificación de respuesta anti-alucinación
- [ ] Medición de tiempo de respuesta (meta: < 3 seg al primer token)
- [ ] Checklist UC-02 documentado

---

## Semana 4 — Escalamiento + Notificaciones + Onboarding ❌ NO INICIADO

### LÍDER — Daniel ❌
- [ ] Cuenta Stripe creada
- [ ] `POST /webhook` para `payment_intent.succeeded`
- [ ] Webhook: INSERT en `tenant` + `agente` admin con email del pago
- [ ] Email de bienvenida via Resend
- [ ] Flujo onboarding: `/register` → email → `/checkout` → `/dashboard`
- [ ] Prueba con tarjeta `4242 4242 4242 4242`

### DEV — Edwin ❌
- [ ] Pantalla `/agents/conversations` con conversaciones escaladas
- [ ] Cliente WebSocket en Next.js conectado al Notification Service
- [ ] Alertas visuales al recibir notificación WebSocket
- [ ] Panel de conversación escalada con historial + caja de respuesta
- [ ] `POST /api/messages/agent` para respuesta del agente
- [ ] Pantalla `/register` con `supabase.auth.signUp()`

### DBA — Marlon ❌
- [ ] BullMQ instalado y configurado
- [ ] Cola `ingestion-queue` y worker conectado al Ingestion Service
- [ ] `POST /knowledge/upload` retorna `jobId` inmediatamente
- [ ] `GET /knowledge/status/:jobId` con estado del job
- [ ] Prueba con PDF de 50+ páginas (respuesta inmediata + background processing)

### ANALISTA — Gerson ❌
- [ ] `notification_service.py` con FastAPI y WebSockets
- [ ] Endpoint `ws://host/ws/agente/{id_agente}` activo
- [ ] `escalar_conversacion(conv_id, tenant_id, score)` busca agente disponible
- [ ] Push WebSocket si agente activo / email Resend si no
- [ ] Query Service llama a escalamiento cuando `score < umbral`
- [ ] Conversación actualizada a estado `escalada`

### QA — Melany ❌
- [ ] UC-04 completo: pregunta sin doc → escalamiento → notificación agente (< 3 seg)
- [ ] Fallback email: cerrar panel → escalamiento → email de Resend
- [ ] UC-08 onboarding: tarjeta de prueba → tenant creado
- [ ] Pago rechazado: tarjeta `4000...0002` → tenant NO creado

---

## Semana 5 — Reportes + Historial + Pulido UI ❌ NO INICIADO
*(Semana en curso según el calendario — nada implementado)*

### LÍDER — Daniel ❌
- [ ] Revisión de PRs y merges pendientes
- [ ] Priorización de deuda técnica
- [ ] Entorno de staging en Railway (rama `develop`)
- [ ] Variables de entorno documentadas en README
- [ ] Bugs críticos de QA resueltos
- [ ] Alerta automática al Admin si intención supera 40% escalamiento (RF-13)

### DEV — Edwin ❌
- [ ] `/reports`: selector de tipo + rango de fechas → spinner → descarga
- [ ] `/history`: tabla de conversaciones con filtros (usuario, fecha, canal, estado)
- [ ] Paginación: 20 conversaciones por página con anterior/siguiente
- [ ] RBAC en historial: agentes solo ven sus conversaciones
- [ ] Responsive mejorado en chat, knowledge y dashboard

### DBA — Marlon ❌
- [ ] Query: COUNT de conversaciones por día, canal e intención
- [ ] Query: `AVG(timestamp_fin - timestamp_inicio)` por intención
- [ ] Query: tasa de escalamiento por intención
- [ ] Jobs de reportes encolados en BullMQ
- [ ] Generación de CSV + upload a Supabase Storage con URL firmada TTL 24h
- [ ] `GET /reports/:id` con URL de descarga

### ANALISTA — Gerson ❌
- [ ] Revisión de logs: intenciones con score bajo o alta tasa de escalamiento
- [ ] Ajuste de `chunk_size` y `chunk_overlap`
- [ ] RF-13: job periódico (cada hora) que alerta al Admin si escalamiento > 40%
- [ ] Optimización de índice `ivfflat` si latencia > 1 seg
- [ ] Manejo de errores en Query Service (OpenAI falla → 503)

### QA — Melany ❌
- [ ] Ejecución y documentación de RF-01 a RF-13
- [ ] Verificación de 7 KPIs operativos
- [ ] Prueba de aislamiento multi-tenant
- [ ] Reporte de bugs con severidad
- [ ] Resumen ejecutivo de calidad

---

## Semana 6 — Estabilización + Deploy + Demo final ❌ NO INICIADO

*(Ver ROADMAP.md — no se lista aquí porque aún no es relevante)*

---

## Requerimientos funcionales — Estado

| Código | Descripción | Estado |
|---|---|---|
| RF-01 | Registro de empresa con email/contraseña → activa como Admin | 🟡 Auth login funciona; sign-up y creación de tenant NO |
| RF-02 | Creación automática de Tenant al confirmar pago en Stripe | ❌ No iniciado |
| RF-03 | Almacenamiento de conversaciones en DB con timestamps y contexto | ❌ Solo en React state (se pierde al recargar) |
| RF-04 | Pipeline RAG: embedding → búsqueda vectorial → LLM | ❌ No iniciado |
| RF-05 | Escalamiento a agente cuando score < umbral | ❌ No iniciado |
| RF-06 | Notification Service: WebSocket si agente online, email si no | ❌ No iniciado |
| RF-07 | Historial paginado con filtros y RBAC | ❌ UI parcial, sin datos reales |
| RF-08 | Registrar intención detectada y score_confianza en cada mensaje | ❌ No iniciado |
| RF-09 | Reportes operativos asíncronos vía BullMQ | ❌ No iniciado |
| RF-10 | Admin crea/edita/publica/elimina entradas de KB; embeddings automáticos | ❌ Solo UI de tabla, sin lógica real |
| RF-11 | RBAC: Admin, Supervisor, Agente, Usuario Final | 🟡 RBAC en frontend completado; backend sin RBAC |
| RF-12 | Multi-tenancy con `tenant_id` + RLS + filtro pgvector | ❌ No hay DB activa |
| RF-13 | Alerta automática al Admin si escalamiento > 40% | ❌ No iniciado |

---

## Deuda técnica acumulada

| Item | Responsable | Impacto |
|---|---|---|
| Migrations 003–005 pendientes de confirmar (RLS, pgvector, índice ivfflat) | Marlon | **Alto** — tablas base existen, pero RLS y pgvector no confirmados |
| No hay backend FastAPI | Daniel | **Crítico** — bloquea RAG, escalamiento, reportes |
| No hay API Route `/api/chat` hacia el gateway | Edwin | **Alto** — chat sigue siendo mock |
| Usuarios de prueba en Supabase Auth (roles) | Melany/QA | **Alto** — impide verificar RBAC end-to-end |
| pgvector no habilitado en Supabase | Marlon | **Alto** — bloquea embeddings |
| RLS no configurado | Marlon | **Alto** — requisito de seguridad no negociable |

---

## Próximas acciones prioritarias (semana 5)

> En orden de prioridad para desbloquear el trabajo de todos:

1. **Marlon** — Confirmar si `respuesta` tiene columna `embedding VECTOR(1536)` + índice `ivfflat` + RLS activo en todas las tablas
2. **Daniel** — Crear el proyecto FastAPI en `/backend` y deployar el gateway mínimo en Railway
3. **Gerson** — ⚠️ Bloqueado por semana 1: primero debe configurar entorno Python y probar embeddings, luego puede avanzar con `ingestion_service.py`
4. **Edwin** — Conectar `/api/chat/route.ts` al gateway cuando esté disponible + implementar streaming
5. **Melany** — Crear 3 cuentas de prueba en Supabase Auth con roles asignados para poder testear RBAC end-to-end

---

*Generado en base al análisis del código fuente del repo y comparación con DERCAS_Roadmap v1.0*
