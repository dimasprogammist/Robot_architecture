# Architecture Canvas

Visual architecture studio for software, hardware, and robotic systems. Nested canvases, protocols, algorithms, requirements, and AI-ready export.

## Stack

- Frontend: React, TypeScript, Vite, React Flow (`@xyflow/react`), Zustand
- Backend: FastAPI, SQLAlchemy, SQLite (modular monolith)

## Run locally

Terminal 1 — API:

```bash
cd backend
PYTHONPATH=. python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Terminal 2 — UI:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

The Vite dev server proxies `/api` to the backend.

## Typical flow

1. Create a project (Robot template is a good start).
2. Drag Raspberry Pi, STM32, Camera, Motor Controller, MQTT from the library.
3. Connect blocks; set protocol on each edge.
4. Double-click STM32 to design internal architecture.
5. Describe the algorithm and add requirements.
6. **Export for AI** → copy the prompt into Cursor / Claude / ChatGPT.

## Data

Projects are stored in `backend/data/architecture_canvas.db`. Export JSON is semantic (components, connections, protocols, algorithms, requirements), not just canvas coordinates.

JSON import/export round-trips the full project snapshot under `project` in the envelope.
