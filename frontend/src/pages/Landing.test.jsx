import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { PROJECTS } from '../graphql'
import { useAuth } from '../auth'
import { mockQueries } from '../test/apollo'
import { developer, makeProject } from '../test/fixtures'
import { renderPage } from '../test/utils'
import Landing from './Landing'

vi.mock('../auth', async (importOriginal) => ({ ...(await importOriginal()), useAuth: vi.fn() }))

describe('Landing', () => {
  it('shows the latest projects and stats to visitors', () => {
    useAuth.mockReturnValue({ user: null })
    mockQueries([[PROJECTS, { data: { projects: [makeProject(), makeProject({ id: '8', title: 'Booking app' })] } }]])
    renderPage(<Landing />)

    expect(screen.getByRole('link', { name: /Booking app/ })).toHaveAttribute('href', '/projects/8')
    expect(screen.getByText('Published projects').previousSibling).toHaveTextContent('2')
    expect(screen.getByRole('link', { name: 'Get started for free' })).toBeInTheDocument()
  })

  it('shows empty stats when there are no projects', () => {
    useAuth.mockReturnValue({ user: developer })
    renderPage(<Landing />)

    expect(screen.getByText('Published projects').previousSibling).toHaveTextContent('0')
    expect(screen.getByRole('link', { name: 'Go to my dashboard' })).toBeInTheDocument()
  })
})
