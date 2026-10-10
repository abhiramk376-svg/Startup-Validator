// Generic trend line over a period, used for the Profitability Timeline.
// values: array of numbers on an SVG-y-position scale (lower = better/higher up the chart).
export default function TimelineChart({ values = [50, 44, 34, 24, 12, 4], fromLabel = 'Now', toLabel = 'Later' }) {
  const width = 400
  const height = 120
  const stepX = width / (values.length - 1)
  const points = values.map((v, i) => `${i * stepX},${v}`).join(' ')
  const polygonPoints = `0,${values[0]} ${points} ${width},${height} 0,${height}`

  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <line x1="0" y1={height - 12} x2={width} y2={height - 12} stroke="#E4E2DB" />
        <polyline points={points} fill="none" stroke="#0E7C6B" strokeWidth="3" />
        <circle cx={width} cy={values[values.length - 1]} r="4.5" fill="#0E7C6B" />
        <polygon points={polygonPoints} fill="#0E7C6B" opacity="0.07" />
      </svg>
      <div className="chart-axis-row"><span>{fromLabel}</span><span>{toLabel}</span></div>
    </div>
  )
}
