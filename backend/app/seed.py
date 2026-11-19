"""Carga datos de demostración. Uso: uv run python -m app.seed"""

from sqlalchemy import select

from . import models as m
from .auth import hash_password
from .db import Base, SessionLocal, engine

PASSWORD = "devbridge123"


def run():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    if db.scalar(select(m.User).where(m.User.email == "techcorp@demo.com")):
        print("Los datos de demostración ya existen.")
        return

    def user(**kw):
        u = m.User(password_hash=hash_password(PASSWORD), data_consent=True, **kw)
        db.add(u)
        return u

    techcorp = user(email="techcorp@demo.com", name="TechCorp S.A.S.", role="organization",
                    city="Pasto", bio="Empresa de desarrollo de software a la medida.")
    datainsight = user(email="datainsight@demo.com", name="DataInsight", role="organization",
                       city="Bogotá", bio="Analítica de datos para pymes.")
    user(email="nico@demo.com", name="Nico Rojas", role="developer", city="Pasto",
         level="junior", skills=["JavaScript", "React", "Node.js", "Git", "PostgreSQL"],
         interests=["Backend / APIs", "Full Stack"], availability_hours=20,
         github="https://github.com/")
    user(email="laura@demo.com", name="Laura Gómez", role="developer", city="Pasto",
         level="estudiante", skills=["Python", "HTML/CSS", "Git"], interests=["Data / IA"],
         availability_hours=10)
    db.flush()

    projects = [
        (techcorp, "API REST para E-commerce", "Desarrollar endpoints para gestión de productos, carrito y pagos.",
         ["Node.js", "PostgreSQL", "REST APIs", "Git"], "junior", 20, 8, "remoto", 2, "Ana García"),
        (techcorp, "Landing page institucional", "Maquetar la nueva landing page responsive de la empresa a partir de un diseño en Figma.",
         ["HTML/CSS", "JavaScript", "Figma"], "estudiante", 10, 4, "remoto", 3, "Luis Mora"),
        (datainsight, "Dashboard Analytics", "Panel de visualización de indicadores de ventas para clientes pyme.",
         ["React", "TypeScript", "GraphQL"], "recien_graduado", 15, 6, "hibrido", 1, "Carlos Vera"),
        (datainsight, "Limpieza de datos con Python", "Automatizar la depuración de bases de datos de clientes con scripts en Python.",
         ["Python", "PostgreSQL"], "estudiante", 10, 4, "remoto", 2, "María López"),
    ]
    for org, title, desc, skills, level, hours, weeks, modality, slots, mentor in projects:
        db.add(m.Project(org_id=org.id, title=title, description=desc, skills=skills, level=level,
                         hours_per_week=hours, duration_weeks=weeks, modality=modality, slots=slots,
                         mentor_name=mentor))
    db.commit()
    print(f"Datos de demostración creados. Contraseña de todas las cuentas: {PASSWORD}")


if __name__ == "__main__":
    run()
