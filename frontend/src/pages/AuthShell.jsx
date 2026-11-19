import { Logo } from '../components/Layout'

const BENEFITS = [
  ['Certificados verificables', 'Cada proyecto genera evidencia real de experiencia'],
  ['Matching inteligente', 'Te conectamos con proyectos ideales para tu perfil'],
  ['Mentor dedicado', 'Un senior te guía durante todo el proceso'],
  ['Gratuito para devs', 'Sin costo hasta conseguir tu primer empleo'],
]

/** Pantalla dividida del registro/onboarding del mockup (panel oscuro + formulario). */
export default function AuthShell({ children, wide }) {
  return (
    <div className="auth">
      <div className="auth-side">
        <Logo dark />
        <h1>Tu perfil es tu<br />nueva hoja de vida.</h1>
        <p>Las empresas te encontrarán a ti — no al revés.</p>
        <ul className="benefits">
          {BENEFITS.map(([t, d]) => (
            <li key={t}><span className="check">✓</span><div><b>{t}</b><small>{d}</small></div></li>
          ))}
        </ul>
      </div>
      <div className="auth-main">
        <div className={`card auth-card ${wide ? 'auth-card-wide' : ''}`}>{children}</div>
      </div>
    </div>
  )
}
