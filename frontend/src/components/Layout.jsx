import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth'
import { LanguageSwitch, useI18n } from '../i18n'

export function Logo({ dark }) {
  return (
    <Link to="/" className={`logo ${dark ? 'logo-dark' : ''}`}>
      <span className="logo-dev">Dev</span><span className="logo-bridge">Bridge</span>
    </Link>
  )
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

/** Layout with a dark sidebar, as in the Figma mockup. */
export default function Layout({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const isOrg = user?.role === 'organization'

  return (
    <div className="app">
      <aside className="sidebar">
        <Logo dark />
        {user && (
          <div className="sidebar-user">
            <div className="avatar">{initials(user.name)}</div>
            <div>
              <div className="sidebar-name">{user.name}</div>
              <div className="sidebar-role">{isOrg ? t('nav.orgRole') : t('nav.devRole')}</div>
            </div>
          </div>
        )}
        <nav className="sidebar-nav">
          {user ? (
            <>
              <NavLink to="/dashboard">{isOrg ? t('nav.myProjects') : t('nav.dashboard')}</NavLink>
              {isOrg ? (
                <NavLink to="/projects/new">{t('nav.postProject')}</NavLink>
              ) : (
                <NavLink to="/projects" end>{t('nav.explore')}</NavLink>
              )}
              <NavLink to="/profile">{t('nav.myProfile')}</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/projects" end>{t('nav.explore')}</NavLink>
              <NavLink to="/login">{t('nav.login')}</NavLink>
              <NavLink to="/register">{t('nav.signup')}</NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <LanguageSwitch dark />
          {user && <button className="sidebar-logout" onClick={logout}>{t('nav.logout')}</button>}
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          <div className="row">{actions}</div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  )
}
