import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { MY_PROJECTS, REVIEW_APPLICATION, REVIEW_DELIVERY, SET_PROJECT_STATUS } from '../graphql'
import { LEVELS } from '../auth'
import { ErrorMsg, StatusBadge, Tags } from '../components/ui'
import Layout, { initials } from '../components/Layout'

function DeliveryReview({ delivery, onDone }) {
  const [form, setForm] = useState({ status: 'approved', feedback: '', rating: 5 })
  const [review, { error, loading }] = useMutation(REVIEW_DELIVERY)
  if (delivery.status !== 'pending') {
    return (
      <div className="feedback">
        <StatusBadge status={delivery.status} /> {delivery.feedback} <b>{'★'.repeat(delivery.rating || 0)}</b>
      </div>
    )
  }
  const send = async (e) => {
    e.preventDefault()
    try { await review({ variables: { id: delivery.id, ...form, rating: Number(form.rating) } }); onDone() } catch { /* ErrorMsg */ }
  }
  return (
    <form className="row review" onSubmit={send}>
      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
        <option value="approved">Approve</option>
        <option value="changes_requested">Request changes</option>
      </select>
      <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
      </select>
      <input required placeholder="Feedback for the developer" value={form.feedback}
        onChange={(e) => setForm({ ...form, feedback: e.target.value })} />
      <button className="btn btn-primary" disabled={loading}>Submit</button>
      <ErrorMsg error={error} />
    </form>
  )
}

/** Organization dashboard: published projects, applications and delivery review. */
export default function OrgDashboard() {
  const { data, refetch } = useQuery(MY_PROJECTS)
  const [reviewApp, reviewState] = useMutation(REVIEW_APPLICATION)
  const [setStatus] = useMutation(SET_PROJECT_STATUS)
  const projects = data?.myProjects || []
  const all = projects.flatMap((p) => p.applications)

  const decide = async (id, status) => {
    try { await reviewApp({ variables: { id, status } }); await refetch() } catch { /* ErrorMsg */ }
  }

  return (
    <Layout title="My projects" subtitle="Manage your projects, applications and deliveries"
      actions={<Link className="btn btn-primary" to="/projects/new">+ Post project</Link>}>
      <div className="kpis">
        <div className="card kpi"><span className="dot dot-blue" /><b>{projects.filter((p) => p.status === 'published').length}</b><span>Published projects</span></div>
        <div className="card kpi"><span className="dot dot-orange" /><b>{all.filter((a) => a.status === 'submitted').length}</b><span>Applications to review</span></div>
        <div className="card kpi"><span className="dot dot-green" /><b>{all.filter((a) => a.status === 'accepted').length}</b><span>Developers in internship</span></div>
        <div className="card kpi"><span className="dot dot-purple" /><b>{all.flatMap((a) => a.deliveries).filter((d) => d.status === 'pending').length}</b><span>Deliveries to review</span></div>
      </div>
      <ErrorMsg error={reviewState.error} />
      {projects.length === 0 && <div className="card empty">You have not posted any projects yet.</div>}
      {projects.map((p) => (
        <div key={p.id} className="card">
          <div className="row between">
            <div>
              <h3>{p.title} <StatusBadge status={p.status} /></h3>
              <div className="muted small">{LEVELS[p.level]} · {p.durationWeeks} weeks · {p.acceptedCount}/{p.slots} slots filled</div>
            </div>
            <div className="row">
              <Link className="btn btn-outline" to={`/projects/${p.id}`}>View</Link>
              <button className="btn btn-outline" onClick={() => setStatus({ variables: { id: p.id, status: p.status === 'published' ? 'closed' : 'published' } })}>
                {p.status === 'published' ? 'Close' : 'Reopen'}
              </button>
            </div>
          </div>
          <Tags items={p.skills} />
          <h4>Applications ({p.applications.length})</h4>
          {p.applications.length === 0 && <p className="muted small">No applications yet.</p>}
          {p.applications.map((a) => (
            <div key={a.id} className="list-item">
              <div className="row between">
                <div className="row">
                  <div className="avatar">{initials(a.developer.name)}</div>
                  <div>
                    <b>{a.developer.name}</b>
                    <div className="muted small">{LEVELS[a.developer.level]} · {a.developer.city}
                      {a.developer.github && <> · <a href={a.developer.github} target="_blank" rel="noreferrer">GitHub</a></>}</div>
                  </div>
                </div>
                <div className="row">
                  <StatusBadge status={a.status} />
                  {a.status === 'submitted' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => decide(a.id, 'accepted')}>Accept</button>
                      <button className="btn btn-outline btn-sm" onClick={() => decide(a.id, 'rejected')}>Reject</button>
                    </>
                  )}
                </div>
              </div>
              <Tags items={a.developer.skills} highlight={p.skills} />
              {a.message && <p className="small">“{a.message}”</p>}
              {a.deliveries.map((d) => (
                <div key={d.id} className="delivery">
                  <div><b>{d.title}</b> · <a href={d.link} target="_blank" rel="noreferrer">view delivery</a></div>
                  <DeliveryReview delivery={d} onDone={refetch} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </Layout>
  )
}
