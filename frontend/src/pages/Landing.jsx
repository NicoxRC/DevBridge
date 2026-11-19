import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { Logo } from '../components/Layout'
import { useAuth } from '../auth'
import { PROJECTS } from '../graphql'

export default function Landing() {
  const { user } = useAuth()
  const { data } = useQuery(PROJECTS)
  const projects = data?.projects || []
  const orgs = new Set(projects.map((p) => p.organization.id)).size

  return (
    <div className="landing">
      <header className="landing-nav">
        <Logo />
        <nav className="row">
          <Link to="/projects">Explore projects</Link>
          {user ? (
            <Link className="btn btn-primary" to="/dashboard">Go to my dashboard</Link>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link className="btn btn-primary" to="/register">Get started for free</Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-text">
          <span className="pill">Tech internship platform for juniors</span>
          <h1>Your first tech job,<br /><span className="primary">with real experience.</span></h1>
          <p className="lead">
            We connect junior developers with real company projects, supervised by mentors.
            Gain verifiable experience and land your first job.
          </p>
          <div className="row">
            <Link className="btn btn-primary btn-lg" to="/register?role=developer">I'm a junior developer</Link>
            <Link className="btn btn-outline btn-lg" to="/register?role=organization">I'm a company or institution</Link>
          </div>
          <p className="muted small">Free for devs · You can explore projects without signing up</p>
        </div>
        <div className="hero-card">
          <div className="card">
            <div className="row">
              <div className="avatar avatar-lg">MA</div>
              <div>
                <strong>Smart matching</strong>
                <div className="muted small">We recommend projects based on your skills, level and availability.</div>
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
            <strong>Deliveries reviewed by mentors</strong>
            <div className="muted small">Every sprint gets feedback and a rating.</div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div><b>{projects.length}</b><span>Published projects</span></div>
        <div><b>{orgs}</b><span>Partner organizations</span></div>
        <div><b>100 %</b><span>Supervised projects</span></div>
        <div><b>$0</b><span>Cost for developers</span></div>
      </section>
    </div>
  )
}
