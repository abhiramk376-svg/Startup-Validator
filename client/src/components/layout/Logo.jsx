import { Link } from 'react-router-dom'
import { LogoMarkIcon } from '../icons/Icons.jsx'

export default function Logo({ to = '/', small = false, dark = false }) {
  return (
    <Link
      to={to}
      className="logo"
      style={{ fontSize: small ? '16px' : undefined, color: dark ? '#fff' : undefined }}
    >
      <div className="logo-mark" style={small ? { width: 26, height: 26 } : undefined}>
        <LogoMarkIcon width={small ? 14 : 16} height={small ? 14 : 16} />
      </div>
      Autonomous Model Evaluator
    </Link>
  )
}
