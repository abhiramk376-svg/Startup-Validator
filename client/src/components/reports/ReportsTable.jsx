import { useNavigate } from 'react-router-dom'
import Badge from '../common/Badge.jsx'

// reports: [{ id, title, industry, score, date }]
export default function ReportsTable({ reports }) {
  const navigate = useNavigate()

  return (
    <div className="report-table">
      <div className="report-row head">
        <span>Idea</span><span>Industry</span><span>Score</span><span>Date</span><span></span>
      </div>
      {reports.map((r) => (
        <div className="report-row" key={r.id}>
          <span className="report-title">{r.title}</span>
          <span>{r.industry}</span>
          <span><Badge variant={r.score >= 60 ? 'good' : 'warn'}>{r.score}</Badge></span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.date}</span>
          <span className="report-view" onClick={() => navigate(`/app/results/${r.id}`)}>
            View Report →
          </span>
        </div>
      ))}
    </div>
  )
}
