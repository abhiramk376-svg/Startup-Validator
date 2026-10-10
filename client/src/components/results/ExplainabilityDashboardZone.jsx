import ScoreGauge from '../charts/ScoreGauge.jsx'
import TimelineChart from '../charts/TimelineChart.jsx'
import CategoryBars from '../charts/CategoryBars.jsx'
import RiskOpportunityMatrix from '../charts/RiskOpportunityMatrix.jsx'
import { InfoIcon } from '../icons/Icons.jsx'

const AXES = [
  { key: 'sustainability', label: 'Sustainability', color: '#0E7C6B' },
  { key: 'scalability', label: 'Scalability', color: '#B9843A' },
  { key: 'profitability', label: 'Profitability', color: '#3B6FA0' },
]

// scores: {sustainability, scalability, profitability, overall}
// charts: {profitabilityTimelineValues, profitabilityTimelineCaption, revenueStreams, costStructure, riskOpportunityPoints, scoresDesc}
export default function ExplainabilityDashboardZone({ scores, charts, industry }) {
  return (
    <div className="zone zone-white result-zone">
      <div className="zone-header">
        <h3>Explainability Dashboard</h3>
        <p>The signals and numbers behind your three scores — nothing here is a black box</p>
      </div>

      <div className="dash-grid" style={{ marginBottom: 0 }}>
        <div className="chart-card dash-span-3">
          <div className="chart-card-head">
            <h4>Score Breakdown</h4>
            <InfoIcon style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', margin: '18px 0 8px' }}>
            {AXES.map((axis) => (
              <div key={axis.key} style={{ textAlign: 'center', position: 'relative' }}>
                <ScoreGauge score={scores?.[axis.key]} size={80} strokeWidth={8} showLabel={false} color={axis.color} />
                <div
                  className="mono"
                  style={{ position: 'absolute', top: 30, left: 0, right: 0, fontSize: 18, fontWeight: 600, color: axis.color }}
                >
                  {scores?.[axis.key] ?? '–'}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>{axis.label}</div>
              </div>
            ))}
          </div>
          {charts?.scoresDesc && <p className="feas-desc" style={{ maxWidth: 560, margin: '4px auto 0' }}>{charts.scoresDesc}</p>}
        </div>

        <div className="chart-card dash-span-2">
          <div className="chart-card-head">
            <h4>Profitability Timeline</h4>
          </div>
          <div className="cap">{charts?.profitabilityTimelineCaption || `${industry} · projected trend`}</div>
          <TimelineChart values={charts?.profitabilityTimelineValues} fromLabel="Now" toLabel="Later" />
        </div>

        <div className="chart-card dash-span-1">
          <h4>Risk Exposure Map</h4>
          <div className="cap">Where the concrete risks and opportunities sit</div>
          <RiskOpportunityMatrix points={charts?.riskOpportunityPoints || []} />
        </div>

        <div className="chart-card dash-span-1">
          <div className="chart-card-head">
            <h4>Revenue Streams</h4>
          </div>
          <div className="cap">How this model actually makes money</div>
          <CategoryBars items={(charts?.revenueStreams || []).map((r) => ({ ...r, highlight: true }))} />
        </div>

        <div className="chart-card dash-span-2">
          <div className="chart-card-head">
            <h4>Cost Structure</h4>
          </div>
          <div className="cap">Where the money goes, and what threatens margin</div>
          <CategoryBars items={charts?.costStructure || []} />
        </div>
      </div>
    </div>
  )
}
