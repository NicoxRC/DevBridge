import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { REGISTER } from '../graphql'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
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
  const { t } = useI18n()
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
      <h2>{t('register.title')}</h2>
      <p className="muted">{t('register.step')}</p>
      <form onSubmit={submit} className="form">
        <div className="segmented">
          <button type="button" className={form.role === 'developer' ? 'on' : ''} onClick={() => setForm({ ...form, role: 'developer' })}>
            {t('register.dev')}
          </button>
          <button type="button" className={form.role === 'organization' ? 'on' : ''} onClick={() => setForm({ ...form, role: 'organization' })}>
            {t('register.org')}
          </button>
        </div>
        <label>{form.role === 'organization' ? t('common.orgName') : t('common.fullName')}
          <input required value={form.name} onChange={set('name')} />
        </label>
        <label>{t('common.email')}
          <input type="email" required value={form.email} onChange={set('email')} />
        </label>
        <label>{t('register.password')}
          <input type="password" required minLength={8} value={form.password} onChange={set('password')} />
        </label>
        <label className="consent">
          <input type="checkbox" checked={form.dataConsent} onChange={set('dataConsent')} />
          <span>{t('register.consent')}</span>
        </label>
        <ErrorMsg error={error} />
        <button className="btn btn-primary btn-lg" disabled={loading || !form.dataConsent}>
          {loading ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
      <p className="small">{t('register.hasAccount')} <Link to="/login">{t('register.login')}</Link></p>
    </AuthShell>
  )
}
