# Plan de Refactorización a Monorepo: React (Vite) + Flask

Este documento detalla paso a paso la estrategia de migración desde una aplicación monolítica simple de Flask (con plantillas HTML) hacia una arquitectura profesional Full-Stack usando un **Monorepo (Frontend React/Vite + Backend Flask)**.

---

## Fase 1: Reestructuración Física y Entorno

**Objetivo:** Separar las responsabilidades físicas (Frontend y Backend) sin perder el contexto del proyecto unificado.

1. **Crear carpetas raíz:**
   - En la raíz del proyecto (`SYBAU/`), crear dos carpetas: `backend/` y `frontend/`.
2. **Mover el Backend existente:**
   - Mover `app.py`, `ffmpeg.exe` (si estás en Windows), y la carpeta `templates/` adentro de la nueva carpeta `backend/`.
   - Crear un archivo `backend/requirements.txt` con las dependencias actuales (`flask`, `requests`, `PyMuPDF`, `openai-whisper`, `flask-cors`, `imageio_ffmpeg`).
3. **Limpieza del Git:**
   - Asegurar que `.gitignore` esté correctamente configurado en la raíz para ignorar `node_modules/`, `__pycache__/`, y entornos virtuales (`vnev/`, `env/`).

---

## Fase 2: Inicialización del Frontend (React + Vite)

**Objetivo:** Crear una SPA moderna, rápida y empaquetable.

1. **Scaffolding de Vite:**
   - Correr en la raíz: `npm create vite@latest frontend -- --template react-ts` (o `react` puro si prefieren JS sin tipado).
2. **Instalación de Dependencias UI:**
   - Sugiero fuertemente usar **TailwindCSS** para recrear y mejorar la UI actual, junto con dependencias para parsear Markdown (ya que Ollama responde en MD):
     ```bash
     cd frontend
     npm install
     npm install -D tailwindcss postcss autoprefixer
     npx tailwindcss init -p
     npm install react-markdown remark-gfm
     ```
3. **Configuración del Entorno Frontend:**
   - Configurar Tailwind en el `tailwind.config.js` y en el `index.css` borrando el código por defecto de Vite.

---

## Fase 3: Puesta a punto de la API Backend (Flask)

**Objetivo:** Convertir Flask de un "renderizador de páginas" a una auténtica REST API preparada para Streaming.

1. **Implementar CORS:**
   - Instalar `Flask-CORS` (`pip install flask-cors`).
   - Modificar `app.py` para inyectar CORS y permitir que Vite (usualmente en `localhost:5173`) consulte al puerto `5000`:

     ```python
     from flask import Flask, request, Response, stream_with_context
     from flask_cors import CORS

     app = Flask(__name__)
     CORS(app) # Importante para evitar bloqueos del navegador
     ```

2. **Eliminar el Ruteo de UI:**
   - Borrar la ruta `def index(): return render_template('index.html')` ya que de eso se encargará React.
3. **Mantener el Endpoing de `/chat`:**
   - Tu endpoint de `/chat` procesando archivos (PDF, Audio, Imágenes) está muy bien armado. Asegurate de que devuelva siempre encabezados de SSE (Server-Sent Events) o JSON puro si hay error visible.
   - El código de `stream_with_context(generate())` se mantiene intacto.

---

## Fase 4: Refactorización y Consumo en React

**Objetivo:** Recrear la vista de chat en componentes React y conectar el flujo de datos.

1. **Estructura de Componentes en `src/`:**
   - `App.jsx` o `App.tsx` (Contenedor principal).
   - `components/ChatMessage.jsx` (Para renderizar globos del usuario y bot aplicando `react-markdown`).
   - `components/ChatInput.jsx` (Para manejar el texto y los adjuntos como audio/PDF).
2. **Consumo del Streaming SSE:**
   - En React, en vez del `fetch` estándar que espera a que termine toda la respuesta, debes usar la **Fetch API con un Reader de Streams** para lograr el efecto "máquina de escribir":
     ```javascript
     const response = await fetch("http://127.0.0.1:5000/chat", {
       method: "POST",
       body: formData,
     });
     const reader = response.body.getReader();
     const decoder = new TextDecoder("utf-8");
     // Loop de lectura...
     ```
3. **Gestión de Estado:**
   - Usar `useState` para el historial (`messages`), `isLoading`, y `currentStreamingMessage` localmente.

---

## Fase 5: Scripting Útil (Opcional pero Recomendado)

**Objetivo:** Iniciar todo el proyecto con un solo comando.

1. **Package.json en la Raíz:**
   - Crear un `package.json` en la raíz de `SYBAU/`.
   - Instalar `concurrently`: `npm install -D concurrently`.
   - Agregar estos scripts:
     ```json
     "scripts": {
       "dev:front": "cd frontend && npm run dev",
       "dev:back": "cd backend && python app.py",
       "dev": "concurrently \"npm run dev:back\" \"npm run dev:front\""
     }
     ```
   - _Nota: Asegurate de que tu entorno virtual de Python esté activado o modifica "dev:back" para usar el path absoluto a python.exe._

---

** Nota del Arquitecto:** Siguiendo este plan de forma lineal, lográs en menos de 2 horas un stack robusto sin código espagueti. Al pasarlo por React, vas a poder modularizar muchísimo la UI y meter un diseño que rompa cabezas sin pelear con el Vanilla JS. ¡Mucho éxito en la refactorización!
