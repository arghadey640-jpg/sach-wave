import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getReactions, saveReactions } from '../utils/dataStore.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Valid reaction types
const VALID_REACTIONS = ['like', 'funny', 'wow', 'support']

// Add or update reaction
router.post('/:postId', authenticate, (req, res) => {
  try {
    const { type } = req.body
    const postId = req.params.postId
    const userId = req.user.id

    if (!VALID_REACTIONS.includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' })
    }

    const reactions = getReactions()
    
    // Check if user already reacted
    const existingIndex = reactions.findIndex(
      r => r.postId === postId && r.userId === userId
    )

    if (existingIndex >= 0) {
      // Update existing reaction
      reactions[existingIndex].type = type
      reactions[existingIndex].updatedAt = new Date().toISOString()
    } else {
      // Create new reaction
      reactions.push({
        id: uuidv4(),
        postId,
        userId,
        type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    saveReactions(reactions)

    // Get updated counts
    const counts = getReactionCounts(postId)

    res.json({ message: 'Reaction added', type, counts })
  } catch (error) {
    console.error('Add reaction error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Remove reaction
router.delete('/:postId', authenticate, (req, res) => {
  try {
    const postId = req.params.postId
    const userId = req.user.id

    const reactions = getReactions()
    const updatedReactions = reactions.filter(
      r => !(r.postId === postId && r.userId === userId)
    )

    saveReactions(updatedReactions)

    // Get updated counts
    const counts = getReactionCounts(postId)

    res.json({ message: 'Reaction removed', counts })
  } catch (error) {
    console.error('Remove reaction error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get reaction counts for a post
router.get('/:postId', authenticate, (req, res) => {
  try {
    const counts = getReactionCounts(req.params.postId)
    const userReaction = getUserReaction(req.params.postId, req.user.id)

    res.json({ counts, userReaction })
  } catch (error) {
    console.error('Get reactions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get reactions by current user
router.get('/user/my-reactions', authenticate, (req, res) => {
  try {
    const reactions = getReactions()
    const userReactions = reactions
      .filter(r => r.userId === req.user.id)
      .map(r => ({
        postId: r.postId,
        type: r.type
      }))

    res.json({ reactions: userReactions })
  } catch (error) {
    console.error('Get user reactions error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Helper function to get reaction counts
function getReactionCounts(postId) {
  const reactions = getReactions()
  const postReactions = reactions.filter(r => r.postId === postId)

  const counts = {
    like: 0,
    funny: 0,
    wow: 0,
    support: 0,
    total: postReactions.length
  }

  postReactions.forEach(r => {
    if (counts[r.type] !== undefined) {
      counts[r.type]++
    }
  })

  // Determine dominant reaction
  let dominant = 'like'
  let maxCount = counts.like
  
  for (const [type, count] of Object.entries(counts)) {
    if (type !== 'total' && count > maxCount) {
      maxCount = count
      dominant = type
    }
  }

  counts.dominant = maxCount > 0 ? dominant : null

  return counts
}

// Helper function to get user's reaction
function getUserReaction(postId, userId) {
  const reactions = getReactions()
  const reaction = reactions.find(r => r.postId === postId && r.userId === userId)
  return reaction ? reaction.type : null
}

export default router
