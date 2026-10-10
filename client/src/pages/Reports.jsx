import { useEffect, useState } from 'react'
import AppNav from '../components/layout/AppNav.jsx'
import ReportsTable from '../components/reports/ReportsTable.jsx'
import { SearchIcon } from '../components/icons/Icons.jsx'
import { listReports } from '../api/reports.js'

const FILTERS = ['All', 'HealthTech', 'Fintech', 'Food & Beverage', 'B2B SaaS']

export default function Reports() {
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await listReports({ search, industry: activeFilter === 'All' ? '' : activeFilter })
        if (!cancelled) setReports(data)
      } catch {
        if (!cancelled) setError('Could not load your evaluations.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [search, activeFilter])

  return (
    <div className="page">
      <AppNav active="reports" />

      <div className="reports-wrap">
        <div className="reports-head">
          <h2>My Evaluations</h2>
          <div className="search-bar">
            <SearchIcon />
            <input
              placeholder="Search evaluations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="filters-row">
          {FILTERS.map((f) => (
            <span
              key={f}
              className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </span>
          ))}
        </div>

        {loading && <p>Loading evaluations…</p>}
        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
        {!loading && !error && <ReportsTable reports={reports} />}
      </div>
    </div>
  )
}
