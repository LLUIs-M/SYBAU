# Roadmap de Nuevas Funcionalidades (Ollama + SYBAU)

Basado en la arquitectura actual y el potencial brutal de la API local de Ollama (https://docs.ollama.com/api/introduction), acá tenés una lista de funcionalidades pensadas para convertir este chat en una herramienta ultra profesional. 

No es solo hacer ping-pong de mensajes, ¡es darle control total al usuario sobre su motor de IA!

---

## 1. Selector de Cerebros (Gestión de Modelos Locales)
*La clásica experiencia de cambiar de modelo al vuelo.*
- **API a usar:** `GET /api/tags`
- **Funcionalidad:** En lugar de dejar el modelo harcodeado, mostramos un `<select>` moderno en el header o sidebar con todos los modelos que el usuario tiene instalados en su máquina (ej: `llama3`, `mistral`, `deepseek-coder`).
- **Valor agregado:** Es instantáneo y le da versatilidad a la app.

## 2. Descarga de Nuevos Modelos (Pulling Mode)
*Para no tener que abrir la terminal nunca más.*
- **API a usar:** `POST /api/pull`
- **Funcionalidad:** Una sección en la configuración donde escribís el nombre de un modelo (ej: `phi3:mini`) y le das a "Descargar". El backend hace streaming del proceso de descarga y el frontend muestra una barra de progreso que se va llenando.

## 3. Modo "Thinking" (Cadena de Pensamiento Visible)
*Como pediste: activación y desactivación del razonamiento.*
- **API a usar:** `POST /api/chat` (y control de UI)
- **Funcionalidad:** Un toggle o switch que diga "Mostrar Pensamiento" o "Deep Think". Si usas modelos enfocados en reasoning (como `deepseek-r1`), suelen escupir el razonamiento adentro de etiquetas `<think>...</think>`. Podemos capturar y ocultar/mostrar ese bloque en la UI con un estilo tipo "acordeón" (collapsible), igual que hace ChatGPT.
- **Valor agregado:** Fundamental cuando codeás y querés ver por qué el modelo tomó una decisión antes de darte el resultado.

## 4. Control Experto de Parámetros (Tuning del Modelo)
*Basta de modelos vainilla, dale palancas al usuario.*
- **API a usar:** `POST /api/chat` (usando el objeto `options`)
- **Funcionalidad:** Un panel lateral o modal donde el usuario pueda ajustar el alma del bot:
  - `temperature`: (Ej: 0.1 para código exacto, 0.8 para creatividad).
  - `num_ctx`: Ampliar la ventana de contexto si estás mandando un PDF enorme (ej: pasarlo de 2048 a 8192 si el hardware aguanta).
  - `seed`: Para reproducir respuestas exactas fijando la semilla aleatoria.

## 5. Creador de Asistentes Personalizados (Modelfiles On-The-Fly)
*Agentes con roles fijos.*
- **API a usar:** `POST /api/create`
- **Funcionalidad:** Una UI donde armás "Personajes". Le ponés nombre (Ej: "Experto en Python"), le clavás un `SYSTEM PROMPT` estricto y la app usa la API de Ollama para crear un Modelfile y empaquetarlo. Queda guardado como tu propio bot personal en el selector de modelos.

## 6. Monitor de Hardware y Rendimiento (Memoria)
*Si corrés local, la memoria es oro.*
- **API a usar:** `GET /api/ps` y parámetro `keep_alive`
- **Funcionalidad:** Mostrar en la barra de abajo un semáforo con el modelo que actualmente está cargado en la RAM/VRAM de la computadora (con uso de memoria y bytes). Así sumado agregar un botón de "Forzar Apagado" que envíe una petición a Ollama con `"keep_alive": 0` para vaciar la memoria RAM instantáneamente si la PC se trabó.

## 7. Soporte Multimodal Nativo (Lector de Imágenes)
*Porque chatear con texto es del 2022.*
- **API a usar:** `POST /api/chat` (enviando el array `images` con Base64)
- **Funcionalidad:** Si el usuario tiene descargado `llava` o un modelo multimodal, que pueda arrastrar una captura de pantalla al input del chat. El frontend procesa la imagen a Base64 y la API del backend se la tira a Ollama para que entienda qué hay en la imagen (ideal para debuggear errores visuales).

## 8. Function Calling (Integración de Herramientas Reales)
*Acá el proyecto se transforma en agente, no en loro.*
- **API a usar:** `POST /api/chat` (pasando el campo `tools` de OpenAI format soportado por modelos nuevos en Ollama)
- **Funcionalidad:** Darle al modelo herramientas del sistema operativo. Por ejemplo, que pueda ejecutar `bash` o leer la fecha de la PC. El modelo detecta si le pediste algo que deba hacer, pausa la generación, el backend lo ejecuta automáticamente, y se reanuda la charla.

---

### ¿Cómo seguir?
Te recomiendo empezar por la **(1) Gestión de Modelos Locales** y **(3) Modo Thinking**. Son fáciles de implementar en React, dan mucho impacto visual instantáneo y prueban que dominás el consumo dinámico de datos de la red. Una vez que tengas eso, sumás el **(4) Tuning**.
