import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { MY_APPLICATIONS, RECOMMENDED } from '../graphql'
import { useAuth } from '../auth'
import { ProjectCard, StatusBadge } from '../components/ui'
import Layout from '../components/Layout'

/** Developer dashboard (mockup screen 02). */
export default function Dashboard() {
  const { user } = useAuth()
  const { data: apps } = useQuery(MY_APPLICATIONS)
  const { data: rec, loading: recLoading } = useQuery(RECOMMENDED)
  const applications = apps?.myApplications || []
  const active = applications.filter((a) => a.status === 'accepted')
  const deliveries = applications.flatMap((a) => a.deliveries)
  const approved = deliveries.filter((d) => d.status === 'approved')
  const rated = deliveries.filter((d) => d.rating)
  const avg = rated.length ? (rated.reduce((s, d) => s + d.rating, 0) / rated.length).toFixed(1) : '—'

  return (
    <Layout title={`Hi, ${user.name.split(' ')[0]}! 👋`} subtitle="Here is your summary for today"
      actions={<Link className="btn btn-primary" to="/projects">Explore projects</Link>}>
      {user.skills.length === 0 && (
        <div className="alert alert-info">Add your skills in <Link to="/profile">My profile</Link> to get recommendations.</div>
      )}
      <div className="kpis">
        <div className="card kpi"><span className="dot dot-blue" /><b>{active.length}</b><span>Active projects</span></div>
        <div className="card kpi"><span className="dot dot-orange" /><b>{applications.length}</b><span>Applications</span></div>
        <div className="card kpi"><span className="dot dot-green" /><b>{approved.length}</b><span>Approved deliveries</span></div>
        <div className="card kpi"><span className="dot dot-purple" /><b>{avg}</b><span>Average rating</span></div>
      </div>

      <div className="detail">
        <div className="col">
          <h3>My applications and projects</h3>
          {applications.length === 0 && <div className="card empty">You have not applied to any project yet.</div>}
          {applications.map((a) => (
            <Link key={a.id} to={`/projects/${a.project.id}`} className="card list-card">
              <div className="row between">
                <div>
                  <b>{a.project.title}</b>
                  <div className="muted small">{a.project.organization.name} · Mentor: {a.project.mentorName || 'to be assigned'}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              {a.status === 'accepted' && (
                <div className="small muted">{a.deliveries.length} deliveries · {a.deliveries.filter((d) => d.status === 'approved').length} approved</div>
              )}
            </Link>
          ))}
        </div>
        <div className="col">
          <div className="card reco">
            <h3>✦ Recommended for you</h3>
            <p className="muted small">Based on your skills, level and availability</p>
          </div>
          {recLoading && <p className="muted">Calculating…</p>}
          {rec?.recommendedProjects.length === 0 && <div className="card empty">No recommendations for now.</div>}
          {rec?.recommendedProjects.map((r) => (
            <ProjectCard key={r.project.id} project={r.project} score={r.score} matched={r.matchedSkills} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
