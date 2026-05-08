# DERCAS — Roadmap de Desarrollo
> Plan de 6 Semanas | Ingeniería de Software — Semestre 9 | Versión 1.0 · Abril 2026

---

## Equipo

| Rol | Integrante | Responsabilidad principal |
|---|---|---|
| **LÍDER** | Daniel | Coordinación, API Gateway, integración de servicios, Stripe, decisiones arquitectónicas |
| **DEV** | Edwin | Frontend Next.js, chat UI, panel admin, integración frontend-backend, historial y reportes |
| **DBA** | Marlon | Schema SQL, migrations, RLS, Upstash Redis, BullMQ, queries de agregación para reportes |
| **ANALISTA** | Gerson | Pipeline RAG, Ingestion Service, Query Service, Notification Service, optimización de embeddings |
| **QA** | Melany | Documentación de pruebas, checklists de casos de uso, testing manual end-to-end, reporte de bugs |

---

## Vista general por semana

| Semana | Fechas | Foco | Estado |
|---|---|---|---|
| 1 | 7–11 abr | Setup + Prototipo con data quemada | ✅ Completado |
| 2 | 14–18 abr | Auth + Tenants + RBAC | ✅ Completado |
| 3 | 21–25 abr | Pipeline RAG + Chat funcional | ✅ Completado |
| 4 | 28 abr–2 may | Escalamiento + Notificaciones + Onboarding | ✅ Completado |
| 5 | 5–9 may | Reportes + Historial + Pulido UI | 🔄 En curso |
| 6 | 12–16 may | Estabilización + Deploy + Demo final | ⏳ Pendiente |

---

## Semana 1 — Setup + Prototipo con data quemada
**7–11 de abril de 2026 · PROTOTIPO**

**Objetivo:** Tener algo visual y navegable para mostrar en la evaluación semanal. No hay lógica real — todo corre con datos estáticos (JSON). Se configura toda la infraestructura de cuentas y el schema SQL en Supabase. El analista arranca su investigación de RAG.

**Entregable:** Prototipo navegable en Vercel con data quemada + Schema SQL (migrations 001 y 002) aplicado en Supabase + Analista con entorno Python funcionando.

### LÍDER — Daniel
- Crear repositorio GitHub (monorepo o dos repos: frontend + backend) y configurar ramas (`main`, `develop`, `feature/*`)
- Crear cuentas gratuitas en Supabase, Vercel, Railway, Upstash. Guardar API keys en gestor compartido (Notion o `.env.example`)
- Definir convenciones de código: nombrado de variables, estructura de carpetas, formato de commits (`feat:`, `fix:`, `chore:`)
- Crear tablero Kanban en Notion: Backlog → En Proceso → Probando → Completado
- Distribuir accesos a todos los integrantes en cada servicio
- Revisar DERCAS V3.1 con el equipo y resolver dudas conceptuales

### DEV — Edwin
- Inicializar Next.js 14 con App Router y Tailwind: `npx create-next-app@latest dercas-frontend`
- Crear estructura de carpetas: `/app/(auth)/login`, `/app/(dashboard)/chat`, `/knowledge`, `/reports`, `/agents`
- Implementar layout base con sidebar de navegación
- Pantalla `/chat`: lista de conversaciones + ventana de chat con mensajes JSON estáticos
- Pantalla `/knowledge`: tabla de documentos con botón "Subir documento" (sin lógica)
- Pantalla `/reports`: tarjetas con KPIs hardcodeados
- Pantalla `/agents`: tabla de agentes con roles, datos quemados
- Deploy en Vercel con CD automático en push a `main`

### DBA — Marlon
- Crear proyecto en Supabase. Guardar URL y anon key
- Habilitar pgvector: `CREATE EXTENSION IF NOT EXISTS vector;`
- Migration 001: tablas `tenant`, `agente`, `usuario`
- Migration 002: tablas `conversacion`, `mensaje`, `canal`
- Verificar FKs con queries de prueba (INSERT + SELECT con JOIN)
- Documentar schema en Notion

