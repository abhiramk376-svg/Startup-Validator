// Central place to read + validate environment variables.
// Import `env` anywhere instead of touching process.env directly.

const required = ['MONGO_URI', 'JWT_SECRET']

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai'
const aiBaseUrl = process.env.AI_PROVIDER_BASE_URL || GEMINI_BASE_URL
const usingGemini = aiBaseUrl.includes('generativelanguage.googleapis.com')

const list = (value) =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Defaults point at Google's Gemini API via its OpenAI-compatible layer —
  // free, no credit card, and runs entirely in the cloud (nobody needs to
  // install anything locally). Get a free key at
  // https://aistudio.google.com/apikey. This same client works unmodified
  // against OpenAI/Groq/Azure/a local Ollama server/etc if you swap providers.
  AI_PROVIDER_BASE_URL: aiBaseUrl,
  AI_PROVIDER_API_KEY: process.env.AI_PROVIDER_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gemini-3.6-flash',

  // Minimum gap between chat calls to the primary provider. 13s keeps Gemini's
  // free tier (5 requests/minute per model) from being tripped. A provider with
  // a higher limit (e.g. Groq, 30/min) can use a much smaller value like 3000.
  AI_MIN_INTERVAL_MS: Number(process.env.AI_MIN_INTERVAL_MS) || 13000,

  // Backup models on the SAME provider/key. Each Gemini model has its own free
  // daily quota, so when one is overloaded (503) or out of quota (429) the
  // client switches to the next instead of failing. Defaults only apply when
  // using Gemini; set AI_FALLBACK_MODELS= (empty) to disable.
  AI_FALLBACK_MODELS: list(
    process.env.AI_FALLBACK_MODELS ?? (usingGemini ? 'gemini-2.5-flash,gemini-3.5-flash-lite' : '')
  ),

  // Optional backup on a DIFFERENT provider, tried last (e.g. Groq's free tier,
  // which has far higher limits). All three must be set to enable it.
  AI_FALLBACK_BASE_URL: process.env.AI_FALLBACK_BASE_URL || '',
  AI_FALLBACK_API_KEY: process.env.AI_FALLBACK_API_KEY || '',
  AI_FALLBACK_MODEL: process.env.AI_FALLBACK_MODEL || '',
  AI_FALLBACK_MIN_INTERVAL_MS: Number(process.env.AI_FALLBACK_MIN_INTERVAL_MS) || 3000,

  // Free embeddings for RAG — same Gemini API, same free key, OpenAI-compatible
  // embeddings endpoint (separate model name, same base URL shape).
  // NOTE: if AI_PROVIDER_* points at a different provider (e.g. Groq), set
  // EMBEDDING_PROVIDER_API_KEY to your Gemini key — Groq has no embeddings.
  EMBEDDING_PROVIDER_BASE_URL: process.env.EMBEDDING_PROVIDER_BASE_URL || GEMINI_BASE_URL,
  EMBEDDING_PROVIDER_API_KEY: process.env.EMBEDDING_PROVIDER_API_KEY || '',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'gemini-embedding-001',
  // Embedding limits are far looser than chat limits, so a short gap is fine
  // (and keeps the seed script from taking an hour).
  EMBEDDING_MIN_INTERVAL_MS: Number(process.env.EMBEDDING_MIN_INTERVAL_MS) || 1000,

  CLIENT_ORIGIN: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(','),
}

export function assertEnv() {
  const missing = required.filter((key) => !process.env[key])
  if (missing.length) {
    console.warn(`⚠ Missing env vars: ${missing.join(', ')} — set these in your .env file.`)
  }
}

assertEnv()
