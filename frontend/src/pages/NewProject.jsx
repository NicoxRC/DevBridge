import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { CATALOGS, CREATE_PROJECT } from '../graphql'
import { LEVELS, MODALITIES } from '../auth'
import { ChipPicker, ErrorMsg } from '../components/ui'
import Layout from '../components/Layout'

export default function NewProject() {
  const navigate = useNavigate()
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
    <Layout title="Post project" subtitle="Describe the real project a junior developer will work on under supervision">
      <form className="card form form-grid" onSubmit={submit}>
        <label className="span-2">Project title
          <input required value={form.title} onChange={set('title')} placeholder="E-commerce REST API" />
        </label>
        <label className="span-2">Description
          <textarea required rows={4} value={form.description} onChange={set('description')} />
        </label>
        <div className="span-2">
          <div className="label">Required technologies</div>
          <ChipPicker options={cat?.catalogs.skills || []} value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} />
        </div>
        <label>Required level
          <select value={form.level} onChange={set('level')}>
            {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Modality
          <select value={form.modality} onChange={set('modality')}>
            {Object.entries(MODALITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Duration (weeks)
          <input type="number" min={1} value={form.durationWeeks} onChange={set('durationWeeks')} />
        </label>
        <label>Commitment (hours per week)
          <input type="number" min={1} value={form.hoursPerWeek} onChange={set('hoursPerWeek')} />
        </label>
        <label>Slots
          <input type="number" min={1} value={form.slots} onChange={set('slots')} />
        </label>
        <label>Assigned mentor
          <input value={form.mentorName} onChange={set('mentorName')} placeholder="Senior developer's name" />
        </label>
        <div className="span-2 row end">
          <ErrorMsg error={error} />
          <button className="btn btn-primary" disabled={loading || form.skills.length === 0}>Post project</button>
        </div>
      </form>
    </Layout>
  )
}
