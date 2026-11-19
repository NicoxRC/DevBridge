from app.db import _database_url


class TestDatabaseUrl:
    def test_adds_the_psycopg_driver_to_railway_urls(self, monkeypatch):
        monkeypatch.setenv("DATABASE_URL", "postgres://user:pass@host:5432/devbridge")
        assert _database_url() == "postgresql+psycopg://user:pass@host:5432/devbridge"

    def test_falls_back_to_the_local_database(self, monkeypatch):
        monkeypatch.delenv("DATABASE_URL")
        assert _database_url() == "postgresql+psycopg://devbridge:devbridge@localhost:5432/devbridge"
