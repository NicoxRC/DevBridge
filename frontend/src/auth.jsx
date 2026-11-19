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
      if (!data.me) localStorage.removeItem(KEY) // token vencido o inválido
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => { refetch() }, [refetch])

  // Se llama con la respuesta de las mutaciones login/register (token + usuario).
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

export const LEVELS = { estudiante: 'Estudiante', recien_graduado: 'Recién graduado', junior: 'Junior (0-2 años)' }
export const MODALITIES = { remoto: 'Remoto', presencial: 'Presencial', hibrido: 'Híbrido' }
