from datetime import datetime
from functools import cached_property
from typing import Optional

import strawberry
from sqlalchemy import func, or_, select
from strawberry.fastapi import BaseContext
from strawberry.types import Info

from . import models as m
from .auth import create_token, decode_token, hash_password, verify_password
from .db import SessionLocal
from .matching import recommend

SKILLS_CATALOG = [
    "JavaScript", "TypeScript", "Python", "Java", "React", "Node.js", "FastAPI", "Django",
    "HTML/CSS", "PostgreSQL", "MongoDB", "Docker", "Git", "REST APIs", "GraphQL",
    "React Native", "Flutter", "AWS", "Testing", "Figma",
]
INTERESTS_CATALOG = ["Backend / APIs", "Frontend / UI", "Full Stack", "Mobile", "Data / AI", "DevOps"]


# --------------------------------------------------------------------------- context
class Context(BaseContext):
    def __init__(self):
        super().__init__()
        self.db = SessionLocal()

    @cached_property
    def user(self) -> m.User | None:
        if not self.request:
            return None
        header = self.request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None
        uid = decode_token(header[7:])
        return self.db.get(m.User, uid) if uid else None

    def require(self, role: str | None = None) -> m.User:
        if not self.user:
            raise Exception("You must be logged in.")
        if role and self.user.role != role:
            raise Exception("You do not have permission for this action.")
        return self.user


async def get_context():
    ctx = Context()
    try:
        yield ctx
    finally:
        ctx.db.close()


# --------------------------------------------------------------------------- types
@strawberry.type
class Organization:
    id: int
    name: str
    city: str
    bio: str


@strawberry.type
class Delivery:
    id: int
    title: str
    link: str
    status: str
    feedback: str
    rating: Optional[int]
    created_at: datetime


@strawberry.type
class DeveloperSummary:
    id: int
    name: str
    city: str
    level: str
    skills: list[str]
    github: str


@strawberry.type
class Application:
    id: int
    status: str
    message: str
    created_at: datetime
    _obj: strawberry.Private[m.Application]

    @strawberry.field
    def project(self) -> "Project":
        return Project.from_model(self._obj.project)

    @strawberry.field
    def developer(self) -> DeveloperSummary:
        d = self._obj.developer
        return DeveloperSummary(id=d.id, name=d.name, city=d.city, level=d.level,
                                skills=d.skills or [], github=d.github)

    @strawberry.field
    def deliveries(self) -> list[Delivery]:
        return [Delivery(id=x.id, title=x.title, link=x.link, status=x.status, feedback=x.feedback,
                         rating=x.rating, created_at=x.created_at) for x in self._obj.deliveries]

    @classmethod
    def from_model(cls, a: m.Application) -> "Application":
        return cls(id=a.id, status=a.status, message=a.message, created_at=a.created_at, _obj=a)


@strawberry.type
class Project:
    id: int
    title: str
    description: str
    skills: list[str]
    level: str
    hours_per_week: int
    duration_weeks: int
    modality: str
    slots: int
    mentor_name: str
    status: str
    created_at: datetime
    _obj: strawberry.Private[m.Project]

    @strawberry.field
    def organization(self) -> Organization:
        o = self._obj.organization
        return Organization(id=o.id, name=o.name, city=o.city, bio=o.bio)

    @strawberry.field
    def applications_count(self) -> int:
        return len(self._obj.applications)

    @strawberry.field
    def accepted_count(self) -> int:
        return sum(1 for a in self._obj.applications if a.status == "accepted")

    @strawberry.field
    def my_application(self, info: Info) -> Optional[Application]:
        user = info.context.user
        if not user:
            return None
        for a in self._obj.applications:
            if a.developer_id == user.id:
                return Application.from_model(a)
        return None

    @strawberry.field
    def applications(self, info: Info) -> list[Application]:
        """Only the organization that owns the project can see its applications."""
        user = info.context.user
        if not user or user.id != self._obj.org_id:
            return []
        return [Application.from_model(a) for a in self._obj.applications]

    @classmethod
    def from_model(cls, p: m.Project) -> "Project":
        return cls(id=p.id, title=p.title, description=p.description, skills=p.skills or [],
                   level=p.level, hours_per_week=p.hours_per_week, duration_weeks=p.duration_weeks,
                   modality=p.modality, slots=p.slots, mentor_name=p.mentor_name, status=p.status,
                   created_at=p.created_at, _obj=p)


