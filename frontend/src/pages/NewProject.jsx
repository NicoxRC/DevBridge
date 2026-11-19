import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { CATALOGS, CREATE_PROJECT } from '../graphql'
import { LEVELS, MODALITIES } from '../auth'
import { useI18n } from '../i18n'
import { ChipPicker, ErrorMsg } from '../components/ui'
import Layout from '../components/Layout'

export default function NewProject() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { data: cat } = useQuery(CATALOGS)
  const [create, { loading, error }] = useMutation(CREATE_PROJECT)
  const [form, setForm] = useState({
    title: '', description: '', skills: [], level: 'student', hoursPerWeek: 10,
    durationWeeks: 8, modality: 'remote', slots: 2, mentorName: '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      const input = { ...form, hoursPerWeek: +form.hoursPerWeek, durationWeeks: +form.durationWeeks, slots: +form.slots }
      await create({ variables: { input } })
      navigate('/dashboard')
    } catch { /* ErrorMsg */ }
  }

  return (
    <Layout title={t('nav.postProject')} subtitle={t('newProject.subtitle')}>
      <form className="card form form-grid" onSubmit={submit}>
        <label className="span-2">{t('newProject.projectTitle')}
          <input required value={form.title} onChange={set('title')} placeholder={t('newProject.titlePlaceholder')} />
        </label>
        <label className="span-2">{t('newProject.description')}
          <textarea required rows={4} value={form.description} onChange={set('description')} />
        </label>
        <div className="span-2">
          <div className="label">{t('newProject.tech')}</div>
          <ChipPicker options={cat?.catalogs.skills || []} value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} />
        </div>
        <label>{t('newProject.level')}
          <select value={form.level} onChange={set('level')}>
            {LEVELS.map((k) => <option key={k} value={k}>{t(`level.${k}`)}</option>)}
          </select>
        </label>
        <label>{t('newProject.modality')}
          <select value={form.modality} onChange={set('modality')}>
            {MODALITIES.map((k) => <option key={k} value={k}>{t(`modality.${k}`)}</option>)}
          </select>
        </label>
        <label>{t('newProject.duration')}
          <input type="number" min={1} value={form.durationWeeks} onChange={set('durationWeeks')} />
        </label>
        <label>{t('newProject.commitment')}
          <input type="number" min={1} value={form.hoursPerWeek} onChange={set('hoursPerWeek')} />
        </label>
        <label>{t('newProject.slots')}
          <input type="number" min={1} value={form.slots} onChange={set('slots')} />
        </label>
        <label>{t('newProject.mentor')}
          <input value={form.mentorName} onChange={set('mentorName')} placeholder={t('newProject.mentorPlaceholder')} />
        </label>
        <div className="span-2 row end">
          <ErrorMsg error={error} />
          <button className="btn btn-primary" disabled={loading || form.skills.length === 0}>{t('nav.postProject')}</button>
        </div>
      </form>
    </Layout>
  )
}
