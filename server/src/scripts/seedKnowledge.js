import 'dotenv/config'
import { connectDB } from '../config/db.js'
import { scrapeAndIngest } from '../services/scraperService.js'
import mongoose from 'mongoose'

// One-time (or re-runnable) script to bootstrap the shared knowledge base
// with a handful of real, free, public pages so the RAG pipeline has
// something to retrieve on day one, before a user or scraper adds more.
// Run with:  node src/scripts/seedKnowledge.js
//
// Add/replace URLs freely — Wikipedia company/industry pages, SEC EDGAR
// filings, and public market-research summary pages all work well here.
const SEED_SOURCES = [
  { url: 'https://en.wikipedia.org/wiki/Software_as_a_service', category: 'market' },
  { url: 'https://en.wikipedia.org/wiki/Subscription_business_model', category: 'market' },
  { url: 'https://en.wikipedia.org/wiki/Gig_economy', category: 'market' },
  { url: 'https://en.wikipedia.org/wiki/Startup_company', category: 'risk' },
  { url: 'https://en.wikipedia.org/wiki/Venture_capital', category: 'risk' },
  { url: 'https://en.wikipedia.org/wiki/Startup_studio', category: 'risk' },
  // competitor-category sources were missing entirely — competitorAnalysisNode
  // in langgraphPipeline.js retrieves { category: 'competitor' }, which would
  // return zero chunks on a fresh DB without these.
  { url: 'https://en.wikipedia.org/wiki/List_of_unicorn_startup_companies', category: 'competitor' },
  { url: 'https://en.wikipedia.org/wiki/Y_Combinator', category: 'competitor' },
  { url: 'https://en.wikipedia.org/wiki/Competitive_advantage', category: 'competitor' },
]

async function run() {
  await connectDB()
  console.log(`Seeding knowledge base from ${SEED_SOURCES.length} sources (userId: null = shared/global)...`)

  for (const { url, category } of SEED_SOURCES) {
    try {
      const result = await scrapeAndIngest({ url, category, userId: null })
      console.log(`  ✓ ${result.title} — ${result.chunkCount} chunks (${category})`)
    } catch (err) {
      console.warn(`  ✗ ${url}: ${err.message}`)
    }
  }

  console.log('Done. Add more anytime via POST /api/knowledge/url or /api/knowledge/text.')
  await mongoose.connection.close()
}

run().catch((err) => {
  console.error('Seed script failed:', err)
  process.exit(1)
})
