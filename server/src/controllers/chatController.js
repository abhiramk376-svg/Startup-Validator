import Validation from '../models/Validation.js'
import Evidence from '../models/Evidence.js'
import ChatMessage from '../models/ChatMessage.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { answerStartupQuestion } from '../services/aiClient.js'
import { retrieveRelevant, formatContext } from '../services/ragService.js'

// GET /api/validations/:id/chat — full thread so far
export const getChatHistory = asyncHandler(async (req, res) => {
  const validation = await Validation.findOne({ _id: req.params.id, user: req.user._id })
  if (!validation) return res.status(404).json({ message: 'Validation not found.' })

  const messages = await ChatMessage.find({ validation: validation._id }).sort({ createdAt: 1 })
  res.json(messages.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })))
})

// POST /api/validations/:id/chat  { question }
// The customer can ask literally anything about their startup here —
// "why is the funding number that low", "what's my biggest risk in the EU",
// "who else is building this" — and gets an answer grounded in that
// validation's own summary + evidence, with the running conversation as context.
export const askQuestion = asyncHandler(async (req, res) => {
  const { question } = req.body
  if (!question || !question.trim()) {
    return res.status(400).json({ message: 'question is required.' })
  }

  const validation = await Validation.findOne({ _id: req.params.id, user: req.user._id })
  if (!validation) return res.status(404).json({ message: 'Validation not found.' })
  if (validation.status !== 'complete') {
    return res.status(409).json({ message: 'This report is still generating — try again once it completes.' })
  }

  const [evidence, priorMessages] = await Promise.all([
    Evidence.find({ validation: validation._id }),
    ChatMessage.find({ validation: validation._id }).sort({ createdAt: 1 }).limit(20),
  ])

  await ChatMessage.create({ validation: validation._id, user: req.user._id, role: 'user', content: question })

  // Live RAG lookup scoped to what the founder just asked — not just the
  // chunks retrieved back when the original report was generated. E.g. "who
  // else is building this in Europe" retrieves fresh competitor-category
  // chunks matching that question specifically.
  const freshChunks = await retrieveRelevant(question, { userId: req.user._id, k: 5 })

  const answer = await answerStartupQuestion({
    ideaDescription: validation.ideaDescription,
    summary: validation.summary,
    evidence: evidence.map((e) => ({ claim: e.claim, source: e.source })),
    chatHistory: priorMessages.map((m) => ({ role: m.role, content: m.content })),
    question,
    retrievedContext: formatContext(freshChunks),
  })

  const saved = await ChatMessage.create({
    validation: validation._id,
    user: req.user._id,
    role: 'assistant',
    content: answer,
  })

  res.status(201).json({ role: 'assistant', content: saved.content, createdAt: saved.createdAt })
})
