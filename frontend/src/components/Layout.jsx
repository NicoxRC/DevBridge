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

/** Layout con barra lateral oscura, como en el mockup de Figma. */
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
              <div className="sidebar-role">{isOrg ? 'Empresa / institución' : 'Desarrollador junior'}</div>
            </div>
          </div>
        )}
        <nav className="sidebar-nav">
          {user ? (
            <>
              <NavLink to="/panel">{isOrg ? 'Mis proyectos' : 'Dashboard'}</NavLink>
              {isOrg ? (
                <NavLink to="/proyectos-nuevo">Publicar proyecto</NavLink>
              ) : (
                <NavLink to="/proyectos" end>Explorar proyectos</NavLink>
              )}
              <NavLink to="/perfil">Mi perfil</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/proyectos" end>Explorar proyectos</NavLink>
              <NavLink to="/login">Iniciar sesión</NavLink>
              <NavLink to="/registro">Crear cuenta</NavLink>
            </>
          )}
        </nav>
        {user && <button className="sidebar-logout" onClick={logout}>↩ Cerrar sesión</button>}
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
