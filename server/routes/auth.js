import express from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { JWT_SECRET } from '../middleware/auth.js'

const router = express.Router()

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Check if this is the first user (make them owner)
    const userCount = await User.countDocuments()
    const role = userCount === 0 ? 'owner' : 'user'

    // Create user
    const newUser = await User.create({
      email,
      password,
      role
    })

    // Generate token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check if suspended or banned
    if (user.suspended) {
      return res.status(403).json({ message: 'Account suspended' })
    }
    if (user.banned) {
      return res.status(403).json({ message: 'Account banned' })
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Verify access code
router.post('/verify-code', (req, res) => {
  const { code } = req.body
  
  if (code === 'sachad26') {
    res.json({ valid: true, message: 'Access granted' })
  } else {
    res.status(400).json({ valid: false, message: 'Invalid access code' })
  }
})

export default router
