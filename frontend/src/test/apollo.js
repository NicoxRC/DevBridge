import { useState } from 'react'
import { vi } from 'vitest'
import { useMutation, useQuery } from '@apollo/client'

/**
 * Answers each query document with its result.
 *   mockQueries([[PROJECTS, { data: { projects: [] } }]])
 */
export function mockQueries(entries) {
  const results = new Map(entries)
  useQuery.mockImplementation((query) => ({ loading: false, refetch: vi.fn(), ...results.get(query) }))
}

/**
 * Makes every mutation resolve with `data`, or fail with `error` (shown through the hook's `error`, like Apollo).
 * Returns a spy called with the options of each mutation call.
 */
export function mockMutation({ data = {}, error } = {}) {
  const spy = vi.fn()
  useMutation.mockImplementation(() => {
    const [state, setState] = useState({ loading: false })
    const mutate = async (options) => {
      spy(options)
      if (error) {
        setState({ loading: false, error })
        throw error
      }
      setState({ loading: false, data })
      return { data }
    }
    return [mutate, state]
  })
  return spy
}
