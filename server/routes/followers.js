import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getFollowers, saveFollowers, getProfiles, getUsers } from '../utils/dataStore.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Follow a user
router.post('/follow/:userId', authenticate, (req, res) => {
  try {
    const targetUserId = req.params.userId
    const followerId = req.user.id

    if (targetUserId === followerId) {
      return res.status(400).json({ message: 'Cannot follow yourself' })
    }

    const followers = getFollowers()
    
    // Check if already following
    const existing = followers.find(f => f.followerId === followerId && f.followingId === targetUserId)
    if (existing) {
      return res.status(400).json({ message: 'Already following this user' })
    }

    const newFollow = {
      id: uuidv4(),
      followerId,
      followingId: targetUserId,
      createdAt: new Date().toISOString()
    }

    followers.push(newFollow)
    saveFollowers(followers)

    res.json({ message: 'Followed successfully', follow: newFollow })
  } catch (error) {
    console.error('Follow error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Unfollow a user
router.post('/unfollow/:userId', authenticate, (req, res) => {
  try {
    const targetUserId = req.params.userId
    const followerId = req.user.id

    const followers = getFollowers()
    const updatedFollowers = followers.filter(
      f => !(f.followerId === followerId && f.followingId === targetUserId)
    )

    saveFollowers(updatedFollowers)
    res.json({ message: 'Unfollowed successfully' })
  } catch (error) {
    console.error('Unfollow error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get followers list for a user
router.get('/followers/:userId', authenticate, (req, res) => {
  try {
    const followers = getFollowers()
    const profiles = getProfiles()
    const users = getUsers()

    const userFollowers = followers
      .filter(f => f.followingId === req.params.userId)
      .map(f => {
        const profile = profiles.find(p => p.userId === f.followerId)
        const user = users.find(u => u.id === f.followerId)
        return {
          id: f.followerId,
          name: profile?.name,
          profileImage: profile?.profileImage,
          stream: profile?.stream,
          followedAt: f.createdAt
        }
      })

    res.json({ followers: userFollowers, count: userFollowers.length })
  } catch (error) {
    console.error('Get followers error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get following list for a user
router.get('/following/:userId', authenticate, (req, res) => {
  try {
    const followers = getFollowers()
    const profiles = getProfiles()
    const users = getUsers()

    const userFollowing = followers
      .filter(f => f.followerId === req.params.userId)
      .map(f => {
        const profile = profiles.find(p => p.userId === f.followingId)
        const user = users.find(u => u.id === f.followingId)
        return {
          id: f.followingId,
          name: profile?.name,
          profileImage: profile?.profileImage,
          stream: profile?.stream,
          followedAt: f.createdAt
        }
      })

    res.json({ following: userFollowing, count: userFollowing.length })
  } catch (error) {
    console.error('Get following error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Check if current user follows target user
router.get('/status/:userId', authenticate, (req, res) => {
  try {
    const followers = getFollowers()
    const isFollowing = followers.some(
      f => f.followerId === req.user.id && f.followingId === req.params.userId
    )
    
    // Check if target follows current user
    const followsYou = followers.some(
      f => f.followerId === req.params.userId && f.followingId === req.user.id
    )

    res.json({ isFollowing, followsYou })
  } catch (error) {
    console.error('Check follow status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get follow counts
router.get('/counts/:userId', authenticate, (req, res) => {
  try {
    const followers = getFollowers()
    const followersCount = followers.filter(f => f.followingId === req.params.userId).length
    const followingCount = followers.filter(f => f.followerId === req.params.userId).length

    res.json({ followersCount, followingCount })
  } catch (error) {
    console.error('Get follow counts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
