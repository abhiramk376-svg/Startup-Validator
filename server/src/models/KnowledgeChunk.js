import mongoose from 'mongoose'

// One retrievable chunk of real-world source text (scraped or pasted in),
// plus its embedding vector, used by ragService.js for retrieval.
// No Atlas Vector Search index required — similarity is computed in plain
// JS (cosine similarity) so this works against ANY MongoDB (local, free
// Atlas tier, wherever) with zero extra paid setup.
const knowledgeChunkSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    source: { type: String, required: true }, // display name, e.g. "SEC EDGAR filing — DoorDash 10-K 2025"
    sourceUrl: String,
    category: {
      type: String,
      enum: ['market', 'competitor', 'risk', 'general'],
      default: 'general',
      index: true,
    },
    embedding: { type: [Number], required: true },
    // Optional: scope a chunk to one user's own uploaded research instead of
    // the shared/global knowledge base.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

export default mongoose.model('KnowledgeChunk', knowledgeChunkSchema)
