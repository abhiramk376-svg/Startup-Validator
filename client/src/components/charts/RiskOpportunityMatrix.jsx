// points: [{ label, x, y, risk: bool }] where x/y are already positioned in the 400x200 viewbox
export default function RiskOpportunityMatrix({ points = [] }) {
  return (
    <svg width="100%" height="200" viewBox="0 0 400 200">
      <line x1="200" y1="10" x2="200" y2="190" stroke="#E4E2DB" />
      <line x1="10" y1="100" x2="390" y2="100" stroke="#E4E2DB" />
      <text x="200" y="12" fontSize="9" fill="#6B7069" textAnchor="middle" fontFamily="IBM Plex Mono">HIGH RISK</text>
      <text x="200" y="196" fontSize="9" fill="#6B7069" textAnchor="middle" fontFamily="IBM Plex Mono">LOW RISK</text>
      <text x="14" y="103" fontSize="9" fill="#6B7069" fontFamily="IBM Plex Mono">LOW OPP.</text>
      <text x="345" y="103" fontSize="9" fill="#6B7069" fontFamily="IBM Plex Mono">HIGH OPP.</text>
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="7" fill={p.risk ? '#D8A34D' : '#0E7C6B'} />
          <text x={p.x} y={p.y - 15} fontSize="10" fill="#14181A" textAnchor="middle">{p.label}</text>
        </g>
      ))}
    </svg>
  )
}
