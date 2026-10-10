import { useEffect, useRef, useState } from 'react'
import { askQuestion, getChatHistory } from '../../api/validations.js'

const SUGGESTIONS = [
  'What is the biggest risk to profitability?',
  'How would this scale to 10x the customers?',
  'When would this realistically break even?',
  'What would you change to improve sustainability?',
]

// Continuous, scoped Q&A — the founder can keep asking unlimited follow-up
// questions about this specific model, each grounded in its own evaluation.
export default function ChatPanel({ validationId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const threadRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function loadHistory() {
      setLoading(true)
      try {
        const history = await getChatHistory(validationId)
        if (!cancelled) setMessages(history)
      } catch {
        if (!cancelled) setError('Could not load the conversation.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadHistory()
    return () => { cancelled = true }
  }, [validationId])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function sendQuestion(question) {
    const trimmed = question.trim()
    if (!trimmed || sending) return

    setError('')
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: trimmed, createdAt: new Date().toISOString() }])
    setSending(true)

    try {
      const answer = await askQuestion(validationId, trimmed)
      setMessages((prev) => [...prev, answer])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not get an answer — try again.')
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendQuestion(input)
  }

  return (
    <div className="chatbot-panel">
      <div className="chatbot-thread" ref={threadRef}>
        {loading && <p className="chatbot-empty">Loading conversation…</p>}

        {!loading && messages.length === 0 && (
          <div className="chatbot-empty">
            <p>Ask anything about this model — as many questions as you want. Every answer is grounded in its evaluation.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'chatbot-msg chatbot-msg-user' : 'chatbot-msg chatbot-msg-assistant'}>
            {m.content}
          </div>
        ))}

        {sending && (
          <div className="chatbot-msg chatbot-msg-assistant chatbot-typing">
            <span></span><span></span><span></span>
          </div>
        )}
      </div>

      {!loading && messages.length === 0 && (
        <div className="chatbot-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="composer-chip" onClick={() => sendQuestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="chatbot-error">{error}</p>}

      <form className="chatbot-input-row" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question…"
          disabled={sending}
        />
        <button className="btn btn-primary" type="submit" disabled={sending || !input.trim()}>
          Ask
        </button>
      </form>
    </div>
  )
}
