import pytest

PROJECTS = """query ($search: String, $skill: String, $level: String) {
  projects(search: $search, skill: $skill, level: $level) { title } }"""
PROJECT = """query ($id: Int!) {
  project(id: $id) { title acceptedCount myApplication { status } applications { id } } }"""
RECOMMENDED = "{ recommendedProjects { score matchedSkills project { title } } }"
MY_APPLICATIONS = "{ myApplications { status project { title } } }"
MY_PROJECTS = "{ myProjects { title applicationsCount } }"


class TestMe:
    def test_returns_the_signed_in_user(self, gql, developer):
        assert gql("{ me { email role } }", user=developer)["me"] == {"email": "nico@demo.com", "role": "developer"}

    def test_returns_null_for_visitors(self, gql):
        assert gql("{ me { email } }")["me"] is None


class TestProjects:
    def test_filters_published_projects_without_login(self, gql, make_project):
        make_project(title="Inventory API", skills=["Python"])
        make_project(title="Booking app", skills=["React"], level="student")

        assert gql(PROJECTS, skill="python")["projects"] == [{"title": "Inventory API"}]
        assert gql(PROJECTS, search="BOOKING", level="student")["projects"] == [{"title": "Booking app"}]

    def test_hides_closed_projects(self, gql, make_project):
        make_project(status="closed")
        assert gql(PROJECTS)["projects"] == []


class TestProject:
    def test_shows_the_developer_their_application(self, gql, make_project, make_application, developer):
        project = make_project()
        make_application(project, developer, status="accepted")

        result = gql(PROJECT, user=developer, id=project.id)["project"]

        assert result["acceptedCount"] == 1
        assert result["myApplication"] == {"status": "accepted"}

    def test_returns_null_when_it_does_not_exist(self, gql):
        assert gql(PROJECT, id=999)["project"] is None

    # Specific case: applications are private to the organization that owns the project.
    def test_only_the_owner_sees_the_applications(self, gql, make_project, make_application, developer, organization):
        project = make_project()
        make_application(project, developer)

        assert gql(PROJECT, user=organization, id=project.id)["project"]["applications"] != []
        assert gql(PROJECT, user=developer, id=project.id)["project"]["applications"] == []


class TestRecommendedProjects:
    def test_recommends_matching_projects_not_applied_yet(self, gql, make_project, make_application, developer):
        make_project(title="Inventory API", skills=["Python"])
        make_application(make_project(title="Applied", skills=["Python"]), developer)

        assert gql(RECOMMENDED, user=developer)["recommendedProjects"] == [
            {"score": 100, "matchedSkills": ["Python"], "project": {"title": "Inventory API"}}
        ]

    def test_is_only_for_developers(self, gql, organization):
        with pytest.raises(Exception, match="You do not have permission"):
            gql(RECOMMENDED, user=organization)


class TestMyApplications:
    def test_lists_the_developer_applications(self, gql, make_project, make_application, developer):
        make_application(make_project(), developer)
        assert gql(MY_APPLICATIONS, user=developer)["myApplications"] == [
            {"status": "submitted", "project": {"title": "Inventory API"}}
        ]

    def test_requires_login(self, gql):
        with pytest.raises(Exception, match="You must be logged in"):
            gql(MY_APPLICATIONS)


class TestMyProjects:
    def test_lists_the_organization_projects(self, gql, make_project, make_application, developer, organization):
        make_application(make_project(), developer)
        assert gql(MY_PROJECTS, user=organization)["myProjects"] == [{"title": "Inventory API", "applicationsCount": 1}]

    def test_is_only_for_organizations(self, gql, developer):
        with pytest.raises(Exception, match="You do not have permission"):
            gql(MY_PROJECTS, user=developer)
