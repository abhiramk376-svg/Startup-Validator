import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'

import authRoutes from './routes/authRoutes.js'
import validationRoutes from './routes/validationRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import knowledgeRoutes from './routes/knowledgeRoutes.js'

const app = express()

app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/validations', validationRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/knowledge', knowledgeRoutes)

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }))
app.use(errorHandler)

export default app
