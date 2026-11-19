import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

const STATUS_CLASS = {
  submitted: 'badge-blue',
  accepted: 'badge-green',
  rejected: 'badge-gray',
  pending: 'badge-orange',
  approved: 'badge-green',
  changes_requested: 'badge-orange',
  published: 'badge-green',
  closed: 'badge-gray',
}

export function StatusBadge({ status }) {
  const { t } = useI18n()
  const label = STATUS_CLASS[status] ? t(`status.${status}`) : status
  return <span className={`badge ${STATUS_CLASS[status] || 'badge-gray'}`}>{label}</span>
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
  const { t } = useI18n()
  return (
    <div className="card project-card">
      <div className="row between">
        <div>
          <h3>{project.title}</h3>
          <div className="muted small">{project.organization.name} · {project.organization.city || 'Colombia'}</div>
        </div>
        {score != null && <span className="badge badge-purple">{t('common.match', { n: score })}</span>}
      </div>
      <p className="desc">{project.description}</p>
      <Tags items={project.skills} highlight={matched || []} />
      <div className="meta small muted">
        <span>{t(`level.${project.level}`)}</span>
        <span>{t(`modality.${project.modality}`)}</span>
        <span>{t('common.weeks', { n: project.durationWeeks })}</span>
        <span>{t('common.hoursWeek', { n: project.hoursPerWeek })}</span>
        <span>{t('common.slots', { n: Math.max(project.slots - project.acceptedCount, 0) })}</span>
      </div>
      <div className="row end">
        <Link className="btn btn-primary" to={`/projects/${project.id}`}>{t('common.viewDetails')}</Link>
      </div>
    </div>
  )
}

/** Chip-style tag picker (skills, interests). */
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
  const { translateError } = useI18n()
  if (!error) return null
  const msg = error.graphQLErrors?.[0]?.message || error.message
  return <div className="alert">{translateError(msg)}</div>
}
