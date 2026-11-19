"""Shared fixtures. Tests run against a throwaway SQLite database, never against PostgreSQL."""

import os
import tempfile

# Must be set before `app` is imported: app.db creates the engine at import time.
_DB_FILE = os.path.join(tempfile.mkdtemp(prefix="devbridge-tests-"), "test.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_FILE}"

import pytest  # noqa: E402

from app import models as m  # noqa: E402
from app.auth import hash_password  # noqa: E402
from app.db import Base, SessionLocal, engine  # noqa: E402
from app.schema import Context, schema  # noqa: E402

PASSWORD = "devbridge123"


@pytest.fixture(autouse=True)
def db():
    """A clean database for every test."""
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    session = SessionLocal()
    yield session
    session.close()


# --------------------------------------------------------------------------- factories
@pytest.fixture
def make_user(db):
    def make(role="developer", **fields):
        defaults = dict(
            email=f"user{db.query(m.User).count() + 1}@demo.com", name="Nico Rojas", role=role,
            password_hash=hash_password(PASSWORD), data_consent=True, level="junior",
            skills=["Python", "React"], availability_hours=20,
        )
        user = m.User(**{**defaults, **fields})
        db.add(user)
        db.commit()
        return user
    return make


@pytest.fixture
def developer(make_user):
    return make_user(email="nico@demo.com")


@pytest.fixture
def organization(make_user):
    return make_user(role="organization", email="techcorp@demo.com", name="TechCorp")


@pytest.fixture
def make_project(db, organization):
    def make(org=None, **fields):
        defaults = dict(
            org_id=(org or organization).id, title="Inventory API", description="REST API for a small store.",
            skills=["Python", "PostgreSQL"], level="junior", hours_per_week=10, slots=2,
        )
        project = m.Project(**{**defaults, **fields})
        db.add(project)
        db.commit()
        return project
    return make


@pytest.fixture
def make_application(db):
    def make(project, developer, status="submitted"):
        application = m.Application(project_id=project.id, developer_id=developer.id, status=status)
        db.add(application)
        db.commit()
        return application
    return make


# --------------------------------------------------------------------------- GraphQL
class GraphQLRequestError(Exception):
    pass


@pytest.fixture
def gql(db):
    """Runs a GraphQL operation as `user` (None = visitor). Returns `data` or raises GraphQLRequestError."""
    def run(query, user=None, **variables):
        context = Context()
        context.db.close()
        context.db = db
        context.__dict__["user"] = user  # overrides the cached `user` property (normally read from the JWT)
        result = schema.execute_sync(query, variable_values=variables, context_value=context)
        if result.errors:
            raise GraphQLRequestError(result.errors[0].message)
        db.expire_all()  # next reads see what the resolver committed
        return result.data
    return run
