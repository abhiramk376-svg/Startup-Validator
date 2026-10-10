import 'dotenv/config'
import app from './src/app.js'
import { connectDB } from './src/config/db.js'
import { env } from './src/config/env.js'

async function start() {
  await connectDB()
  app.listen(env.PORT, () => {
    console.log(`Autonomous Model Evaluator API running on http://localhost:${env.PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
