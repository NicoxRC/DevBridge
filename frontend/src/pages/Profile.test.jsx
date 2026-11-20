import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '../auth'
import { mockMutation } from '../test/apollo'
import { apiError, developer } from '../test/fixtures'
import { renderPage } from '../test/utils'
import Profile from './Profile'

vi.mock('../auth', async (importOriginal) => ({ ...(await importOriginal()), useAuth: vi.fn() }))

describe('Profile', () => {
  let refetch
  beforeEach(() => {
    refetch = vi.fn()
    useAuth.mockReturnValue({ user: developer, refetch, logout: vi.fn() })
  })

  it('saves the changes', async () => {
    const mutate = mockMutation()
    renderPage(<Profile />, { route: '/profile' })

    await userEvent.clear(screen.getByLabelText('City'))
    await userEvent.type(screen.getByLabelText('City'), 'Bogotá')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(mutate.mock.calls[0][0].variables.input).toMatchObject({ city: 'Bogotá', availabilityHours: 20 })
    expect(refetch).toHaveBeenCalled()
    expect(await screen.findByText('✓ Changes saved')).toBeInTheDocument()
  })

  it('shows the error when the profile cannot be saved', async () => {
    mockMutation({ error: apiError('You must be logged in.') })
    renderPage(<Profile />, { route: '/profile' })

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('You must be logged in.')).toBeInTheDocument()
    expect(screen.queryByText('✓ Changes saved')).not.toBeInTheDocument()
  })
})
