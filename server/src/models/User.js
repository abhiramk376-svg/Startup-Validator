import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
)

// Never send passwordHash to the client
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.passwordHash
  return obj
}

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash)
}

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10)
}

export default mongoose.model('User', userSchema)
