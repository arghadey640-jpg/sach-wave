import express from 'express'
import { getUsers, saveUsers, getPosts, savePosts, getProfiles, getStories, saveStories } from '../utils/dataStore.js'
import { authenticate, requireAdmin, requireOwner } from '../middleware/auth.js'

const router = express.Router()

// Apply authentication to all routes
router.use(authenticate)

// Get all users (admin only)
router.get('/users', requireAdmin, (req, res) => {
  try {
    const users = getUsers()
    const profiles = getProfiles()

    const enrichedUsers = users.map(user => {
      const profile = profiles.find(p => p.userId === user.id)
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        suspended: user.suspended || false,
        createdAt: user.createdAt,
        name: profile?.name,
        profileImage: profile?.profileImage
      }
    })

    res.json({ users: enrichedUsers })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all posts (admin only)
router.get('/posts', requireAdmin, (req, res) => {
  try {
    const posts = getPosts()
    const profiles = getProfiles()

    const enrichedPosts = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(post => {
        const profile = profiles.find(p => p.userId === post.userId)
        return {
          ...post,
          userName: profile?.name || 'Unknown',
          userImage: profile?.profileImage
        }
      })

    res.json({ posts: enrichedPosts })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete user (admin only)
router.delete('/users/:userId', requireAdmin, (req, res) => {
  try {
    const users = getUsers()
    const user = users.find(u => u.id === req.params.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' })
    }

    const updatedUsers = users.filter(u => u.id !== req.params.userId)
    saveUsers(updatedUsers)

    // Clean up user's data
    const posts = getPosts().filter(p => p.userId !== req.params.userId)
    const stories = getStories().filter(s => s.userId !== req.params.userId)
    const profiles = getProfiles().filter(p => p.userId !== req.params.userId)
    
    savePosts(posts)
    saveStories(stories)
    // Note: profiles would need separate save function

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Suspend/unsuspend user (admin only)
router.put('/users/:userId/suspend', requireAdmin, (req, res) => {
  try {
    const users = getUsers()
    const index = users.findIndex(u => u.id === req.params.userId)

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (users[index].id === req.user.id) {
      return res.status(400).json({ message: 'Cannot suspend yourself' })
    }

    users[index].suspended = !users[index].suspended
    saveUsers(users)

    res.json({
      message: `User ${users[index].suspended ? 'suspended' : 'unsuspended'} successfully`,
      user: users[index]
    })
  } catch (error) {
    console.error('Suspend user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete post (admin only)
router.delete('/posts/:postId', requireAdmin, (req, res) => {
  try {
    const posts = getPosts()
    const post = posts.find(p => p.id === req.params.postId)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const updatedPosts = posts.filter(p => p.id !== req.params.postId)
    savePosts(updatedPosts)

    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get analytics (admin only)
router.get('/analytics', requireAdmin, (req, res) => {
  try {
    const posts = getPosts()
    const users = getUsers()
    const profiles = getProfiles()
    const stories = getStories()

    // Calculate total likes (sum of all post likes)
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0)
    
    // Calculate total comments
    const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)

    // Calculate total story views
    const totalViews = stories.length * 5 // Approximation

    // Calculate engagement rate
    const totalInteractions = totalLikes + totalComments
    const engagementRate = posts.length > 0 
      ? Math.round((totalInteractions / posts.length) * 10) / 10 
      : 0

    // Top posts by likes
    const topPosts = posts
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 10)
      .map(post => {
        const profile = profiles.find(p => p.userId === post.userId)
        return {
          ...post,
          userName: profile?.name || 'Unknown'
        }
      })

    // Most active users by post count
    const userPostCounts = {}
    posts.forEach(post => {
      userPostCounts[post.userId] = (userPostCounts[post.userId] || 0) + 1
    })
    
    const mostActiveUsers = Object.entries(userPostCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => {
        const profile = profiles.find(p => p.userId === userId)
        return {
          userId,
          name: profile?.name || 'Unknown',
          posts: count
        }
      })

    res.json({
      totalUsers: users.length,
      totalPosts: posts.length,
      totalStories: stories.length,
      totalLikes,
      totalComments,
      totalViews,
      engagementRate,
      topPosts,
      mostActiveUsers
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ===== OWNER-ONLY ROUTES =====
// Grant admin access to a user (owner only)
router.put('/users/:userId/grant-admin', requireOwner, (req, res) => {
  try {
    const users = getUsers()
    const index = users.findIndex(u => u.id === req.params.userId)

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (users[index].role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' })
    }

    users[index].role = 'admin'
    saveUsers(users)

    res.json({
      message: 'Admin access granted successfully',
      user: {
        id: users[index].id,
        email: users[index].email,
        role: users[index].role
      }
    })
  } catch (error) {
    console.error('Grant admin error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Revoke admin access from a user (owner only)
router.put('/users/:userId/revoke-admin', requireOwner, (req, res) => {
  try {
    const users = getUsers()
    const index = users.findIndex(u => u.id === req.params.userId)

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (users[index].role !== 'admin') {
      return res.status(400).json({ message: 'User is not an admin' })
    }

    if (users[index].id === req.user.id) {
      return res.status(400).json({ message: 'Cannot revoke your own admin access' })
    }

    users[index].role = 'user'
    saveUsers(users)

    res.json({
      message: 'Admin access revoked successfully',
      user: {
        id: users[index].id,
        email: users[index].email,
        role: users[index].role
      }
    })
  } catch (error) {
    console.error('Revoke admin error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Ban user permanently (owner only)
router.put('/users/:userId/ban', requireOwner, (req, res) => {
  try {
    const users = getUsers()
    const index = users.findIndex(u => u.id === req.params.userId)

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (users[index].id === req.user.id) {
      return res.status(400).json({ message: 'Cannot ban yourself' })
    }

    if (users[index].role === 'owner') {
      return res.status(400).json({ message: 'Cannot ban the owner' })
    }

    users[index].banned = true
    users[index].bannedAt = new Date().toISOString()
    users[index].bannedBy = req.user.id
    saveUsers(users)

    res.json({
      message: 'User banned successfully',
      user: {
        id: users[index].id,
        email: users[index].email,
        banned: users[index].banned
      }
    })
  } catch (error) {
    console.error('Ban user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Unban user (owner only)
router.put('/users/:userId/unban', requireOwner, (req, res) => {
  try {
    const users = getUsers()
    const index = users.findIndex(u => u.id === req.params.userId)

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' })
    }

    users[index].banned = false
    users[index].bannedAt = null
    users[index].bannedBy = null
    saveUsers(users)

    res.json({
      message: 'User unbanned successfully',
      user: {
        id: users[index].id,
        email: users[index].email,
        banned: users[index].banned
      }
    })
  } catch (error) {
    console.error('Unban user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
