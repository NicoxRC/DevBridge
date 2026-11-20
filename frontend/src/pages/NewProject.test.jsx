import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CATALOGS } from '../graphql'
import { useAuth } from '../auth'
import { mockMutation, mockQueries } from '../test/apollo'
import { organization } from '../test/fixtures'
import { renderPage } from '../test/utils'
import NewProject from './NewProject'

vi.mock('../auth', async (importOriginal) => ({ ...(await importOriginal()), useAuth: vi.fn() }))

const submitButton = () => screen.getByRole('button', { name: 'Post project' })

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText('Project title'), 'Inventory API')
  await userEvent.type(screen.getByLabelText('Description'), 'REST API for a small store.')
}

describe('NewProject', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: organization, logout: vi.fn() })
    mockQueries([[CATALOGS, { data: { catalogs: { skills: ['Python', 'React'], interests: [] } } }]])
  })

  it('publishes the project with numeric values and goes to the dashboard', async () => {
    const mutate = mockMutation({ data: { createProject: { id: '9' } } })
    renderPage(<NewProject />, { route: '/projects/new' })
    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: 'Python' }))
    await userEvent.click(submitButton())

    expect(mutate.mock.calls[0][0].variables.input).toMatchObject({
      title: 'Inventory API', skills: ['Python'], slots: 2, hoursPerWeek: 10, durationWeeks: 8,
    })
    expect(await screen.findByText('Moved to /dashboard')).toBeInTheDocument()
  })

  it('does not let you publish without technologies', async () => {
    renderPage(<NewProject />, { route: '/projects/new' })
    await fillRequiredFields()

    expect(submitButton()).toBeDisabled()
  })
})
