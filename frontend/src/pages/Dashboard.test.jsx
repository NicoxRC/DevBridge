import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { MY_APPLICATIONS, RECOMMENDED } from '../graphql'
import { useAuth } from '../auth'
import { mockQueries } from '../test/apollo'
import { developer, makeApplication, makeDelivery, makeProject } from '../test/fixtures'
import { renderPage } from '../test/utils'
import Dashboard from './Dashboard'

vi.mock('../auth', async (importOriginal) => ({ ...(await importOriginal()), useAuth: vi.fn() }))

const kpi = (label) => screen.getByText(label).previousSibling

describe('Dashboard', () => {
  beforeEach(() => useAuth.mockReturnValue({ user: developer, logout: vi.fn() }))

  it('summarizes applications, deliveries and recommendations', () => {
    const deliveries = [
      makeDelivery({ status: 'approved', rating: 5 }),
      makeDelivery({ id: '31', status: 'changes_requested', rating: 2 }),
    ]
    mockQueries([
      [MY_APPLICATIONS, { data: { myApplications: [makeApplication({ status: 'accepted', deliveries })] } }],
      [RECOMMENDED, { data: { recommendedProjects: [{ score: 80, matchedSkills: ['Python'], project: makeProject({ title: 'Booking app' }) }] } }],
    ])
    renderPage(<Dashboard />, { route: '/dashboard' })

    expect(screen.getByRole('heading', { name: 'Hi, Nico! 👋' })).toBeInTheDocument()
    expect(kpi('Active projects')).toHaveTextContent('1')
    expect(kpi('Approved deliveries')).toHaveTextContent('1')
    expect(kpi('Average rating')).toHaveTextContent('3.5')
    expect(screen.getByText('80% match')).toBeInTheDocument()
  })

  it('shows empty states and asks for skills to a new developer', () => {
    useAuth.mockReturnValue({ user: { ...developer, skills: [] }, logout: vi.fn() })
    mockQueries([
      [MY_APPLICATIONS, { data: { myApplications: [] } }],
      [RECOMMENDED, { data: { recommendedProjects: [] } }],
    ])
    renderPage(<Dashboard />, { route: '/dashboard' })

    expect(screen.getByText(/Add your skills in/)).toBeInTheDocument()
    expect(screen.getByText('You have not applied to any project yet.')).toBeInTheDocument()
    expect(kpi('Average rating')).toHaveTextContent('—')
  })
})
