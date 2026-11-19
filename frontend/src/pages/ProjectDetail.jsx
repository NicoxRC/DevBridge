import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { APPLY, PROJECT, SUBMIT_DELIVERY } from '../graphql'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import { ErrorMsg, StatusBadge, Tags } from '../components/ui'
import Layout, { initials } from '../components/Layout'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useI18n()
  const { data, loading, refetch } = useQuery(PROJECT, { variables: { id: Number(id) } })
  const [message, setMessage] = useState('')
  const [apply, applyState] = useMutation(APPLY)
  const [delivery, setDelivery] = useState({ title: '', link: '' })
  const [submit, submitState] = useMutation(SUBMIT_DELIVERY)

  const p = data?.project
  if (loading && !p) return <Layout title={t('common.loading')} />
  if (!p) return <Layout title={t('project.notFound')} />
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
    <Layout title={p.title} subtitle={<Link to="/projects">{t('project.back')}</Link>}
      actions={<StatusBadge status={p.status} />}>
      <div className="detail">
        <div className="col">
          <div className="card">
            <div className="row">
              <div className="avatar avatar-sq">{initials(p.organization.name)}</div>
              <div>
                <h2>{p.title}</h2>
                <div className="muted small">{p.organization.name} · {p.organization.city} · {t(`modality.${p.modality}`)}</div>
              </div>
            </div>
            <p>{p.description}</p>
            <Tags items={p.skills} highlight={user?.skills || []} />
            <div className="meta small muted">
              <span>{t('project.level', { v: t(`level.${p.level}`) })}</span>
              <span>{t('project.duration', { n: p.durationWeeks })}</span>
              <span>{t('project.commitment', { n: p.hoursPerWeek })}</span>
              <span>{t('project.openSlots', { f: free, s: p.slots })}</span>
            </div>
          </div>

          {app?.status === 'accepted' && (
            <div className="card">
              <h3>{t('project.sprintDeliveries')}</h3>
              <p className="muted small">{t('project.sprintDesc')}</p>
              {app.deliveries.length === 0 && <p className="muted">{t('project.noDeliveries')}</p>}
              {app.deliveries.map((d) => (
                <div key={d.id} className="list-item">
                  <div className="row between">
                    <div><b>{d.title}</b> · <a href={d.link} target="_blank" rel="noreferrer">{t('project.viewLink')}</a></div>
                    <StatusBadge status={d.status} />
                  </div>
                  {d.feedback && <div className="feedback">💬 {d.feedback} {d.rating && <b>· {'★'.repeat(d.rating)}</b>}</div>}
                </div>
              ))}
              <form className="row" onSubmit={doDeliver}>
                <input required placeholder={t('project.deliveryPlaceholder')} value={delivery.title}
                  onChange={(e) => setDelivery({ ...delivery, title: e.target.value })} />
                <input required type="url" placeholder="https://github.com/…" value={delivery.link}
                  onChange={(e) => setDelivery({ ...delivery, link: e.target.value })} />
                <button className="btn btn-primary">{t('project.submitDelivery')}</button>
              </form>
              <ErrorMsg error={submitState.error} />
            </div>
          )}
        </div>

        <div className="col">
          <div className="card">
            <div className="muted small">{t('project.mentor')}</div>
            <div className="row">
              <div className="avatar avatar-green">{initials(p.mentorName || 'M')}</div>
              <div><b>{p.mentorName || t('common.toBeAssigned')}</b><div className="muted small">{p.organization.name}</div></div>
            </div>
          </div>

          <div className="card cta-card">
            {!user && (
              <>
                <b>{t('project.interested')}</b>
                <p className="small">{t('project.createAccount')}</p>
                <Link className="btn btn-light" to="/register">{t('project.signup')}</Link>
              </>
            )}
            {user?.role === 'organization' && <p>{t('project.orgNote')}</p>}
            {user?.role === 'developer' && !app && (
              <>
                <b>{t('project.apply')}</b>
                <textarea rows={3} placeholder={t('project.applyPlaceholder')}
                  value={message} onChange={(e) => setMessage(e.target.value)} />
                <button className="btn btn-light" onClick={doApply} disabled={applyState.loading || free === 0}>
                  {free === 0 ? t('project.noSlots') : t('project.applyBtn')}
                </button>
                <ErrorMsg error={applyState.error} />
              </>
            )}
            {user?.role === 'developer' && app && (
              <>
                <b>{t('project.yourApp')}</b>
                <div><StatusBadge status={app.status} /></div>
                {app.status === 'submitted' && <p className="small">{t('project.willReview')}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
