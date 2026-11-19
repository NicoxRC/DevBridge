"""Load demo data. Usage: uv run python -m app.seed"""

from sqlalchemy import select

from . import models as m
from .auth import hash_password
from .db import Base, SessionLocal, engine

PASSWORD = "devbridge123"


def run():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    if db.scalar(select(m.User).where(m.User.email == "techcorp@demo.com")):
        print("Demo data already exists.")
        return

    def user(**kw):
        u = m.User(password_hash=hash_password(PASSWORD), data_consent=True, **kw)
        db.add(u)
        return u

    techcorp = user(email="techcorp@demo.com", name="TechCorp S.A.S.", role="organization",
                    city="Pasto", bio="Custom software development company.")
    datainsight = user(email="datainsight@demo.com", name="DataInsight", role="organization",
                       city="Bogotá", bio="Data analytics for SMEs.")
    user(email="nico@demo.com", name="Nico Rojas", role="developer", city="Pasto",
         level="junior", skills=["JavaScript", "React", "Node.js", "Git", "PostgreSQL"],
         interests=["Backend / APIs", "Full Stack"], availability_hours=20,
         github="https://github.com/")
    user(email="laura@demo.com", name="Laura Gómez", role="developer", city="Pasto",
         level="student", skills=["Python", "HTML/CSS", "Git"], interests=["Data / IA"],
         availability_hours=10)
    db.flush()

    projects = [
        (techcorp, "E-commerce REST API", "Build endpoints for product, cart and payment management.",
         ["Node.js", "PostgreSQL", "REST APIs", "Git"], "junior", 20, 8, "remote", 2, "Ana García"),
        (techcorp, "Corporate landing page", "Build the company's new responsive landing page from a Figma design.",
         ["HTML/CSS", "JavaScript", "Figma"], "student", 10, 4, "remote", 3, "Luis Mora"),
        (datainsight, "Dashboard Analytics", "Sales KPI visualization dashboard for SME clients.",
         ["React", "TypeScript", "GraphQL"], "recent_graduate", 15, 6, "hybrid", 1, "Carlos Vera"),
        (datainsight, "Data cleaning with Python", "Automate cleanup of client databases with Python scripts.",
         ["Python", "PostgreSQL"], "student", 10, 4, "remote", 2, "María López"),
    ]
    for org, title, desc, skills, level, hours, weeks, modality, slots, mentor in projects:
        db.add(m.Project(org_id=org.id, title=title, description=desc, skills=skills, level=level,
                         hours_per_week=hours, duration_weeks=weeks, modality=modality, slots=slots,
                         mentor_name=mentor))
    db.commit()
    print(f"Demo data created. Password for all accounts: {PASSWORD}")


if __name__ == "__main__":
    run()
