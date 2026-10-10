import Typewriter from '../common/Typewriter.jsx'

// The four agents in the order they run. `field` is the key in `progress`
// that holds that agent's finished analysis (the report agent has none —
// its output is the full report, which replaces this view when complete).
const AGENTS = [
  { step: 'market', field: 'marketAnalysis', title: 'Market Research', working: 'Reading market sources…' },
  { step: 'competitor', field: 'competitorAnalysis', title: 'Competitor Analysis', working: 'Comparing against competitors…' },
  { step: 'risk', field: 'riskAnalysis', title: 'Risk Assessment', working: 'Looking for the biggest risk…' },
  { step: 'report', field: null, title: 'Scoring & Report', working: 'Scoring sustainability, scalability and profitability…' },
]

const ORDER = AGENTS.map((a) => a.step)

// Shows the evaluation being built, agent by agent. Each agent's analysis
// appears (typed out word by word) as soon as it finishes, so the page fills
// in step by step instead of sitting on a spinner until everything is done.
export default function LiveProgress({ progress = {}, status }) {
  const currentIndex = progress.step ? ORDER.indexOf(progress.step) : status === 'simulating' ? 3 : 0

  return (
    <div className="live-progress">
      <div className="live-progress-head">
        <h3>Building your evaluation</h3>
        <p>Each agent researches its part, then hands its findings to the next.</p>
      </div>

      {AGENTS.map((agent, i) => {
        const text = agent.field ? progress[agent.field] : null
        const isDone = Boolean(text)
        const isWorking = !isDone && i === currentIndex
        const state = isDone ? 'done' : isWorking ? 'working' : 'waiting'

        return (
          <div key={agent.step} className={`live-card live-card-${state}`}>
            <div className="live-card-top">
              <span className="live-card-index">{i + 1}</span>
              <span className="live-card-title">{agent.title}</span>
              <span className="live-card-state">
                {state === 'done' ? 'Done' : state === 'working' ? 'Working' : 'Waiting'}
              </span>
            </div>

            {isDone && (
              <p className="live-card-text">
                <Typewriter text={text} />
              </p>
            )}

            {isWorking && (
              <div className="live-card-busy">
                <span className="chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <em>{agent.working}</em>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
