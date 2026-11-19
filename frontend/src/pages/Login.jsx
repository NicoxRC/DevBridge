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
      navigate('/panel')
    } catch { /* el error se muestra con ErrorMsg */ }
  }

  return (
    <AuthShell>
      <h2>Iniciar sesión</h2>
      <p className="muted">Bienvenido de nuevo a DevBridge</p>
      <form onSubmit={submit} className="form">
        <label>Correo electrónico
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>Contraseña
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <ErrorMsg error={error} />
        <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
      <p className="small">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </AuthShell>
  )
}
