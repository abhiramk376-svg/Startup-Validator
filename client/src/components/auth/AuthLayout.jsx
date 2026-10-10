import { Link } from 'react-router-dom'
import Logo from '../layout/Logo.jsx'
import { ShieldIcon } from '../icons/Icons.jsx'

// Shared two-column shell for Sign Up / Sign In: dark pitch panel + white form panel
export default function AuthLayout({ heading, body, calloutText, children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <Link to="/" className="auth-back">← Back</Link>
        <Logo dark />
        <h2>{heading}</h2>
        <p>{body}</p>
        <div className="callout">
          <ShieldIcon />
          <p>{calloutText}</p>
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  )
}
