import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:8000/graphql',
})

// Attach the stored JWT token to every request.
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('devbridge_token')
  return { headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
})
