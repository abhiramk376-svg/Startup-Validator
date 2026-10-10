import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    validation: { type: mongoose.Schema.Types.ObjectId, ref: 'Validation', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Report', reportSchema)
