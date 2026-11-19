import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { Logo } from '../components/Layout'
import { useAuth } from '../auth'
import { LanguageSwitch, useI18n } from '../i18n'
import { PROJECTS } from '../graphql'

export default function Landing() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { data } = useQuery(PROJECTS)
  const projects = data?.projects || []
  const orgs = new Set(projects.map((p) => p.organization.id)).size

  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <nav className="row">
          <LanguageSwitch />
          <Link to="/projects">{t('nav.explore')}</Link>
          {user ? (
            <Link className="btn btn-primary" to="/dashboard">{t('landing.goDashboard')}</Link>
          ) : (
            <>
              <Link to="/login">{t('nav.login')}</Link>
              <Link className="btn btn-primary" to="/register">{t('landing.start')}</Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-text">
          <span className="pill">{t('landing.pill')}</span>
          <h1>{t('landing.title1')}<br /><span className="primary">{t('landing.title2')}</span></h1>
          <p className="lead">
            {t('landing.lead')}
          </p>
          <div className="row">
            <Link className="btn btn-primary btn-lg" to="/register?role=developer">{t('landing.ctaDev')}</Link>
            <Link className="btn btn-outline btn-lg" to="/register?role=organization">{t('landing.ctaOrg')}</Link>
          </div>
          <p className="muted small">{t('landing.note')}</p>
        </div>
        <div className="hero-card">
          <div className="card">
            <div className="row">
              <div className="avatar avatar-lg">MA</div>
              <div>
                <strong>{t('landing.matchTitle')}</strong>
                <div className="muted small">{t('landing.matchDesc')}</div>
              </div>
            </div>
          </div>
          {projects.slice(0, 2).map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="card mini-card">
              <strong>{p.title}</strong>
              <div className="muted small">{p.organization.name} · {p.skills.slice(0, 3).join(', ')}</div>
            </Link>
          ))}
          <div className="card mini-card">
            <strong>{t('landing.reviewTitle')}</strong>
            <div className="muted small">{t('landing.reviewDesc')}</div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div><b>{projects.length}</b><span>{t('landing.statProjects')}</span></div>
        <div><b>{orgs}</b><span>{t('landing.statOrgs')}</span></div>
        <div><b>100 %</b><span>{t('landing.statSupervised')}</span></div>
        <div><b>$0</b><span>{t('landing.statCost')}</span></div>
      </section>
    </div>
  )
}
