import { Logo } from '../components/Layout'
import { LanguageSwitch, useI18n } from '../i18n'

const BENEFITS = ['b1', 'b2', 'b3', 'b4']

/** Split sign-up/onboarding screen from the mockup (dark panel + form). */
export default function AuthShell({ children, wide }) {
  const { t } = useI18n()
  return (
    <div className="auth">
      <div className="auth-side">
        <Logo dark />
        <h1>{t('authShell.title1')}<br />{t('authShell.title2')}</h1>
        <p>{t('authShell.subtitle')}</p>
        <ul className="benefits">
          {BENEFITS.map((b) => (
            <li key={b}><span className="check">✓</span><div><b>{t(`authShell.${b}t`)}</b><small>{t(`authShell.${b}d`)}</small></div></li>
          ))}
        </ul>
      </div>
      <div className="auth-main">
        <div className="auth-lang"><LanguageSwitch /></div>
        <div className={`card auth-card ${wide ? 'auth-card-wide' : ''}`}>{children}</div>
      </div>
    </div>
  )
}
