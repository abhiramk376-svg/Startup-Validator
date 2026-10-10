import { env } from '../config/env.js'

// Thin wrapper around any OpenAI-compatible chat completions endpoint.
// Swap AI_PROVIDER_BASE_URL / AI_MODEL in .env to point at a different
// provider (OpenAI, Azure OpenAI, a local vLLM server, etc.) without
// touching any calling code.

// Status codes that represent a transient upstream condition worth retrying
// (model overloaded, rate limited, gateway hiccup) as opposed to something
// that will fail again immediately no matter how many times we ask (bad
// request, auth failure, etc).
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Targets: where a chat request can go, in priority order.
//   1. the primary model                     (AI_MODEL)
//   2. backup models on the same provider    (AI_FALLBACK_MODELS)
//   3. optionally a second provider          (AI_FALLBACK_BASE_URL/_API_KEY/_MODEL)
// Free-tier quotas are per model, so when one model is overloaded or out of
// quota the request moves to the next target instead of failing.
// ---------------------------------------------------------------------------
function buildTargets() {
  const targets = [
    {
      baseUrl: env.AI_PROVIDER_BASE_URL,
      apiKey: env.AI_PROVIDER_API_KEY,
      model: env.AI_MODEL,
      minIntervalMs: env.AI_MIN_INTERVAL_MS,
    },
  ]
  for (const model of env.AI_FALLBACK_MODELS) {
    if (model === env.AI_MODEL) continue
    targets.push({
      baseUrl: env.AI_PROVIDER_BASE_URL,
      apiKey: env.AI_PROVIDER_API_KEY,
      model,
      minIntervalMs: env.AI_MIN_INTERVAL_MS,
    })
  }
  if (env.AI_FALLBACK_BASE_URL && env.AI_FALLBACK_API_KEY && env.AI_FALLBACK_MODEL) {
    targets.push({
      baseUrl: env.AI_FALLBACK_BASE_URL,
      apiKey: env.AI_FALLBACK_API_KEY,
      model: env.AI_FALLBACK_MODEL,
      minIntervalMs: env.AI_FALLBACK_MIN_INTERVAL_MS,
    })
  }
  return targets.map((t) => ({ ...t, id: `${t.baseUrl}|${t.model}`, lastCallAt: 0 }))
}

const TARGETS = buildTargets()

// target.id -> timestamp until which we skip it (overloaded / out of quota)
const unavailableUntil = new Map()
const isAvailable = (t) => (unavailableUntil.get(t.id) || 0) <= Date.now()

// First target that is not cooling down; if every target is, the one that
// recovers soonest (the normal retry/backoff below then waits for it).
function pickTarget() {
  const ready = TARGETS.find(isAvailable)
  if (ready) return ready
  return [...TARGETS].sort((a, b) => (unavailableUntil.get(a.id) || 0) - (unavailableUntil.get(b.id) || 0))[0]
}

const hasAlternative = (current) => TARGETS.some((t) => t.id !== current.id && isAvailable(t))

// Gemini's free tier allows only ~5 requests/minute per model. Space calls to
// each target proactively instead of relying on reactive 429 retries (which
// then have to wait out Gemini's ~40s penalty). Per target, because quotas
// are per model — a different model has its own allowance.
async function throttle(target) {
  const wait = target.lastCallAt + target.minIntervalMs - Date.now()
  if (wait > 0) await sleep(wait)
  target.lastCallAt = Date.now()
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

// Gemini's 429 responses don't set a standard `Retry-After` header — the
// suggested wait is buried in the JSON error body instead, e.g.:
//   { error: { details: [ { "@type": "...RetryInfo", retryDelay: "39s" } ] } }
// Without parsing this, a fixed short backoff (1s/2s/4s) just retries into
// the same wall and fails anyway on a 5-requests-per-minute free tier.
// IMPORTANT: Gemini's OpenAI-compatible endpoint wraps the body in an array
// (`[{ error: {...} }]`), so it must be unwrapped first or the lookup
// silently finds nothing every time.
function parseGeminiRetryDelayMs(bodyText) {
  try {
    let parsed = JSON.parse(bodyText)
    if (Array.isArray(parsed)) parsed = parsed[0]
    const details = parsed?.error?.details || []
    const retryInfo = details.find((d) => typeof d.retryDelay === 'string')
    if (!retryInfo) return null
    const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''))
    return Number.isFinite(seconds) ? Math.ceil(seconds * 1000) : null
  } catch {
    return null
  }
}

// A per-minute 429 (a few seconds to tens of seconds) is worth waiting out.
// A per-DAY quota exhaustion (hours) is not — no amount of in-request waiting
// frees that up, so retrying only burns the whole retry budget before failing
// with a confusing message. Fail immediately with a clear, actionable error.
const MAX_HONORED_RETRY_DELAY_MS = 90 * 1000

