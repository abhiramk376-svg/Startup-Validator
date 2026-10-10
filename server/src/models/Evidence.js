import mongoose from 'mongoose'

const evidenceSchema = new mongoose.Schema(
  {
    validation: { type: mongoose.Schema.Types.ObjectId, ref: 'Validation', required: true, index: true },
    claim: { type: String, required: true },
    source: { type: String, required: true }, // display string, e.g. "Statista, 2026"
    sourceUrl: String,
    agentStep: { type: String, enum: ['sustainability', 'scalability', 'profitability', 'general'], default: 'general' },
  },
  { timestamps: true }
)

export default mongoose.model('Evidence', evidenceSchema)
