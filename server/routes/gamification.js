import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getUserPoints, saveUserPoints, getProfiles } from '../utils/dataStore.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Level thresholds
const LEVELS = [
  { name: 'Newbie', minPoints: 0, badge: '🌱' },
  { name: 'Active', minPoints: 100, badge: '🌿' },
  { name: 'Popular', minPoints: 500, badge: '🌳' },
  { name: 'Star Student', minPoints: 1000, badge: '⭐' }
]

// Points configuration
const POINTS = {
  CREATE_POST: 10,
  CREATE_STORY: 5,
  RECEIVE_LIKE: 2,
  RECEIVE_COMMENT: 5,
  NEW_FOLLOWER: 10,
  DAILY_LOGIN: 5
}

// Get current user's points and level
router.get('/points', authenticate, (req, res) => {
  try {
    const userPoints = getUserPoints()
    let userPointData = userPoints.find(up => up.userId === req.user.id)

    if (!userPointData) {
      // Initialize new user points
      userPointData = {
        id: uuidv4(),
        userId: req.user.id,
        points: 0,
        level: 'Newbie',
        badges: ['newbie'],
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      userPoints.push(userPointData)
      saveUserPoints(userPoints)
    }

    const currentLevel = getLevel(userPointData.points)
    const nextLevel = LEVELS.find(l => l.minPoints > userPointData.points)
    const progress = nextLevel 
      ? ((userPointData.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
      : 100

    res.json({
      points: userPointData.points,
      level: currentLevel.name,
      badge: currentLevel.badge,
      progress: Math.round(progress),
      nextLevel: nextLevel?.name || null,
      pointsToNextLevel: nextLevel ? nextLevel.minPoints - userPointData.points : 0,
      badges: userPointData.badges
    })
  } catch (error) {
    console.error('Get points error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get leaderboard
router.get('/leaderboard', authenticate, (req, res) => {
  try {
    const userPoints = getUserPoints()
    const profiles = getProfiles()

    const leaderboard = userPoints
      .sort((a, b) => b.points - a.points)
      .slice(0, 20)
      .map((up, index) => {
        const profile = profiles.find(p => p.userId === up.userId)
        const level = getLevel(up.points)
        return {
          rank: index + 1,
          userId: up.userId,
          name: profile?.name || 'Unknown',
          profileImage: profile?.profileImage,
          points: up.points,
          level: level.name,
          badge: level.badge
        }
      })

    res.json({ leaderboard })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Award points (internal use)
router.post('/award', authenticate, (req, res) => {
  try {
    const { points, reason } = req.body
    const userId = req.user.id

    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Invalid points value' })
    }

    const userPoints = getUserPoints()
    let userPointData = userPoints.find(up => up.userId === userId)

    if (!userPointData) {
      userPointData = {
        id: uuidv4(),
        userId,
        points: 0,
        level: 'Newbie',
        badges: ['newbie'],
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      userPoints.push(userPointData)
    }

    // Add points
    userPointData.points += points
    userPointData.updatedAt = new Date().toISOString()

    // Add to history
    userPointData.history.push({
      id: uuidv4(),
      points,
      reason,
      timestamp: new Date().toISOString()
    })

    // Check for level up
    const newLevel = getLevel(userPointData.points)
    const oldLevel = userPointData.level
    
    if (newLevel.name !== oldLevel) {
      userPointData.level = newLevel.name
      if (!userPointData.badges.includes(newLevel.name.toLowerCase().replace(' ', '_'))) {
        userPointData.badges.push(newLevel.name.toLowerCase().replace(' ', '_'))
      }
    }

    saveUserPoints(userPoints)

    res.json({
      message: 'Points awarded',
      points: userPointData.points,
      level: userPointData.level,
      leveledUp: newLevel.name !== oldLevel
    })
  } catch (error) {
    console.error('Award points error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get points history
router.get('/history', authenticate, (req, res) => {
  try {
    const userPoints = getUserPoints()
    const userPointData = userPoints.find(up => up.userId === req.user.id)

    if (!userPointData) {
      return res.json({ history: [] })
    }

    res.json({ history: userPointData.history.slice(-50).reverse() })
  } catch (error) {
    console.error('Get history error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Helper function to get level based on points
function getLevel(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

export { POINTS, getLevel }
export default router
