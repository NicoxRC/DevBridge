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
          <Link to="/proyectos">Explorar proyectos</Link>
          {user ? (
            <Link className="btn btn-primary" to="/panel">Ir a mi panel</Link>
          ) : (
            <>
              <Link to="/login">Iniciar sesión</Link>
              <Link className="btn btn-primary" to="/registro">Empezar gratis</Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-text">
          <span className="pill">Plataforma de internado tech para juniors</span>
          <h1>Tu primer empleo<br /><span className="primary">tech, con experiencia real.</span></h1>
          <p className="lead">
            Conectamos desarrolladores junior con proyectos reales de empresas, supervisados por mentores.
            Gana experiencia verificable y consigue tu primer empleo.
          </p>
          <div className="row">
            <Link className="btn btn-primary btn-lg" to="/registro?rol=developer">Soy desarrollador junior</Link>
            <Link className="btn btn-outline btn-lg" to="/registro?rol=organization">Soy empresa o institución</Link>
          </div>
          <p className="muted small">Gratis para devs · Puedes explorar proyectos sin registrarte</p>
        </div>
        <div className="hero-card">
          <div className="card">
            <div className="row">
              <div className="avatar avatar-lg">MA</div>
              <div>
                <strong>Matching inteligente</strong>
                <div className="muted small">Te recomendamos proyectos según tus habilidades, nivel y disponibilidad.</div>
              </div>
            </div>
          </div>
          {projects.slice(0, 2).map((p) => (
            <Link key={p.id} to={`/proyectos/${p.id}`} className="card mini-card">
              <strong>{p.title}</strong>
              <div className="muted small">{p.organization.name} · {p.skills.slice(0, 3).join(', ')}</div>
            </Link>
          ))}
          <div className="card mini-card">
            <strong>Entregas revisadas por mentores</strong>
            <div className="muted small">Cada sprint recibe retroalimentación y calificación.</div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div><b>{projects.length}</b><span>Proyectos publicados</span></div>
        <div><b>{orgs}</b><span>Organizaciones aliadas</span></div>
        <div><b>100 %</b><span>Proyectos supervisados</span></div>
        <div><b>$0</b><span>Costo para desarrolladores</span></div>
      </section>
    </div>
  )
}
