import { gql } from '@apollo/client'

const USER_FIELDS = `id email name role city bio level skills interests availabilityHours github`
const PROJECT_FIELDS = `id title description skills level hoursPerWeek durationWeeks modality slots mentorName status
  organization { id name city } applicationsCount acceptedCount`

export const ME = gql`query { me { ${USER_FIELDS} } }`
export const CATALOGS = gql`query { catalogs { skills interests } }`

export const LOGIN = gql`mutation ($email: String!, $password: String!) {
  login(email: $email, password: $password) { token user { ${USER_FIELDS} } } }`

export const REGISTER = gql`mutation ($input: RegisterInput!) {
  register(input: $input) { token user { ${USER_FIELDS} } } }`

export const UPDATE_PROFILE = gql`mutation ($input: ProfileInput!) {
  updateProfile(input: $input) { ${USER_FIELDS} } }`

export const PROJECTS = gql`query ($search: String, $skill: String, $level: String, $modality: String) {
  projects(search: $search, skill: $skill, level: $level, modality: $modality) { ${PROJECT_FIELDS} } }`

export const PROJECT = gql`query ($id: Int!) {
  project(id: $id) { ${PROJECT_FIELDS} organization { id name city bio }
    myApplication { id status deliveries { id title link status feedback rating createdAt } } } }`

export const RECOMMENDED = gql`query { recommendedProjects(limit: 5) { score matchedSkills project { ${PROJECT_FIELDS} } } }`

export const MY_APPLICATIONS = gql`query { myApplications { id status createdAt
  project { id title mentorName durationWeeks organization { name } }
  deliveries { id title link status feedback rating createdAt } } }`

export const MY_PROJECTS = gql`query { myProjects { ${PROJECT_FIELDS}
  applications { id status message createdAt
    developer { id name city level skills github }
    deliveries { id title link status feedback rating createdAt } } } }`

export const APPLY = gql`mutation ($projectId: Int!, $message: String!) {
  applyToProject(projectId: $projectId, message: $message) { id status } }`

export const CREATE_PROJECT = gql`mutation ($input: ProjectInput!) { createProject(input: $input) { id } }`

export const SET_PROJECT_STATUS = gql`mutation ($id: Int!, $status: String!) {
  setProjectStatus(id: $id, status: $status) { id status } }`

export const REVIEW_APPLICATION = gql`mutation ($id: Int!, $status: String!) {
  reviewApplication(id: $id, status: $status) { id status } }`

export const SUBMIT_DELIVERY = gql`mutation ($applicationId: Int!, $title: String!, $link: String!) {
  submitDelivery(applicationId: $applicationId, title: $title, link: $link) { id } }`

export const REVIEW_DELIVERY = gql`mutation ($id: Int!, $status: String!, $feedback: String!, $rating: Int!) {
  reviewDelivery(id: $id, status: $status, feedback: $feedback, rating: $rating) { id status } }`
