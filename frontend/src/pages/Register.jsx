import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { REGISTER } from '../graphql'
import { useAuth } from '../auth'
import { ErrorMsg } from '../components/ui'
import AuthShell from './AuthShell'

export default function Register() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: params.get('rol') === 'organization' ? 'organization' : 'developer',
    dataConsent: false,
  })
  const [registerMut, { loading, error }] = useMutation(REGISTER)
  const { login } = useAuth()
  const navigate = useNavigate()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await registerMut({ variables: { input: form } })
      await login(data.register.token, data.register.user)
      navigate('/perfil?nuevo=1') // Paso 2: completar el perfil profesional
    } catch { /* se muestra con ErrorMsg */ }
  }

  return (
    <AuthShell>
      <h2>Crea tu cuenta</h2>
      <p className="muted">Paso 1 de 2 · Cuenta</p>
      <form onSubmit={submit} className="form">
        <div className="segmented">
          <button type="button" className={form.role === 'developer' ? 'on' : ''} onClick={() => setForm({ ...form, role: 'developer' })}>
            Soy desarrollador
          </button>
          <button type="button" className={form.role === 'organization' ? 'on' : ''} onClick={() => setForm({ ...form, role: 'organization' })}>
            Soy empresa / institución
          </button>
        </div>
        <label>{form.role === 'organization' ? 'Nombre de la organización' : 'Nombre completo'}
          <input required value={form.name} onChange={set('name')} />
        </label>
        <label>Correo electrónico
          <input type="email" required value={form.email} onChange={set('email')} />
        </label>
        <label>Contraseña (mínimo 8 caracteres)
          <input type="password" required minLength={8} value={form.password} onChange={set('password')} />
        </label>
        <label className="consent">
          <input type="checkbox" checked={form.dataConsent} onChange={set('dataConsent')} />
          <span>Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 y la política de
            privacidad de DevBridge.</span>
        </label>
        <ErrorMsg error={error} />
        <button className="btn btn-primary btn-lg" disabled={loading || !form.dataConsent}>
          {loading ? 'Creando cuenta…' : 'Continuar →'}
        </button>
      </form>
      <p className="small">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </AuthShell>
  )
}
