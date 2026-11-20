import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { useAuth } from './auth'
import { developer, organization } from './test/fixtures'
import { renderWithRouter } from './test/utils'
import App from './App'

vi.mock('./auth', () => ({ useAuth: vi.fn() }))

// The pages are replaced with placeholders: these tests only check the routes and their access rules.
const { page } = vi.hoisted(() => ({ page: (name) => ({ default: () => <p>{name} page</p> }) }))
vi.mock('./pages/Landing', () => page('Landing'))
vi.mock('./pages/Login', () => page('Login'))
vi.mock('./pages/Register', () => page('Register'))
vi.mock('./pages/Profile', () => page('Profile'))
vi.mock('./pages/Explore', () => page('Explore'))
vi.mock('./pages/ProjectDetail', () => page('ProjectDetail'))
vi.mock('./pages/Dashboard', () => page('Dashboard'))
vi.mock('./pages/OrgDashboard', () => page('OrgDashboard'))
vi.mock('./pages/NewProject', () => page('NewProject'))

function renderAt(route, user = null) {
  useAuth.mockReturnValue({ user, loading: false })
  renderWithRouter(<App />, { route })
}

describe('App', () => {
  it('shows private pages to signed-in users', () => {
    renderAt('/dashboard', organization)
    expect(screen.getByText('OrgDashboard page')).toBeInTheDocument()
  })

  it('sends visitors to log in from private pages', () => {
    renderAt('/profile')
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  // Specific case: role-restricted route.
  it('only lets organizations post projects', () => {
    renderAt('/projects/new', developer)
    expect(screen.getByText('Dashboard page')).toBeInTheDocument()
  })
})
