import { Router } from 'express'
import { ingestKnowledgeText, ingestKnowledgeUrl, listKnowledge } from '../controllers/knowledgeController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()
router.use(requireAuth)

router.get('/', listKnowledge)
router.post('/text', ingestKnowledgeText)
router.post('/url', ingestKnowledgeUrl)

export default router
