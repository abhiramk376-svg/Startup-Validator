import { StateGraph, Annotation, START, END } from '@langchain/langgraph'
import { chatCompletion } from './aiClient.js'
import { retrieveRelevant, formatContext } from './ragService.js'

// ---------------------------------------------------------------------------
// Real multi-agent LangGraph pipeline. Each node is its own agent step: it
// retrieves its own slice of the knowledge base (RAG) and reasons over just
// that context, then hands its output forward through shared graph state.
//
//   START -> marketResearch -> competitorResearch -> riskAssessment
//         -> reportGenerator -> END
//
// Node names are distinct from the state field names they write to
// (e.g. the competitorResearch node writes the "competitorAnalysis" state
// field) — LangGraph.js does not allow a node name to collide with a state
// channel/annotation key.
// ---------------------------------------------------------------------------

const StateAnnotation = Annotation.Root({
  ideaDescription: Annotation(),
  marketContext: Annotation({ default: () => [] }),
  marketAnalysis: Annotation({ default: () => '' }),
  competitorContext: Annotation({ default: () => [] }),
  competitorAnalysis: Annotation({ default: () => '' }),
  riskContext: Annotation({ default: () => [] }),
  riskAnalysis: Annotation({ default: () => '' }),
  result: Annotation({ default: () => null }),
})

// Smaller/backup models sometimes wrap JSON in ```fences```, add chatter around
// it, or leave a trailing comma. Clean the obvious cases before parsing.
function parseModelJSON(raw) {
  let text = String(raw).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end > start) text = text.slice(start, end + 1)
  try {
    return JSON.parse(text)
  } catch {
    return JSON.parse(text.replace(/,\s*([}\]])/g, '$1'))
  }
}

async function askJSON(system, user) {
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
  let lastErr
  // If the model returns malformed JSON, ask again (usually fixes itself).
  for (let attempt = 1; attempt <= 3; attempt++) {
    const raw = await chatCompletion(messages, { jsonMode: true, maxRetries: 6, baseDelayMs: 3000 })
    try {
      return parseModelJSON(raw)
    } catch (err) {
      lastErr = err
      console.warn(`AI returned malformed JSON (${err.message}) — asking again (attempt ${attempt}/3)`)
    }
  }
  throw new Error(`The AI model kept returning invalid JSON: ${lastErr.message}`)
}

// Lets the caller watch the graph work. Each node announces which step it is
// starting ({ step }) and hands over its finished analysis the moment it has
// it ({ marketAnalysis } etc), so the UI can show results step by step
// instead of waiting for all four agents. A failure while reporting progress
// must never break the evaluation itself, hence the try/catch.
async function emit(config, patch) {
  try {
    await config?.configurable?.onProgress?.(patch)
  } catch (err) {
    console.warn('progress callback failed:', err.message)
  }
}

// --- Node 1: market research agent ---------------------------------------
async function marketResearchNode(state, config) {
  await emit(config, { step: 'market' })
  const chunks = await retrieveRelevant(state.ideaDescription, { category: 'market', k: 5 })
  const context = formatContext(chunks)

  const system = `You are the Market Research agent in a multi-agent startup evaluation pipeline.
Given a business idea and retrieved source material, write a grounded market analysis. Only use the
retrieved source material for factual claims — if it doesn't cover something, say the knowledge base
doesn't have data on that point rather than inventing a statistic. Return STRICT JSON:
{"marketAnalysis": "4-6 plain-English sentences on the market size, growth trend, and target customer
for this idea, citing which source number [1]/[2]/etc backs each factual claim where the context supports it"}`

  const user = `IDEA:\n${state.ideaDescription}\n\nRETRIEVED MARKET SOURCES:\n${context}`
  const { marketAnalysis } = await askJSON(system, user)
  await emit(config, { marketAnalysis })
  return { marketContext: chunks, marketAnalysis }
}

// --- Node 2: competitor analysis agent -----------------------------------
async function competitorAnalysisNode(state, config) {
  await emit(config, { step: 'competitor' })
  const chunks = await retrieveRelevant(state.ideaDescription, { category: 'competitor', k: 5 })
  const context = formatContext(chunks)

  const system = `You are the Competitor Analysis agent in a multi-agent startup evaluation pipeline.
You receive the market analysis already produced by the previous agent, plus retrieved competitor
source material. Only use the retrieved material for factual claims about named competitors. Return
STRICT JSON:
{"competitorAnalysis": "4-6 plain-English sentences on who else is building this or something adjacent,
how this idea differentiates (or doesn't), citing source numbers where the context supports it"}`

  const user = `IDEA:\n${state.ideaDescription}\n\nMARKET ANALYSIS FROM PRIOR AGENT:\n${state.marketAnalysis}\n\nRETRIEVED COMPETITOR SOURCES:\n${context}`
  const { competitorAnalysis } = await askJSON(system, user)
  await emit(config, { competitorAnalysis })
  return { competitorContext: chunks, competitorAnalysis }
}

// --- Node 3: risk assessment agent ----------------------------------------
async function riskAssessmentNode(state, config) {
  await emit(config, { step: 'risk' })
  const chunks = await retrieveRelevant(state.ideaDescription, { category: 'risk', k: 5 })
  const context = formatContext(chunks)

  const system = `You are the Risk Assessment agent in a multi-agent startup evaluation pipeline.
You receive the market and competitor analyses already produced, plus retrieved risk-relevant source
material (regulatory, financial, operational). Return STRICT JSON:
{"riskAnalysis": "4-6 plain-English sentences on the single biggest concrete risk to sustainability or
profitability for THIS idea, citing source numbers where the context supports it"}`

  const user = `IDEA:\n${state.ideaDescription}\n\nMARKET ANALYSIS:\n${state.marketAnalysis}\n\nCOMPETITOR ANALYSIS:\n${state.competitorAnalysis}\n\nRETRIEVED RISK SOURCES:\n${context}`
  const { riskAnalysis } = await askJSON(system, user)
  await emit(config, { riskAnalysis })
  return { riskContext: chunks, riskAnalysis }
}

