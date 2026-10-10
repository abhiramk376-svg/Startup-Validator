import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../components/layout/AppNav.jsx'
import PillBadge from '../components/common/PillBadge.jsx'
import { createValidation } from '../api/validations.js'

export default function Chat() {
  const [idea, setIdea] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit() {
    if (!idea.trim()) {
      setError('Describe your idea first.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const { validationId } = await createValidation(idea)
      navigate(`/app/results/${validationId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong starting the validation.')
      setSubmitting(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="page">
      <AppNav active="new" />

      <div className="composer-wrap">
        <div className="composer-inner">
          <PillBadge>NEW VALIDATION</PillBadge>
          <h1 className="composer-title">What's the idea?</h1>
          <p className="composer-sub">
            Describe it in a sentence or two. It gets scored on sustainability, scalability, and
            profitability — then you can ask as many follow-up questions as you want.
          </p>

          <div className="composer-card">
            <textarea
              className="composer-input"
              rows={4}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your business model in a sentence or two…"
              autoFocus
            />
            <div className="composer-toolbar">
              <span className="composer-hint">⌘ + Enter to run</span>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Validating…' : 'Validate Idea →'}
              </button>
            </div>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{error}</p>}

          {submitting && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 14, textAlign: 'center' }}>
              Researching your idea — this can take a moment.
            </p>
          )}

          <div className="composer-steps">
            <div className="composer-step"><span className="composer-step-dot"></span>Revenue</div>
            <div className="composer-step-line"></div>
            <div className="composer-step"><span className="composer-step-dot"></span>Cost</div>
            <div className="composer-step-line"></div>
            <div className="composer-step"><span className="composer-step-dot"></span>Scale</div>
            <div className="composer-step-line"></div>
            <div className="composer-step"><span className="composer-step-dot"></span>Profitability</div>
          </div>
        </div>
      </div>
    </div>
  )
}
