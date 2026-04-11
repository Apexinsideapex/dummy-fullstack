# Barebones Fullstack Application

A simple interview boilerplate with a React frontend and Python backend.

## Tech Stack

- **Frontend**: React (TypeScript) + Vite
- **Backend**: FastAPI (Python)
- **Package Managers**: [Bun](https://bun.sh/) (Frontend) and [uv](https://github.com/astral-sh/uv) (Backend)

## Getting Started

### Prerequisites

Ensure you have `bun` and `uv` installed on your machine.

---

### Backend Setup (Python)

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
uv sync
```

To start the backend server:

```bash
# Using the main script
uv run python main.py

# Or via uvicorn directly
uv run uvicorn main:app --reload --port 8000
```

The API will be available at [http://localhost:8000/api/hello](http://localhost:8000/api/hello).

---

### Frontend Setup (React)

Navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
bun install
```

To start the frontend development server:

```bash
bun run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## API Endpoints

- `GET /api/hello`: Returns a greeting message.
- `GET /api/health`: Basic health check for the API.

## Architecture Notes

### API calls use relative URLs
The frontend calls `/api/*` (not `http://localhost:8000/api/*`). Vite proxies these to the FastAPI backend on port 8000 during development. This is intentional — it means one tunnel covers both frontend and backend when using tools like Cloudflare Tunnels.

**Do not change fetch calls back to `http://localhost:8000`** — they will break when the app is accessed via any URL that isn't localhost (tunnels, deployed environments, etc.).

### Running with a public preview URL (ShipYard)
This repo is used as the starter repo for ShipYard live coding sessions. When running inside a ShipYard workspace (code-server on Fly.io), use the `preview` command to expose the app publicly:

```bash
# Terminal 1 — start the backend
cd backend && uv run uvicorn main:app --reload --port 8000

# Terminal 2 — start the frontend
cd frontend && bun run dev

# Terminal 3 — open a public tunnel to the frontend (covers backend via Vite proxy)
preview 5173
```

This prints a `trycloudflare.com` URL. Open it in a new tab to see the running app.

### Vite proxy config
`frontend/vite.config.ts` is configured with:
- `server.allowedHosts: true` — required so Cloudflare tunnel URLs are not blocked by Vite's host check
- `server.proxy['/api']` — proxies `/api/*` requests to `http://localhost:8000`

### CORS
The FastAPI backend allows all origins (`allow_origins: ["*"]`). This is safe because in development the frontend and backend are on the same machine, and in production all API traffic goes through the Vite proxy (same origin). Do not restrict CORS to `localhost:5173` as it will break tunnel and deployed access.

## Project Structure

```text
.
├── backend/            # Python FastAPI backend
│   ├── main.py
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/           # React TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── bun.lockb
├── .gitignore          # Environment & dependency ignores
└── README.md
```