// --- Node 4: report generator agent ---------------------------------------
// Synthesizes all three prior agents' grounded analyses into the exact JSON
// shape the rest of the app (Validation model, Results page, charts) expects.
async function reportGeneratorNode(state, config) {
  await emit(config, { step: 'report' })
  const allEvidence = [...state.marketContext, ...state.competitorContext, ...state.riskContext]
  const evidenceList = allEvidence
    .map((c, i) => `${i + 1}. [${c.category}] ${c.text.slice(0, 200)}... (source: ${c.source}${c.sourceUrl ? `, ${c.sourceUrl}` : ''})`)
    .join('\n')

  const system = `You are the Report Generator agent — the final step in a multi-agent startup evaluation
pipeline. You receive grounded analyses already produced by the Market Research, Competitor Analysis,
and Risk Assessment agents, plus the exact retrieved source chunks they used. Synthesize these into a
final structured evaluation. Score sustainability, scalability, and profitability based on the reasoning
already produced by the other agents — do not contradict them. Every sentence must reference concrete
details from THIS idea. Return STRICT JSON matching this exact shape (no extra keys, no markdown, no
prose outside the JSON):

{
  "title": "a clear, specific 3-6 word name for this exact business model",
  "industry": "one or two word category, e.g. 'Food & Beverage', 'Fintech', 'HealthTech'",
  "scores": {
    "sustainability": integer 0-100,
    "scalability": integer 0-100,
    "profitability": integer 0-100,
    "overall": integer 0-100
  },
  "summary": {
    "abstract": "4-6 full sentences: the honest bottom-line verdict, synthesizing all three agents' analyses",
    "keyFactors": [{"label": "short 2-4 word phrase specific to this idea", "variant": "good" | "warn"}, ... 4-5 items],
    "revenueStreams": "4-6 sentences on exactly how this model makes money",
    "costStructure": "4-6 sentences on what it costs to run and the biggest margin threat",
    "marketScalability": "4-6 sentences grounded in the Market Research agent's analysis above",
    "riskExposure": "4-6 sentences grounded in the Risk Assessment agent's analysis above",
    "profitabilityTimeline": "3-5 sentences on when this breaks even and why"
  },
  "evidence": [
    {"claim": "one specific factual statement grounded in a retrieved source below (or general reasoning if the knowledge base had no coverage)", "source": "the exact source name from the list below, or 'agent reasoning' if none applied", "agentStep": "sustainability" | "scalability" | "profitability" | "general"}
    ... 6-8 items, prefer real retrieved sources over invented ones
  ],
  "charts": {
    "profitabilityTimelineValues": [6 integers 0-100, lower = stronger position, trending per profitabilityTimeline],
    "profitabilityTimelineCaption": "short label matching profitabilityTimeline",
    "revenueStreams": [{"name": "...", "pct": 0-100}, ... 2-4 items summing to ~100],
    "costStructure": [{"name": "...", "pct": 0-100}, ... 2-4 items summing to ~100],
    "riskOpportunityPoints": [{"label": "short phrase", "x": 0-390, "y": 0-190, "risk": true|false}, ... 3-4 items],
    "scoresDesc": "1-2 sentences on how the three scores relate for this model"
  }
}`

  const user = `IDEA:\n${state.ideaDescription}

MARKET RESEARCH AGENT OUTPUT:
${state.marketAnalysis}

COMPETITOR ANALYSIS AGENT OUTPUT:
${state.competitorAnalysis}

RISK ASSESSMENT AGENT OUTPUT:
${state.riskAnalysis}

RETRIEVED SOURCE CHUNKS (use these for the "evidence" array where relevant):
${evidenceList || '(knowledge base is empty — reason from general knowledge and say so in evidence sources)'}`

  const result = await askJSON(system, user)
  return { result }
}

let compiledGraph = null

function buildGraph() {
  const graph = new StateGraph(StateAnnotation)
    .addNode('marketResearch', marketResearchNode)
    .addNode('competitorResearch', competitorAnalysisNode)
    .addNode('riskAssessment', riskAssessmentNode)
    .addNode('reportGenerator', reportGeneratorNode)
    .addEdge(START, 'marketResearch')
    .addEdge('marketResearch', 'competitorResearch')
    .addEdge('competitorResearch', 'riskAssessment')
    .addEdge('riskAssessment', 'reportGenerator')
    .addEdge('reportGenerator', END)

  return graph.compile()
}

// Runs the full agentic graph for one idea and returns the same JSON shape
// validationPipeline.js expects, plus the raw per-agent context so the caller
// can also persist real evidence.
// onProgress (optional) is called with partial results as each agent finishes.
export async function runAgenticEvaluation(ideaDescription, { onProgress } = {}) {
  if (!compiledGraph) compiledGraph = buildGraph()

  const finalState = await compiledGraph.invoke({ ideaDescription }, { configurable: { onProgress } })
  return {
    ...finalState.result,
    _agentTrace: {
      marketAnalysis: finalState.marketAnalysis,
      competitorAnalysis: finalState.competitorAnalysis,
      riskAnalysis: finalState.riskAnalysis,
      retrievedChunks: [...finalState.marketContext, ...finalState.competitorContext, ...finalState.riskContext],
    },
  }
}