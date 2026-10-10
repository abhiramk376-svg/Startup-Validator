import mongoose from 'mongoose'

const keyFactorSchema = new mongoose.Schema(
  { label: String, variant: { type: String, enum: ['good', 'warn'], default: 'good' } },
  { _id: false }
)

const validationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ideaDescription: { type: String, required: true },
    title: { type: String, default: 'Untitled Model' },
    industry: { type: String, default: 'General' },
    status: {
      type: String,
      enum: ['pending', 'researching', 'simulating', 'complete', 'failed'],
      default: 'pending',
    },

    // The three-axis evaluation, plus a blended overall score
    scores: {
      sustainability: { type: Number, default: null },
      scalability: { type: Number, default: null },
      profitability: { type: Number, default: null },
      overall: { type: Number, default: null },
    },

    summary: {
      abstract: String, // the bottom-line verdict, plain language
      keyFactors: [keyFactorSchema],
      revenueStreams: String, // how the model makes money
      costStructure: String, // what it costs to run and where money goes
      marketScalability: String, // how far/fast this can realistically grow
      riskExposure: String, // concrete risks to sustainability/profitability
      profitabilityTimeline: String, // when this is likely to become profitable, and why
    },

    charts: {
      profitabilityTimelineValues: [Number], // trend line, 0-100 scale (SVG y-position style)
      profitabilityTimelineCaption: String, // e.g. "Break-even around Month 14"
      revenueStreams: [{ name: String, pct: Number }], // revenue mix
      costStructure: [{ name: String, pct: Number }], // cost breakdown
      riskOpportunityPoints: [{ label: String, x: Number, y: Number, risk: Boolean }],
      scoresDesc: String, // 1-2 sentences explaining the three scores together
    },

    // Live progress while the agent graph is still running, so the UI can show
    // each agent's analysis the moment it finishes instead of all at once.
    progress: {
      step: { type: String, enum: ['market', 'competitor', 'risk', 'report', null], default: null },
      marketAnalysis: String,
      competitorAnalysis: String,
      riskAnalysis: String,
    },

    errorMessage: String,
  },
  { timestamps: true }
)

export default mongoose.model('Validation', validationSchema)
