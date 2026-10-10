import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'fullName, email, and password are all required.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' })
  }

  const passwordHash = await User.hashPassword(password)
  const user = await User.create({ fullName, email, passwordHash })

  const token = generateToken(user._id)
  res.status(201).json({ user, token })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  const valid = await user.comparePassword(password)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  const token = generateToken(user._id)
  res.json({ user, token })
})

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user })
})
