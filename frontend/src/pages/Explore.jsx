import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { CATALOGS, PROJECTS } from '../graphql'
import { LEVELS, MODALITIES } from '../auth'
import { useI18n } from '../i18n'
import { ProjectCard } from '../components/ui'
import Layout from '../components/Layout'

export default function Explore() {
  const { t } = useI18n()
  const [filters, setFilters] = useState({ search: '', skill: '', level: '', modality: '' })
  const vars = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  const { data, loading } = useQuery(PROJECTS, { variables: vars })
  const { data: cat } = useQuery(CATALOGS)
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })
  const projects = data?.projects || []

  return (
    <Layout title={t('nav.explore')} subtitle={t('explore.available', { n: projects.length })}>
      <div className="filters">
        <input className="search" placeholder={t('explore.search')} value={filters.search} onChange={set('search')} />
        <select value={filters.skill} onChange={set('skill')}>
          <option value="">{t('explore.allTech')}</option>
          {(cat?.catalogs.skills || []).map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.level} onChange={set('level')}>
          <option value="">{t('explore.anyLevel')}</option>
          {LEVELS.map((k) => <option key={k} value={k}>{t(`level.${k}`)}</option>)}
        </select>
        <select value={filters.modality} onChange={set('modality')}>
          <option value="">{t('explore.anyModality')}</option>
          {MODALITIES.map((k) => <option key={k} value={k}>{t(`modality.${k}`)}</option>)}
        </select>
      </div>
      {loading && !data && <p className="muted">{t('explore.loading')}</p>}
      {!loading && projects.length === 0 && <div className="card empty">{t('explore.empty')}</div>}
      <div className="grid-2">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </Layout>
  )
}
