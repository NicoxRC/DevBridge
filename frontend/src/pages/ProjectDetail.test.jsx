import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PROJECT } from '../graphql'
import { useAuth } from '../auth'
import { mockMutation, mockQueries } from '../test/apollo'
import { developer, makeProject } from '../test/fixtures'
import { renderPage } from '../test/utils'
import ProjectDetail from './ProjectDetail'

vi.mock('../auth', async (importOriginal) => ({ ...(await importOriginal()), useAuth: vi.fn() }))

function renderProject(project) {
  useAuth.mockReturnValue({ user: developer, logout: vi.fn() })
  mockQueries([[PROJECT, { data: { project } }]])
  renderPage(<ProjectDetail />, { route: '/projects/7', path: '/projects/:id' })
}

describe('ProjectDetail', () => {
  it('lets a developer apply with a message', async () => {
    const mutate = mockMutation({ data: { applyToProject: { id: '20', status: 'submitted' } } })
    renderProject(makeProject())

    await userEvent.type(screen.getByPlaceholderText(/why you are interested/), 'I know Python')
    await userEvent.click(screen.getByRole('button', { name: 'Apply →' }))

    expect(mutate).toHaveBeenCalledWith({ variables: { projectId: '7', message: 'I know Python' } })
  })

  it('shows not found when the project does not exist', () => {
    renderProject(null)
    expect(screen.getByRole('heading', { name: 'Project not found' })).toBeInTheDocument()
  })

  // Specific case: full projects must not accept more applications.
  it('blocks applying when there are no slots left', () => {
    renderProject(makeProject({ slots: 1, acceptedCount: 1 }))
    expect(screen.getByRole('button', { name: 'No slots left' })).toBeDisabled()
  })
})
