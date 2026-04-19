# Plan: SQLite Persistence para SYBAU

## Diagnóstico del estado actual

El frontend vive 100% en React state (`useState<Conversation[]>([])`).
Cuando recargás la página, **todo desaparece**. El backend es un proxy puro hacia Ollama — sin ninguna capa de datos propia.

El `CreateModelModal` envía el `modelfile` a Ollama y SYBAU nunca guarda el `system prompt` ni el `base_model` usado. El modelo existe en Ollama, pero SYBAU pierde el contexto de cómo fue creado.

---

## Qué vamos a persistir y por qué

| Dato | Por qué persisitir |
|------|-------------------|
| Conversaciones | Para sobrevivir recargas y poder retomar chats anteriores |
| Mensajes | Sin mensajes no hay historial útil |
| Modelos custom (metadata) | SYBAU necesita saber el `system_prompt` y `base_model` que usó para crearlo |

Lo que **NO** persistimos:
- Modelos base de Ollama (eso ya lo maneja Ollama)
- Opciones de tuning (son por sesión, son preferencias efímeras)
- Theme (ya está en `localStorage`)

---

## Stack y restricciones

- **Motor**: SQLite — incluido en Python stdlib, sin dependencias extras
- **Acceso**: módulo `sqlite3` nativo — sin ORM (el scope no lo justifica)
- **Archivo DB**: `backend/sybau.db` — gitignoreado
- **Sin usuarios, sin auth, local only**

---

## Schema de la base de datos

### `conversations`

```sql
CREATE TABLE conversations (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL DEFAULT 'New Conversation',
  model      TEXT NOT NULL,
  preview    TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### `messages`

```sql
CREATE TABLE messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL DEFAULT '',
  thinking        TEXT,
  model           TEXT,
  created_at      TEXT NOT NULL
);

CREATE INDEX idx_messages_conv ON messages(conversation_id);
```

### `custom_models`

```sql
CREATE TABLE custom_models (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  base_model   TEXT NOT NULL,
  system_prompt TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL
);
```

---

## Nuevos endpoints REST (backend)

Todos devuelven JSON. Los IDs son los mismos `nanoid` que ya genera el frontend.

### Conversaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/conversations` | Lista todas las conversaciones (sin mensajes) |
| `POST` | `/conversations` | Crea una conversación nueva |
| `GET` | `/conversations/<id>` | Trae una conversación con todos sus mensajes |
| `PATCH` | `/conversations/<id>` | Renombra (actualiza `title`) |
| `DELETE` | `/conversations/<id>` | Elimina conversación y sus mensajes (CASCADE) |

### Mensajes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/conversations/<id>/messages` | Persiste un mensaje (user o assistant) |
| `PATCH` | `/conversations/<id>/messages/<msg_id>` | Actualiza contenido (streaming completado) |

### Custom Models

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/custom_models` | Lista los modelos creados en SYBAU |
| `POST` | `/custom_models` | Guarda metadata de un modelo custom |
| `DELETE` | `/custom_models/<id>` | Borra el registro en SYBAU (no toca Ollama) |

---

## Cambios en el frontend

### App.tsx — carga inicial

```
useEffect(() => {
  fetch('/conversations') → setConversations(data)
}, [])
```

Las conversaciones llegan **sin mensajes** para que la sidebar sea rápida.

### Al seleccionar una conversación

Cuando el usuario clickea una conv en la sidebar → `GET /conversations/<id>` → se populan los mensajes. Hoy se muestran desde el state local; ahora se piden al servidor la primera vez (lazy load por conversación).

### Al enviar un mensaje

Flujo actual:
1. Crear user message en state
2. Crear assistant message placeholder en state
3. Stream del backend

Flujo nuevo:
1. `POST /conversations/<id>/messages` con el user message
2. Crear assistant message placeholder en state (sin DB todavía)
3. Stream del backend — acumular en state como hoy
4. Cuando el stream termina → `PATCH /conversations/<id>/messages/<assistant_id>` con el contenido final

### Al crear una conversación

```
POST /conversations  →  { id, title, model, created_at }
```

El `nanoid()` lo puede seguir generando el frontend y mandarlo como `id`, o el backend puede generarlo — a definir. Lo más simple: el frontend lo genera y lo manda.

### CreateModelModal — guardar metadata

Después de que Ollama confirme creación exitosa:
```
POST /custom_models  →  { id, name, base_model, system_prompt }
```

---

## Módulo `db.py` en el backend

Un archivo separado `backend/db.py` que encapsula toda la lógica SQLite:

```python
# Responsabilidades de db.py
- get_db()          # conexión con row_factory = sqlite3.Row
- init_db()         # CREATE TABLE IF NOT EXISTS (llamado al arrancar Flask)
- CRUD de conversations
- CRUD de messages
- CRUD de custom_models
```

`app.py` importa de `db.py` y solo hace el routing HTTP.

---

## Organización de archivos afectados

```
backend/
  app.py          # agrega los nuevos routes, importa db
  db.py           # NUEVO — toda la lógica SQLite
  sybau.db        # GENERADO — gitignoreado

frontend/src/
  App.tsx         # carga inicial desde API, save al enviar/crear
  components/
    CreateModelModal.tsx  # POST /custom_models al finalizar
```

---

## Flujo de arranque

```
Flask start
  → db.init_db()
    → CREATE TABLE IF NOT EXISTS (idempotente)
  → app listo
```

---

## Decisiones de diseño tomadas

1. **Sin ORM** — `sqlite3` stdlib es suficiente para este scope. SQLAlchemy sería overkill.
2. **Mensajes sin contenido intermedio** — Solo se persiste el mensaje del assistant cuando el stream termina. No se guardan estados parciales.
3. **IDs generados por el frontend** — El `nanoid` ya existe en `utils.ts`, lo mandamos en el body. Evita sincronización de IDs.
4. **DB en `backend/`** — Vive junto al proceso que la escribe. No hay razón para separarla.
5. **`ON DELETE CASCADE`** — Borrar una conversación borra todos sus mensajes automáticamente. No hay mensajes huérfanos.
6. **`custom_models` es metadata SYBAU** — No reemplaza ni toca Ollama. Es una fuente de verdad propia para poder mostrar el `system_prompt` original.

---

## Lo que esto NO hace (scope fuera)

- Búsqueda de mensajes
- Exportar conversaciones
- Sincronización entre dispositivos
- Paginación de mensajes (para el scope actual no hace falta)
