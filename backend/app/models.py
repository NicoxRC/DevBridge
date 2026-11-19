from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    """Junior developer or organization (company / institution)."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(150))
    role: Mapped[str] = mapped_column(String(20))  # developer | organization
    city: Mapped[str] = mapped_column(String(100), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    # Developer profile fields
    level: Mapped[str] = mapped_column(String(30), default="student")
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
    level: Mapped[str] = mapped_column(String(30), default="student")
    hours_per_week: Mapped[int] = mapped_column(Integer, default=10)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=8)
    modality: Mapped[str] = mapped_column(String(20), default="remote")
    slots: Mapped[int] = mapped_column(Integer, default=2)
    mentor_name: Mapped[str] = mapped_column(String(150), default="")
    status: Mapped[str] = mapped_column(String(20), default="published")  # published | closed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    organization: Mapped[User] = relationship(back_populates="projects")
    applications: Mapped[list["Application"]] = relationship(back_populates="project")


class Application(Base):
    """A developer's application to a project."""

    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("project_id", "developer_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    developer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="submitted")  # submitted | accepted | rejected
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    project: Mapped[Project] = relationship(back_populates="applications")
    developer: Mapped[User] = relationship(back_populates="applications")
    deliveries: Mapped[list["Delivery"]] = relationship(
        back_populates="application", order_by="Delivery.created_at"
    )


class Delivery(Base):
    """Progress delivery (sprint) with a repository link, reviewed by the mentor."""

    __tablename__ = "deliveries"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"))
    title: Mapped[str] = mapped_column(String(200))
    link: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | approved | changes_requested
    feedback: Mapped[str] = mapped_column(Text, default="")
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    application: Mapped[Application] = relationship(back_populates="deliveries")
