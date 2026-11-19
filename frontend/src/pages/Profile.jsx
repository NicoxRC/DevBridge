import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { CATALOGS, UPDATE_PROFILE } from '../graphql'
import { LEVELS, useAuth } from '../auth'
import { useI18n } from '../i18n'
import { ChipPicker, ErrorMsg } from '../components/ui'
import Layout from '../components/Layout'

export default function Profile() {
  const { user, refetch } = useAuth()
  const { t } = useI18n()
  const [params] = useSearchParams()
  const isNew = params.get('new') === '1'
  const isOrg = user.role === 'organization'
  const navigate = useNavigate()
  const { data: cat } = useQuery(CATALOGS)
  const [save, { loading, error }] = useMutation(UPDATE_PROFILE)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState(null)

  useEffect(() => {
    setForm({
      name: user.name, city: user.city, bio: user.bio, level: user.level, skills: user.skills,
      interests: user.interests, availabilityHours: user.availabilityHours, github: user.github,
    })
  }, [user])

  if (!form) return null
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      await save({ variables: { input: { ...form, availabilityHours: Number(form.availabilityHours) } } })
      await refetch()
      if (isNew) navigate('/dashboard')
      else setSaved(true)
    } catch { /* ErrorMsg */ }
  }

  return (
    <Layout title={isNew ? t('profile.complete') : t('nav.myProfile')}
      subtitle={isOrg ? t('profile.orgSubtitle') : t('profile.devSubtitle')}>
      <form className="card form form-grid" onSubmit={submit}>
        <label>{isOrg ? t('common.orgName') : t('common.fullName')}
          <input required value={form.name} onChange={set('name')} />
        </label>
        <label>{t('profile.city')}
          <input value={form.city} onChange={set('city')} placeholder="Pasto, Nariño" />
        </label>

        {isOrg ? (
          <label className="span-2">{t('profile.orgDescription')}
            <textarea rows={3} value={form.bio} onChange={set('bio')} />
          </label>
        ) : (
          <>
            <label>{t('profile.level')}
              <select value={form.level} onChange={set('level')}>
                {LEVELS.map((k) => <option key={k} value={k}>{t(`level.${k}`)}</option>)}
              </select>
            </label>
            <label>{t('profile.availability')}
              <input type="number" min={1} max={48} value={form.availabilityHours} onChange={set('availabilityHours')} />
            </label>
            <label className="span-2">LinkedIn / GitHub
              <input value={form.github} onChange={set('github')} placeholder={t('profile.githubPlaceholder')} />
            </label>
            <div className="span-2">
              <div className="label">{t('profile.skills')}</div>
              <ChipPicker options={cat?.catalogs.skills || []} value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} />
            </div>
            <div className="span-2">
              <div className="label">{t('profile.interests')}</div>
              <ChipPicker green options={cat?.catalogs.interests || []} value={form.interests} onChange={(v) => setForm({ ...form, interests: v })} />
            </div>
            <label className="span-2">{t('profile.about')}
              <textarea rows={3} value={form.bio} onChange={set('bio')} placeholder={t('profile.aboutPlaceholder')} />
            </label>
          </>
        )}
        <div className="span-2 row between">
          <span className="small green">{saved ? t('profile.saved') : ''}</span>
          <ErrorMsg error={error} />
          <button className="btn btn-primary" disabled={loading}>{isNew ? t('profile.saveContinue') : t('profile.save')}</button>
        </div>
      </form>
    </Layout>
  )
}
