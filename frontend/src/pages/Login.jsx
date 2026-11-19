import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../graphql'
import { useAuth } from '../auth'
import { ErrorMsg } from '../components/ui'
import AuthShell from './AuthShell'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loginMut, { loading, error }] = useMutation(LOGIN)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await loginMut({ variables: form })
      await login(data.login.token, data.login.user)
      navigate('/dashboard')
    } catch { /* the error is shown with ErrorMsg */ }
  }

  return (
    <AuthShell>
      <h2>Log in</h2>
      <p className="muted">Welcome back to DevBridge</p>
      <form onSubmit={submit} className="form">
        <label>Email
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>Password
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <ErrorMsg error={error} />
        <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="small">Don't have an account? <Link to="/register">Sign up</Link></p>
    </AuthShell>
  )
}
