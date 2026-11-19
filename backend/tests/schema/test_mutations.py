import pytest

from app import models as m
from app.auth import decode_token

REGISTER = """mutation ($input: RegisterInput!) { register(input: $input) { token user { email role } } }"""
LOGIN = """mutation ($email: String!, $password: String!) { login(email: $email, password: $password) { token } }"""
UPDATE_PROFILE = """mutation ($input: ProfileInput!) { updateProfile(input: $input) { name skills availabilityHours } }"""
CREATE_PROJECT = """mutation ($input: ProjectInput!) { createProject(input: $input) { title status } }"""
SET_STATUS = """mutation ($id: Int!, $status: String!) { setProjectStatus(id: $id, status: $status) { status } }"""
APPLY = """mutation ($projectId: Int!, $message: String!) {
  applyToProject(projectId: $projectId, message: $message) { status message } }"""
REVIEW_APPLICATION = """mutation ($id: Int!, $status: String!) { reviewApplication(id: $id, status: $status) { status } }"""
SUBMIT_DELIVERY = """mutation ($applicationId: Int!, $title: String!, $link: String!) {
  submitDelivery(applicationId: $applicationId, title: $title, link: $link) { title status } }"""
REVIEW_DELIVERY = """mutation ($id: Int!, $status: String!, $feedback: String!, $rating: Int!) {
  reviewDelivery(id: $id, status: $status, feedback: $feedback, rating: $rating) { status rating } }"""


def registration(**fields):
    return {"name": "Laura", "email": " Laura@Demo.com ", "password": "devbridge123",
            "role": "developer", "dataConsent": True, **fields}


@pytest.fixture
def delivery(db, make_project, make_application, developer):
    application = make_application(make_project(), developer, status="accepted")
    d = m.Delivery(application_id=application.id, title="Sprint 1", link="https://github.com/nico/inventory")
    db.add(d)
    db.commit()
    return d


class TestRegister:
    def test_creates_the_account_and_returns_a_token(self, gql):
        result = gql(REGISTER, input=registration())["register"]

        assert result["user"] == {"email": "laura@demo.com", "role": "developer"}
        assert decode_token(result["token"]) is not None

    def test_requires_the_data_processing_consent(self, gql, db):
        with pytest.raises(Exception, match="Law 1581"):
            gql(REGISTER, input=registration(dataConsent=False))
        assert db.query(m.User).count() == 0

    # Specific case: the email identifies the account, so it cannot be reused.
    def test_rejects_an_email_already_registered(self, gql, developer):
        with pytest.raises(Exception, match="already exists"):
            gql(REGISTER, input=registration(email="NICO@demo.com"))


class TestLogin:
    def test_returns_a_token_for_the_user(self, gql, developer):
        token = gql(LOGIN, email=" NICO@demo.com", password="devbridge123")["login"]["token"]
        assert decode_token(token) == developer.id

    def test_rejects_a_wrong_password(self, gql, developer):
        with pytest.raises(Exception, match="Incorrect email or password"):
            gql(LOGIN, email="nico@demo.com", password="wrong-password")


class TestUpdateProfile:
    def test_updates_the_signed_in_user(self, gql, developer):
        profile = {"name": "Nico R.", "skills": ["Go"], "availabilityHours": 30}
        assert gql(UPDATE_PROFILE, user=developer, input=profile)["updateProfile"] == {
            "name": "Nico R.", "skills": ["Go"], "availabilityHours": 30,
        }

    def test_requires_login(self, gql):
        with pytest.raises(Exception, match="You must be logged in"):
            gql(UPDATE_PROFILE, input={"name": "Nobody"})


class TestCreateProject:
    def test_publishes_the_project(self, gql, organization):
        project = {"title": "Inventory API", "description": "REST API.", "skills": ["Python"]}
        assert gql(CREATE_PROJECT, user=organization, input=project)["createProject"] == {
            "title": "Inventory API", "status": "published",
        }

    def test_requires_at_least_one_technology(self, gql, organization):
        with pytest.raises(Exception, match="at least one technology"):
            gql(CREATE_PROJECT, user=organization, input={"title": "Inventory API", "description": "REST API.", "skills": []})


