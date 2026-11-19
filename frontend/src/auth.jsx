import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { ME } from './graphql'

const AuthContext = createContext(null)
const KEY = 'devbridge_token'

export function AuthProvider({ children }) {
  const client = useApolloClient()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem(KEY))

  const refetch = useCallback(async () => {
    if (!localStorage.getItem(KEY)) return setUser(null)
    try {
      const { data } = await client.query({ query: ME, fetchPolicy: 'network-only' })
      setUser(data.me)
      if (!data.me) localStorage.removeItem(KEY) // expired or invalid token
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => { refetch() }, [refetch])

  // Called with the response of the login/register mutations (token + user).
  const login = async (token, me) => {
    localStorage.setItem(KEY, token)
    await client.resetStore()
    setUser(me)
  }

  const logout = async () => {
    localStorage.removeItem(KEY)
    setUser(null)
    await client.clearStore()
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// Stored values; their labels live in i18n.jsx under `level.*` and `modality.*`.
export const LEVELS = ['student', 'recent_graduate', 'junior']
export const MODALITIES = ['remote', 'on_site', 'hybrid']
