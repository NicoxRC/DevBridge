# DevBridge – MVP

Plataforma de internado tecnológico que conecta desarrolladores junior con proyectos reales de empresas,
supervisados por mentores. Prototipo funcional del Proyecto de Grado (UNAD – Grupo 202016907_69).

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + React Router + Apollo Client (Vite) |
| API | Python + FastAPI + Strawberry (GraphQL), dependencias con **uv** |
| Base de datos | PostgreSQL (SQLAlchemy) |
| Autenticación | JWT + contraseñas con bcrypt |
| Despliegue | Railway (backend, frontend y PostgreSQL) |

## Funcionalidades del MVP

| Historia | Qué hace |
|----------|----------|
| RF-01 / RF-02 | Registro con autorización de datos (Ley 1581) e inicio de sesión con roles: desarrollador u organización |
| RF-03 | Perfil del desarrollador: nivel, habilidades, intereses, disponibilidad y GitHub |
| RF-05 | Dashboard del desarrollador: postulaciones, entregas y métricas |
| RF-06 | La organización publica proyectos (tecnologías, nivel, duración, cupos, mentor) |
| RF-07 | Explorar y filtrar proyectos **sin registrarse** (búsqueda, tecnología, nivel, modalidad) |
| RF-08 / RF-09 | Detalle del proyecto y postulación (no permite postularse dos veces) |
| RF-10 | Proyectos recomendados con % de afinidad (matching) |
| RF-11 | La organización acepta o rechaza postulaciones respetando los cupos |
| RF-12 / RF-13 | El desarrollador entrega avances con enlace al repositorio; el mentor los aprueba o pide ajustes con comentario y calificación (1–5) |

**Matching (RF-10):** se excluyen los proyectos con nivel mayor al del desarrollador o que exigen más horas de las que
tiene disponibles; el resto se ordena por el porcentaje de tecnologías requeridas que el desarrollador ya maneja.
Quedan como trabajo futuro: matching con embeddings y pgvector, certificados verificables (RF-14), panel institucional
(RF-15), aprobación de organizaciones por un administrador (RF-16) e infraestructura en AWS con Terraform.

## Estructura

```
devbridge-mvp/
├── backend/            API GraphQL
│   ├── app/
│   │   ├── main.py     FastAPI + ruta /graphql y /health
│   │   ├── schema.py   tipos, queries y mutations GraphQL
│   │   ├── models.py   tablas: users, projects, applications, deliveries
│   │   ├── matching.py algoritmo de recomendación
│   │   ├── auth.py     JWT y contraseñas
│   │   ├── db.py       conexión a PostgreSQL
│   │   └── seed.py     datos de demostración
│   ├── pyproject.toml / uv.lock
│   └── Dockerfile
├── frontend/           aplicación React
│   └── src/
│       ├── pages/      Landing, Login, Registro, Perfil, Explorar, Detalle, Dashboard, Panel de la organización, Publicar proyecto
│       ├── components/ Layout (barra lateral) y componentes de interfaz
│       ├── graphql.js  consultas y mutaciones
│       └── auth.jsx    sesión del usuario
└── docker-compose.yml  PostgreSQL para desarrollo local
```

## Ejecutar en local

Requisitos: Python 3.12+, [uv](https://docs.astral.sh/uv/), Node 20+ y Docker (o un PostgreSQL instalado).

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend  →  http://localhost:8000/graphql
cd backend
uv sync
uv run python -m app.seed          # datos de demostración (opcional)
uv run uvicorn app.main:app --reload

# 3. Frontend  →  http://localhost:5173  (en otra terminal)
cd frontend
npm install
npm run dev
```

Cuentas de demostración (contraseña `devbridge123`):

| Rol | Correo |
|-----|--------|
| Desarrolladores | `nico@demo.com`, `laura@demo.com` |
| Organizaciones | `techcorp@demo.com`, `datainsight@demo.com` |

En `http://localhost:8000/graphql` se abre GraphiQL para probar la API.

## Variables de entorno

| Servicio | Variable | Ejemplo |
|----------|----------|---------|
| backend | `DATABASE_URL` | la entrega Railway al conectar PostgreSQL |
| backend | `JWT_SECRET` | una cadena larga aleatoria |
| backend | `CORS_ORIGINS` | `https://devbridge-web.up.railway.app` |
| frontend | `VITE_API_URL` | `https://devbridge-api.up.railway.app/graphql` |

## Despliegue en Railway

1. Subir este repositorio a GitHub y crear un proyecto en Railway.
2. **Agregar PostgreSQL**: *New → Database → PostgreSQL*.
3. **Servicio backend**: *New → GitHub Repo*, con *Root Directory* = `backend` (usa el `Dockerfile`).
   Variables: `DATABASE_URL = ${{Postgres.DATABASE_URL}}`, `JWT_SECRET` y `CORS_ORIGINS` (la URL del frontend).
   En *Settings → Networking* generar un dominio público.
4. **Servicio frontend**: *New → GitHub Repo*, con *Root Directory* = `frontend`.
   Variable `VITE_API_URL` = dominio del backend + `/graphql` (se usa al compilar).
   Railway ejecuta `npm run build` y `npm start`. Generar también un dominio público.
5. (Opcional) Cargar datos de demostración: en el servicio backend, ejecutar `python -m app.seed`
   desde la consola de Railway o con `railway run`.

Las tablas se crean automáticamente al iniciar la API.
