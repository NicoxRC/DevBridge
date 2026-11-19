import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from .db import Base, engine
from .schema import get_context, schema

# Crea las tablas si no existen (suficiente para el MVP; a futuro, migraciones con Alembic).
Base.metadata.create_all(engine)

app = FastAPI(title="DevBridge API", version="0.1.0")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(GraphQLRouter(schema, context_getter=get_context), prefix="/graphql")


@app.get("/health")
def health():
    return {"status": "ok"}
