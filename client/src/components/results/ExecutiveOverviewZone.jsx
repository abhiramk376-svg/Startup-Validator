import { useState } from 'react'
import Badge from '../common/Badge.jsx'
import Typewriter from '../common/Typewriter.jsx'

// summary: { abstract, keyFactors, revenueStreams, costStructure, marketScalability, riskExposure, profitabilityTimeline }
// animate: write the report out section by section, word by word (used when
// the user watched the evaluation being built). Otherwise it shows instantly.
const BLOCKS = [
  { key: 'revenueStreams', title: '💵 Revenue Streams' },
  { key: 'costStructure', title: '🧾 Cost Structure' },
  { key: 'marketScalability', title: '📈 Market Scalability' },
  { key: 'riskExposure', title: '⚠️ Risk Exposure' },
  { key: 'profitabilityTimeline', title: '⏱️ Profitability Timeline' },
]

export default function ExecutiveOverviewZone({ summary, animate = false }) {
  const blocks = BLOCKS.filter((b) => summary[b.key])
  // 0 = bottom line is typing, 1..n = that many detail blocks revealed
  const [stage, setStage] = useState(animate ? 0 : blocks.length + 1)
  const next = (from) => setStage((s) => (s === from ? from + 1 : s))

  return (
    <div className="zone zone-white result-zone">
      <div className="zone-header">
        <h3>Executive Overview</h3>
        <p>The verdict on your specific model, in plain terms</p>
      </div>

      <div className="verdict-card">
        <span className="eyebrow">THE BOTTOM LINE</span>
        <p>
          {animate ? <Typewriter text={summary.abstract} msPerWord={25} onDone={() => next(0)} /> : summary.abstract}
        </p>
        {stage >= 1 && (
          <>
            <span className="eyebrow" style={{ marginTop: 6 }}>KEY FACTORS</span>
            <div className="chip-row">
              {summary.keyFactors?.map((f) => (
                <Badge key={f.label} variant={f.variant}>{f.label}</Badge>
              ))}
            </div>
          </>
        )}
      </div>

      {stage >= 1 && blocks.length > 0 && (
        <div className="verdict-card" style={{ marginTop: 18 }}>
          {blocks.map((b, i) => {
            const n = i + 1
            if (stage < n) return null
            const typing = animate && stage === n
            return (
              <div className="info-block" key={b.key}>
                <h4>{b.title}</h4>
                <p>
                  {typing ? (
                    <Typewriter text={summary[b.key]} msPerWord={20} onDone={() => next(n)} />
                  ) : (
                    summary[b.key]
                  )}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}