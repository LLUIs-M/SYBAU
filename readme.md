# LLuMi — Web ui for local llm's

A local-first AI chat interface powered by [Ollama](https://ollama.com). Supports multimodal input (text, PDF, images, audio), real-time streaming responses, and on-device speech transcription via Whisper — no cloud required.

---

## Architecture

Monorepo with a decoupled React frontend and Flask backend.

```
SYBAU/
├── backend/                  # Flask REST API
│   ├── app.py                # API entrypoint — chat endpoint, file processing, Ollama streaming
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── App.tsx           # Root component — state management, streaming loop
│   │   ├── types.ts          # Shared TypeScript types
│   │   └── components/
│   │       ├── ChatMessage.tsx   # Message renderer (Markdown + <think> blocks)
│   │       └── ChatInput.tsx     # Input area (text, file attach, mic)
│   └── vite.config.ts
└── package.json              # Root scripts (concurrently)
```

### Data flow

```
User input (text / PDF / image / audio)
        ↓
   ChatInput.tsx
        ↓
   POST /chat  (FormData)
        ↓
   Flask backend
     ├── PDF      → PyMuPDF text extraction
     ├── Image    → base64 encoded for vision models
     └── Audio    → Whisper local transcription
        ↓
   Ollama API (localhost:11434) — streaming
        ↓
   Raw byte stream (text/event-stream)
        ↓
   ReadableStream reader in App.tsx
        ↓
   ChatMessage.tsx — parses <think> blocks, renders Markdown
```

---

## Prerequisites

- [Ollama](https://ollama.com) running locally on port `11434`
- Python 3.10+ with a virtual environment
- Node.js 18+

Pull at least one model before running:

```bash
ollama pull deepseek-r1:8b
```

---

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

---

## Running

From the project root:

```bash
npm run dev
```

> The backend script uses `backend/venv/bin/python` directly — no need to activate the virtual environment manually.

This starts both servers in parallel:

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:5000  |

To run them individually:

```bash
npm run dev:back    # Flask only
npm run dev:front   # Vite only
```

---

## Supported Models

| Model | Use case |
|-------|----------|
| `deepseek-r1:8b` | General reasoning with visible chain-of-thought |
| `gemma4:e4b` | General purpose |
| `qwen2.5-coder:7b` | Code generation and review |
| `llava:latest` | Vision — image understanding |

Add more models by pulling them with `ollama pull <model>` and adding an entry to the `MODELS` array in [frontend/src/App.tsx](frontend/src/App.tsx).

---

## Features

- **Streaming responses** — token-by-token output via `ReadableStream`, no waiting for the full response
- **Chain-of-thought display** — `<think>` blocks rendered as a collapsible panel, visible during streaming
- **Markdown rendering** — full GFM support via `react-markdown` + `remark-gfm`
- **PDF attachment** — text extracted server-side via PyMuPDF and injected into the prompt
- **Image attachment** — base64 encoded and sent to vision-capable models
- **Audio transcription** — `.mp3 / .wav / .ogg / .m4a` transcribed locally via OpenAI Whisper (tiny model, no network)
- **Text-to-speech** — browser Web Speech API reads assistant responses aloud
- **Voice input** — browser SpeechRecognition API dictates into the input field
- **Stop generation** — abort the active request mid-stream

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Python, Flask, Flask-CORS |
| AI runtime | Ollama (local) |
| Speech-to-text | OpenAI Whisper (tiny, offline) |
| PDF parsing | PyMuPDF (fitz) |
| Dev tooling | concurrently |
