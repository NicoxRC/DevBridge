import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useApolloClient } from '@apollo/client'
import { AuthProvider, useAuth } from './auth'
import { developer } from './test/fixtures'

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

function mockClient(me) {
  const client = { query: vi.fn().mockResolvedValue({ data: { me } }), resetStore: vi.fn(), clearStore: vi.fn() }
  useApolloClient.mockReturnValue(client)
  return client
}

describe('AuthProvider', () => {
  it('loads the user of the stored token', async () => {
    localStorage.setItem('devbridge_token', 'jwt')
    mockClient(developer)
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toEqual(developer)
  })

  it('drops an expired token', async () => {
    localStorage.setItem('devbridge_token', 'expired')
    mockClient(null)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('devbridge_token')).toBeNull()
  })
})
