import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { MY_PROJECTS, REVIEW_APPLICATION, REVIEW_DELIVERY, SET_PROJECT_STATUS } from '../graphql'
import { LEVELS } from '../auth'
import { ErrorMsg, StatusBadge, Tags } from '../components/ui'
import Layout, { initials } from '../components/Layout'

function DeliveryReview({ delivery, onDone }) {
  const [form, setForm] = useState({ status: 'aprobada', feedback: '', rating: 5 })
  const [review, { error, loading }] = useMutation(REVIEW_DELIVERY)
  if (delivery.status !== 'pendiente') {
    return (
      <div className="feedback">
        <StatusBadge status={delivery.status} /> {delivery.feedback} <b>{'★'.repeat(delivery.rating || 0)}</b>
      </div>
    )
  }
  const send = async (e) => {
    e.preventDefault()
    try { await review({ variables: { id: delivery.id, ...form, rating: Number(form.rating) } }); onDone() } catch { /* ErrorMsg */ }
  }
  return (
    <form className="row review" onSubmit={send}>
      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
        <option value="aprobada">Aprobar</option>
        <option value="ajustes">Pedir ajustes</option>
      </select>
      <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
      </select>
      <input required placeholder="Retroalimentación para el desarrollador" value={form.feedback}
        onChange={(e) => setForm({ ...form, feedback: e.target.value })} />
      <button className="btn btn-primary" disabled={loading}>Enviar</button>
      <ErrorMsg error={error} />
    </form>
  )
}

/** Panel de la organización: proyectos publicados, postulaciones y revisión de entregas. */
export default function OrgDashboard() {
  const { data, refetch } = useQuery(MY_PROJECTS)
  const [reviewApp, reviewState] = useMutation(REVIEW_APPLICATION)
  const [setStatus] = useMutation(SET_PROJECT_STATUS)
  const projects = data?.myProjects || []
  const all = projects.flatMap((p) => p.applications)

  const decide = async (id, status) => {
    try { await reviewApp({ variables: { id, status } }); await refetch() } catch { /* ErrorMsg */ }
  }

  return (
    <Layout title="Mis proyectos" subtitle="Gestiona tus proyectos, postulaciones y entregas"
      actions={<Link className="btn btn-primary" to="/proyectos-nuevo">+ Publicar proyecto</Link>}>
      <div className="kpis">
        <div className="card kpi"><span className="dot dot-blue" /><b>{projects.filter((p) => p.status === 'publicado').length}</b><span>Proyectos publicados</span></div>
        <div className="card kpi"><span className="dot dot-orange" /><b>{all.filter((a) => a.status === 'enviada').length}</b><span>Postulaciones por revisar</span></div>
        <div className="card kpi"><span className="dot dot-green" /><b>{all.filter((a) => a.status === 'aceptada').length}</b><span>Desarrolladores en internado</span></div>
        <div className="card kpi"><span className="dot dot-purple" /><b>{all.flatMap((a) => a.deliveries).filter((d) => d.status === 'pendiente').length}</b><span>Entregas por revisar</span></div>
      </div>
      <ErrorMsg error={reviewState.error} />
      {projects.length === 0 && <div className="card empty">Aún no has publicado proyectos.</div>}
      {projects.map((p) => (
        <div key={p.id} className="card">
          <div className="row between">
            <div>
              <h3>{p.title} <StatusBadge status={p.status} /></h3>
              <div className="muted small">{LEVELS[p.level]} · {p.durationWeeks} semanas · {p.acceptedCount}/{p.slots} cupos ocupados</div>
            </div>
            <div className="row">
              <Link className="btn btn-outline" to={`/proyectos/${p.id}`}>Ver</Link>
              <button className="btn btn-outline" onClick={() => setStatus({ variables: { id: p.id, status: p.status === 'publicado' ? 'cerrado' : 'publicado' } })}>
                {p.status === 'publicado' ? 'Cerrar' : 'Reabrir'}
              </button>
            </div>
          </div>
          <Tags items={p.skills} />
          <h4>Postulaciones ({p.applications.length})</h4>
          {p.applications.length === 0 && <p className="muted small">Todavía no hay postulaciones.</p>}
          {p.applications.map((a) => (
            <div key={a.id} className="list-item">
              <div className="row between">
                <div className="row">
                  <div className="avatar">{initials(a.developer.name)}</div>
                  <div>
                    <b>{a.developer.name}</b>
                    <div className="muted small">{LEVELS[a.developer.level]} · {a.developer.city}
                      {a.developer.github && <> · <a href={a.developer.github} target="_blank" rel="noreferrer">GitHub</a></>}</div>
                  </div>
                </div>
                <div className="row">
                  <StatusBadge status={a.status} />
                  {a.status === 'enviada' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => decide(a.id, 'aceptada')}>Aceptar</button>
                      <button className="btn btn-outline btn-sm" onClick={() => decide(a.id, 'rechazada')}>Rechazar</button>
                    </>
                  )}
                </div>
              </div>
              <Tags items={a.developer.skills} highlight={p.skills} />
              {a.message && <p className="small">“{a.message}”</p>}
              {a.deliveries.map((d) => (
                <div key={d.id} className="delivery">
                  <div><b>{d.title}</b> · <a href={d.link} target="_blank" rel="noreferrer">ver entrega</a></div>
                  <DeliveryReview delivery={d} onDone={refetch} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </Layout>
  )
}
