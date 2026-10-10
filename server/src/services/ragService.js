import KnowledgeChunk from '../models/KnowledgeChunk.js'
import { embedText, cosineSimilarity } from './embeddingClient.js'

// --- Chunking -----------------------------------------------------------
// Simple, dependency-free sliding-window chunker: good enough for
// paragraphs of scraped/pasted text. ~800 chars with overlap keeps chunks
// small enough for accurate retrieval without losing context at the edges.
export function chunkText(text, { size = 800, overlap = 120 } = {}) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const chunks = []
  let start = 0
  while (start < clean.length) {
    const end = Math.min(start + size, clean.length)
    chunks.push(clean.slice(start, end))
    if (end === clean.length) break
    start = end - overlap
  }
  return chunks
}

// --- Ingestion ------------------------------------------------------------
// Embeds + stores one document's worth of text as retrievable chunks.
// Call this from the knowledge routes (paste-in text) or scraperService.js
// (fetched URLs).
export async function ingestText({ text, source, sourceUrl, category = 'general', userId = null }) {
  const chunks = chunkText(text)
  const docs = []
  for (const chunk of chunks) {
    const embedding = await embedText(chunk)
    docs.push({ text: chunk, source, sourceUrl, category, embedding, user: userId })
  }
  if (docs.length) await KnowledgeChunk.insertMany(docs)
  return docs.length
}

// --- Retrieval --------------------------------------------------------
// Embeds the query, pulls candidate chunks (global knowledge base + this
// user's own uploads, optionally filtered by category), scores by cosine
// similarity, returns the top k. No Atlas Search index needed — fine for
// knowledge-base sizes typical of an MVP/portfolio project (thousands of
// chunks). If the corpus grows large, swap this for an Atlas Vector Search
// $vectorSearch aggregation stage without changing the calling code.
export async function retrieveRelevant(query, { category, userId = null, k = 5 } = {}) {
  const queryEmbedding = await embedText(query)

  const filter = category ? { category } : {}
  if (userId) filter.$or = [{ user: null }, { user: userId }]

  const candidates = await KnowledgeChunk.find(filter).limit(2000).lean()
  if (!candidates.length) return []

  const scored = candidates
    .map((c) => ({ ...c, score: cosineSimilarity(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)

  return scored.map((c) => ({
    text: c.text,
    source: c.source,
    sourceUrl: c.sourceUrl,
    category: c.category,
    score: c.score,
  }))
}

export function formatContext(chunks) {
  if (!chunks.length) return '(no matching source material found in the knowledge base yet)'
  return chunks
    .map((c, i) => `[${i + 1}] (${c.source}${c.sourceUrl ? ` — ${c.sourceUrl}` : ''})\n${c.text}`)
    .join('\n\n')
}
