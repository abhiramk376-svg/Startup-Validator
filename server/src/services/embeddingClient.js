import { env } from '../config/env.js'

// Thin wrapper around any OpenAI-compatible embeddings endpoint.
// Works with Gemini (default), OpenAI, Azure, or a local Ollama server —
// just change the .env values, no code changes needed.

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Same reasoning as aiClient.js's throttle — space out calls proactively
// instead of only reacting to 429s after they happen. Embedding limits are
// much looser than chat limits, so the default gap is short (configurable
// via EMBEDDING_MIN_INTERVAL_MS).
const MIN_CALL_INTERVAL_MS = env.EMBEDDING_MIN_INTERVAL_MS
let lastCallAt = 0
async function throttle() {
  const wait = lastCallAt + MIN_CALL_INTERVAL_MS - Date.now()
  if (wait > 0) await sleep(wait)
  lastCallAt = Date.now()
}

// See aiClient.js for why this exists: Gemini's 429 body carries the real
// suggested wait time, not a standard Retry-After header. The body is
// array-wrapped (`[{ error: {...} }]`), so it must be unwrapped first.
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

// Same reasoning as aiClient.js: a per-day quota exhaustion (hours-long
// retryDelay) should fail fast, not be blindly waited out.
const MAX_HONORED_RETRY_DELAY_MS = 90 * 1000

// Embedding the same text twice always gives the same vector, and one
// evaluation embeds the same idea once per agent (market, competitor, risk).
// Cache the in-flight/finished request so repeats cost nothing — fewer calls
// against the quota, and no throttle wait. Small LRU-ish cap keeps memory flat.
const EMBED_CACHE_MAX = 200
const embedCache = new Map()

export function embedText(text, options) {
  if (embedCache.has(text)) {
    const hit = embedCache.get(text)
    embedCache.delete(text) // refresh recency
    embedCache.set(text, hit)
    return hit
  }
  const pending = fetchEmbedding(text, options).catch((err) => {
    embedCache.delete(text) // never cache a failure
    throw err
  })
  embedCache.set(text, pending)
  if (embedCache.size > EMBED_CACHE_MAX) embedCache.delete(embedCache.keys().next().value)
  return pending
}

async function fetchEmbedding(text, { maxRetries = 5, baseDelayMs = 1500 } = {}) {
  const apiKey = env.EMBEDDING_PROVIDER_API_KEY || env.AI_PROVIDER_API_KEY
  if (!apiKey) {
    throw Object.assign(new Error('EMBEDDING_PROVIDER_API_KEY (or AI_PROVIDER_API_KEY) is not set in .env'), {
      status: 500,
    })
  }

  let lastErr
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await throttle()
    let res
    try {
      res = await fetch(`${env.EMBEDDING_PROVIDER_BASE_URL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: env.EMBEDDING_MODEL, input: text }),
      })
    } catch (networkErr) {
      lastErr = Object.assign(new Error(`Embedding request failed: ${networkErr.message}`), { status: 502 })
      if (attempt < maxRetries) {
        await sleep(baseDelayMs * 2 ** attempt + Math.random() * 250)
        continue
      }
      throw lastErr
    }

    if (res.ok) {
      const data = await res.json()
      const embedding = data?.data?.[0]?.embedding
      if (!embedding) {
        throw Object.assign(new Error(`Embedding response had no data[0].embedding: ${JSON.stringify(data)}`), {
          status: 502,
        })
      }
      return embedding
    }

    const errText = await res.text()
    const err = Object.assign(
      new Error(
        `Embedding request failed (${res.status}): ${errText}. Check EMBEDDING_PROVIDER_BASE_URL/EMBEDDING_MODEL/EMBEDDING_PROVIDER_API_KEY in .env — get a free key at https://aistudio.google.com/apikey`
      ),
      { status: 502, providerStatus: res.status }
    )

    const geminiDelayMs = res.status === 429 ? parseGeminiRetryDelayMs(errText) : null

    if (res.status === 429 && geminiDelayMs !== null && geminiDelayMs > MAX_HONORED_RETRY_DELAY_MS) {
      throw Object.assign(
        new Error(
          `Embedding provider daily quota exhausted — Gemini says retry in ~${Math.round(geminiDelayMs / 3600000)}h. ` +
            `Fix: change EMBEDDING_MODEL in .env to one with more free-tier headroom and restart the server, ` +
            `or wait for reset. Original error: ${errText}`
        ),
        { status: 429, providerStatus: 429 }
      )
    }

    if (RETRYABLE_STATUS.has(res.status) && attempt < maxRetries) {
      lastErr = err
      const delay = geminiDelayMs ?? baseDelayMs * 2 ** attempt + Math.random() * 250
      console.warn(`Embedding provider ${res.status} — retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${maxRetries})`)
      await sleep(delay)
      continue
    }

    throw err
  }

  throw lastErr
}

export async function embedBatch(texts) {
  // Sequential — throttle() inside embedText already enforces safe spacing
  // between calls, so no extra manual delay is needed here.
  const out = []
  for (const t of texts) {
    out.push(await embedText(t))
  }
  return out
}

export function cosineSimilarity(a, b) {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}
