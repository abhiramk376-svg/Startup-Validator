import Validation from '../models/Validation.js'
import Evidence from '../models/Evidence.js'
import { runAgenticEvaluation } from './langgraphPipeline.js'

// Runs the full idea -> evaluation pipeline for one Validation document.
//
// This runs the real multi-agent LangGraph pipeline (see langgraphPipeline.js):
// marketResearch -> competitorResearch -> riskAssessment -> reportGenerator,
// with each of the first three nodes doing its own RAG retrieval
// (ragService.js) against the KnowledgeChunk vector store before reasoning.
//
// As each agent finishes, its analysis is written to the Validation document
// straight away (`progress.*`), and GET /:id/status returns it — so the
// results page can fill in step by step instead of waiting for the full run.
export async function runValidationPipeline(validationId) {
  const validation = await Validation.findById(validationId)
  if (!validation) return

  try {
    validation.status = 'researching'
    validation.progress = { step: null }
    await validation.save()

    // Saves partial results as they arrive. Uses a targeted $set so it never
    // clobbers fields the final save writes. Never throws: losing a progress
    // update must not fail the evaluation.
    const onProgress = async (patch) => {
      const set = {}
      for (const [key, value] of Object.entries(patch)) set[`progress.${key}`] = value
      // Once the report agent starts, the three analyses are done — flip the
      // status so the UI can say "scoring".
      if (patch.step === 'report') set.status = 'simulating'
      try {
        await Validation.updateOne({ _id: validationId }, { $set: set })
      } catch (err) {
        console.warn(`Could not save progress for ${validationId}:`, err.message)
      }
    }

    const result = await runAgenticEvaluation(validation.ideaDescription, { onProgress })

    // Re-fetch: progress was written via updateOne, so the in-memory doc is stale.
    const fresh = await Validation.findById(validationId)
    fresh.title = result.title
    fresh.industry = result.industry
    fresh.scores = result.scores
    fresh.summary = result.summary
    fresh.charts = result.charts
    fresh.status = 'complete'
    await fresh.save()

    if (Array.isArray(result.evidence) && result.evidence.length) {
      // Match each evidence claim's declared source name back to a real
      // retrieved chunk (if there is one) so we can persist a real sourceUrl
      // instead of just a display string — keeps citations honest.
      const retrieved = result._agentTrace?.retrievedChunks || []
      await Evidence.insertMany(
        result.evidence.map((e) => {
          const matched = retrieved.find((c) => c.source === e.source)
          return {
            validation: fresh._id,
            claim: e.claim,
            source: e.source,
            sourceUrl: matched?.sourceUrl,
            agentStep: e.agentStep || 'general',
          }
        })
      )
    }
  } catch (err) {
    await Validation.updateOne(
      { _id: validationId },
      { $set: { status: 'failed', errorMessage: err.message } }
    )
    throw err
  }
}
