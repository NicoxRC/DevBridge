import { Link } from 'react-router-dom'
import { LEVELS, MODALITIES } from '../auth'

const STATUS = {
  enviada: ['Enviada', 'badge-blue'],
  aceptada: ['Aceptada', 'badge-green'],
  rechazada: ['Rechazada', 'badge-gray'],
  pendiente: ['Pendiente de revisión', 'badge-orange'],
  aprobada: ['Aprobada', 'badge-green'],
  ajustes: ['Con ajustes', 'badge-orange'],
  publicado: ['Publicado', 'badge-green'],
  cerrado: ['Cerrado', 'badge-gray'],
}

export function StatusBadge({ status }) {
  const [label, cls] = STATUS[status] || [status, 'badge-gray']
  return <span className={`badge ${cls}`}>{label}</span>
}

export function Tags({ items, highlight = [] }) {
  return (
    <div className="tags">
      {items.map((s) => (
        <span key={s} className={`tag ${highlight.includes(s) ? 'tag-match' : ''}`}>{s}</span>
      ))}
    </div>
  )
}

export function ProjectCard({ project, score, matched }) {
  return (
    <div className="card project-card">
      <div className="row between">
        <div>
          <h3>{project.title}</h3>
          <div className="muted small">{project.organization.name} · {project.organization.city || 'Colombia'}</div>
        </div>
        {score != null && <span className="badge badge-purple">{score}% afinidad</span>}
      </div>
      <p className="desc">{project.description}</p>
      <Tags items={project.skills} highlight={matched || []} />
      <div className="meta small muted">
        <span>{LEVELS[project.level]}</span>
        <span>{MODALITIES[project.modality]}</span>
        <span>{project.durationWeeks} semanas</span>
        <span>{project.hoursPerWeek} h/semana</span>
        <span>{Math.max(project.slots - project.acceptedCount, 0)} cupos</span>
      </div>
      <div className="row end">
        <Link className="btn btn-primary" to={`/proyectos/${project.id}`}>Ver detalle</Link>
      </div>
    </div>
  )
}

/** Selector de etiquetas tipo "chips" (habilidades, intereses). */
export function ChipPicker({ options, value, onChange, green }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])
  return (
    <div className="tags">
      {options.map((o) => (
        <button type="button" key={o} onClick={() => toggle(o)}
          className={`chip ${value.includes(o) ? (green ? 'chip-on-green' : 'chip-on') : ''}`}>
          {o}
        </button>
      ))}
    </div>
  )
}

export function ErrorMsg({ error }) {
  if (!error) return null
  const msg = error.graphQLErrors?.[0]?.message || error.message
  return <div className="alert">{msg}</div>
}
