import { SparkIcon } from '../icons/Icons.jsx'

export default function PillBadge({ children, style }) {
  return (
    <span className="pill-badge" style={style}>
      <SparkIcon /> {children}
    </span>
  )
}
