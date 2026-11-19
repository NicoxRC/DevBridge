import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Explore from './pages/Explore'
import ProjectDetail from './pages/ProjectDetail'
import Dashboard from './pages/Dashboard'
import OrgDashboard from './pages/OrgDashboard'
import NewProject from './pages/NewProject'

function Private({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="center muted">Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/panel" replace />
  return children
}

function Panel() {
  const { user } = useAuth()
  return user.role === 'organization' ? <OrgDashboard /> : <Dashboard />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      {/* El listado y el detalle son públicos (RF-07): se pueden ver sin registrarse */}
      <Route path="/proyectos" element={<Explore />} />
      <Route path="/proyectos/:id" element={<ProjectDetail />} />
      <Route path="/panel" element={<Private><Panel /></Private>} />
      <Route path="/perfil" element={<Private><Profile /></Private>} />
      <Route path="/proyectos-nuevo" element={<Private role="organization"><NewProject /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
