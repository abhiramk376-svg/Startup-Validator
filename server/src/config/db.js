import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  if (!env.MONGO_URI) {
    console.warn('⚠ MONGO_URI not set — skipping DB connection (server will still start, but data routes will fail).')
    return
  }
  try {
    await mongoose.connect(env.MONGO_URI)
    console.log('MongoDB connected')
    await recoverAbandonedValidations()
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

// runValidationPipeline() runs as an in-memory fire-and-forget background
// task. If the server restarts mid-run (a dev-mode `--watch` restart, a
// crash, a deploy), the Validation document is left stuck at
// 'pending'/'researching'/'simulating' forever: it never reaches 'failed',
// so POST /retry permanently 409s on it. On every boot, mark any such
// abandoned validation as 'failed' so it can be retried.
async function recoverAbandonedValidations() {
  const Validation = (await import('../models/Validation.js')).default
  const result = await Validation.updateMany(
    { status: { $in: ['pending', 'researching', 'simulating'] } },
    { $set: { status: 'failed', errorMessage: 'Interrupted by a server restart — please retry.' } }
  )
  if (result.modifiedCount > 0) {
    console.log(`Recovered ${result.modifiedCount} validation(s) stuck from a previous server run — now retryable.`)
  }
}
