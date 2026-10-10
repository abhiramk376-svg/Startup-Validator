import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import PasswordField from '../components/auth/PasswordField.jsx'
import { UserIcon, MailIcon } from '../components/icons/Icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function SignUp() {
  const { signUp, loading, error } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [formError, setFormError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!fullName || !email || !password) {
      setFormError('Please fill in every field.')
      return
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    if (!agreed) {
      setFormError('Please agree to the Terms of Service and Privacy Policy.')
      return
    }

    try {
      await signUp({ fullName, email, password })
      navigate('/app')
    } catch {
      // error surfaced via AuthContext's `error` state
    }
  }

  return (
    <div className="page">
      <AuthLayout
        heading={<>Know exactly where your model <span className="accent">stands</span>, before you build it.</>}
        body="Founders use the Autonomous Model Evaluator to score sustainability, scalability, and profitability, and keep asking questions until every part of the model is clear — all before committing months to building."
        calloutText="Your business model is analyzed in an isolated workspace and is never used to train external models."
      >
        <h2>Create an account</h2>
        <p className="sub">Already have an account? <Link to="/signin">Sign in instead</Link></p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <div className="input-wrap">
              <UserIcon />
              <input placeholder="John paul" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Email Address</label>
            <div className="input-wrap">
              <MailIcon />
              <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <PasswordField label="Password" value={password} onChange={setPassword} showToggle showStrength />
          <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} />

          <div className="checkbox-row">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</span>
          </div>

          {(formError || error) && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{formError || error}</p>
          )}

          <button className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>
      </AuthLayout>
    </div>
  )
}
