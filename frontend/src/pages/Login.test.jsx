import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '../auth'
import { mockMutation } from '../test/apollo'
import { apiError, developer } from '../test/fixtures'
import { renderPage } from '../test/utils'
import Login from './Login'

vi.mock('../auth', async (importOriginal) => ({ ...(await importOriginal()), useAuth: vi.fn() }))

async function logIn() {
  await userEvent.type(screen.getByLabelText('Email'), 'nico@demo.com')
  await userEvent.type(screen.getByLabelText('Password'), 'devbridge123')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('Login', () => {
  let login
  beforeEach(() => {
    login = vi.fn()
    useAuth.mockReturnValue({ login })
  })

  it('starts the session and goes to the dashboard', async () => {
    const mutate = mockMutation({ data: { login: { token: 'jwt', user: developer } } })
    renderPage(<Login />, { route: '/login' })
    await logIn()

    expect(mutate).toHaveBeenCalledWith({ variables: { email: 'nico@demo.com', password: 'devbridge123' } })
    expect(login).toHaveBeenCalledWith('jwt', developer)
    expect(await screen.findByText('Moved to /dashboard')).toBeInTheDocument()
  })

  it('shows the error and stays on the page with wrong credentials', async () => {
    mockMutation({ error: apiError('Incorrect email or password.') })
    renderPage(<Login />, { route: '/login' })
    await logIn()

    expect(await screen.findByText('Incorrect email or password.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })
})
