# Running DevBridge locally

## Requirements

| Tool | Version | Used for |
|------|---------|----------|
| [Docker](https://docs.docker.com/get-docker/) | any recent | PostgreSQL database |
| [uv](https://docs.astral.sh/uv/getting-started/installation/) | any recent | Python dependencies and runner (installs Python 3.12 if needed) |
| [Node.js](https://nodejs.org/) | 18 or newer | Frontend (Vite) |

## 1. Clone the repository

```bash
git clone git@github.com:NicoxRC/DevBridge.git
cd DevBridge
```

## 2. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL 16 on `localhost:5432` (user, password and database: `devbridge`).
Data persists in the `pgdata` Docker volume.

## 3. Start the API (backend)

```bash
cd backend
uv sync
uv run python -m app.seed                 # optional: load demo data
uv run uvicorn app.main:app --reload      # http://localhost:8000
```

- Tables are created automatically on startup.
- GraphQL playground: <http://localhost:8000/graphql> — health check: <http://localhost:8000/health>.
- The defaults already point to the local database. To change them, export the variables listed in
  `backend/.env.example` before running (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`).

## 4. Start the web app (frontend)

In another terminal:

```bash
cd frontend
npm install
npm run dev                               # http://localhost:5173
```

The app calls `http://localhost:8000/graphql` by default. To use another API, copy
`frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.

## Demo accounts

After running the seed, every demo user has the password `devbridge123`:

| Email | Role |
|-------|------|
| `techcorp@demo.com` | Organization |
| `datainsight@demo.com` | Organization |
| `nico@demo.com` | Developer |
| `laura@demo.com` | Developer |

## Useful commands

| Task | Command |
|------|---------|
| Stop the database | `docker compose down` |
| Reset the database (deletes all data) | `docker compose down -v && docker compose up -d` |
| Frontend unit tests | `cd frontend && npm test` (watch mode: `npm run test:watch`) |
| Production build of the frontend | `cd frontend && npm run build` |
| Backend unit tests | `cd backend && uv run pytest` |

## Troubleshooting

- **`connection refused` on port 5432** — the database isn't running: `docker compose up -d`, then `docker compose ps`.
- **Port 5432 already in use** — another PostgreSQL is running locally; stop it or change the port mapping in `docker-compose.yml` and `DATABASE_URL`.
- **CORS error in the browser** — the frontend must run on the origin listed in `CORS_ORIGINS` (default `http://localhost:5173`).
