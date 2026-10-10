import { Router } from 'express'
import {
  createValidation,
  getValidationStatus,
  getValidation,
  getValidationEvidence,
  getValidationCharts,
  retryValidation,
} from '../controllers/validationController.js'
import { getChatHistory, askQuestion } from '../controllers/chatController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()
router.use(requireAuth) // every validation route requires a signed-in user

router.post('/', createValidation)
router.post('/:id/retry', retryValidation)
router.get('/:id/status', getValidationStatus)
router.get('/:id', getValidation)
router.get('/:id/evidence', getValidationEvidence)
router.get('/:id/charts', getValidationCharts)

// "Ask anything about your startup" — scoped to one validation's report
router.get('/:id/chat', getChatHistory)
router.post('/:id/chat', askQuestion)

export default router