@strawberry.type
class User:
    id: int
    email: str
    name: str
    role: str
    city: str
    bio: str
    level: str
    skills: list[str]
    interests: list[str]
    availability_hours: int
    github: str

    @classmethod
    def from_model(cls, u: m.User) -> "User":
        return cls(id=u.id, email=u.email, name=u.name, role=u.role, city=u.city, bio=u.bio,
                   level=u.level, skills=u.skills or [], interests=u.interests or [],
                   availability_hours=u.availability_hours, github=u.github)


@strawberry.type
class AuthPayload:
    token: str
    user: User


@strawberry.type
class Recommendation:
    project: Project
    score: int
    matched_skills: list[str]


@strawberry.type
class Catalogs:
    skills: list[str]
    interests: list[str]


# --------------------------------------------------------------------------- inputs
@strawberry.input
class RegisterInput:
    name: str
    email: str
    password: str
    role: str  # developer | organization
    data_consent: bool


@strawberry.input
class ProfileInput:
    name: str
    city: str = ""
    bio: str = ""
    level: str = "student"
    skills: list[str] = strawberry.field(default_factory=list)
    interests: list[str] = strawberry.field(default_factory=list)
    availability_hours: int = 10
    github: str = ""


@strawberry.input
class ProjectInput:
    title: str
    description: str
    skills: list[str]
    level: str = "student"
    hours_per_week: int = 10
    duration_weeks: int = 8
    modality: str = "remote"
    slots: int = 2
    mentor_name: str = ""


# --------------------------------------------------------------------------- query
@strawberry.type
class Query:
    @strawberry.field
    def me(self, info: Info) -> Optional[User]:
        u = info.context.user
        return User.from_model(u) if u else None

    @strawberry.field
    def catalogs(self) -> Catalogs:
        return Catalogs(skills=SKILLS_CATALOG, interests=INTERESTS_CATALOG)

    @strawberry.field(description="Public list of published projects (no login required).")
    def projects(self, info: Info, search: Optional[str] = None, skill: Optional[str] = None,
                 level: Optional[str] = None, modality: Optional[str] = None) -> list[Project]:
        q = select(m.Project).where(m.Project.status == "published")
        if search:
            like = f"%{search.lower()}%"
            q = q.where(or_(func.lower(m.Project.title).like(like), func.lower(m.Project.description).like(like)))
        if level:
            q = q.where(m.Project.level == level)
        if modality:
            q = q.where(m.Project.modality == modality)
        rows = info.context.db.scalars(q.order_by(m.Project.created_at.desc())).all()
        if skill:
            rows = [p for p in rows if skill.lower() in [s.lower() for s in p.skills or []]]
        return [Project.from_model(p) for p in rows]

    @strawberry.field
    def project(self, info: Info, id: int) -> Optional[Project]:
        p = info.context.db.get(m.Project, id)
        return Project.from_model(p) if p else None

    @strawberry.field
    def recommended_projects(self, info: Info, limit: int = 10) -> list[Recommendation]:
        dev = info.context.require("developer")
        db = info.context.db
        applied = {a.project_id for a in dev.applications}
        candidates = [p for p in db.scalars(select(m.Project).where(m.Project.status == "published")).all()
                      if p.id not in applied]
        return [Recommendation(project=Project.from_model(p), score=s, matched_skills=ms)
                for p, s, ms in recommend(dev, candidates, limit)]

    @strawberry.field
    def my_applications(self, info: Info) -> list[Application]:
        dev = info.context.require("developer")
        return [Application.from_model(a) for a in sorted(dev.applications, key=lambda a: a.created_at, reverse=True)]

    @strawberry.field
    def my_projects(self, info: Info) -> list[Project]:
        org = info.context.require("organization")
        return [Project.from_model(p) for p in sorted(org.projects, key=lambda p: p.created_at, reverse=True)]