```sql
-- migration_001.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE tenant (
  id_tenant          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_empresa     VARCHAR(200) NOT NULL,
  plan               TEXT CHECK (plan IN ('free','pro','enterprise')),
  stripe_customer_id VARCHAR(100),
  timestamp_registro TIMESTAMPTZ DEFAULT now(),
  activo             BOOLEAN DEFAULT TRUE,
  config_bot         JSONB
);

CREATE TABLE agente (
  id_agente  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tenant  UUID REFERENCES tenant(id_tenant),
  nombre     VARCHAR(150) NOT NULL,
  email      VARCHAR(200) NOT NULL,
  rol        TEXT CHECK (rol IN ('agente','supervisor','admin')),
  disponible BOOLEAN DEFAULT TRUE,
  UNIQUE(id_tenant, email)  -- unicidad POR tenant, no global
);
```

### ANALISTA — Gerson
> Esta semana NO toca código del proyecto. Dedicación 100% a aprender RAG.
- Leer DERCAS V3.1 secciones 14 (C4), 17 (Pipeline RAG) y 18 (Multi-tenant)
- Estudiar LangChain: `RecursiveCharacterTextSplitter` y `OpenAIEmbeddings`
- Crear entorno Python: `python -m venv venv && pip install openai langchain psycopg2-binary fastapi uvicorn`
- Hacer prueba básica de embeddings con API key de OpenAI
- Subir un PDF, extraer texto con `PyPDFLoader`, dividir en chunks y verificar output
- Documentar aprendizajes en Notion

```python
# prueba_embeddings.py — verificar entorno OK
from openai import OpenAI

client = OpenAI(api_key='TU_API_KEY')
resp = client.embeddings.create(input='precio del producto', model='text-embedding-3-small')
vector = resp.data[0].embedding
print(f'Dimensiones: {len(vector)}')   # debe imprimir 1536
print(f'Primeros 5 valores: {vector[:5]}')
```

### QA — Melany
- Leer los 8 casos de uso (UC-01 a UC-08) del documento DERCAS V3.1
- Crear checklist en Notion para cada UC: precondición, pasos, resultado esperado, resultado obtenido
- Revisar el prototipo en Vercel y verificar que todas las pantallas están representadas
- Documentar inconsistencias entre prototipo y casos de uso
- Preparar plantilla de reporte de bugs: ID, descripción, pasos para reproducir, severidad, asignado a

---

## Semana 2 — Auth + Tenants + RBAC
**14–18 de abril de 2026 · AUTH CORE**

**Objetivo:** Reemplazar el prototipo estático con autenticación real. Supabase Auth maneja el login y el JWT. El frontend muestra u oculta secciones según el rol. La DB completa su schema con RLS activo. El analista implementa el Ingestion Service básico.

**Entregable:** Login real con Supabase Auth + RBAC visible en frontend + Schema SQL completo con RLS activo + Ingestion Service insertando chunks en pgvector.

### LÍDER — Daniel
- Inicializar proyecto FastAPI en `/backend` con estructura: `/gateway`, `/services`, `/models`
- Implementar `POST /messages` que valida JWT de Supabase y extrae `tenant_id` del payload
- Implementar middleware de rate limiting (100 req/min) con `slowapi`
- Crear variable de entorno `API_GATEWAY_URL` en Vercel apuntando al backend en Railway
- Deploy del API Gateway en Railway
- Definir contrato de API con Dev: qué manda Next.js, qué responde Python

```python
# gateway/main.py
from fastapi import FastAPI, Header, HTTPException, Depends
from jose import jwt

app = FastAPI()

def obtener_tenant(authorization: str = Header(...)):
    token = authorization.split(' ')[1]
    payload = jwt.decode(token, options={'verify_signature': False})
    tenant_id = payload.get('tenant_id')
    if not tenant_id:
        raise HTTPException(401, 'Sin tenant_id en el token')
    return tenant_id

@app.post('/messages')
async def recibir_mensaje(body: dict, tenant_id: str = Depends(obtener_tenant)):
    # tenant_id viene del JWT — NUNCA del body
    return {'status': 'ok', 'tenant': tenant_id}
```