class TestSetProjectStatus:
    def test_closes_an_own_project(self, gql, make_project, organization):
        project = make_project()
        assert gql(SET_STATUS, user=organization, id=project.id, status="closed")["setProjectStatus"] == {"status": "closed"}

    def test_cannot_change_another_organization_project(self, gql, make_project, make_user):
        project = make_project()
        other = make_user(role="organization", email="other@demo.com")

        with pytest.raises(Exception, match="Project not found"):
            gql(SET_STATUS, user=other, id=project.id, status="closed")


class TestApplyToProject:
    def test_applies_with_a_message(self, gql, make_project, developer):
        project = make_project()
        assert gql(APPLY, user=developer, projectId=project.id, message="I know Python")["applyToProject"] == {
            "status": "submitted", "message": "I know Python",
        }

    def test_cannot_apply_to_a_closed_project(self, gql, make_project, developer):
        project = make_project(status="closed")
        with pytest.raises(Exception, match="not available"):
            gql(APPLY, user=developer, projectId=project.id, message="")

    # Specific case: a developer can only apply once per project.
    def test_cannot_apply_twice(self, gql, make_project, make_application, developer):
        project = make_project()
        make_application(project, developer)

        with pytest.raises(Exception, match="already applied"):
            gql(APPLY, user=developer, projectId=project.id, message="")


class TestReviewApplication:
    def test_accepts_an_application(self, gql, make_project, make_application, developer, organization):
        application = make_application(make_project(), developer)
        assert gql(REVIEW_APPLICATION, user=organization, id=application.id, status="accepted")["reviewApplication"] == {
            "status": "accepted",
        }

    def test_cannot_accept_beyond_the_slots(self, gql, make_project, make_application, make_user, developer, organization):
        project = make_project(slots=1)
        make_application(project, developer, status="accepted")
        waiting = make_application(project, make_user(email="laura@demo.com"))

        with pytest.raises(Exception, match="no slots left"):
            gql(REVIEW_APPLICATION, user=organization, id=waiting.id, status="accepted")


class TestSubmitDelivery:
    def test_submits_a_delivery_for_an_accepted_application(self, gql, make_project, make_application, developer):
        application = make_application(make_project(), developer, status="accepted")
        result = gql(SUBMIT_DELIVERY, user=developer, applicationId=application.id,
                     title="Sprint 1", link="https://github.com/nico/inventory")["submitDelivery"]

        assert result == {"title": "Sprint 1", "status": "pending"}

    def test_requires_an_accepted_application(self, gql, make_project, make_application, developer):
        application = make_application(make_project(), developer, status="submitted")
        with pytest.raises(Exception, match="where you were accepted"):
            gql(SUBMIT_DELIVERY, user=developer, applicationId=application.id,
                title="Sprint 1", link="https://github.com/nico/inventory")

    # Specific case: the link must be a real URL the mentor can open.
    def test_rejects_a_link_that_is_not_a_url(self, gql, make_project, make_application, developer):
        application = make_application(make_project(), developer, status="accepted")
        with pytest.raises(Exception, match="valid URL"):
            gql(SUBMIT_DELIVERY, user=developer, applicationId=application.id, title="Sprint 1", link="github.com/nico")


class TestReviewDelivery:
    def test_approves_with_feedback_and_rating(self, gql, delivery, organization):
        result = gql(REVIEW_DELIVERY, user=organization, id=delivery.id,
                     status="approved", feedback="Great work", rating=5)["reviewDelivery"]

        assert result == {"status": "approved", "rating": 5}

    def test_rejects_a_rating_out_of_range(self, gql, delivery, organization):
        with pytest.raises(Exception, match="rating from 1 to 5"):
            gql(REVIEW_DELIVERY, user=organization, id=delivery.id, status="approved", feedback="Great work", rating=6)
