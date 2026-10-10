import { useState } from 'react'
import { LockIcon, EyeIcon } from '../icons/Icons.jsx'

export default function PasswordField({ label, value, onChange, showToggle = false, showStrength = false }) {
  const [visible, setVisible] = useState(false)

  const strengthLevel = showStrength ? scorePassword(value) : 0

  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-wrap">
        <LockIcon />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
        />
        {showToggle && (
          <button type="button" className="toggle" onClick={() => setVisible((v) => !v)}>
            <EyeIcon />
          </button>
        )}
      </div>
      {showStrength && (
        <>
          <div className="strength">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ background: i < strengthLevel ? 'var(--primary)' : 'var(--border)' }} />
            ))}
          </div>
          <div className="strength-label">{strengthLabel(strengthLevel)}</div>
        </>
      )}
    </div>
  )
}

function scorePassword(pw = '') {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

function strengthLabel(level) {
  if (!level) return 'Enter a password'
  if (level <= 1) return 'Weak — try adding numbers and length'
  if (level === 2) return 'Good — add a symbol for a stronger password'
  if (level === 3) return 'Strong password'
  return 'Excellent password'
}
