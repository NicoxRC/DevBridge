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
  if (loading) return <div className="center muted">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />
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
      <Route path="/register" element={<Register />} />
      {/* The list and detail pages are public (RF-07): they can be viewed without signing up */}
      <Route path="/projects" element={<Explore />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/dashboard" element={<Private><Panel /></Private>} />
      <Route path="/profile" element={<Private><Profile /></Private>} />
      <Route path="/projects/new" element={<Private role="organization"><NewProject /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
