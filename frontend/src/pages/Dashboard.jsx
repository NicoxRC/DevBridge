import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { MY_APPLICATIONS, RECOMMENDED } from '../graphql'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import { ProjectCard, StatusBadge } from '../components/ui'
import Layout from '../components/Layout'

/** Developer dashboard (mockup screen 02). */
export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { data: apps } = useQuery(MY_APPLICATIONS)
  const { data: rec, loading: recLoading } = useQuery(RECOMMENDED)
  const applications = apps?.myApplications || []
  const active = applications.filter((a) => a.status === 'accepted')
  const deliveries = applications.flatMap((a) => a.deliveries)
  const approved = deliveries.filter((d) => d.status === 'approved')
  const rated = deliveries.filter((d) => d.rating)
  const avg = rated.length ? (rated.reduce((s, d) => s + d.rating, 0) / rated.length).toFixed(1) : '—'

  return (
    <Layout title={t('dashboard.hello', { name: user.name.split(' ')[0] })} subtitle={t('dashboard.subtitle')}
      actions={<Link className="btn btn-primary" to="/projects">{t('nav.explore')}</Link>}>
      {user.skills.length === 0 && (
        <div className="alert alert-info">{t('dashboard.addSkillsBefore')} <Link to="/profile">{t('nav.myProfile')}</Link> {t('dashboard.addSkillsAfter')}</div>
      )}
      <div className="kpis">
        <div className="card kpi"><span className="dot dot-blue" /><b>{active.length}</b><span>{t('dashboard.active')}</span></div>
        <div className="card kpi"><span className="dot dot-orange" /><b>{applications.length}</b><span>{t('dashboard.applications')}</span></div>
        <div className="card kpi"><span className="dot dot-green" /><b>{approved.length}</b><span>{t('dashboard.approved')}</span></div>
        <div className="card kpi"><span className="dot dot-purple" /><b>{avg}</b><span>{t('dashboard.avg')}</span></div>
      </div>

      <div className="detail">
        <div className="col">
          <h3>{t('dashboard.myApps')}</h3>
          {applications.length === 0 && <div className="card empty">{t('dashboard.noApps')}</div>}
          {applications.map((a) => (
            <Link key={a.id} to={`/projects/${a.project.id}`} className="card list-card">
              <div className="row between">
                <div>
                  <b>{a.project.title}</b>
                  <div className="muted small">{a.project.organization.name} · {t('dashboard.mentor', { name: a.project.mentorName || t('common.toBeAssigned') })}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              {a.status === 'accepted' && (
                <div className="small muted">{t('dashboard.deliveries', { n: a.deliveries.length, a: a.deliveries.filter((d) => d.status === 'approved').length })}</div>
              )}
            </Link>
          ))}
        </div>
        <div className="col">
          <div className="card reco">
            <h3>{t('dashboard.recommended')}</h3>
            <p className="muted small">{t('dashboard.recommendedDesc')}</p>
          </div>
          {recLoading && <p className="muted">{t('dashboard.calculating')}</p>}
          {rec?.recommendedProjects.length === 0 && <div className="card empty">{t('dashboard.noRecs')}</div>}
          {rec?.recommendedProjects.map((r) => (
            <ProjectCard key={r.project.id} project={r.project} score={r.score} matched={r.matchedSkills} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
