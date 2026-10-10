// Circular score gauge, reused for sustainability/scalability/profitability/overall.
// score: 0-100, size: px, color: any CSS color string, showLabel toggles the center number.
export default function ScoreGauge({ score = 0, size = 96, strokeWidth = 9, showLabel = true, color = '#0E7C6B' }) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const dash = (score / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E4E2DB" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span className="mono" style={{ fontSize: size >= 110 ? 26 : 24, fontWeight: 600, color }}>
            {score ?? '–'}
          </span>
        </div>
      )}
    </div>
  )
}
