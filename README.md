# DevBridge – MVP

Tech internship platform that connects junior developers with real company projects,
supervised by mentors. Working prototype of the Degree Project (UNAD – Group 202016907_69).

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router + Apollo Client (Vite) |
| API | Python + FastAPI + Strawberry (GraphQL), dependencies managed with **uv** |
| Database | PostgreSQL (SQLAlchemy) |
| Authentication | JWT + bcrypt-hashed passwords |
| Deployment | Railway (API and PostgreSQL) + Vercel (frontend) |

## MVP features

| Story | What it does |
|-------|--------------|
| RF-01 / RF-02 | Sign up with personal data authorization (Colombian Law 1581) and log in with roles: developer or organization |
| RF-03 | Developer profile: level, skills, interests, availability and GitHub |
| RF-05 | Developer dashboard: applications, deliveries and metrics |
| RF-06 | Organizations post projects (technologies, level, duration, slots, mentor) |
| RF-07 | Explore and filter projects **without signing up** (search, technology, level, modality) |
| RF-08 / RF-09 | Project detail and application (applying twice is not allowed) |
| RF-10 | Recommended projects with a match percentage (matching) |
| RF-11 | Organizations accept or reject applications within the available slots |
| RF-12 / RF-13 | Developers submit progress with a repository link; the mentor approves it or requests changes with a comment and a rating (1–5) |

**Matching (RF-10):** projects that require a higher level than the developer's, or more weekly hours than the
developer has available, are excluded; the rest are sorted by the percentage of required technologies the developer
already knows. Future work: embedding-based matching with pgvector, verifiable certificates (RF-14), institutional
dashboard (RF-15), organization approval by an administrator (RF-16) and AWS infrastructure with Terraform.

## Structure

```
devbridge-mvp/
├── backend/            GraphQL API
│   ├── app/
│   │   ├── main.py     FastAPI + /graphql and /health routes
│   │   ├── schema.py   GraphQL types, queries and mutations
│   │   ├── models.py   tables: users, projects, applications, deliveries
│   │   ├── matching.py recommendation algorithm
│   │   ├── auth.py     JWT and passwords
│   │   ├── db.py       PostgreSQL connection
│   │   └── seed.py     demo data
│   ├── pyproject.toml / uv.lock
│   └── Dockerfile
├── frontend/           React application
│   └── src/
│       ├── pages/      Landing, Login, Register, Profile, Explore, Project detail, Dashboard, Organization dashboard, New project
│       ├── components/ Layout (sidebar) and UI components
│       ├── graphql.js  queries and mutations
│       └── auth.jsx    user session
└── docker-compose.yml  PostgreSQL for local development
```

## Getting started

- Run it locally: [docs/local-setup.md](docs/local-setup.md)
- Contribute (branches, commits, PRs): [CONTRIBUTING.md](CONTRIBUTING.md)
