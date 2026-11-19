import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { CATALOGS, UPDATE_PROFILE } from '../graphql'
import { LEVELS, useAuth } from '../auth'
import { ChipPicker, ErrorMsg } from '../components/ui'
import Layout from '../components/Layout'

export default function Profile() {
  const { user, refetch } = useAuth()
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
    <Layout title={isNew ? 'Complete your profile' : 'My profile'}
      subtitle={isOrg ? 'Information visible to developers' : 'This information helps us find the right projects for you'}>
      <form className="card form form-grid" onSubmit={submit}>
        <label>{isOrg ? 'Organization name' : 'Full name'}
          <input required value={form.name} onChange={set('name')} />
        </label>
        <label>City
          <input value={form.city} onChange={set('city')} placeholder="Pasto, Nariño" />
        </label>

        {isOrg ? (
          <label className="span-2">Organization description
            <textarea rows={3} value={form.bio} onChange={set('bio')} />
          </label>
        ) : (
          <>
            <label>Experience level
              <select value={form.level} onChange={set('level')}>
                {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Availability (hours per week)
              <input type="number" min={1} max={48} value={form.availabilityHours} onChange={set('availabilityHours')} />
            </label>
            <label className="span-2">LinkedIn / GitHub
              <input value={form.github} onChange={set('github')} placeholder="https://github.com/username" />
            </label>
            <div className="span-2">
              <div className="label">Technical skills (select the ones you know)</div>
              <ChipPicker options={cat?.catalogs.skills || []} value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} />
            </div>
            <div className="span-2">
              <div className="label">What kind of projects are you interested in?</div>
              <ChipPicker green options={cat?.catalogs.interests || []} value={form.interests} onChange={(v) => setForm({ ...form, interests: v })} />
            </div>
            <label className="span-2">About you (optional)
              <textarea rows={3} value={form.bio} onChange={set('bio')} placeholder="I want to gain real experience working on company projects…" />
            </label>
          </>
        )}
        <div className="span-2 row between">
          <span className="small green">{saved ? '✓ Changes saved' : ''}</span>
          <ErrorMsg error={error} />
          <button className="btn btn-primary" disabled={loading}>{isNew ? 'Save and continue →' : 'Save changes'}</button>
        </div>
      </form>
    </Layout>
  )
}
