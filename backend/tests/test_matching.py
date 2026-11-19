from app.matching import recommend, score
from app.models import Project, User


def dev(**fields):
    return User(**{"level": "junior", "availability_hours": 20, "skills": ["Python", "React"], **fields})


def project(id=1, **fields):
    return Project(**{"id": id, "level": "junior", "hours_per_week": 10, "skills": ["Python", "PostgreSQL"], **fields})


class TestScore:
    def test_scores_the_share_of_required_skills(self):
        assert score(dev(skills=[" python ", "React"]), project()) == (50, ["Python"])

    def test_excludes_projects_the_developer_cannot_take(self):
        assert score(dev(level="student"), project(level="junior")) is None  # level too high
        assert score(dev(availability_hours=5), project(hours_per_week=10)) is None  # not enough hours
        assert score(dev(skills=["Go"]), project()) is None  # no skill in common


class TestRecommend:
    def test_sorts_by_score_then_newest_and_applies_the_limit(self):
        full_old = project(id=1, skills=["Python"])
        partial_old = project(id=2)
        partial_new = project(id=3)

        result = recommend(dev(), [partial_old, full_old, partial_new], limit=2)

        assert [(p.id, pct) for p, pct, _ in result] == [(1, 100), (3, 50)]

    def test_returns_nothing_when_no_project_matches(self):
        assert recommend(dev(skills=["Go"]), [project(), project(id=2)]) == []
