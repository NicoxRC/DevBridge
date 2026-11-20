import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQuery } from '@apollo/client'
import { CATALOGS, PROJECTS } from '../graphql'
import { useAuth } from '../auth'
import { mockQueries } from '../test/apollo'
import { makeProject } from '../test/fixtures'
import { renderPage } from '../test/utils'
import Explore from './Explore'

vi.mock('../auth', async (importOriginal) => ({ ...(await importOriginal()), useAuth: vi.fn() }))

describe('Explore', () => {
  beforeEach(() => useAuth.mockReturnValue({ user: null }))

  it('lists the projects and filters them by level', async () => {
    mockQueries([
      [PROJECTS, { data: { projects: [makeProject()] } }],
      [CATALOGS, { data: { catalogs: { skills: ['Python'], interests: [] } } }],
    ])
    renderPage(<Explore />, { route: '/projects' })

    expect(screen.getByText('1 projects available')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Inventory API' })).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByDisplayValue('Any level'), 'junior')
    expect(useQuery).toHaveBeenCalledWith(PROJECTS, { variables: { level: 'junior' } })
  })

  it('tells when no project matches', () => {
    mockQueries([[PROJECTS, { data: { projects: [] } }]])
    renderPage(<Explore />, { route: '/projects' })

    expect(screen.getByText('No projects match those filters.')).toBeInTheDocument()
  })
})