export async function chatCompletion(messages, { jsonMode = false, maxRetries = 5, baseDelayMs = 1500 } = {}) {
  if (!env.AI_PROVIDER_API_KEY) {
    throw Object.assign(new Error('AI_PROVIDER_API_KEY is not set in .env'), { status: 500 })
  }

  let lastErr
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const target = pickTarget()
    await throttle(target)
    let res
    try {
      res = await fetch(`${target.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${target.apiKey}`,
        },
        body: JSON.stringify({
          model: target.model,
          messages,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
      })
    } catch (networkErr) {
      // fetch itself threw (DNS, connection reset, etc) — treat as retryable
      lastErr = Object.assign(new Error(`AI provider request failed: ${networkErr.message}`), { status: 502 })
      if (attempt < maxRetries) {
        await sleep(baseDelayMs * 2 ** attempt + Math.random() * 250)
        continue
      }
      throw lastErr
    }

    if (res.ok) {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    }

    const text = await res.text()
    const err = Object.assign(new Error(`AI provider error (${res.status}): ${text}`), { status: 502, providerStatus: res.status })

    const geminiDelayMs = res.status === 429 ? parseGeminiRetryDelayMs(text) : null
    const longQuota = res.status === 429 && geminiDelayMs !== null && geminiDelayMs > MAX_HONORED_RETRY_DELAY_MS

    // 503 (model overloaded), 429 (quota) and 404 (model name not available)
    // are all problems with THIS model, not with the request. If another
    // target is available, mark this one unavailable for a while and move on
    // right away instead of waiting on a model that will keep failing.
    if (res.status === 503 || res.status === 429 || res.status === 404) {
      const cooldownMs =
        res.status === 404
          ? SIX_HOURS_MS
          : res.status === 429
            ? Math.min(geminiDelayMs ?? 30000, SIX_HOURS_MS)
            : 60000
      unavailableUntil.set(target.id, Date.now() + cooldownMs)

      if (hasAlternative(target) && attempt < maxRetries) {
        const next = pickTarget()
        console.warn(
          `AI model ${target.model} unavailable (${res.status}) — switching to ${next.model}` +
            (next.baseUrl !== target.baseUrl ? ' on backup provider' : '')
        )
        lastErr = err
        continue
      }
    }

    if (longQuota) {
      throw Object.assign(
        new Error(
          `AI provider daily quota exhausted — Gemini says retry in ~${Math.round(geminiDelayMs / 3600000)}h. ` +
            `This is a free-tier daily request cap, not a temporary glitch. Fix: add backup models/provider ` +
            `(AI_FALLBACK_MODELS, or AI_FALLBACK_BASE_URL + AI_FALLBACK_API_KEY + AI_FALLBACK_MODEL in .env), ` +
            `or wait for the daily quota to reset. Original error: ${text}`
        ),
        { status: 429, providerStatus: 429 }
      )
    }

    if (RETRYABLE_STATUS.has(res.status) && attempt < maxRetries) {
      lastErr = err
      // Priority: Gemini's own suggested wait (short-window only, see above)
      // > a standard Retry-After header > exponential backoff with jitter.
      const retryAfterHeader = res.headers.get('retry-after')
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : null
      const delay =
        geminiDelayMs ??
        (retryAfterMs && !Number.isNaN(retryAfterMs) ? retryAfterMs : baseDelayMs * 2 ** attempt + Math.random() * 250)
      console.warn(`AI provider ${res.status} — retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${maxRetries})`)
      await sleep(delay)
      continue
    }

    throw err
  }

  throw lastErr
}

