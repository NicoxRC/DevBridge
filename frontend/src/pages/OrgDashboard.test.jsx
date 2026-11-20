import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MY_PROJECTS } from '../graphql'
import { useAuth } from '../auth'
import { mockMutation, mockQueries } from '../test/apollo'
import { makeApplication, makeDelivery, makeProject, organization } from '../test/fixtures'
import { renderPage } from '../test/utils'
import OrgDashboard from './OrgDashboard'

vi.mock('../auth', async (importOriginal) => ({ ...(await importOriginal()), useAuth: vi.fn() }))

describe('OrgDashboard', () => {
  beforeEach(() => useAuth.mockReturnValue({ user: organization, logout: vi.fn() }))

  it('accepts an application', async () => {
    const mutate = mockMutation()
    mockQueries([[MY_PROJECTS, { data: { myProjects: [makeProject({ applications: [makeApplication()] }) ] } }]])
    renderPage(<OrgDashboard />, { route: '/dashboard' })

    expect(screen.getByText('Applications (1)')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Accept' }))

    expect(mutate).toHaveBeenCalledWith({ variables: { id: '20', status: 'accepted' } })
  })

  it('tells when there are no projects yet', () => {
    mockQueries([[MY_PROJECTS, { data: { myProjects: [] } }]])
    renderPage(<OrgDashboard />, { route: '/dashboard' })

    expect(screen.getByText('You have not posted any projects yet.')).toBeInTheDocument()
  })

  // Specific case: mentors review pending deliveries with a rating.
  it('reviews a pending delivery with feedback and rating', async () => {
    const mutate = mockMutation()
    const application = makeApplication({ status: 'accepted', deliveries: [makeDelivery()] })
    mockQueries([[MY_PROJECTS, { data: { myProjects: [makeProject({ applications: [application] })] } }]])
    renderPage(<OrgDashboard />, { route: '/dashboard' })

    await userEvent.type(screen.getByPlaceholderText('Feedback for the developer'), 'Great work')
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(mutate).toHaveBeenCalledWith({
      variables: { id: '30', status: 'approved', feedback: 'Great work', rating: 5 },
    })
  })
})
