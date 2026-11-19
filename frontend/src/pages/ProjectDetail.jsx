import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { APPLY, PROJECT, SUBMIT_DELIVERY } from '../graphql'
import { LEVELS, MODALITIES, useAuth } from '../auth'
import { ErrorMsg, StatusBadge, Tags } from '../components/ui'
import Layout, { initials } from '../components/Layout'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, loading, refetch } = useQuery(PROJECT, { variables: { id: Number(id) } })
  const [message, setMessage] = useState('')
  const [apply, applyState] = useMutation(APPLY)
  const [delivery, setDelivery] = useState({ title: '', link: '' })
  const [submit, submitState] = useMutation(SUBMIT_DELIVERY)

  const p = data?.project
  if (loading && !p) return <Layout title="Cargando…" />
  if (!p) return <Layout title="Proyecto no encontrado" />
  const app = p.myApplication
  const free = Math.max(p.slots - p.acceptedCount, 0)

  const doApply = async () => {
    try { await apply({ variables: { projectId: p.id, message } }); await refetch() } catch { /* ErrorMsg */ }
  }
  const doDeliver = async (e) => {
    e.preventDefault()
    try {
      await submit({ variables: { applicationId: app.id, ...delivery } })
      setDelivery({ title: '', link: '' })
      await refetch()
    } catch { /* ErrorMsg */ }
  }

  return (
    <Layout title={p.title} subtitle={<Link to="/proyectos">← Volver a proyectos</Link>}
      actions={<StatusBadge status={p.status} />}>
      <div className="detail">
        <div className="col">
          <div className="card">
            <div className="row">
              <div className="avatar avatar-sq">{initials(p.organization.name)}</div>
              <div>
                <h2>{p.title}</h2>
                <div className="muted small">{p.organization.name} · {p.organization.city} · {MODALITIES[p.modality]}</div>
              </div>
            </div>
            <p>{p.description}</p>
            <Tags items={p.skills} highlight={user?.skills || []} />
            <div className="meta small muted">
              <span>Nivel: {LEVELS[p.level]}</span>
              <span>Duración: {p.durationWeeks} semanas</span>
              <span>Dedicación: {p.hoursPerWeek} h/semana</span>
              <span>Cupos libres: {free} de {p.slots}</span>
            </div>
          </div>

          {app?.status === 'aceptada' && (
            <div className="card">
              <h3>Entregas por sprint</h3>
              <p className="muted small">Comparte el enlace de tu repositorio en cada sprint para que tu mentor lo revise.</p>
              {app.deliveries.length === 0 && <p className="muted">Aún no has registrado entregas.</p>}
              {app.deliveries.map((d) => (
                <div key={d.id} className="list-item">
                  <div className="row between">
                    <div><b>{d.title}</b> · <a href={d.link} target="_blank" rel="noreferrer">ver enlace</a></div>
                    <StatusBadge status={d.status} />
                  </div>
                  {d.feedback && <div className="feedback">💬 {d.feedback} {d.rating && <b>· {'★'.repeat(d.rating)}</b>}</div>}
                </div>
              ))}
              <form className="row" onSubmit={doDeliver}>
                <input required placeholder="Ej.: Sprint 1 – Módulo de productos" value={delivery.title}
                  onChange={(e) => setDelivery({ ...delivery, title: e.target.value })} />
                <input required type="url" placeholder="https://github.com/…" value={delivery.link}
                  onChange={(e) => setDelivery({ ...delivery, link: e.target.value })} />
                <button className="btn btn-primary">Entregar avance</button>
              </form>
              <ErrorMsg error={submitState.error} />
            </div>
          )}
        </div>

        <div className="col">
          <div className="card">
            <div className="muted small">Mentor del proyecto</div>
            <div className="row">
              <div className="avatar avatar-green">{initials(p.mentorName || 'M')}</div>
              <div><b>{p.mentorName || 'Por asignar'}</b><div className="muted small">{p.organization.name}</div></div>
            </div>
          </div>

          <div className="card cta-card">
            {!user && (
              <>
                <b>¿Te interesa este proyecto?</b>
                <p className="small">Crea tu cuenta gratis para postularte.</p>
                <Link className="btn btn-light" to="/registro">Registrarme</Link>
              </>
            )}
            {user?.role === 'organization' && <p>Las organizaciones gestionan sus proyectos desde su panel.</p>}
            {user?.role === 'developer' && !app && (
              <>
                <b>Postúlate a este proyecto</b>
                <textarea rows={3} placeholder="Cuéntale a la empresa por qué te interesa (opcional)"
                  value={message} onChange={(e) => setMessage(e.target.value)} />
                <button className="btn btn-light" onClick={doApply} disabled={applyState.loading || free === 0}>
                  {free === 0 ? 'Sin cupos' : 'Postularme →'}
                </button>
                <ErrorMsg error={applyState.error} />
              </>
            )}
            {user?.role === 'developer' && app && (
              <>
                <b>Tu postulación</b>
                <div><StatusBadge status={app.status} /></div>
                {app.status === 'enviada' && <p className="small">La organización revisará tu perfil pronto.</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
