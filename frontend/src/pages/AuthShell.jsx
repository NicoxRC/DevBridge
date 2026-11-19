import { Logo } from '../components/Layout'

const BENEFITS = [
  ['Verifiable certificates', 'Every project generates real proof of experience'],
  ['Smart matching', 'We connect you with projects that fit your profile'],
  ['Dedicated mentor', 'A senior developer guides you through the whole process'],
  ['Free for devs', 'No cost until you land your first job'],
]

/** Split sign-up/onboarding screen from the mockup (dark panel + form). */
export default function AuthShell({ children, wide }) {
  return (
    <div className="auth">
      <div className="auth-side">
        <Logo dark />
        <h1>Your profile is your<br />new résumé.</h1>
        <p>Companies will find you — not the other way around.</p>
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
