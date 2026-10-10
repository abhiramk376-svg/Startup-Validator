import { Link } from 'react-router-dom'
import SiteNav from '../components/layout/SiteNav.jsx'
import PillBadge from '../components/common/PillBadge.jsx'
import { CheckCircleIcon, TrendIcon, ListIcon } from '../components/icons/Icons.jsx'

export default function Landing() {
  return (
    <div className="page">
      <SiteNav />

      <div className="hero-zone">
        <div className="dot-field"></div>
        <div className="hero-v2">
          <div>
            <PillBadge>AUTONOMOUS MODEL EVALUATOR</PillBadge>
            <h1>Score your business model on <span className="accent">what actually matters</span></h1>
            <p>
              Submit your idea once. Get it scored on sustainability, scalability, and profitability —
              each explained in plain English, backed by specific signals. Then keep asking questions,
              as many as you want, about any part of your model.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary btn-lg" to="/signup">Get Started →</Link>
              <a className="btn btn-ghost btn-lg" href="#how-it-works">See How It Works ›</a>
            </div>
            <div className="stat-row">
              <div><div className="stat-num">3</div><div className="stat-label">SCORING AXES</div></div>
              <div><div className="stat-num">∞</div><div className="stat-label">FOLLOW-UP QUESTIONS</div></div>
              <div><div className="stat-num">100%</div><div className="stat-label">SIGNAL-BACKED</div></div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="float-badge b1"><span className="float-dot"></span>Overall: 68</div>
            <div className="preview-mock">
              <div className="mock-titlebar"><span className="mock-dot"></span><span className="mock-dot"></span><span className="mock-dot"></span></div>
              <div className="preview-inner">
                <div className="preview-card">
                  <h5>Sustainability · Scalability · Profitability</h5>
                  <svg width="100%" height="60" viewBox="0 0 260 60" preserveAspectRatio="none">
                    <rect x="10" y="20" width="60" height="30" rx="4" fill="#0E7C6B" opacity="0.15" />
                    <rect x="100" y="10" width="60" height="40" rx="4" fill="#B9843A" opacity="0.15" />
                    <rect x="190" y="26" width="60" height="24" rx="4" fill="#3B6FA0" opacity="0.15" />
                    <text x="40" y="38" fontSize="13" fill="#0E7C6B" textAnchor="middle" fontFamily="IBM Plex Mono">72</text>
                    <text x="130" y="34" fontSize="13" fill="#B9843A" textAnchor="middle" fontFamily="IBM Plex Mono">81</text>
                    <text x="220" y="42" fontSize="13" fill="#3B6FA0" textAnchor="middle" fontFamily="IBM Plex Mono">54</text>
                  </svg>
                </div>
                <div className="preview-card">
                  <h5>Ask AI</h5>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    "What's the biggest risk to profitability?" — grounded in your evaluation, answered instantly.
                  </p>
                </div>
              </div>
            </div>
            <div className="float-badge b2"><span className="float-dot" style={{ background: '#D8A34D' }}></span>6 signals traced</div>
          </div>
        </div>
      </div>

      <div className="cap-section" id="how-it-works">
        <span className="cap-label">CORE CAPABILITIES</span>
        <h2>One idea in, a full evaluation out</h2>
        <p>Structured scoring plus continuous conversation, so nothing about your model stays a black box.</p>
        <div className="cap-grid" id="features">
          <div className="cap-card tint-1">
            <div className="cap-icon"><CheckCircleIcon /><span className="cap-index">01</span></div>
            <h3>Three-axis scoring</h3>
            <p>Sustainability, scalability, and profitability are scored separately, then blended into one overall verdict — not a single vague number.</p>
          </div>
          <div className="cap-card tint-2">
            <div className="cap-icon"><TrendIcon /><span className="cap-index">02</span></div>
            <h3>Continuous Q&amp;A</h3>
            <p>Ask unlimited follow-up questions about your model — every answer is grounded in the same evaluation, not a generic reply.</p>
          </div>
          <div className="cap-card tint-3">
            <div className="cap-icon"><ListIcon /><span className="cap-index">03</span></div>
            <h3>Explainability Dashboard</h3>
            <p>Every score is traceable to specific signals — revenue mix, cost structure, and risk exposure, all shown plainly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
