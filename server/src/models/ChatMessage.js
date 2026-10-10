import mongoose from 'mongoose'

// The "ask anything about your startup" thread, scoped to one validation.
const chatMessageSchema = new mongoose.Schema(
  {
    validation: { type: mongoose.Schema.Types.ObjectId, ref: 'Validation', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model('ChatMessage', chatMessageSchema)
