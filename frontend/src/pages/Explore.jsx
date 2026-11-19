import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { CATALOGS, PROJECTS } from '../graphql'
import { LEVELS, MODALITIES } from '../auth'
import { ProjectCard } from '../components/ui'
import Layout from '../components/Layout'

export default function Explore() {
  const [filters, setFilters] = useState({ search: '', skill: '', level: '', modality: '' })
  const vars = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  const { data, loading } = useQuery(PROJECTS, { variables: vars })
  const { data: cat } = useQuery(CATALOGS)
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })
  const projects = data?.projects || []

  return (
    <Layout title="Explorar proyectos" subtitle={`${projects.length} proyectos disponibles`}>
      <div className="filters">
        <input className="search" placeholder="🔍 Buscar proyecto…" value={filters.search} onChange={set('search')} />
        <select value={filters.skill} onChange={set('skill')}>
          <option value="">Todas las tecnologías</option>
          {(cat?.catalogs.skills || []).map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.level} onChange={set('level')}>
          <option value="">Cualquier nivel</option>
          {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.modality} onChange={set('modality')}>
          <option value="">Cualquier modalidad</option>
          {Object.entries(MODALITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {loading && !data && <p className="muted">Cargando proyectos…</p>}
      {!loading && projects.length === 0 && <div className="card empty">No hay proyectos con esos filtros.</div>}
      <div className="grid-2">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </Layout>
  )
}
