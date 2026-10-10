import { Router } from 'express'
import { listReports } from '../controllers/reportController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()
router.use(requireAuth)

router.get('/', listReports)

export default router
