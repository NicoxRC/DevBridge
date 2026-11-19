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
    role: params.get('role') === 'organization' ? 'organization' : 'developer',
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
      navigate('/profile?new=1') // Step 2: complete the professional profile
    } catch { /* shown with ErrorMsg */ }
  }

  return (
    <AuthShell>
      <h2>Create your account</h2>
      <p className="muted">Step 1 of 2 · Account</p>
      <form onSubmit={submit} className="form">
        <div className="segmented">
          <button type="button" className={form.role === 'developer' ? 'on' : ''} onClick={() => setForm({ ...form, role: 'developer' })}>
            I'm a developer
          </button>
          <button type="button" className={form.role === 'organization' ? 'on' : ''} onClick={() => setForm({ ...form, role: 'organization' })}>
            I'm a company / institution
          </button>
        </div>
        <label>{form.role === 'organization' ? 'Organization name' : 'Full name'}
          <input required value={form.name} onChange={set('name')} />
        </label>
        <label>Email
          <input type="email" required value={form.email} onChange={set('email')} />
        </label>
        <label>Password (at least 8 characters)
          <input type="password" required minLength={8} value={form.password} onChange={set('password')} />
        </label>
        <label className="consent">
          <input type="checkbox" checked={form.dataConsent} onChange={set('dataConsent')} />
          <span>I authorize the processing of my personal data in accordance with Law 1581 of 2012 and the DevBridge
            privacy policy.</span>
        </label>
        <ErrorMsg error={error} />
        <button className="btn btn-primary btn-lg" disabled={loading || !form.dataConsent}>
          {loading ? 'Creating account…' : 'Continue →'}
        </button>
      </form>
      <p className="small">Already have an account? <Link to="/login">Log in</Link></p>
    </AuthShell>
  )
}