// NOTE: validationPipeline.js now calls runAgenticEvaluation() in
// langgraphPipeline.js instead of this function — that's the real
// multi-agent RAG pipeline (market -> competitor -> risk -> report nodes).
// This single-call version is kept only as a reference/manual-testing
// helper (evaluates a business model on three axes in one structured call,
// no retrieval, no agent steps) and is not wired into any route.
export async function generateValidationJSON(ideaDescription) {
  const system = `You are the Autonomous Model Evaluator — an analyst that scores business models on
sustainability, scalability, and profitability, and explains every score in plain English to someone
with no business background. Analyze the SPECIFIC model described below — never fall back on a generic
template or a different, unrelated example. Every sentence you write must reference concrete details
from THIS idea (the actual product, the actual customer, the actual revenue mechanism if implied). If
something isn't specified in the idea, say so honestly rather than inventing details.

Definitions to score against:
- SUSTAINABILITY: can this business keep operating and serving customers over years, not just survive
  a launch? Consider durability of the customer relationship, dependency risks, and whether the model
  holds up as costs/competition change.
- SCALABILITY: can this grow significantly without a proportional increase in cost or effort? Consider
  whether serving 10x more customers requires 10x more people/cost, or whether it gets easier.
- PROFITABILITY: does the revenue model realistically exceed the cost to run it, and on what timeline?
  Consider unit economics, not just total revenue potential.

Return STRICT JSON matching this exact shape (no extra keys, no markdown, no prose outside the JSON):

{
  "title": "a clear, specific 3-6 word name for this exact business model",
  "industry": "one or two word category, e.g. 'Food & Beverage', 'Fintech', 'HealthTech'",

  "scores": {
    "sustainability": integer 0-100,
    "scalability": integer 0-100,
    "profitability": integer 0-100,
    "overall": integer 0-100 (a reasoned blend of the three, not a plain average if one axis is a dealbreaker)
  },

  "summary": {
    "abstract": "4-6 full sentences, plain conversational English. The honest bottom-line verdict on THIS model: what works, what doesn't, and what you'd tell this founder to do next — tied to specifics of the idea, not generic advice.",

    "keyFactors": [{"label": "short 2-4 word phrase specific to this idea", "variant": "good" | "warn"}, ... exactly 4-5 items, mixed],

    "revenueStreams": "4-6 plain-English sentences: exactly how does this model make money (be specific — subscription, per-transaction fee, one-time sale, etc, inferred from the idea), who pays, how often, and is that revenue mechanism realistic for the described customer.",

    "costStructure": "4-6 plain-English sentences: what does it actually cost to run this, in categories a non-expert understands (e.g. 'the raw ingredients for each drink', 'the engineers needed to build and maintain the calendar sync'), and which cost is the biggest threat to margins.",

    "marketScalability": "4-6 plain-English sentences: what happens to this business at 10x the current scale — does cost grow proportionally (bad) or does it get more efficient (good) — and what specifically would need to be true for this to scale well.",

    "riskExposure": "4-6 plain-English sentences on the single biggest concrete risk to this model's sustainability or profitability — not 'market risk' in the abstract, but the specific thing that could actually break it.",

    "profitabilityTimeline": "3-5 plain-English sentences: roughly how long before this model breaks even or turns profitable, what has to happen for that to occur, and whether that timeline is realistic given the business type (e.g. a physical retail model breaks even differently than a software subscription)."
  },

  "evidence": [
    {"claim": "one specific, plain-English factual statement a normal person would understand at a glance, directly supporting something said above", "source": "a plausible, specific source name, e.g. 'IBISWorld Industry Report, 2026' or 'comparable business benchmarks'", "agentStep": "sustainability" | "scalability" | "profitability" | "general"}
    ... exactly 6-8 items, spread across all four categories, each understandable without business background
  ],

  "charts": {
    "profitabilityTimelineValues": [6 integers 0-100, an SVG-y-position-style trend where a LOWER number means a stronger financial position — first value is near-term (likely negative/high number), trending toward the value implied by profitabilityTimeline],
    "profitabilityTimelineCaption": "short label, e.g. 'Break-even around Month 14' — must match what profitabilityTimeline said",
    "revenueStreams": [{"name": "specific revenue stream name", "pct": 0-100}, ... 2-4 items summing to roughly 100, matching revenueStreams text],
    "costStructure": [{"name": "specific cost category name", "pct": 0-100}, ... 2-4 items summing to roughly 100, matching costStructure text],
    "riskOpportunityPoints": [{"label": "short 2-4 word phrase specific to this idea", "x": 0-390, "y": 0-190, "risk": true|false}, ... exactly 3-4 items, matching riskExposure and marketScalability],
    "scoresDesc": "1-2 plain-English sentences explaining how the three scores relate to each other for this specific model (e.g. why scalability might be high but profitability low, or vice versa)"
  }
}`

  const raw = await chatCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: `Evaluate this business model in detail:\n\n${ideaDescription}` },
    ],
    { jsonMode: true, maxRetries: 4, baseDelayMs: 1500 }
  )

  return JSON.parse(raw)
}

// Used by chatController.js — answers unlimited follow-up questions, grounded
// in this specific model's own scores, summary, and evidence (lightweight
// RAG: no vector DB, the report's own context is stuffed directly into the
// prompt since it's small enough).
export async function answerStartupQuestion({ ideaDescription, summary, evidence, chatHistory, question, retrievedContext }) {
  const evidenceBlock = evidence.map((e) => `- ${e.claim} (source: ${e.source})`).join('\n')

  const system = `You are the Autonomous Model Evaluator's analyst — the one behind this business model's
sustainability/scalability/profitability evaluation. The founder can ask you literally anything about
their model, and you keep answering, grounded in the evaluation you already produced, freshly retrieved
source material for THIS question, and general business reasoning. Never invent statistics that aren't in
the context below. If something isn't covered, say so plainly and give your best reasoned judgment instead
of fabricating a citation.

THE BUSINESS MODEL: ${ideaDescription}

EVALUATION SUMMARY: ${summary?.abstract || 'n/a'}

SIGNALS ON FILE:
${evidenceBlock || '(none yet)'}

FRESHLY RETRIEVED SOURCES FOR THIS SPECIFIC QUESTION (RAG lookup, use for any new factual claim):
${retrievedContext || '(no additional matching sources found for this question)'}

Keep answers conversational, concise (3-6 sentences unless the question needs a list), and specific to this model — never drift into discussing a different or generic example.`

  const messages = [
    { role: 'system', content: system },
    ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ]

  return chatCompletion(messages)
}