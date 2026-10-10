// Generic horizontal breakdown bars — reused for both revenue stream mix
// and cost structure. items: [{ name, pct, highlight?: bool }]
export default function CategoryBars({ items = [] }) {
  return (
    <div className="competitor-list">
      {items.map((item) => (
        <div className="competitor-row" key={item.name}>
          <div className="competitor-row-label">
            <span className={item.highlight ? 'competitor-you' : undefined}>{item.name}</span>
            <span className={item.highlight ? 'competitor-tag competitor-tag-you' : 'competitor-tag'}>{item.pct}%</span>
          </div>
          <div className="competitor-bar-track">
            <div
              className="competitor-bar"
              style={{ width: `${item.pct}%`, background: item.highlight ? 'var(--primary)' : '#C9C6BC' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
