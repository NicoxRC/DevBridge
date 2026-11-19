import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { APPLY, PROJECT, SUBMIT_DELIVERY } from '../graphql'
import { LEVELS, MODALITIES, useAuth } from '../auth'
import { ErrorMsg, StatusBadge, Tags } from '../components/ui'
import Layout, { initials } from '../components/Layout'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, loading, refetch } = useQuery(PROJECT, { variables: { id: Number(id) } })
  const [message, setMessage] = useState('')
  const [apply, applyState] = useMutation(APPLY)
  const [delivery, setDelivery] = useState({ title: '', link: '' })
  const [submit, submitState] = useMutation(SUBMIT_DELIVERY)

  const p = data?.project
  if (loading && !p) return <Layout title="Loading…" />
  if (!p) return <Layout title="Project not found" />
  const app = p.myApplication
  const free = Math.max(p.slots - p.acceptedCount, 0)

  const doApply = async () => {
    try { await apply({ variables: { projectId: p.id, message } }); await refetch() } catch { /* ErrorMsg */ }
  }
  const doDeliver = async (e) => {
    e.preventDefault()
    try {
      await submit({ variables: { applicationId: app.id, ...delivery } })
      setDelivery({ title: '', link: '' })
      await refetch()
    } catch { /* ErrorMsg */ }
  }

  return (
    <Layout title={p.title} subtitle={<Link to="/projects">← Back to projects</Link>}
      actions={<StatusBadge status={p.status} />}>
      <div className="detail">
        <div className="col">
          <div className="card">
            <div className="row">
              <div className="avatar avatar-sq">{initials(p.organization.name)}</div>
              <div>
                <h2>{p.title}</h2>
                <div className="muted small">{p.organization.name} · {p.organization.city} · {MODALITIES[p.modality]}</div>
              </div>
            </div>
            <p>{p.description}</p>
            <Tags items={p.skills} highlight={user?.skills || []} />
            <div className="meta small muted">
              <span>Level: {LEVELS[p.level]}</span>
              <span>Duration: {p.durationWeeks} weeks</span>
              <span>Commitment: {p.hoursPerWeek} h/week</span>
              <span>Open slots: {free} of {p.slots}</span>
            </div>
          </div>

          {app?.status === 'accepted' && (
            <div className="card">
              <h3>Sprint deliveries</h3>
              <p className="muted small">Share your repository link each sprint so your mentor can review it.</p>
              {app.deliveries.length === 0 && <p className="muted">You have not submitted any deliveries yet.</p>}
              {app.deliveries.map((d) => (
                <div key={d.id} className="list-item">
                  <div className="row between">
                    <div><b>{d.title}</b> · <a href={d.link} target="_blank" rel="noreferrer">view link</a></div>
                    <StatusBadge status={d.status} />
                  </div>
                  {d.feedback && <div className="feedback">💬 {d.feedback} {d.rating && <b>· {'★'.repeat(d.rating)}</b>}</div>}
                </div>
              ))}
              <form className="row" onSubmit={doDeliver}>
                <input required placeholder="E.g.: Sprint 1 – Products module" value={delivery.title}
                  onChange={(e) => setDelivery({ ...delivery, title: e.target.value })} />
                <input required type="url" placeholder="https://github.com/…" value={delivery.link}
                  onChange={(e) => setDelivery({ ...delivery, link: e.target.value })} />
                <button className="btn btn-primary">Submit delivery</button>
              </form>
              <ErrorMsg error={submitState.error} />
            </div>
          )}
        </div>

        <div className="col">
          <div className="card">
            <div className="muted small">Project mentor</div>
            <div className="row">
              <div className="avatar avatar-green">{initials(p.mentorName || 'M')}</div>
              <div><b>{p.mentorName || 'To be assigned'}</b><div className="muted small">{p.organization.name}</div></div>
            </div>
          </div>

          <div className="card cta-card">
            {!user && (
              <>
                <b>Interested in this project?</b>
                <p className="small">Create a free account to apply.</p>
                <Link className="btn btn-light" to="/register">Sign up</Link>
              </>
            )}
            {user?.role === 'organization' && <p>Organizations manage their projects from their dashboard.</p>}
            {user?.role === 'developer' && !app && (
              <>
                <b>Apply to this project</b>
                <textarea rows={3} placeholder="Tell the company why you are interested (optional)"
                  value={message} onChange={(e) => setMessage(e.target.value)} />
                <button className="btn btn-light" onClick={doApply} disabled={applyState.loading || free === 0}>
                  {free === 0 ? 'No slots left' : 'Apply →'}
                </button>
                <ErrorMsg error={applyState.error} />
              </>
            )}
            {user?.role === 'developer' && app && (
              <>
                <b>Your application</b>
                <div><StatusBadge status={app.status} /></div>
                {app.status === 'submitted' && <p className="small">The organization will review your profile soon.</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