### DEV — Edwin
- Instalar SDK: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs`
- Crear cliente Supabase en `/lib/supabase.ts`
- Implementar `/login` con `supabase.auth.signInWithPassword()`
- Crear `middleware.ts` que proteja rutas `/dashboard/*` y redirija a `/login` si no hay sesión
- Leer rol del JWT y guardarlo en contexto React (useContext o Zustand)
- RBAC en sidebar: Admin ve todo, Supervisor no ve `/knowledge` ni config, Agente solo ve `/chat`
- Crear API Route `/api/chat/route.ts` que obtiene JWT y lo manda al API Gateway

```typescript
// app/api/chat/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  const jwt = session?.access_token

  const { pregunta, conversacion_id } = await req.json()

  const res = await fetch(`${process.env.API_GATEWAY_URL}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ pregunta, conversacion_id })
  })
  return new Response(res.body, { headers: { 'Content-Type': 'text/event-stream' } })
}
```

### DBA — Marlon
- Migration 003: tabla `intencion` con `tenant_id` y `UNIQUE(id_tenant, nombre)`
- Migration 004: tabla `respuesta` con columna `embedding VECTOR(1536)` e índice `ivfflat`
- Migration 005: tablas `canal` y `reporte`
- Configurar RLS en todas las tablas (habilitar + política que filtra por `tenant_id` del JWT)
- Tests SQL: crear dos tenants de prueba, verificar que tenant A no ve datos de tenant B
- Documentar comandos de migración en README

```sql
-- migration_004.sql — tabla Respuesta con pgvector
CREATE TABLE respuesta (
  id_respuesta       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tenant          UUID REFERENCES tenant(id_tenant),
  id_intencion       UUID REFERENCES intencion(id_intencion),
  contenido          TEXT NOT NULL,
  embedding          VECTOR(1536),
  doc_origen         VARCHAR(500),
  version            INTEGER DEFAULT 1,
  publicada          BOOLEAN DEFAULT FALSE,
  timestamp_creacion TIMESTAMPTZ DEFAULT now(),
  id_creador         UUID REFERENCES agente(id_agente),
  deleted_at         TIMESTAMPTZ
);

CREATE INDEX ON respuesta USING ivfflat (embedding vector_cosine_ops);

ALTER TABLE respuesta ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON respuesta
  USING (id_tenant = (current_setting('app.tenant_id'))::uuid);
```

### ANALISTA — Gerson
- Crear `ingestion_service.py` con función `procesar_documento(ruta, id_tenant, nombre_doc)`
- Cargar PDF con `PyPDFLoader`, dividir con `RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)`
- Para cada chunk: llamar a OpenAI Embeddings y obtener vector de 1536 dims
- Conectar a Supabase con `psycopg2` e insertar cada chunk con su vector en tabla `respuesta`
- Probar con el PDF del documento DERCAS V3.1
- Crear endpoint FastAPI `POST /ingest`

```python
# ingestion_service.py
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from openai import OpenAI
import psycopg2

def procesar_documento(ruta_archivo, id_tenant, nombre_doc):
    loader = PyPDFLoader(ruta_archivo)
    paginas = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(paginas)

    client = OpenAI()
    conn = psycopg2.connect(SUPABASE_DB_URL)

    for chunk in chunks:
        resp = client.embeddings.create(input=chunk.page_content, model='text-embedding-3-small')
        vector = resp.data[0].embedding

        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO respuesta (id_tenant, contenido, embedding, doc_origen) VALUES (%s, %s, %s, %s)',
                (id_tenant, chunk.page_content, vector, nombre_doc)
            )
    conn.commit()
```

### QA — Melany
- Crear 3 cuentas de prueba en Supabase Auth: admin, supervisor, agente
- Probar login con cada cuenta y verificar sidebar según rol
- Intentar acceder a URLs protegidas sin sesión y verificar redirección a `/login`
- Documentar resultados en checklist de UC-05 (Consultar Historial)
- Reportar inconsistencias entre roles del frontend y la matriz de permisos de V3.1

---

## Semana 3 — Pipeline RAG + Chat funcional
**21–25 de abril de 2026 · RAG CORE**

**Objetivo:** La semana más importante. El chat responde preguntas reales basadas en documentos del tenant. El Query Service implementa el pipeline RAG completo: embedding → búsqueda vectorial → prompt → LLM → streaming. El DBA configura Redis para sesiones de conversación.

**Entregable:** Chat funcional con RAG real respondiendo desde documentos del tenant + Streaming en frontend + Redis almacenando contexto de sesión.

### LÍDER — Daniel
- Actualizar `POST /messages` para llamar al Query Service y retornar `StreamingResponse`
- Implementar manejo de errores: si Query Service falla → HTTP 500 con mensaje claro
- Agregar logging de cada request: timestamp, tenant_id, latencia, status code
- Verificar que `tenant_id` NUNCA viene del body — siempre del JWT
- Conectar endpoint `/ingest` del Ingestion Service al API Gateway como `POST /knowledge/upload`
- Probar flujo completo: subir PDF → hacer pregunta → ver respuesta del documento

### DEV — Edwin
- Actualizar `enviarMensaje()` en `chat/page.tsx` para leer respuesta en streaming con `getReader()`
- Implementar while loop de lectura del stream con `TextDecoder` para efecto de escritura en tiempo real
- Panel `/knowledge`: botón "Subir documento" con `POST /api/knowledge/upload` usando `FormData`
- Mostrar estado de procesamiento: `Procesando...` → `Listo` → `Error`
- Agregar indicador de carga en el chat mientras espera respuesta del bot

```typescript
// Lectura del stream en chat/page.tsx
async function enviarMensaje() {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pregunta: input, conversacion_id: convId })
  })

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let texto = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    texto += decoder.decode(value)
    setRespuestaStreaming(texto)  // actualiza UI en tiempo real
  }
}
```

### DBA — Marlon
- Crear cuenta en Upstash. Crear base de datos Redis en tier gratuito
- `pip install upstash-redis`
- Implementar `set_session(conv_id, historial)` con TTL=1800 (30 min)
- Implementar `get_session(conv_id)` que recupera historial de sesión activa
- Agregar URL y token de Upstash a variables de entorno
- Probar que TTL funciona: después de 30 min la sesión desaparece

```python
# redis_session.py
from upstash_redis import Redis
import json

redis = Redis(url=UPSTASH_URL, token=UPSTASH_TOKEN)

def get_session(conv_id: str) -> list:
    data = redis.get(f'session:{conv_id}')
    return json.loads(data) if data else []

def set_session(conv_id: str, historial: list):
    redis.set(f'session:{conv_id}', json.dumps(historial), ex=1800)

def agregar_mensaje(conv_id: str, rol: str, contenido: str):
    historial = get_session(conv_id)
    historial.append({'role': rol, 'content': contenido})
    historial = historial[-5:]  # solo últimos 5 mensajes
    set_session(conv_id, historial)
```

### ANALISTA — Gerson
- Crear `query_service.py` con función `async responder_pregunta(pregunta, id_tenant, conv_id)`
- Paso 1: vectorizar la pregunta con `text-embedding-3-small`
- Paso 2: query de similitud coseno en pgvector: `WHERE id_tenant = %s AND publicada = TRUE ORDER BY embedding <=> %s LIMIT 5`
- Paso 3: construir prompt con instrucción anti-alucinación + chunks + historial de Redis + pregunta
- Paso 4: llamar al LLM con `stream=True` y retornar `StreamingResponse`
- Probar caso de alucinación: preguntar algo que NO está en el doc → verificar que responde "No tengo esa información"

```python
# query_service.py
async def responder_pregunta(pregunta, id_tenant, conv_id):
    historial = get_session(conv_id)

    # Paso 1: vectorizar pregunta
    resp_emb = client.embeddings.create(input=pregunta, model='text-embedding-3-small')
    query_vector = resp_emb.data[0].embedding

    # Paso 2: buscar chunks relevantes
    cur.execute('''
        SELECT contenido FROM respuesta
        WHERE id_tenant = %s AND publicada = TRUE
        ORDER BY embedding <=> %s LIMIT 5
    ''', (id_tenant, query_vector))
    chunks = [row[0] for row in cur.fetchall()]

    # Paso 3: construir prompt
    contexto = '\n'.join([f'[{i+1}] {c}' for i, c in enumerate(chunks)])
    prompt = f'''Responde ÚNICAMENTE con el contexto.
Si no está en el contexto, di: No tengo esa información.
CONTEXTO: {contexto}
HISTORIAL: {historial}
PREGUNTA: {pregunta}'''

    # Paso 4: llamar al LLM con streaming
    return client.chat.completions.create(
        model='gpt-4o',
        messages=[{'role': 'user', 'content': prompt}],
        stream=True
    )
```

### QA — Melany
- Preparar set de 10 preguntas: 7 con respuesta en el doc, 3 sin respuesta
- Verificar que el bot dice "No tengo esa información" para las 3 sin respuesta
- Medir tiempo de respuesta del bot (meta: < 3 segundos hasta el primer token)
- Documentar resultados en checklist de UC-02 (Consultar Información Frecuente)

---

## Semana 4 — Escalamiento + Notificaciones + Onboarding
**28 de abril – 2 de mayo de 2026 · FUNCIONAL**

**Objetivo:** Implementar las tres funcionalidades más complejas: escalamiento a agente humano con notificaciones en tiempo real, onboarding self-service con Stripe, y cola de jobs asíncronos con BullMQ. Al final de esta semana el sistema es funcionalmente completo en sus flujos críticos.

**Entregable:** Escalamiento funcionando con WebSocket + Fallback email con Resend + Onboarding self-service con Stripe (modo test) + BullMQ procesando docs en background.

### LÍDER — Daniel
- Crear cuenta en Stripe. Instalar CLI: `stripe listen --forward-to localhost:8000/webhook`
- Implementar `POST /webhook` en FastAPI que recibe `payment_intent.succeeded`
- En el webhook: INSERT en `tenant` + INSERT en `agente` con `rol='admin'` usando email del pago
- Usar Resend para enviar email de bienvenida al nuevo admin
- Implementar flujo onboarding en Next.js: `/register` → verificar email → `/checkout` → `/dashboard`
- Probar flujo completo con tarjeta de prueba `4242 4242 4242 4242`

```python
# tenant_service.py — webhook de Stripe
@app.post('/webhook')
async def stripe_webhook(request: Request):
    payload = await request.body()
    event = stripe.Webhook.construct_event(
        payload, request.headers['stripe-signature'], STRIPE_SECRET
    )

    if event.type == 'payment_intent.succeeded':
        email = event.data.object.receipt_email
        plan  = event.data.object.metadata.get('plan', 'pro')
        cid   = event.data.object.customer

        cur.execute(
            'INSERT INTO tenant (nombre_empresa, plan, stripe_customer_id) VALUES (%s, %s, %s) RETURNING id_tenant',
            ('Empresa nueva', plan, cid)
        )
        tenant_id = cur.fetchone()[0]
        cur.execute(
            'INSERT INTO agente (id_tenant, email, rol) VALUES (%s, %s, %s)',
            (tenant_id, email, 'admin')
        )
        conn.commit()
    return {'status': 'ok'}
```

### DEV — Edwin
- Crear pantalla `/agents/conversations` con lista de conversaciones escaladas asignadas al agente
- Implementar cliente WebSocket en Next.js que se conecta al Notification Service al cargar el dashboard
- Al llegar notificación WebSocket: mostrar alerta visual y actualizar lista de conversaciones
- Panel de conversación escalada: historial completo + caja de texto para que el agente responda
- Implementar `POST /api/messages/agent` para que el agente envíe respuesta al usuario
- Pantalla de onboarding: `/register` con `supabase.auth.signUp()`

```typescript
// WebSocket client en dashboard del agente
useEffect(() => {
  const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/agente/${agenteId}`)

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.tipo === 'ESCALAMIENTO') {
      setNotificacion(data)
      refetchConversaciones()
    }
  }

  return () => ws.close()  // cleanup al desmontar
}, [agenteId])
```

### DBA — Marlon
- `npm install bullmq` (corre en Node.js, separado del backend Python)
- Crear cola `ingestion-queue` y worker que llama al Ingestion Service
- Modificar `POST /knowledge/upload` para solo encolar el job y retornar inmediatamente con `jobId`
- Implementar `GET /knowledge/status/:jobId` que retorna estado del job (pending, active, completed, failed)
- Probar con un PDF de 50+ páginas: endpoint responde inmediatamente mientras procesamiento corre en background

```javascript
// ingestion_worker.js — BullMQ worker
const { Worker } = require('bullmq')

const worker = new Worker('ingestion-queue', async (job) => {
  const { ruta_archivo, id_tenant, nombre_doc } = job.data

  await fetch(`${PYTHON_API}/ingest`, {
    method: 'POST',
    body: JSON.stringify({ ruta_archivo, id_tenant, nombre_doc })
  })

  return { status: 'completed' }
}, {
  connection: { url: process.env.UPSTASH_REDIS_URL }
})
```

### ANALISTA — Gerson
- Crear `notification_service.py` con FastAPI y soporte WebSockets
- Implementar endpoint `ws://host/ws/agente/{id_agente}` que mantiene conexión activa
- Implementar `escalar_conversacion(conv_id, tenant_id, score)`: busca agente disponible en DB
- Si agente tiene WebSocket activo → push con historial completo
- Si agente NO tiene WebSocket → Resend API con resumen y enlace
- Conectar al Query Service: si `score < umbral` → llamar a `escalar_conversacion()`
- Actualizar conversación a estado `escalada` + insertar mensaje "Te conectaré con un agente en breve."

```python
# notification_service.py
from fastapi import WebSocket
import resend

conexiones_activas: dict[str, WebSocket] = {}

@app.websocket('/ws/agente/{agente_id}')
async def ws_agente(ws: WebSocket, agente_id: str):
    await ws.accept()
    conexiones_activas[agente_id] = ws
    try:
        while True:
            await ws.receive_text()  # mantener vivo
    except:
        del conexiones_activas[agente_id]

async def notificar_agente(agente_id: str, payload: dict):
    if agente_id in conexiones_activas:
        await conexiones_activas[agente_id].send_json(payload)
    else:
        # Fallback: enviar email con Resend
        resend.Emails.send({
            'from': 'noreply@dercas.app',
            'to': payload['email_agente'],
            'subject': 'Nueva conversación escalada',
            'html': '<p>Tienes una conversación esperando.</p>'
        })
```

### QA — Melany
- Probar UC-04 completo: pregunta sin respuesta en doc → bot escala → agente recibe notificación en < 3 seg
- Probar fallback de email: cerrar panel del agente → hacer escalamiento → verificar email de Resend
- Probar UC-08 onboarding: registrar empresa con tarjeta de prueba → verificar creación del tenant
- Probar pago rechazado: tarjeta `4000 0000 0000 0002` → verificar que NO se crea tenant
- Documentar resultados en checklists correspondientes

---

## Semana 5 — Reportes + Historial + Pulido UI
**5–9 de mayo de 2026 · INTEGRACIÓN**

**Objetivo:** Cierre funcional. Implementar módulos de reportes y historial paginado, resolver deuda técnica acumulada, y ejecutar testing integral de RF-01 a RF-13. Al final de esta semana la aplicación debe estar feature-complete.

**Entregable:** Todos los RF-01 a RF-13 implementados + Reportes con descarga funcionando + Historial paginado con RBAC + Checklist QA completo + App en staging.

### LÍDER — Daniel
- Revisar todos los PRs pendientes y hacer merge de branches listas
- Identificar y priorizar deuda técnica: código duplicado, manejo de errores incompleto, falta de validaciones
- Configurar entorno de staging en Railway (rama `develop`) separado de producción
- Asegurar que todas las variables de entorno están documentadas en README
- Coordinar resolución de bugs críticos reportados por QA
- Implementar alerta automática al Admin cuando una intención supera 40% de escalamiento (RF-13)

### DEV — Edwin
- Pantalla `/reports`: selector de tipo de reporte (volumen, tiempos, escalamiento, CSAT) y rango de fechas
- Al solicitar reporte: `POST` al Motor de Reportes → spinner "Generando..." → botón de descarga con URL firmada
- Pantalla `/history`: tabla de conversaciones con filtros por usuario, fecha, canal y estado
- Paginación: botones anterior/siguiente, 20 conversaciones por página
- RBAC en historial: si el usuario es agente, query retorna SOLO sus conversaciones asignadas
- Mejorar responsive de pantallas críticas: chat, knowledge y dashboard principal

### DBA — Marlon
- Query reporte de volumen: COUNT de conversaciones por día agrupadas por canal e intención
- Query reporte de tiempos: `AVG(timestamp_fin - timestamp_inicio)` por intención
- Query reporte de escalamiento: COUNT escaladas / total por intención
- Encolar cada reporte como job en BullMQ para procesamiento asíncrono
- Generar CSV con resultados y subir a Supabase Storage con URL firmada TTL 24h
- Endpoint `GET /reports/:id` que retorna URL de descarga cuando el job está completo

```sql
-- Query de reporte de escalamiento por intención
SELECT
  i.nombre AS intencion,
  COUNT(*) AS total_mensajes,
  SUM(CASE WHEN c.estado = 'escalada' THEN 1 ELSE 0 END) AS escalados,
  ROUND(
    100.0 * SUM(CASE WHEN c.estado = 'escalada' THEN 1 ELSE 0 END) / COUNT(*), 2
  ) AS tasa_escalamiento_pct
FROM mensaje m
JOIN intencion i ON m.id_intencion = i.id_intencion
JOIN conversacion c ON m.id_conversacion = c.id_conversacion
WHERE m.id_tenant = %s
  AND m.timestamp_envio BETWEEN %s AND %s
GROUP BY i.nombre
ORDER BY tasa_escalamiento_pct DESC;
```

### ANALISTA — Gerson
- Revisar logs de conversaciones de prueba: identificar intenciones con score bajo o alta tasa de escalamiento
- Ajustar `chunk_size` y `chunk_overlap` si respuestas son muy cortas o pierden contexto
- Implementar RF-13: job periódico (cada hora) que verifica si alguna intención supera 40% de escalamiento y alerta al Admin vía Resend
- Optimizar query de pgvector con índice `ivfflat` si latencia supera 1 segundo
- Agregar manejo de errores al Query Service: si OpenAI falla → error 503 con mensaje claro
- Documentar umbrales de confianza recomendados por tipo de intención

### QA — Melany
- Ejecutar y documentar resultados para los 13 requerimientos funcionales (RF-01 a RF-13)
- Verificar los 7 KPIs operativos: tiempo respuesta < 3s, resolución ≥ 75%, CSAT ≥ 4.0, etc.
- Probar aislamiento multi-tenant: dos tenants, documentos distintos, verificar que cada bot solo responde con los suyos
- Reportar todos los bugs con severidad (crítico, alto, medio, bajo) y asignarlos al integrante correspondiente
- Preparar resumen ejecutivo de calidad para la evaluación semanal

---

## Semana 6 — Estabilización + Deploy + Demo final
**12–16 de mayo de 2026 · PRODUCCIÓN**

**Objetivo:** El foco es estabilidad, no features nuevas. Deploy completo a producción, corrección de últimos bugs críticos, optimización de performance, y demo final con tenant real configurado.

**Entregable:** App en producción + Demo lista con tenant configurado + Documentación entregada + Reporte final de calidad.

### LÍDER — Daniel
- Deploy frontend: dominio en Vercel + verificar HTTPS
- Deploy backend: mover variables de entorno de staging a producción en Railway
- Configurar Stripe modo LIVE (o dejar test para la demo)
- Crear tenant de demo con nombre real y 3–5 documentos representativos
- Crear usuarios de prueba: 1 admin, 1 supervisor, 1 agente — verificar que cada rol funciona
- Preparar guión de demo de 10 min: registro → configurar bot → subir doc → preguntar → escalar → ver reporte
- Ensayar la demo al menos 2 veces con el equipo

### DEV — Edwin
- Corregir todos los bugs de severidad alta y crítica reportados por QA en semana 5
- Pulir responsive del chat UI y panel admin para pantalla proyectada
- Agregar estados de error amigables: si el bot falla → mensaje claro (no pantalla en blanco)
- Verificar que Vercel usa variables de entorno de producción (no desarrollo)
- Smoke test en producción: login → chat → subir doc → ver reporte

### DBA — Marlon
- Ejecutar todas las migrations en Supabase producción en orden correcto
- Verificar RLS activo en todas las tablas
- Hacer backup del schema SQL completo: `pg_dump --schema-only`
- Verificar índice `ivfflat` de pgvector activo en producción
- Insertar datos iniciales del tenant de demo
- Monitorear latencia de queries durante la demo

```sql
-- Verificar RLS activo en todas las tablas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar índice ivfflat activo
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'respuesta'
  AND indexdef LIKE '%ivfflat%';
```

### ANALISTA — Gerson
- Indexar documentos del tenant de demo y hacer 20+ preguntas de calibración
- Ajustar `umbral_confianza` del tenant de demo al valor óptimo (entre 0.65 y 0.80)
- Verificar latencia del Query Service en producción (meta: p95 < 3 segundos)
- Preparar 5 preguntas demo que demuestren claramente el valor del sistema
- Plan B: si OpenAI falla durante la demo → tener capturas de pantalla de respuestas correctas

### QA — Melany
- Smoke test en producción: recorrer todos los flujos principales sin errores
- Prueba de aislamiento final: dos tenants en producción, documentos distintos, verificar que cada bot solo accede a los suyos
- Verificar que no hay datos sensibles en logs o UI
- Preparar reporte final de calidad: % de RF implementados, bugs resueltos vs reportados, KPIs alcanzados

---

## Requerimientos funcionales — referencia rápida

| Código | Prioridad | Descripción resumida |
|---|---|---|
| RF-01 | Alta | Registro de empresa con email/contraseña vía Supabase Auth → activa como Admin |
| RF-02 | Alta | Creación automática de Tenant al confirmar pago en Stripe |
| RF-03 | Alta | Almacenamiento de conversaciones con timestamps, estado y contexto (JSONB) |
| RF-04 | Alta | Pipeline RAG: embedding → búsqueda vectorial top-5 → generación LLM |
| RF-05 | Alta | Escalamiento a agente cuando score < umbral (default 70%) o solicitud explícita |
| RF-06 | Alta | Notification Service: WebSocket si agente en panel, email Resend si no lo está |
| RF-07 | Media | Historial paginado con filtros; agentes ven sus convs, supervisores/admins ven todas |
| RF-08 | Media | Registrar intención detectada y score_confianza en cada mensaje de tipo bot |
| RF-09 | Media | Reportes operativos asíncronos vía BullMQ sobre Upstash Redis |
| RF-10 | Alta | Admin puede crear/editar/publicar/eliminar (soft delete) entradas de la KB; embeddings automáticos |
| RF-11 | Alta | RBAC: Admin, Supervisor, Agente, Usuario Final (tenant) + Super Admin (plataforma) |
| RF-12 | Alta | Multi-tenancy con aislamiento completo vía tenant_id + RLS + filtro en pgvector |
| RF-13 | Media | Alerta automática al Admin si tasa de escalamiento de una intención supera el 40% |

---

## KPIs del sistema

| KPI | Meta |
|---|---|
| Tiempo de respuesta del bot | < 3 seg (p95) |
| Tasa de resolución automática | ≥ 75% |
| Tasa de escalamiento | ≤ 25% |
| Score de confianza promedio | ≥ 0.80 |
| Satisfacción (CSAT) | ≥ 4.0 / 5.0 |
| Disponibilidad del sistema | ≥ 99.5% |
| Cobertura de intenciones | ≥ 90% |
| Tiempo de onboarding (registro → bot activo) | < 30 min |

---

## Principios de arquitectura no negociables

1. **`tenant_id` siempre del JWT, nunca del body del request.**
2. **RLS activo en todas las tablas de PostgreSQL.**
3. **Cada búsqueda en pgvector incluye `WHERE id_tenant = $1`.**
4. **Soft delete en lugar de eliminación física (`deleted_at`).**
5. **Solo chunks con `publicada = TRUE` son visibles para el pipeline RAG.**
6. **El prompt del LLM siempre incluye la instrucción anti-alucinación:**
   > *"Responde ÚNICAMENTE con información del contexto entregado. Si la respuesta no está en el texto proporcionado, indícalo claramente: No tengo información sobre eso en mi base de conocimiento."*

---

*Documento generado a partir de DERCAS_Roadmap_Desarrollo v1.0 · Para dudas sobre el proyecto ver DERCAS_V3_1_Completo.docx*
