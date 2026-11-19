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
    title: '', description: '', skills: [], level: 'estudiante', hoursPerWeek: 10,
    durationWeeks: 8, modality: 'remoto', slots: 2, mentorName: '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      const input = { ...form, hoursPerWeek: +form.hoursPerWeek, durationWeeks: +form.durationWeeks, slots: +form.slots }
      await create({ variables: { input } })
      navigate('/panel')
    } catch { /* ErrorMsg */ }
  }

  return (
    <Layout title="Publicar proyecto" subtitle="Describe el proyecto real que un desarrollador junior realizará con supervisión">
      <form className="card form form-grid" onSubmit={submit}>
        <label className="span-2">Título del proyecto
          <input required value={form.title} onChange={set('title')} placeholder="API REST para E-commerce" />
        </label>
        <label className="span-2">Descripción
          <textarea required rows={4} value={form.description} onChange={set('description')} />
        </label>
        <div className="span-2">
          <div className="label">Tecnologías requeridas</div>
          <ChipPicker options={cat?.catalogs.skills || []} value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} />
        </div>
        <label>Nivel requerido
          <select value={form.level} onChange={set('level')}>
            {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Modalidad
          <select value={form.modality} onChange={set('modality')}>
            {Object.entries(MODALITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>Duración (semanas)
          <input type="number" min={1} value={form.durationWeeks} onChange={set('durationWeeks')} />
        </label>
        <label>Dedicación (horas por semana)
          <input type="number" min={1} value={form.hoursPerWeek} onChange={set('hoursPerWeek')} />
        </label>
        <label>Cupos
          <input type="number" min={1} value={form.slots} onChange={set('slots')} />
        </label>
        <label>Mentor asignado
          <input value={form.mentorName} onChange={set('mentorName')} placeholder="Nombre del desarrollador senior" />
        </label>
        <div className="span-2 row end">
          <ErrorMsg error={error} />
          <button className="btn btn-primary" disabled={loading || form.skills.length === 0}>Publicar proyecto</button>
        </div>
      </form>
    </Layout>
  )
}
