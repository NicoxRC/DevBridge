"""MVP matching.

Simple, explainable version: filters out projects the developer cannot take
(higher required level or insufficient weekly availability) and sorts the rest by the
percentage of required skills the developer already has.
The embeddings + pgvector version described in the document is left as future work.
"""

from .models import Project, User

LEVELS = {"student": 0, "recent_graduate": 1, "junior": 2}


def _norm(items: list[str]) -> set[str]:
    return {s.strip().lower() for s in items or [] if s.strip()}


def score(dev: User, project: Project) -> tuple[int, list[str]] | None:
    """Return (score 0-100, matched skills) or None if the project is excluded."""
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
