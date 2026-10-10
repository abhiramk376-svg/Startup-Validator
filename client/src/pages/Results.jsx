import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppNav from '../components/layout/AppNav.jsx'
import ResultsSidebar from '../components/results/ResultsSidebar.jsx'
import ExecutiveOverviewZone from '../components/results/ExecutiveOverviewZone.jsx'
import ExplainabilityDashboardZone from '../components/results/ExplainabilityDashboardZone.jsx'
import EvidenceZone from '../components/results/EvidenceZone.jsx'
import ChatPanel from '../components/chat/ChatPanel.jsx'
import LiveProgress from '../components/results/LiveProgress.jsx'
import {
  getValidation,
  getValidationEvidence,
  getValidationCharts,
  getValidationStatus,
  retryValidation,
} from '../api/validations.js'

export default function Results() {
  const { validationId } = useParams()
  const [zone, setZone] = useState('overview')
  const [validation, setValidation] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [charts, setCharts] = useState(null)
  const [status, setStatus] = useState('pending')
  // Partial results from the agents, filled in as each one finishes
  const [progress, setProgress] = useState({})
  // True once we have watched the evaluation being built (not opened a
  // finished report) — used to type out the final verdict instead of
  // dropping it in all at once.
  const [watchedLive, setWatchedLive] = useState(false)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)
  const pollRef = useRef(null)
  const cancelledRef = useRef(false)

  // Pulled out of the effect so the Retry button can restart the same poll
  // loop without duplicating the polling logic.
  function startPolling() {
    clearInterval(pollRef.current)

    async function loadFinal() {
      try {
        const [v, e, c] = await Promise.all([
          getValidation(validationId),
          getValidationEvidence(validationId),
          getValidationCharts(validationId),
        ])
        if (!cancelledRef.current) {
          setValidation(v)
          setEvidence(e)
          setCharts(c)
          setStatus('complete')
        }
      } catch {
        if (!cancelledRef.current) setError('Could not load this evaluation.')
      }
    }

    async function poll() {
      try {
        const { status: s, errorMessage, progress: p } = await getValidationStatus(validationId)
        if (cancelledRef.current) return

        if (s === 'complete') {
          clearInterval(pollRef.current)
          await loadFinal()
        } else if (s === 'failed') {
          clearInterval(pollRef.current)
          setError(errorMessage || 'This model could not be evaluated — try rephrasing it.')
        } else {
          setStatus(s)
          setProgress(p || {})
          setWatchedLive(true)
        }
      } catch {
        clearInterval(pollRef.current)
        if (!cancelledRef.current) setError('Could not check evaluation status.')
      }
    }

    poll()
    pollRef.current = setInterval(poll, 2500)
  }

  useEffect(() => {
    cancelledRef.current = false
    startPolling()

    return () => {
      cancelledRef.current = true
      clearInterval(pollRef.current)
    }
  }, [validationId])

  async function handleRetry() {
    setRetrying(true)
    try {
      const { status: s } = await retryValidation(validationId)
      setError('')
      setValidation(null)
      setEvidence([])
      setCharts(null)
      setProgress({})
      setStatus(s || 'pending')
      startPolling()
    } catch {
      setError('Could not restart this evaluation — please try again.')
    } finally {
      setRetrying(false)
    }
  }

  if (error) {
    return (
      <div className="page">
        <AppNav />
        <div style={{ padding: 44 }}>
          <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>
          <button className="btn btn-primary" onClick={handleRetry} disabled={retrying}>
            {retrying ? 'Retrying…' : 'Retry evaluation'}
          </button>
        </div>
      </div>
    )
  }

  if (status !== 'complete' || !validation) {
    return (
      <div className="page">
        <AppNav />
        <LiveProgress progress={progress} status={status} />
      </div>
    )
  }

  return (
    <div className="page">
      <AppNav />
      <div className="results-wrap">
        <ResultsSidebar validation={validation} activeZone={zone} onZoneChange={setZone} />

        <main className="results-main">
          {zone === 'overview' && <ExecutiveOverviewZone summary={validation.summary} animate={watchedLive} />}

          {zone === 'dashboard' && (
            <ExplainabilityDashboardZone scores={validation.scores} charts={charts} industry={validation.industry} />
          )}

          {zone === 'evidence' && (
            <EvidenceZone items={evidence.map((e) => ({ claim: e.claim, source: e.source, agentStep: e.agentStep }))} />
          )}

          {zone === 'chat' && (
            <div className="zone zone-white result-zone">
              <div className="zone-header">
                <h3>Ask AI</h3>
                <p>Keep asking anything about this model — answers are grounded in this evaluation</p>
              </div>
              <div className="verdict-card" style={{ padding: 0 }}>
                <div style={{ padding: '20px 22px' }}>
                  <ChatPanel validationId={validationId} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}