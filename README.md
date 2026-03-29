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
