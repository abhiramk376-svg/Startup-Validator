import ScoreGauge from '../charts/ScoreGauge.jsx'
import Badge from '../common/Badge.jsx'

const AXES = [
  { key: 'sustainability', label: 'Sustainability', color: '#0E7C6B' },
  { key: 'scalability', label: 'Scalability', color: '#B9843A' },
  { key: 'profitability', label: 'Profitability', color: '#3B6FA0' },
]

// activeZone: 'overview' | 'dashboard' | 'evidence' | 'chat'
export default function ResultsSidebar({ validation, activeZone, onZoneChange }) {
  const scores = validation.scores || {}

  return (
    <aside className="results-side">
      <div className="side-gauge">
        <ScoreGauge score={scores.overall} size={120} strokeWidth={10} showLabel={false} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="mono" style={{ fontSize: 26, fontWeight: 600, color: 'var(--primary-dark)' }}>{scores.overall ?? '–'}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>OVERALL</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 14, color: 'var(--dark)', marginBottom: 4 }}>
        {validation.title}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}><Badge>{validation.industry}</Badge></div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 22 }}>
        {AXES.map((axis) => (
          <div key={axis.key} style={{ textAlign: 'center' }}>
            <ScoreGauge score={scores[axis.key]} size={48} strokeWidth={5} showLabel={false} color={axis.color} />
            <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: axis.color, marginTop: -34 }}>
              {scores[axis.key] ?? '–'}
            </div>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>{axis.label}</div>
          </div>
        ))}
      </div>

      <div className="side-tabs">
        <div
          className={`side-tab ${activeZone === 'overview' ? 'active' : ''}`}
          onClick={() => onZoneChange('overview')}
        >
          Executive Overview
        </div>
        <div
          className={`side-tab ${activeZone === 'dashboard' ? 'active' : ''}`}
          onClick={() => onZoneChange('dashboard')}
        >
          Explainability Dashboard
        </div>
        <div
          className={`side-tab ${activeZone === 'evidence' ? 'active' : ''}`}
          onClick={() => onZoneChange('evidence')}
        >
          Evidence &amp; Signals
        </div>
        <div
          className={`side-tab ${activeZone === 'chat' ? 'active' : ''}`}
          onClick={() => onZoneChange('chat')}
        >
          Ask AI
        </div>
      </div>
    </aside>
  )
}
