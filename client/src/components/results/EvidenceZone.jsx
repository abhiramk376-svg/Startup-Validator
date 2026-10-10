const SIGNAL_LABEL = {
  sustainability: 'Sustainability',
  scalability: 'Scalability',
  profitability: 'Profitability',
  general: 'General',
}

// items: [{ claim, source, agentStep }]
export default function EvidenceZone({ items }) {
  return (
    <div className="zone zone-white result-zone">
      <div className="zone-header">
        <h3>Evidence &amp; Signals</h3>
        <p>Every score is backed by specific signals — here's what influenced each one</p>
      </div>
      <div className="verdict-card">
        {items.map((item, i) => (
          <div className="evidence-item" key={i}>
            <div>
              {item.agentStep && (
                <div style={{ marginBottom: 4 }}>
                  <span className="badge badge-good" style={{ fontSize: 9.5 }}>
                    {SIGNAL_LABEL[item.agentStep] || item.agentStep}
                  </span>
                </div>
              )}
              <div className="txt">{item.claim}</div>
            </div>
            <div className="src">{item.source}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
