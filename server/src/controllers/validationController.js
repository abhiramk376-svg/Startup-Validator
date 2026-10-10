import Validation from '../models/Validation.js'
import Evidence from '../models/Evidence.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { runValidationPipeline } from '../services/validationPipeline.js'

export const createValidation = asyncHandler(async (req, res) => {
  const { ideaDescription } = req.body
  if (!ideaDescription || !ideaDescription.trim()) {
    return res.status(400).json({ message: 'ideaDescription is required.' })
  }

  const validation = await Validation.create({
    user: req.user._id,
    ideaDescription,
    status: 'pending',
  })

  // Fire the pipeline without blocking the response — the client polls
  // /status (or you can upgrade this to SSE/WebSockets later for live steps).
  runValidationPipeline(validation._id).catch((err) =>
    console.error(`Validation pipeline failed for ${validation._id}:`, err.message)
  )

  res.status(202).json({ validationId: validation._id, status: validation.status })
})

export const retryValidation = asyncHandler(async (req, res) => {
  const validation = await Validation.findOne({ _id: req.params.id, user: req.user._id })
  if (!validation) return res.status(404).json({ message: 'Validation not found.' })

  if (validation.status !== 'failed') {
    return res.status(409).json({ message: 'Only a failed evaluation can be retried.' })
  }

  validation.status = 'pending'
  validation.errorMessage = undefined
  validation.progress = { step: null }
  await validation.save()

  runValidationPipeline(validation._id).catch((err) =>
    console.error(`Validation pipeline retry failed for ${validation._id}:`, err.message)
  )

  res.status(202).json({ validationId: validation._id, status: validation.status })
})

export const getValidationStatus = asyncHandler(async (req, res) => {
  const validation = await Validation.findOne({ _id: req.params.id, user: req.user._id }).select(
    'status errorMessage progress'
  )
  if (!validation) return res.status(404).json({ message: 'Validation not found.' })
  // progress = { step, marketAnalysis, competitorAnalysis, riskAnalysis } — fills
  // in as each agent finishes, so the client can show results step by step.
  res.json({
    status: validation.status,
    errorMessage: validation.errorMessage,
    progress: validation.progress || {},
  })
})

export const getValidation = asyncHandler(async (req, res) => {
  const validation = await Validation.findOne({ _id: req.params.id, user: req.user._id })
  if (!validation) return res.status(404).json({ message: 'Validation not found.' })
  res.json({
    id: validation._id,
    title: validation.title,
    industry: validation.industry,
    scores: validation.scores,
    status: validation.status,
    summary: validation.summary,
    ideaDescription: validation.ideaDescription,
  })
})

export const getValidationEvidence = asyncHandler(async (req, res) => {
  const validation = await Validation.findOne({ _id: req.params.id, user: req.user._id })
  if (!validation) return res.status(404).json({ message: 'Validation not found.' })

  const evidence = await Evidence.find({ validation: validation._id }).sort({ createdAt: 1 })
  res.json(evidence.map((e) => ({ claim: e.claim, source: e.source, agentStep: e.agentStep })))
})

export const getValidationCharts = asyncHandler(async (req, res) => {
  const validation = await Validation.findOne({ _id: req.params.id, user: req.user._id })
  if (!validation) return res.status(404).json({ message: 'Validation not found.' })
  res.json(validation.charts || {})
})