# --------------------------------------------------------------------------- mutation
@strawberry.type
class Mutation:
    @strawberry.mutation
    def register(self, info: Info, input: RegisterInput) -> AuthPayload:
        db = info.context.db
        if not input.data_consent:
            raise Exception("You must authorize the processing of personal data (Law 1581 of 2012).")
        if input.role not in ("developer", "organization"):
            raise Exception("Invalid role.")
        if len(input.password) < 8:
            raise Exception("Password must be at least 8 characters long.")
        email = input.email.strip().lower()
        if db.scalar(select(m.User).where(m.User.email == email)):
            raise Exception("An account with that email already exists.")
        u = m.User(email=email, name=input.name.strip(), role=input.role,
                   password_hash=hash_password(input.password), data_consent=True)
        db.add(u)
        db.commit()
        return AuthPayload(token=create_token(u.id, u.role), user=User.from_model(u))

    @strawberry.mutation
    def login(self, info: Info, email: str, password: str) -> AuthPayload:
        u = info.context.db.scalar(select(m.User).where(m.User.email == email.strip().lower()))
        if not u or not verify_password(password, u.password_hash):
            raise Exception("Incorrect email or password.")
        return AuthPayload(token=create_token(u.id, u.role), user=User.from_model(u))

    @strawberry.mutation
    def update_profile(self, info: Info, input: ProfileInput) -> User:
        u = info.context.require()
        for field in ("name", "city", "bio", "level", "skills", "interests", "availability_hours", "github"):
            setattr(u, field, getattr(input, field))
        info.context.db.commit()
        return User.from_model(u)

    @strawberry.mutation
    def create_project(self, info: Info, input: ProjectInput) -> Project:
        org = info.context.require("organization")
        if not input.title.strip() or not input.description.strip() or not input.skills:
            raise Exception("Title, description and at least one technology are required.")
        p = m.Project(org_id=org.id, **{k: getattr(input, k) for k in (
            "title", "description", "skills", "level", "hours_per_week", "duration_weeks",
            "modality", "slots", "mentor_name")})
        info.context.db.add(p)
        info.context.db.commit()
        return Project.from_model(p)

    @strawberry.mutation
    def set_project_status(self, info: Info, id: int, status: str) -> Project:
        org = info.context.require("organization")
        p = info.context.db.get(m.Project, id)
        if not p or p.org_id != org.id or status not in ("published", "closed"):
            raise Exception("Project not found.")
        p.status = status
        info.context.db.commit()
        return Project.from_model(p)

    @strawberry.mutation
    def apply_to_project(self, info: Info, project_id: int, message: str = "") -> Application:
        dev = info.context.require("developer")
        db = info.context.db
        p = db.get(m.Project, project_id)
        if not p or p.status != "published":
            raise Exception("The project is not available.")
        if any(a.developer_id == dev.id for a in p.applications):
            raise Exception("You have already applied to this project.")
        a = m.Application(project_id=p.id, developer_id=dev.id, message=message)
        db.add(a)
        db.commit()
        db.refresh(p)
        return Application.from_model(a)

    @strawberry.mutation
    def review_application(self, info: Info, id: int, status: str) -> Application:
        org = info.context.require("organization")
        db = info.context.db
        a = db.get(m.Application, id)
        if not a or a.project.org_id != org.id or status not in ("accepted", "rejected"):
            raise Exception("Application not found.")
        if status == "accepted" and a.status != "accepted":
            accepted = sum(1 for x in a.project.applications if x.status == "accepted")
            if accepted >= a.project.slots:
                raise Exception("There are no slots left in this project.")
        a.status = status
        db.commit()
        return Application.from_model(a)

    @strawberry.mutation
    def submit_delivery(self, info: Info, application_id: int, title: str, link: str) -> Delivery:
        dev = info.context.require("developer")
        db = info.context.db
        a = db.get(m.Application, application_id)
        if not a or a.developer_id != dev.id or a.status != "accepted":
            raise Exception("You can only submit deliveries for projects where you were accepted.")
        if not link.startswith(("http://", "https://")):
            raise Exception("The link must be a valid URL (http/https).")
        d = m.Delivery(application_id=a.id, title=title, link=link)
        db.add(d)
        db.commit()
        return Delivery(id=d.id, title=d.title, link=d.link, status=d.status, feedback=d.feedback,
                        rating=d.rating, created_at=d.created_at)

    @strawberry.mutation
    def review_delivery(self, info: Info, id: int, status: str, feedback: str, rating: int) -> Delivery:
        org = info.context.require("organization")
        db = info.context.db
        d = db.get(m.Delivery, id)
        if not d or d.application.project.org_id != org.id:
            raise Exception("Delivery not found.")
        if status not in ("approved", "changes_requested") or not feedback.strip() or not 1 <= rating <= 5:
            raise Exception("Provide a status, a comment and a rating from 1 to 5.")
        d.status, d.feedback, d.rating = status, feedback, rating
        db.commit()
        return Delivery(id=d.id, title=d.title, link=d.link, status=d.status, feedback=d.feedback,
                        rating=d.rating, created_at=d.created_at)


schema = strawberry.Schema(query=Query, mutation=Mutation)
