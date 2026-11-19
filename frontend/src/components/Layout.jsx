import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth'

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
              <div className="sidebar-role">{isOrg ? 'Company / institution' : 'Junior developer'}</div>
            </div>
          </div>
        )}
        <nav className="sidebar-nav">
          {user ? (
            <>
              <NavLink to="/dashboard">{isOrg ? 'My projects' : 'Dashboard'}</NavLink>
              {isOrg ? (
                <NavLink to="/projects/new">Post project</NavLink>
              ) : (
                <NavLink to="/projects" end>Explore projects</NavLink>
              )}
              <NavLink to="/profile">My profile</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/projects" end>Explore projects</NavLink>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Sign up</NavLink>
            </>
          )}
        </nav>
        {user && <button className="sidebar-logout" onClick={logout}>↩ Log out</button>}
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
