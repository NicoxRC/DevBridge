import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { MY_APPLICATIONS, RECOMMENDED } from '../graphql'
import { useAuth } from '../auth'
import { ProjectCard, StatusBadge } from '../components/ui'
import Layout from '../components/Layout'

/** Dashboard del desarrollador (pantalla 02 del mockup). */
export default function Dashboard() {
  const { user } = useAuth()
  const { data: apps } = useQuery(MY_APPLICATIONS)
  const { data: rec, loading: recLoading } = useQuery(RECOMMENDED)
  const applications = apps?.myApplications || []
  const active = applications.filter((a) => a.status === 'aceptada')
  const deliveries = applications.flatMap((a) => a.deliveries)
  const approved = deliveries.filter((d) => d.status === 'aprobada')
  const rated = deliveries.filter((d) => d.rating)
  const avg = rated.length ? (rated.reduce((s, d) => s + d.rating, 0) / rated.length).toFixed(1) : '—'

  return (
    <Layout title={`¡Hola, ${user.name.split(' ')[0]}! 👋`} subtitle="Aquí está tu resumen de hoy"
      actions={<Link className="btn btn-primary" to="/proyectos">Explorar proyectos</Link>}>
      {user.skills.length === 0 && (
        <div className="alert alert-info">Completa tus habilidades en <Link to="/perfil">Mi perfil</Link> para recibir recomendaciones.</div>
      )}
      <div className="kpis">
        <div className="card kpi"><span className="dot dot-blue" /><b>{active.length}</b><span>Proyectos activos</span></div>
        <div className="card kpi"><span className="dot dot-orange" /><b>{applications.length}</b><span>Postulaciones</span></div>
        <div className="card kpi"><span className="dot dot-green" /><b>{approved.length}</b><span>Entregas aprobadas</span></div>
        <div className="card kpi"><span className="dot dot-purple" /><b>{avg}</b><span>Calificación promedio</span></div>
      </div>

      <div className="detail">
        <div className="col">
          <h3>Mis postulaciones y proyectos</h3>
          {applications.length === 0 && <div className="card empty">Aún no te has postulado a ningún proyecto.</div>}
          {applications.map((a) => (
            <Link key={a.id} to={`/proyectos/${a.project.id}`} className="card list-card">
              <div className="row between">
                <div>
                  <b>{a.project.title}</b>
                  <div className="muted small">{a.project.organization.name} · Mentor: {a.project.mentorName || 'por asignar'}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              {a.status === 'aceptada' && (
                <div className="small muted">{a.deliveries.length} entregas · {a.deliveries.filter((d) => d.status === 'aprobada').length} aprobadas</div>
              )}
            </Link>
          ))}
        </div>
        <div className="col">
          <div className="card reco">
            <h3>✦ Recomendados para ti</h3>
            <p className="muted small">Según tus habilidades, nivel y disponibilidad</p>
          </div>
          {recLoading && <p className="muted">Calculando…</p>}
          {rec?.recommendedProjects.length === 0 && <div className="card empty">No hay recomendaciones por ahora.</div>}
          {rec?.recommendedProjects.map((r) => (
            <ProjectCard key={r.project.id} project={r.project} score={r.score} matched={r.matchedSkills} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
