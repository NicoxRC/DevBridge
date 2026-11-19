from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    """Desarrollador junior u organización (empresa / institución)."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(150))
    role: Mapped[str] = mapped_column(String(20))  # developer | organization
    city: Mapped[str] = mapped_column(String(100), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    # Campos del perfil del desarrollador
    level: Mapped[str] = mapped_column(String(30), default="estudiante")
    skills: Mapped[list] = mapped_column(JSON, default=list)
    interests: Mapped[list] = mapped_column(JSON, default=list)
    availability_hours: Mapped[int] = mapped_column(Integer, default=10)
    github: Mapped[str] = mapped_column(String(255), default="")
    data_consent: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    projects: Mapped[list["Project"]] = relationship(back_populates="organization")
    applications: Mapped[list["Application"]] = relationship(back_populates="developer")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    skills: Mapped[list] = mapped_column(JSON, default=list)
    level: Mapped[str] = mapped_column(String(30), default="estudiante")
    hours_per_week: Mapped[int] = mapped_column(Integer, default=10)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=8)
    modality: Mapped[str] = mapped_column(String(20), default="remoto")
    slots: Mapped[int] = mapped_column(Integer, default=2)
    mentor_name: Mapped[str] = mapped_column(String(150), default="")
    status: Mapped[str] = mapped_column(String(20), default="publicado")  # publicado | cerrado
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    organization: Mapped[User] = relationship(back_populates="projects")
    applications: Mapped[list["Application"]] = relationship(back_populates="project")


class Application(Base):
    """Postulación de un desarrollador a un proyecto."""

    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("project_id", "developer_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    developer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="enviada")  # enviada | aceptada | rechazada
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    project: Mapped[Project] = relationship(back_populates="applications")
    developer: Mapped[User] = relationship(back_populates="applications")
    deliveries: Mapped[list["Delivery"]] = relationship(
        back_populates="application", order_by="Delivery.created_at"
    )


class Delivery(Base):
    """Entrega de avance (sprint) con enlace al repositorio, revisada por el mentor."""

    __tablename__ = "deliveries"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"))
    title: Mapped[str] = mapped_column(String(200))
    link: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="pendiente")  # pendiente | aprobada | ajustes
    feedback: Mapped[str] = mapped_column(Text, default="")
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    application: Mapped[Application] = relationship(back_populates="deliveries")
