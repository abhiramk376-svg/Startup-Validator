import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordField from '../components/auth/PasswordField.jsx'
import { MailIcon, GoogleIcon } from '../components/icons/Icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function SignIn() {
  const { signIn, loading, error } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await signIn({ email, password })
      navigate('/app')
    } catch {
      // error surfaced via AuthContext's `error` state
    }
  }

  return (
    <div className="page">
      <AuthLayout
        heading={<>Pick up right where your last <span className="accent">evaluation</span> left off.</>}
        body="Your evaluations, signals, and full Q&A history are saved to your account so you can revisit and refine them anytime."
        calloutText="Your data stays private and is never shared with third parties."
      >
        <h2>Welcome back</h2>
        <p className="sub">Don't have an account? <Link to="/signup">Sign up instead</Link></p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email Address</label>
            <div className="input-wrap">
              <MailIcon />
              <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <PasswordField label="Password" value={password} onChange={setPassword} showToggle />

          <div className="row-between">
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
            </span>
            <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Forgot password?</a>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>}

          <button className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div className="divider-or">or</div>
        <button className="btn btn-ghost btn-full btn-lg" type="button">
          <GoogleIcon /> Continue with Google
        </button>
      </AuthLayout>
    </div>
  )
}
