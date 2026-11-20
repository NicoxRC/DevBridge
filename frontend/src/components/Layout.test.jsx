import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '../auth'
import { organization } from '../test/fixtures'
import { renderWithRouter } from '../test/utils'
import Layout, { initials } from './Layout'

vi.mock('../auth', () => ({ useAuth: vi.fn() }))

describe('Layout', () => {
  it('shows the signed-in user, their menu and logs out', async () => {
    const logout = vi.fn()
    useAuth.mockReturnValue({ user: organization, logout })
    renderWithRouter(<Layout title="My projects">content</Layout>)

    expect(screen.getByText('TechCorp S.A.S.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Post project' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /log out/i }))
    expect(logout).toHaveBeenCalled()
  })

  it('shows only public links to visitors', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    renderWithRouter(<Layout title="Explore">content</Layout>)

    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument()
  })
})

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('nico andrés rojas')).toBe('NA')
  })

  it('returns an empty string without a name', () => {
    expect(initials()).toBe('')
  })
})
