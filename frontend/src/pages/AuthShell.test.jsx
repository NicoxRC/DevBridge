import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../test/utils'
import AuthShell from './AuthShell'

describe('AuthShell', () => {
  it('shows the benefits next to the form', () => {
    renderWithRouter(<AuthShell><form aria-label="sign up" /></AuthShell>)

    expect(screen.getByText('Verifiable certificates')).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'sign up' })).toBeInTheDocument()
  })

  it('uses the normal card width unless asked for a wide one', () => {
    const { container } = renderWithRouter(<AuthShell>form</AuthShell>)
    expect(container.querySelector('.auth-card')).not.toHaveClass('auth-card-wide')
  })
})
