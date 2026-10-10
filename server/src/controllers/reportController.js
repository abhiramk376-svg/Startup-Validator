import Validation from '../models/Validation.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// GET /api/reports?search=&industry=  — "My Reports" table data
export const listReports = asyncHandler(async (req, res) => {
  const { search = '', industry = '' } = req.query

  const filter = { user: req.user._id, status: 'complete' }
  if (industry) filter.industry = industry
  if (search) filter.title = { $regex: search, $options: 'i' }

  const validations = await Validation.find(filter).sort({ createdAt: -1 })

  res.json(
    validations.map((v) => ({
      id: v._id,
      title: v.title,
      industry: v.industry,
      score: v.scores?.overall ?? null,
      date: v.createdAt.toISOString().slice(0, 10),
    }))
  )
})
