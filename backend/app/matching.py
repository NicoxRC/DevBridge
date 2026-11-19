"""Matching del MVP.

Versión simple y explicable: filtra los proyectos que el desarrollador no puede tomar
(nivel requerido mayor o disponibilidad semanal insuficiente) y ordena el resto por el
porcentaje de habilidades requeridas que el desarrollador ya maneja.
La versión con embeddings + pgvector descrita en el documento queda como trabajo futuro.
"""

from .models import Project, User

LEVELS = {"estudiante": 0, "recien_graduado": 1, "junior": 2}


def _norm(items: list[str]) -> set[str]:
    return {s.strip().lower() for s in items or [] if s.strip()}


def score(dev: User, project: Project) -> tuple[int, list[str]] | None:
    """Devuelve (puntaje 0-100, habilidades coincidentes) o None si el proyecto se excluye."""
    if LEVELS.get(dev.level, 0) < LEVELS.get(project.level, 0):
        return None
    if (dev.availability_hours or 0) < (project.hours_per_week or 0):
        return None
    required = _norm(project.skills)
    if not required:
        return None
    matched = required & _norm(dev.skills)
    if not matched:
        return None
    pct = round(100 * len(matched) / len(required))
    original = [s for s in project.skills if s.strip().lower() in matched]
    return pct, original


def recommend(dev: User, projects: list[Project], limit: int = 10):
    results = []
    for p in projects:
        r = score(dev, p)
        if r:
            results.append((p, r[0], r[1]))
    results.sort(key=lambda x: (-x[1], -x[0].id))
    return results[:limit]
