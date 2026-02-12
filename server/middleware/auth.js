import jwt from 'jsonwebtoken'
import { getUsers } from '../utils/dataStore.js'

const JWT_SECRET = process.env.JWT_SECRET || 'sach-wave-secret-key-2026'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const users = getUsers()
    const user = users.find(u => u.id === decoded.userId)
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export const requireOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Owner access required' })
  }
  next()
}

export { JWT_SECRET }
