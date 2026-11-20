import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '../auth'
import { mockMutation } from '../test/apollo'
import { organization } from '../test/fixtures'
import { renderPage } from '../test/utils'
import Register from './Register'

vi.mock('../auth', async (importOriginal) => ({ ...(await importOriginal()), useAuth: vi.fn() }))

async function fillForm() {
  await userEvent.type(screen.getByLabelText('Organization name'), 'TechCorp S.A.S.')
  await userEvent.type(screen.getByLabelText('Email'), 'techcorp@demo.com')
  await userEvent.type(screen.getByLabelText(/^Password/), 'devbridge123')
}

describe('Register', () => {
  let login
  beforeEach(() => {
    login = vi.fn()
    useAuth.mockReturnValue({ login })
  })

  it('creates the account with the role from the link and continues to the profile', async () => {
    const mutate = mockMutation({ data: { register: { token: 'jwt', user: organization } } })
    renderPage(<Register />, { route: '/register?role=organization' })
    await fillForm()
    await userEvent.click(screen.getByLabelText(/I authorize/))
    await userEvent.click(screen.getByRole('button', { name: 'Continue →' }))

    expect(mutate.mock.calls[0][0].variables.input).toMatchObject({ role: 'organization', dataConsent: true })
    expect(login).toHaveBeenCalledWith('jwt', organization)
    expect(await screen.findByText('Moved to /profile?new=1')).toBeInTheDocument()
  })

  it('does not let you continue without the data processing consent', async () => {
    const mutate = mockMutation()
    renderPage(<Register />, { route: '/register?role=organization' })
    await fillForm()

    expect(screen.getByRole('button', { name: 'Continue →' })).toBeDisabled()
    expect(mutate).not.toHaveBeenCalled()
  })
})
