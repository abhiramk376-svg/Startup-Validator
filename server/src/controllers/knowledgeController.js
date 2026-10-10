import { asyncHandler } from '../middleware/errorHandler.js'
import { ingestText } from '../services/ragService.js'
import { scrapeAndIngest } from '../services/scraperService.js'
import KnowledgeChunk from '../models/KnowledgeChunk.js'

// POST /api/knowledge/text  { text, source, category }
// Paste in a market report, competitor page, filing excerpt, etc. Free —
// just chunks + embeds locally via Ollama and stores in Mongo.
export const ingestKnowledgeText = asyncHandler(async (req, res) => {
  const { text, source, category } = req.body
  if (!text || !text.trim()) return res.status(400).json({ message: 'text is required.' })
  if (!source || !source.trim()) return res.status(400).json({ message: 'source is required.' })

  const chunkCount = await ingestText({
    text,
    source,
    category: category || 'general',
    userId: req.user._id,
  })

  res.status(201).json({ chunkCount })
})

// POST /api/knowledge/url  { url, category }
// Scrapes a public page (Wikipedia, SEC EDGAR, a news article, a G2/Product
// Hunt listing) and ingests it the same way.
export const ingestKnowledgeUrl = asyncHandler(async (req, res) => {
  const { url, category } = req.body
  if (!url || !url.trim()) return res.status(400).json({ message: 'url is required.' })

  const result = await scrapeAndIngest({ url, category: category || 'general', userId: req.user._id })
  res.status(201).json(result)
})

// GET /api/knowledge — list what's in the knowledge base so far
export const listKnowledge = asyncHandler(async (req, res) => {
  const chunks = await KnowledgeChunk.find({ $or: [{ user: null }, { user: req.user._id }] })
    .select('source sourceUrl category createdAt')
    .sort({ createdAt: -1 })
    .limit(200)
  res.json(chunks)
})
