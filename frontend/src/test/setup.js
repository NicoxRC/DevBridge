import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'

// Components are tested without a GraphQL server: the Apollo hooks are mocked in every test.
// Configure them with the helpers in ./apollo.js.
vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal()),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useApolloClient: vi.fn(),
}))

beforeEach(() => {
  useQuery.mockReturnValue({ data: undefined, loading: false, refetch: vi.fn() })
  useMutation.mockReturnValue([vi.fn(), { loading: false }])
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
})
