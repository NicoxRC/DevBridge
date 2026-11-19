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
  const isNew = params.get('nuevo') === '1'
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
      if (isNew) navigate('/panel')
      else setSaved(true)
    } catch { /* ErrorMsg */ }
  }

  return (
    <Layout title={isNew ? 'Completa tu perfil' : 'Mi perfil'}
      subtitle={isOrg ? 'Información visible para los desarrolladores' : 'Esta información nos ayuda a encontrar proyectos ideales para ti'}>
      <form className="card form form-grid" onSubmit={submit}>
        <label>{isOrg ? 'Nombre de la organización' : 'Nombre completo'}
          <input required value={form.name} onChange={set('name')} />
        </label>
        <label>Ciudad
          <input value={form.city} onChange={set('city')} placeholder="Pasto, Nariño" />
        </label>

        {isOrg ? (
          <label className="span-2">Descripción de la organización
            <textarea rows={3} value={form.bio} onChange={set('bio')} />
          </label>
        ) : (
          <>
            <label>Nivel de experiencia
              <select value={form.level} onChange={set('level')}>
                {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Disponibilidad (horas por semana)
              <input type="number" min={1} max={48} value={form.availabilityHours} onChange={set('availabilityHours')} />
            </label>
            <label className="span-2">LinkedIn / GitHub
              <input value={form.github} onChange={set('github')} placeholder="https://github.com/usuario" />
            </label>
            <div className="span-2">
              <div className="label">Habilidades técnicas (selecciona las que manejas)</div>
              <ChipPicker options={cat?.catalogs.skills || []} value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} />
            </div>
            <div className="span-2">
              <div className="label">¿Qué tipo de proyectos te interesan?</div>
              <ChipPicker green options={cat?.catalogs.interests || []} value={form.interests} onChange={(v) => setForm({ ...form, interests: v })} />
            </div>
            <label className="span-2">Sobre ti (opcional)
              <textarea rows={3} value={form.bio} onChange={set('bio')} placeholder="Quiero ganar experiencia real trabajando en proyectos de empresas…" />
            </label>
          </>
        )}
        <div className="span-2 row between">
          <span className="small green">{saved ? '✓ Cambios guardados' : ''}</span>
          <ErrorMsg error={error} />
          <button className="btn btn-primary" disabled={loading}>{isNew ? 'Guardar y continuar →' : 'Guardar cambios'}</button>
        </div>
      </form>
    </Layout>
  )
}
